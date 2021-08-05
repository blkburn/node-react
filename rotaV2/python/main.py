import csv
import pickle
import os.path
import os
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import numpy as np
import pygsheets
from google.oauth2 import service_account
import json
from googleapiclient.discovery import build
import pandas as pd
import pika
from random import random
import re
from datetime import datetime, timedelta

# google-api-python-client==1.7.9
# google-auth-httplib2==0.0.3
# google-auth-oauthlib==0.4.0

connection = pika.BlockingConnection(
    pika.ConnectionParameters(host='localhost'))

channel = connection.channel()

channel.queue_declare(queue='rpc_queue')

command = 'none'

## ../../04\ C++/monolith/bin/shift_scheduling_colgen output.txt

def gsheet_api_check(SCOPES):
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'rotav2_key.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return creds


def pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL):
    # creds = gsheet_api_check(SCOPES)
    # service = build('sheets', 'v4', credentials=creds)
    # sheet = service.spreadsheets()
    try:
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=DATA_TO_PULL).execute()
    except:
        print('No sheet found')
        return None

    values = result.get('values', [])

    if not values:
        print('No data found.')
    else:
        rows = sheet.values().get(spreadsheetId=SPREADSHEET_ID,
                                  range=DATA_TO_PULL).execute()
        data = rows.get('values')
        print("COMPLETE: Data copied")
        return data


def run(ch, method, props, body):
    global command
    log = open("log.txt", "w")
    log.close()
    if command == 'none':
        command = body.decode('UTF-8')
        print(command)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    else:
        log = open("log.txt", "w")
        param = json.loads(body.decode('UTF-8'))

        print(param)
        ch.basic_ack(delivery_tag=method.delivery_tag)
        rnd = random()
        print(rnd)

        SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
        SERVICE_ACCOUNT_FILE = 'rotav2_key.json'

        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)

        service = build('sheets', 'v4', credentials=credentials)
        sheet = service.spreadsheets()


        client = pygsheets.authorize(credentials=credentials)
        pySheet = client.open_by_key(param['sheet'])
        # pySheet = client.open_by_key('1Ct2-Veq9Crr7CFMZrL83_EcvZpNu3lGrTqb6TQZ_ayc')

        if (command == 'VERIFY_SHEET'):
            log.write("verify google sheet " + str(rnd) + "\n")
            print('check if locked')

            # SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
            SPREADSHEET_ID = param['sheet']
            DATA_TO_PULL = 'LOCKED'
            log.write("check if sheet is locked\n")
            data = pull_sheet_data(sheet, SPREADSHEET_ID, DATA_TO_PULL)
            log.write('LOCKED = ' + data[0][0] + '\n')

            ch.basic_publish(exchange='',
                             routing_key=props.reply_to,
                             properties=pika.BasicProperties(correlation_id = \
                                                                 props.correlation_id),
                             body=str(data[0][0]))
            ch.basic_publish(exchange='',
                             routing_key=props.reply_to,
                             properties=pika.BasicProperties(correlation_id = \
                                                                 props.correlation_id),
                             body=str('Complete'))
            log.close()
            command = 'none'

        elif (command == 'GET_SCHEDULE'):

            SPREADSHEET_ID = param['sheet']
            DATA_TO_PULL = 'Initial'
            log.write("reading Initial sheet\n")
            data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
            raw = pd.DataFrame(data[1:], columns=data[0])

            DATA_TO_PULL = 'Staff'
            log.write("reading Staff sheet\n")
            data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
            staff_hours = pd.DataFrame(data[1:], columns=data[0])

            DATA_TO_PULL = 'Shifts'
            log.write("reading Shifts sheet\n")
            data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
            shifts = pd.DataFrame(data[1:], columns=data[0])

            DATA_TO_PULL = 'Objective'
            log.write("reading Objective sheet\n")
            data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
            obj = pd.DataFrame(data[1:raw.shape[0]+1], columns=data[0])

            cols = obj.columns[2:]
            dates = [obj.columns[0], obj.columns[1]]
            for d in cols:
                dates.append(datetime.strptime(d, '%d/%m/%y'))
            obj.columns=dates

            cnt = 0
            keys = ['title', 'staff', 'shift', 'startDate', 'endDate', 'id']
            ssKeys = ['text', 'id', 'color']
            # keys = ['title', 'location', 'startDate', 'endDate', 'id']
            scheduleJson = []
            staffJson = []
            shiftJson = []

            for index, row in obj.iterrows():
                for idx, value in row.iteritems():
                    if (idx == 'ID'):
                        id = value
                    if (isinstance(idx, datetime)):
                        if (any(shifts['ShiftID']==value)):
                            hr_min = shifts[shifts['ShiftID']==value]['StartTime'].values[0].split(':')
                            start = timedelta(hours=int(hr_min[0]), minutes=int(hr_min[1]))
                            hr_min = shifts[shifts['ShiftID']==value]['EndTime'].values[0].split(':')
                            if ('+1' in hr_min[1]):
                                end = timedelta(days=1, hours=int(hr_min[0]), minutes=int(hr_min[1][:-2]))
                            else:
                                end = timedelta(hours=int(hr_min[0]), minutes=int(hr_min[1]))
                            scheduleJson.append(dict(zip(keys, [value + ' : ' + row.ID, row.ID, value, (idx+start).isoformat(), (idx+end).isoformat(), cnt])))
                            cnt += 1

            for index, row in staff_hours.iterrows():
                staffJson.append(dict(zip(ssKeys, [row.Name, row.ID, row.Color])))
            for index, row in shifts.iterrows():
                shiftJson.append(dict(zip(ssKeys, [row.ShiftName, row.ShiftID, row.Color])))

            ch.basic_publish(exchange='',
                             routing_key=props.reply_to,
                             properties=pika.BasicProperties(correlation_id = props.correlation_id),
                             body=json.dumps(dict({'staff':staffJson, 'shift':shiftJson, 'schedule':scheduleJson})))
            # body=json.dumps(dict({'schedule': schedule})))

            ch.basic_publish(exchange='',
                             routing_key=props.reply_to,
                             properties=pika.BasicProperties(correlation_id = props.correlation_id),
                             body=str('Complete'))
            log.close()
            command = 'none'
        else: # assume RUN_MODEL received
            locked = param['locked'] == 'true'

            log.write("reading sheet\n")
            # ch.basic_ack(delivery_tag=method.delivery_tag)

            # SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
            SPREADSHEET_ID = param['sheet']
            DATA_TO_PULL = 'Initial'
            log.write("reading Initial sheet\n")
            data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
            raw = pd.DataFrame(data[1:], columns=data[0])

            DATA_TO_PULL = 'Shifts'
            log.write("reading Shifts sheet\n")
            data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
            shifts = pd.DataFrame(data[1:], columns=data[0])

            DATA_TO_PULL = 'Shifts_Setup'
            log.write("reading Shifts_Setup sheet\n")
            data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
            shifts_setup = pd.DataFrame(data[1:], columns=data[0])

            DATA_TO_PULL = 'Staff'
            log.write("reading Staff sheet\n")
            data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
            staff_hours = pd.DataFrame(data[1:], columns=data[0])

            log.write("Generating optimisation file...\n")

        # check the shifts ids are the same in both tabs
            chk = set(shifts["ShiftID"].to_list())==set(shifts_setup["ShiftID"].to_list())
            if not chk:
                raise RuntimeError("ShiftID's do not match")

            chk = len(shifts["ShiftID"].to_list()) == len(set(shifts_setup["ShiftID"].to_list()))
            if not chk:
                raise RuntimeError("Duplicate ShiftIDs")

            staff = raw['Name'].to_list()
            staff_id = raw['ID'].to_list()
            rota_days = len(raw.columns)-2
            dates = raw.columns[2:].to_list()

            shifts['PAs'] = pd.to_numeric(shifts['PAs'])*10

            # get the days off for each staff member
            staff_hols = []
            staff_off = []
            df = pd.DataFrame(columns=['ID', 'MaxShifts', 'MaxTotalMinutes', 'MinTotalMinutes', 'MaxConsecutiveShifts', 'MinConsecutiveShifts', 'MinConsecutiveDaysOff', 'MaxWeekends'])

            for index, row in raw.iterrows():
                tmp = sum(row[dates].isin(['AL', 'PL', 'SL']))
                staff_hols.append(tmp)
                staff_list = row[dates].isin(['OFF', 'AL', 'PL', 'SL', 'ML', 'SPA', 'EPA', '2EPA']).to_list()
                s_off = [index for index, element in enumerate(staff_list) if element == True]
                s_off.insert(0, row['ID'])
                staff_off.append(s_off)
                dcc = pd.to_numeric(staff_hours[staff_hours['ID']==row['ID']]['DCC']).values[0]
                pa = pd.to_numeric(staff_hours[staff_hours['ID']==row['ID']]['PA']).values[0]
                spa = pa - dcc
                xpa = pd.to_numeric(staff_hours[staff_hours['ID']==row['ID']]['Extra_PA']).values[0]
                required = np.round(10 * ((pa * rota_days/7 - pa * tmp / 5) - spa * (rota_days/7 - tmp / 5) + xpa)).astype(int)
                df = df.append({'ID': row['ID'], 'MaxShifts': '', 'MaxTotalMinutes': required, 'MinTotalMinutes': '0', 'MaxConsecutiveShifts': '3', 'MinConsecutiveShifts': '1', 'MinConsecutiveDaysOff': '1', 'MaxWeekends': '3'}, ignore_index=True)
                if required <= 0:
                    log.write("#################\n" + row['ID'] + " ERROR: MaxTotalMinutes < 0\n#################\n")
                    log.write(df[-1:].to_string())
                    ch.basic_publish(exchange='',
                                     routing_key=props.reply_to,
                                     properties=pika.BasicProperties(correlation_id = \
                                                                         props.correlation_id),
                                     body=str('Complete'))

                    command = 'none'
                    log.close()
                    return

            shift_on_request = pd.DataFrame(columns=['EmployeeID', 'Day', 'ShiftID', 'Weight'])
            for  index, col in enumerate(raw[dates]):
                shift_on = raw[col].isin(shifts['ShiftID'])
                shift_on = [index for index, element in enumerate(shift_on) if element == True]
                for x in shift_on:
                    shift_on_request = shift_on_request.append({'EmployeeID': staff_id[x], 'Day': index, 'ShiftID': raw[col][x], 'Weight': 1000}, ignore_index=True)

            shift_off_request = pd.DataFrame(columns=['EmployeeID', 'Day', 'ShiftID', 'Weight'])
            shifts_neg = '-' + shifts['ShiftID'].str[:]
            for  index, col in enumerate(raw[dates]):
                for row_idx, row in enumerate(raw[col]):
                    chk = str.split(row, ',')
                    for x in chk:
                        shift_off = shifts_neg == x
                        shift_off = shift_off[shift_off==True]
                        if not shift_off.index.empty:
                            shift_off_request = shift_off_request.append({'EmployeeID': staff_id[row_idx], 'Day': index, 'ShiftID': x[1:], 'Weight': 1000}, ignore_index=True)

            shift_cover = pd.DataFrame(columns=[ 'Day', 'ShiftID', 'Requirement', 'Under', 'Over'])
            for day in range(rota_days):
                col = day % 7 + 1
                for index, row in shifts_setup.iterrows():
                    shift_cover = shift_cover.append({'Day': day, 'ShiftID': row['ShiftID'], 'Requirement': row[col], 'Under': 100, 'Over': 100}, ignore_index=True)

            if locked:
                log.write('Sheet locked - skipping optimisation')

                DATA_TO_PULL = 'Objective'
                log.write("reading Objective sheet\n")
                data = pull_sheet_data(sheet,SPREADSHEET_ID,DATA_TO_PULL)
                obj = pd.DataFrame(data[1:raw.shape[0]+1], columns=data[0])

            else:

                f= open("output.txt","w")
                f.write("SECTION_HORIZON\n# The horizon length in days:\n")
                f.write("%d\n\n" % rota_days)
                log.write("SECTION_HORIZON\n# The horizon length in days:\n")
                log.write("%d\n\n" % rota_days)

                f.write("SECTION_SHIFTS\n# ShiftID, Length in mins, Shifts which cannot follow this shift | separated\n")
                f.write(shifts.to_csv(header=False, index=False))
                log.write("SECTION_SHIFTS\n# ShiftID, Length in mins, Shifts which cannot follow this shift | separated\n")
                log.write(shifts.to_csv(header=False, index=False))
                log.write("\n\n")

                f.write("\nSECTION_STAFF\n# ID, MaxShifts, MaxTotalMinutes, MinTotalMinutes, MaxConsecutiveShifts, MinConsecutiveShifts, MinConsecutiveDaysOff, MaxWeekends\n")
                f.write(df.to_csv(header=False, index=False))
                log.write("\nSECTION_STAFF\n# ID, MaxShifts, MaxTotalMinutes, MinTotalMinutes, MaxConsecutiveShifts, MinConsecutiveShifts, MinConsecutiveDaysOff, MaxWeekends\n")
                log.write(df.to_csv(header=False, index=False))
                log.write("\n\n")

                f.write("\nSECTION_DAYS_OFF\n# EmployeeID, DayIndexes (start at zero)\n")

                write = csv.writer(f)
                write.writerows(staff_off)

                f.write("\nSECTION_SHIFT_ON_REQUESTS\n# EmployeeID, Day, ShiftID, Weight\n")
                f.write(shift_on_request.to_csv(header=False, index=False))

                f.write("\nSECTION_SHIFT_OFF_REQUESTS\n# EmployeeID, Day, ShiftID, Weight\n")
                f.write(shift_off_request.to_csv(header=False, index=False))

                f.write("\nSECTION_COVER\n# Day, ShiftID, Requirement, Weight for under, Weight for over\n")
                f.write(shift_cover.to_csv(header=False, index=False))

                f.close()
                log.write("\n Running Optimisation...\n")
                log.close()
                # os.system('../monolith/bin/shift_scheduling_colgen output.txt >> log.txt 2>&1')
                os.system('../monolith/bin/shift_scheduling output.txt >> log.txt 2>&1')
                log = open("log.txt", "a")
                log.write('\nOptimisation finished\n')

                obj = raw[dates].copy()
                f= open("colgen_output.txt","r")
                tmp = f.read().split('\n')
                f.close()

                for idx, row in enumerate(tmp[:-1]):
                    row = row.replace('.', 'OFF').split(' ')[:-1]
                    obj.loc[idx] = pd.Series(row, index = dates)
                    update = raw[dates].loc[idx].isin(['AL', 'PL', 'SL', 'ML', 'SPA', 'EPA', '2EPA'])
                    obj.loc[idx][update] = raw[dates].loc[idx][update]

                obj.insert(0, 'ID', raw['ID'])
                obj.insert(0, 'Name', raw['Name'])

            obj_pas = obj[dates].copy()
            #iterate over obj
            for idx, row in obj_pas.iterrows():
                all_updates = row == ' '
                for _, shift in shifts.iterrows():
                    update = row == shift['ShiftID']
                    all_updates |= update
                    obj_pas.loc[idx][update] = shift['PAs']/10

                obj_pas.loc[idx][all_updates == False] = 0

            obj_pas.insert(0, 'ID', raw['ID'])
            obj_pas.insert(0, 'Name', raw['Name'])
            cnt=obj_pas[dates].sum().to_list()
            cnt.insert(0, sum(cnt))
            cnt.insert(0, "Allocated PA's")

            shifts_pas = shifts_setup.copy()
            for idx, row in shifts.iterrows():
                pas = row['PAs']
                update = shifts_pas.loc[idx] == '1'
                shifts_pas.loc[idx][update] = row['PAs']/10

            required_pas = shifts_pas[shifts_pas.columns[1:]].astype(float).sum()
            required_pas = required_pas.to_list() * int(rota_days/7)
            required_pas.insert(0, sum(required_pas))
            required_pas.insert(0, "Required PA's")

            alloc = obj_pas[dates].sum(1)
            req = df['MaxTotalMinutes'] / 10
            staff_pas = pd.DataFrame({'Name': raw['Name'], 'ID': raw['ID'], 'Allocated': alloc, 'Required': req, 'Shortfall': req-alloc})

            t = [['Name', 'ID'], shifts['ShiftID'], ['OFF', 'AL', 'PL', 'SL', 'ML', 'SPA', 'EPA', '2EPA' ]]
            flat_list = [item for sublist in t for item in sublist]
            worked_shifts = pd.DataFrame(columns=flat_list)
            for idx, row in obj.iterrows():
                s = row[dates].value_counts()
                worked_shifts.loc[idx] = s.to_frame().transpose().iloc[0]
            worked_shifts['Name'] = raw['Name']
            worked_shifts['ID'] = raw['ID']
            worked_shifts = worked_shifts.fillna(0)

            ws_cnt=worked_shifts[flat_list[2:]].sum().to_list()
            ws_cnt.insert(0, 'Totals')
            ws_cnt.insert(0, '')

            wks = pySheet.worksheet_by_title('Objective')
            wks.clear(start='A1', end=None, fields="*")
            wks.set_dataframe(obj, start=(1,1))
            wks.set_dataframe(obj_pas, start=((len(obj)+3),1))
            wks.update_row(2*(len(obj)+3)-1, cnt)
            wks.update_row(2*(len(obj)+3), required_pas)
            wks.set_dataframe(staff_pas, start=(2*(len(obj)+3)+3,1))
            wks.update_row(2*(len(obj)+3)+len(staff_pas)+4, ['', 'Totals', sum(alloc), sum(req), sum(req-alloc)])
            wks.set_dataframe(worked_shifts, start=(2*(len(obj)+3)+len(staff_pas)+4+3,1))
            wks.update_row(2*(len(obj)+3)+len(staff_pas)+4+3+len(worked_shifts)+1, ws_cnt)

            for idx, (a, r) in enumerate(zip(cnt[2:],required_pas[2:])):
                # header = wks.cell((2*(len(obj)+3)-1,idx+3))
                col = 2*(len(obj)+3)-1
                if a != r:
                    # print('add conditional : ' + str(idx+3))
                    wks.add_conditional_formatting((col, idx+3), (col, idx+3), 'NUMBER_NOT_EQ', {'backgroundColor':{'red':1}}, [str(int(r))])
                #     header.text_format['foregroundColor'] = (1,0,0,1)
                # else:
                #     header.text_format['foregroundColor'] = (0,0,0,1)
                # header.update()

            original = raw[dates]
            results = obj[dates]

            for index, row in results.iterrows():
                orig_row = original.loc[[index]].values
                for idx, (o, r) in enumerate(zip(orig_row.tolist()[0], row.tolist())):
                    if (o != ''):
                        if '-' in o:
                            negs = list(filter(None,re.split(',|-|\n',o.replace(' ', ''))))
                            if r in negs:
                                wks.add_conditional_formatting((index+2, idx+3), (index+2, idx+3), 'TEXT_NOT_CONTAINS', {'backgroundColor':{'red':1}}, [o])
                                print(o + ':' + r)
                        elif o != r:
                            wks.add_conditional_formatting((index+2, idx+3), (index+2, idx+3), 'TEXT_NOT_CONTAINS', {'backgroundColor':{'red':1}}, [o])
                            print(o + ':' + r)



            ch.basic_publish(exchange='',
                             routing_key=props.reply_to,
                             properties=pika.BasicProperties(correlation_id = \
                                                                 props.correlation_id),
                             body=str('Complete'))

            command = 'none'
            log.close()

channel.basic_qos(prefetch_count=1)
channel.basic_consume(queue='rpc_queue', on_message_callback=run)

print(" [x] Awaiting RPC requests")
channel.start_consuming()

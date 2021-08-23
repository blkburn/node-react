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
import http.client

# google-api-python-client==1.7.9
# google-auth-httplib2==0.0.3
# google-auth-oauthlib==0.4.0

class get_sheets:
    def __init__(self, id, cm):

        SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
        SERVICE_ACCOUNT_FILE = 'rotav2_key.json'
        self.credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES)
        service = build('sheets', 'v4', credentials=self.credentials)
        self.spreadsheet = service.spreadsheets()
        self.id = id
        self.cm = cm

    def pull(self, sheet_name, is_df = True):
        try:
            result = self.spreadsheet.values().get(
                spreadsheetId=self.id,
                range=sheet_name).execute()
            data = result.get('values')
            print("Data copied from sheet " + sheet_name)
            self.cm.send("Data copied from sheet " + sheet_name)
            if is_df:
                return(pd.DataFrame(data[1:], columns=data[0]))
            else:
                return data

        except Exception as ex:
            template = "An exception of type {0} occurred. Arguments:\n{1!r}"
            message = template.format(type(ex).__name__, ex.args)
            print(message)
            self.cm.send('Error: ' + message)
            return None

class channel_message:
    def __init__(self, channel, props):
        self.channel = channel
        self.props = props

    def send(self, message):
        self.channel.basic_publish(exchange='',
                                   routing_key=self.props.reply_to,
                                   properties=pika.BasicProperties(correlation_id = self.props.correlation_id),
                                   body=str(message))


def shift_times(df, value):
    hr_min = df[df['ShiftID']==value]['StartTime'].values[0].split(':')
    start = timedelta(hours=int(hr_min[0]), minutes=int(hr_min[1]))
    hr_min = df[df['ShiftID']==value]['EndTime'].values[0].split(':')
    if ('+1' in hr_min[1]):
        end = timedelta(days=1, hours=int(hr_min[0]), minutes=int(hr_min[1][:-2]))
    else:
        end = timedelta(hours=int(hr_min[0]), minutes=int(hr_min[1]))
    return start, end


def run(ch, method, props, body):
    # global command
    # log = open("log.txt", "w")
    # log.close()
    if False: #command == 'none':
        command = body.decode('UTF-8')
        print(command)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    else:
        # log = open("log.txt", "w")
        param = json.loads(body.decode('UTF-8'))
        command = param['command']
        print(param)
        ch.basic_ack(delivery_tag=method.delivery_tag)

        cm = channel_message( ch, props)
        gsheets = get_sheets(param['sheet'], cm)

        lockedSheet = gsheets.pull('LOCKED', False)
        if lockedSheet == None:
            return

        isLocked = lockedSheet[0][0]
        raw = gsheets.pull('Initial')
        if raw is None:
            return
        cols = raw.columns[2:]
        startDate = cols[0]
        endDate = cols[-1]
        msg = 'Locked: ' + str(isLocked) + '\nStart Date: ' + startDate + '\nEnd Date: ' + endDate + '\n'
        cm.send(msg)

        if (command == 'VERIFY_SHEET'):
            print('check if locked')
            cm.send(json.dumps(dict({'isLocked':isLocked, 'startDate':startDate, 'endDate':endDate})))
            cm.send('Complete')

        else:
            shifts = gsheets.pull('Shifts')
            if shifts is None:
                return

            shifts_nc = gsheets.pull('Non_Clinical_Shifts')
            if shifts_nc is None:
                return

            shifts_setup = gsheets.pull('Shifts_Setup')
            if shifts_setup is None:
                return

            staff_hours = gsheets.pull('Staff')
            if staff_hours is None:
                return

            if (command == 'GET_SCHED_REQS' or command == 'GET_SCHEDULE' or command == 'GET_REQUESTS'):

                # requests are pulled from the objective page - the iniital setup
                # with schedule is pulled from the objective sheet - after the optimisation
                objective = gsheets.pull('Objective', False)
                if objective is None:
                    return
                objective = pd.DataFrame(objective[1:raw.shape[0]+1], columns=objective[0])


                scheduleJson = []
                requestsJson = []
                data=[{'obj': objective.copy(), 'respText': 'schedule', 'offCheck': 'OFF', 'json': scheduleJson},
                      {'obj': raw.copy(), 'respText': 'requests', 'offCheck': '', 'json': requestsJson}]

                for dic in data:

                    obj = dic['obj'].copy()
                    respText = dic['respText']
                    offCheck = dic['offCheck']
                    dataJson = []

                    # convert df columns to dates
                    cols = obj.columns[2:]
                    dates = [obj.columns[0], obj.columns[1]]
                    for d in cols:
                        dates.append(datetime.strptime(d, '%d/%m/%y'))
                    obj.columns=dates

                    # create the multiple data structure to send to the frontend to display the schedule/requests
                    # generated from the selected sheet
                    cnt = 0
                    keys = ['title', 'staff', 'shift', 'startDate', 'endDate', 'id']

                    # create a schedule or request data frame to be displayed in the frontend schedule
                    for index, row in obj.iterrows():
                        for idx, value in row.iteritems():
                            if (isinstance(idx, datetime)):
                                if (value.endswith('r')):
                                    value = value[:-1]
                                if (any(shifts['ShiftID']==value)):
                                    start, end = shift_times(shifts, value)
                                    shName = shifts[shifts['ShiftID']==value]['ShiftName'].values[0]
                                    stName = staff_hours[staff_hours['ID']==row.ID]['Name'].values[0]

                                    dataJson.append(dict(zip(keys, [shName + ' : ' + stName, row.ID, value, (idx+start).isoformat(), (idx+end).isoformat(), cnt])))
                                    cnt += 1
                                elif (value!=offCheck and any(shifts_nc['ShiftID']==value)):
                                    start, end = shift_times(shifts_nc, value)
                                    shName = shifts_nc[shifts_nc['ShiftID']==value]['ShiftName'].values[0]
                                    stName = staff_hours[staff_hours['ID']==row.ID]['Name'].values[0]

                                    dataJson.append(dict(zip(keys, [shName + ' : ' + stName, row.ID, value, (idx+start).isoformat(), (idx+end).isoformat(), cnt])))
                                    cnt += 1

                    dic['json'] = dataJson.copy()
                scheduleJson = data[0]['json']
                requestsJson = data[1]['json']

                # return the shift and staff info with color codes - is checked = true is used by the frontend to display the
                # selected staff's shilfts
                ssKeys = ['text', 'id', 'color', 'isChecked']
                staffJson = []
                shiftJson = []

                for index, row in staff_hours.iterrows():
                    staffJson.append(dict(zip(ssKeys, [row.Name, row.ID, row.Color, False])))
                for index, row in shifts.iterrows():
                    shiftJson.append(dict(zip(ssKeys, [row.ShiftName, row.ShiftID, row.Color, False])))
                for index, row in shifts_nc.iterrows():
                    shiftJson.append(dict(zip(ssKeys, [row.ShiftName, row.ShiftID, row.Color, False])))

                cm.send(json.dumps(dict({'isLocked':isLocked, 'startDate':startDate, 'endDate':endDate,'staff':staffJson,
                                         'shift':shiftJson, 'schedule':scheduleJson, 'requests':requestsJson})))
                cm.send('Complete')

            else: # assume RUN_MODEL received

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

                # get the total pa's - to calculate the maximum number of OC shifts for each staff member
                total_pas = 0
                for index, row in raw.iterrows():
                    total_pas += pd.to_numeric(staff_hours[staff_hours['ID']==row['ID']]['PA']).values[0]
                prop_4max = 4 * (rota_days / 7) / total_pas
                prop_5max = 5 * (rota_days / 7) / total_pas

                for index, row in raw.iterrows():
                    tmp = sum(row[dates].isin(['AL', 'PL', 'SL']))
                    staff_hols.append(tmp)
                    # staff_list = row[dates].isin(['OFF', 'AL', 'PL', 'SL', 'ML', 'SPA', 'EPA', 'EPAt', 'EPAu']).to_list()
                    staff_list = row[dates].isin(shifts_nc['ShiftID'].to_list()).to_list()
                    s_off = [index for index, element in enumerate(staff_list) if element == True]
                    s_off.insert(0, row['ID'])
                    staff_off.append(s_off)
                    dcc = pd.to_numeric(staff_hours[staff_hours['ID']==row['ID']]['DCC']).values[0]
                    pa = pd.to_numeric(staff_hours[staff_hours['ID']==row['ID']]['PA']).values[0]
                    xpa = pd.to_numeric(staff_hours[staff_hours['ID']==row['ID']]['Extra_PA']).values[0]
                    required = np.round(10 * (dcc*(rota_days/7 - tmp / 5) + xpa)).astype(int)
                    oc_max = str(round(pa * prop_4max))
                    bs_max = str(round(pa * prop_4max))
                    ds_max = str(round(pa * prop_5max)+3)
                    wrm_max = str(round(pa * prop_5max)+3)
                    fs_max = str(round(pa * prop_5max)+3)

                    df = df.append({'ID': row['ID'], 'MaxShifts': 'OC='+oc_max+'|BS='+bs_max+'|DS='+ds_max+'|WRM='+wrm_max+'|FS='+fs_max, 'MaxTotalMinutes': required, 'MinTotalMinutes': '0', 'MaxConsecutiveShifts': '3', 'MinConsecutiveShifts': '1', 'MinConsecutiveDaysOff': '1', 'MaxWeekends': '3'}, ignore_index=True)
                    if required <= 0:
                        cm.send("#################\n" + row['ID'] + " ERROR: MaxTotalMinutes < 0\n#################\n")
                        cm.send(df[-1:].to_string())
                        # log.write("#################\n" + row['ID'] + " ERROR: MaxTotalMinutes < 0\n#################\n")
                        # log.write(df[-1:].to_string())
                        cm.send('Error: Configuration error' )
                        return

                if isLocked=='TRUE':
                    print('Sheet locked - skipping optimisation')
                    cm.send('Sheet locked - skipping optimisation')
                    obj = gsheets.pull('Objective', False)
                    if obj is None:
                        return
                    obj = pd.DataFrame(obj[1:raw.shape[0]+1], columns=obj[0])

                    obj_orig = obj.copy()
                    for index, row in obj.iterrows():
                        for idx, value in row.iteritems():
                            if (value.endswith('r')):
                                value = value[:-1]
                                obj_orig.iloc[index][idx] = value

                else:


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


                    print('Sheet unlocked - starting optimisation')
                    cm.send('Sheet unlocked - starting optimisation')
                    f = open("output.txt","w")
                    f.write("SECTION_HORIZON\n# The horizon length in days:\n")
                    f.write("%d\n\n" % rota_days)
                    f.write("SECTION_SHIFTS\n# ShiftID, Length in mins, Shifts which cannot follow this shift | separated\n")
                    f.write(shifts.iloc[:,1:4].to_csv(header=False, index=False))
                    f.write("\nSECTION_STAFF\n# ID, MaxShifts, MaxTotalMinutes, MinTotalMinutes, MaxConsecutiveShifts, MinConsecutiveShifts, MinConsecutiveDaysOff, MaxWeekends\n")
                    f.write(df.to_csv(header=False, index=False))
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
                    os.system('../monolith/bin/shift_scheduling_colgen output.txt  > log.txt 2>&1')
                    # os.system('../monolith/bin/shift_scheduling output.txt >> log.txt 2>&1')

                    obj = raw[dates].copy()
                    f= open("colgen_output.txt","r")
                    tmp = f.read().split('\n')
                    f.close()

                    for idx, row in enumerate(tmp[:-1]):
                        row = row.replace('.', 'OFF').split(' ')[:-1]
                        obj.loc[idx] = pd.Series(row, index = dates)
                        shiftIdsNoff = shifts_nc['ShiftID'].to_list()
                        shiftIdsNoff.remove('OFF')
                        update = raw[dates].loc[idx].isin(shiftIdsNoff)
                        obj.loc[idx][update] = raw[dates].loc[idx][update]

                    obj.insert(0, 'ID', raw['ID'])
                    obj.insert(0, 'Name', raw['Name'])

                    obj_orig = obj.copy()
                    for idx, row in obj.iterrows():
                        a=raw.loc[idx][2:]==row[2:]
                        row[2:][a] = row[2:][a].values+'r'

                cm.send('Generating metrics')
                obj_pas = obj[dates].copy()
                #iterate over obj
                for idx, row in obj_pas.iterrows():
                    all_updates = row == ' '
                    for _, shift in shifts.iterrows():
                        update = (row == shift['ShiftID']) | (row == shift['ShiftID']+'r')
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

                t = [['Name', 'ID'], shifts['ShiftID'], shifts_nc['ShiftID'].to_list()]
                flat_list = [item for sublist in t for item in sublist]
                worked_shifts = pd.DataFrame(columns=flat_list)
                for idx, row in obj_orig.iterrows():
                    s = row[dates].value_counts()
                    worked_shifts.loc[idx] = s.to_frame().transpose().iloc[0]
                worked_shifts['Name'] = raw['Name']
                worked_shifts['ID'] = raw['ID']
                worked_shifts = worked_shifts.fillna(0)

                ws_cnt=worked_shifts[flat_list[2:]].sum().to_list()
                ws_cnt.insert(0, 'Totals')
                ws_cnt.insert(0, '')

                client = pygsheets.authorize(credentials=gsheets.credentials)
                pySheet = client.open_by_key(param['sheet'])
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

                cm.send('sheet updated')
                if (param['doConditioanlFormatting']):
                    cm.send(': adding conditional formatting')
                    for idx, (a, r) in enumerate(zip(cnt[2:],required_pas[2:])):
                        col = 2*(len(obj)+3)-1
                        if a != r:
                            wks.add_conditional_formatting((col, idx+3), (col, idx+3), 'NUMBER_NOT_EQ', {'backgroundColor':{'red':1}}, [str(int(r))])

                    original = raw[dates]
                    results = obj_orig[dates]

                    for index, row in shifts.iterrows():
                        if row['Color'] is None:
                            color = 'ffffff'
                        else:
                            color = row['Color'].lstrip('#')
                        rgb = tuple(float(int(color[i:i+2], 16))/255 for i in (0, 2, 4))
                        d = '{"backgroundColor":{"red": '+str(rgb[0])+', "green": '+str(rgb[1])+', "blue": '+str(rgb[2])+'}}'
                        wks.add_conditional_formatting((1, 3), (20, 100), 'CUSTOM_FORMULA', json.loads(d), ['=OR(C1="'+row['ShiftID']+'",C1="'+row['ShiftID']+'r")'])
                        # wks.add_conditional_formatting((1, 3), (20, 100), 'TEXT_EQ', json.loads(d), [row['ShiftID']])
                        # wks.add_conditional_formatting((1, 3), (20, 100), 'TEXT_EQ', json.loads(d), [row['ShiftID']+'r'])
                    for index, row in shifts_nc.iterrows():
                        if row['Color'] is None:
                            color = 'ffffff'
                        else:
                            color = row['Color'].lstrip('#')
                        rgb = tuple(float(int(color[i:i+2], 16))/255 for i in (0, 2, 4))
                        d = '{"backgroundColor":{"red": '+str(rgb[0])+', "green": '+str(rgb[1])+', "blue": '+str(rgb[2])+'}}'
                        # wks.add_conditional_formatting((1, 3), (20, 100), 'TEXT_EQ', json.loads(d), [row['ShiftID']])
                        # wks.add_conditional_formatting((1, 3), (20, 100), 'TEXT_EQ', json.loads(d), [row['ShiftID']+'r'])
                        wks.add_conditional_formatting((1, 3), (20, 100), 'CUSTOM_FORMULA', json.loads(d), ['=OR(C1="'+row['ShiftID']+'",C1="'+row['ShiftID']+'r")'])

                    message = ''
                    for index, row in results.iterrows():
                        orig_row = original.loc[[index]].values
                        for idx, (o, r) in enumerate(zip(orig_row.tolist()[0], row.tolist())):
                            if (o != ''):
                                if '-' in o:
                                    negs = list(filter(None,re.split(',|-|\n',o.replace(' ', ''))))
                                    if r in negs:
                                        wks.add_conditional_formatting((index+2, idx+3), (index+2, idx+3), 'TEXT_NOT_CONTAINS', {'backgroundColor':{'red':1,'green':1}}, [o])
                                        print(obj['Name'][index] + ' ' + row.index[idx] + ' requested: ' + o + ' rostered: ' + r)
                                        # log.write('\n' + obj['Name'][index] + ' ' + row.index[idx] + ' requested: ' + o + ' rostered: ' + r)
                                elif o != r:
                                    wks.add_conditional_formatting((index+2, idx+3), (index+2, idx+3), 'TEXT_NOT_CONTAINS', {'backgroundColor':{'red':1}}, [o])
                                    # log.write('\n' + obj['Name'][index] + ' ' + row.index[idx] + ' requested: ' + o + ' rostered: ' + r)
                                    print(obj['Name'][index] + ' ' + row.index[idx] + ' requested: ' + o + ' rostered: ' + r)

                cm.send('Complete')
                print('finished')


def main():

    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost', heartbeat=600))
    channel = connection.channel()
    channel.queue_declare(queue='rpc_queue') #durable=True
    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue='rpc_queue', on_message_callback=run)

    command = 'none'
    print(" [x] Awaiting RPC requests")
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        channel.stop_consuming()
    channel.close()


if __name__ == '__main__':
    main()
import mongoose from 'mongoose'

const CacheSheetDetailsSchema = mongoose.Schema(
  {
    sheet_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: false,
    },
    sheet: {
      type: String,
      required: true,
    },
    isLocked: {
      type: Boolean,
      required: true,
      default: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const CacheSheetDetails = mongoose.model(
  'CacheSheetDetails',
  CacheSheetDetailsSchema
)

const CacheSheetStaffSchema = mongoose.Schema(
  {
    sheet_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: false,
    },
    text: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: false,
      default: '#ffffff',
    },
    isChecked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const CacheSheetStaff = mongoose.model('CacheSheetStaff', CacheSheetStaffSchema)

const CacheSheetShiftsSchema = mongoose.Schema(
  {
    sheet_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: false,
    },
    text: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: false,
      default: '#ffffff',
    },
    isChecked: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const CacheSheetShifts = mongoose.model(
  'CacheSheetShifts',
  CacheSheetShiftsSchema
)

const CacheSheetScheduleSchema = mongoose.Schema(
  {
    sheet_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: false,
    },
    title: {
      type: String,
      required: true,
    },
    staff: {
      type: String,
      required: true,
    },
    shift: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const CacheSheetSchedule = mongoose.model(
  'CacheSheetSchedule',
  CacheSheetScheduleSchema
)

const CacheSheetRequestsSchema = mongoose.Schema(
  {
    sheet_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: false,
    },
    title: {
      type: String,
      required: true,
    },
    staff: {
      type: String,
      required: true,
    },
    shift: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

const CacheSheetRequests = mongoose.model(
  'CacheSheetRequests',
  CacheSheetRequestsSchema
)

export {
  CacheSheetDetails,
  CacheSheetStaff,
  CacheSheetShifts,
  CacheSheetSchedule,
  CacheSheetRequests,
}

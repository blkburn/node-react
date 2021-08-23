import mongoose from 'mongoose'

const sheetSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    sheet: {
      // the URL of the sheet
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: false,
      default: '',
    },
    endDate: {
      type: String,
      required: false,
      default: '',
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
    isRequests: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

const Sheet = mongoose.model('Sheet', sheetSchema)

export default Sheet

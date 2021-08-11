import mongoose from 'mongoose'

const sheetSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    sheet: {
      type: String,
      required: true,
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

// rotaSchema.pre('save', async function (next) {
//   if (!this.isModified('sheet')) {
//     next()
//   }

// })

const Sheet = mongoose.model('Sheet', sheetSchema)

export default Sheet

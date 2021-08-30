import mongoose from 'mongoose'

const cwListSchema = mongoose.Schema(
  {
    city_name: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
)


const CWList = mongoose.model('CWList', cwListSchema)

export default CWList

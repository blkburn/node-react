import mongoose from 'mongoose'

const requestsSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
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
    type: {
      type: String,
      required: true,
    },
    shift: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'Requested',
    },
  },
  {
    timestamps: true,
  }
)

const Requests = mongoose.model('Requests', requestsSchema)

export default Requests

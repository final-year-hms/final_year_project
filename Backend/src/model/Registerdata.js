const mongoose = require('mongoose')

mongoose
  .connect(
    'mongodb+srv://user:user@22@hmm.1lxy3.mongodb.net/HMM?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log(`Connection successfull`)
  })
  .catch((e) => {
    console.log(`Connection unsuccessfull`)
  })

const Schema = mongoose.Schema
const RegisterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  // Dob: {
  //     type:Date,
  //     required:true
  // },
  phn: {
    type: Number,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  id: {
    type: String,
    required: true,
  },
  pass: {
    type: String,
    required: true,
  },
  cpass: {
    type: String,
    required: true,
  },
  root: {
    type: String,
    required: false,
  },
  patient: {
    type: Boolean,
    required: false,
  },
})

var Registerdata = mongoose.model('regdata', RegisterSchema)

module.exports = Registerdata

const mongoose = require('mongoose')

mongoose.connect(
  'mongodb+srv://user:user@22@hmm.1lxy3.mongodb.net/HMM?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  }
)

const Schema = mongoose.Schema

const ViewSchema = new Schema({
  name: String,
  id: String,
  details: String,
  medication: String,
  root: String,
  messages: Object,
})

var Viewdata = mongoose.model('viewdata', ViewSchema)

module.exports = Viewdata

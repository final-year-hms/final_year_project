//Access Mongoose package
const mongoose = require("mongoose");

//connect to db
// mongoose.connect('mongodb+srv://user:user@22@hmm.1lxy3.mongodb.net/HealthMM?retryWrites=true&w=majority',{
//     useNewUrlParser:true,
//     useUnifiedTopology:true,
//     useCreateIndex:true
// }).then(()=>{
//     console.log(`Connection successfull`);
// }).catch((e)=>{
//     console.log(`Connection unsuccessfull`);
// });

//schema def
const Schema = mongoose.Schema;
const SensorSchema = new Schema({
    PatientId: {
        type:String,
        required:true
    } ,
    Date: {
        type:Date,
        required:true,
        unique: true
    } ,
    
    ECG:{
        type:Int8Array,
        required:true
    } ,
    Temp: {
        type:Number,
        required:true,
        unique:true
    },
    SpO2: {
        type:Number,
        required:true,
    },
    Bpm: {
        type:Number,
        required:true,
    }
});


//create model
var Sensordata = mongoose.model('sensedata',SensorSchema);

module.exports = Sensordata;
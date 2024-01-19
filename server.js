//require('dotenv').config()
//Server Variables

var host = process.env.IP || 'localhost';
//var port = process.env.PORT || 9000;
const express = require('express')
const app = express()
const mongoose = require('mongoose')
var mqtt = require('mqtt')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/"; 
var staticSite = __dirname + '/public';
const atlasConnectionStr = 'mongodb+srv://farmwise:farmwise@cluster0.h6sz0sz.mongodb.net/farmbuddies?retryWrites=true&w=majority';


mongoose.connect(atlasConnectionStr, { useNewUrlParser: true, useUnifiedTopology: true }); // Atlas connection string

//mongoose.connect('mongodb://127.0.0.1:27017/farmbuddies',{ useNewUrlParser: true }); //LOCAL DB CONNECT

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())
 //var client  = mqtt.connect("ws://192.168.1.19:9001/mqtt") // Local Mosquitto Working
 var client = mqtt.connect('ws://broker.hivemq.com:8000/mqtt')// broker.hivemq.com Hive Working
 //var client  = mqtt.connect([{host:'broker.hivemq.com',port:'1883'}])
 console.log("Nodejs Server Started!");
 
// on mqtt conect subscribe on tobic test 
client.on('connect', function () {
  client.subscribe('farmwise/node01/sensors/data', function (err) {
	 //console.log("sub scribing to test topic");
      if(err)
      console.log(err)
  })
})

 //when recive message 
client.on('message', function (topic, message) {
  json_check(message)
})

//check if data json or not
function json_check(data) {
    try {
       // JSON.parse(data);
	 msg = JSON.parse(data.toString()); // t is JSON so handle it how u want
	 // add a timestamp to the JSON object
     //msg.timestamp = new Date();
	  msg.timestamp = new Date().toLocaleString("en-US", { timeZone: "America/Paramaribo" });
	 msg.gateway = "FarmBuddy_Gateway01";
	 
    } catch (e) {
		console.log("message could not valid json " + data.toString);
        return false;
    }
	 console.log(msg);
	 var msgobj = { "msg": msg }; // message object
    Mongo_insert(msgobj)
	console.log(msgobj);
}

//insert data in mongodb
function Mongo_insert(msg){
MongoClient.connect(url, function(err, db ) {
    if (err) throw err;
    var dbo = db.db("farmbuddies");
    dbo.collection("node02").insertOne(msg, function(err, res) {
      if (err) throw err;
	   console.log("data stored");
      //db.close();
    });

    //Fetech from nested json obj in collection
    dbo.collection('node02').find({}).toArray(function(err, result) {
      if (err) throw err;
      // send data as response to client
     // app.get('/data', function(req, res) {
     //   res.send(result);
     // });
     app.use('/data', subscribersRouter)
    // res.send(result);
      db.close();
    });

  }); 
}

const subscribersRouter = require('./routes/subscribers')
app.use('/data', subscribersRouter)

// ENABLE CORS for Express (so swagger.io and external sites can use it remotely .. SECURE IT LATER!!)
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//Routes here
var router = express.Router();  
app.use('/', express.static(staticSite));
// Use router for all /api requests
app.use('/api', router );

app.listen(3000, () => console.log('Server Started port 3000'))
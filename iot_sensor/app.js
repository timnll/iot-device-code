const rpiDhtSensor = require('rpi-dht-sensor');
const fs = require('fs');
//const http = require('http');
const unirest = require('unirest');
const nodemailer = require('nodemailer');

var dht = new rpiDhtSensor.DHT22(4);

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nico.vauv@gmail.com',
    pass: 'sampras14'
  }
});

var jsessionid = ""
var vcapid = ""
var email = ""
var ngroklink = ""

function readSensor() {

  fs.readFile('../website/raspberry_website/log', (err, data) => {
    if (err) {
      if (err.code == 'ENOENT') {
        console.error('"log" file does not exist');
        return;
      }
      throw err;
    }
    console.log("File : " + data.toString());
    tmp = data.toString().split(" ");
    if (tmp.length < 3) {
      console.error('Error in the "log" file');
      setTimeout(readSensor, 5000);
    }

   fs.readFile('logngrok', (err, data) => {
        if (err) {
          if (err.code == 'ENOENT') {
            console.error('"logngrok" file does not exist');
            return;
          }
          throw err;
        }
        console.log("logngrok : " + data.toString());
        var line = data.toString().split("\n");
        tmplink = line[0].split("url=");
        if (tmplink.length < 2) {
          console.error('Error in the "logngrok" file');
          setTimeout(readSensor, 5000);
        }
      
////AAAjouter le mail au form du site web
        if (jsessionid != tmp[0] || vcapid != tmp[1]) {
          jsessionid = tmp[0];
          vcapid = tmp[1];
        }
        if (tmplink[1] != ngroklink || email != tmp[2]) {
          email = tmp[2];
          ngroklink = tmplink[1];
          if (ngroklink != "") {
            var mailOptions = {
              from: 'nico.vauv@gmail.com',
              to: email,
              subject: 'Lien NGROK',
              text: ngroklink
            };
        
            transporter.sendMail(mailOptions, function(error, info){
               if (error) {
                 console.log("Mail ERROR : " + error);
               } else {
                 console.log('Email sent: ' + info.response);
               }
            });
          }
        }
      
       });
   });
  var readout = dht.read();

  console.log("Temperature : " + readout.temperature + " Humidity : " + readout.humidity);
  var cookies = 'JSESSIONID=' + jsessionid + ";__VCAP_ID__=" + vcapid;
  var xcsrf = "";
  console.log("Cookies : " + cookies);
  if (readout.temperature != 0 || readout.humidity != 0) {
    unirest
      .get("https:\/\/iotae-deloitte.flp-iot-sap.cfapps.eu10.hana.ondemand.com/appiot-mds/Things('9A4FF3699799466F94E8B2B918C02593')/iotae.deloitte.tutopostman:tutopostmanThingType/tutopostmanThingType")
      .headers({'x-csrf-token' : 'fetch', 'Cookie': cookies})
      .then((res) => {
         if (res.body != "undefined") {
           console.log("Get result : " + res.body);
           xcsrf = res.headers["x-csrf-token"];
           console.log("XCSRF : " + xcsrf);
           var today = new Date();
           var dd = String(today.getDate()).padStart(2, '0');
           var mm = String(today.getMonth() + 1).padStart(2, '0');
           var yyyy = today.getFullYear();
           var hh = String(today.getHours()).padStart(2, '0');
           var min = String(today.getMinutes()).padStart(2, '0');
           var sec = String(today.getSeconds()).padStart(2, '0');
           var msec = String(today.getMilliseconds()).padStart(3, '0');
           var now = yyyy + "-" + mm + "-" + dd + "T" + hh + ":" + min + ":" + sec + "." + msec + "Z";
           console.log("Now : " + now);
           unirest
             .put("https:\/\/iotae-deloitte.flp-iot-sap.cfapps.eu10.hana.ondemand.com/appiot-mds/Things('9A4FF3699799466F94E8B2B918C02593')/iotae.deloitte.tutopostman:tutopostmanThingType/tutopostmanThingType")
             .headers({'x-csrf-token' : xcsrf, 'Cookie' : cookies, 'Content-Type' : 'application/json'})
             .send({'value' : [{'_time' : now, 'Temperature' : readout.temperature, 'Humidity' : readout.humidity}]})
             .then((res) => {
                console.log("Put code : " + res.code);
             });
         }
      });
   }
   else {
     console.log('DHT22 is not running');
   }


  setTimeout(readSensor, 5000);
};

readSensor();

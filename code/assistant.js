/////////////
//VARIABLES//
/////////////
var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://localhost', { port: 1883 });
var relay = require('./relay.js');
var everloop = require('./everloop.js');
var snipsUserName = 'YOUR_SNIPS_USERNAME';
var wakeword = 'hermes/hotword/default/detected';
var sessionEnd = 'hermes/dialogueManager/sessionEnded';
var lightState = 'hermes/intent/'+snipsUserName+':Lights';
//////////////
//ON CONNECT//
//////////////
client.on('connect', function() {
   console.log('Connected to Snips MQTT server\n');
   client.subscribe('hermes/hotword/default/detected');
   client.subscribe('hermes/dialogueManager/sessionEnded');
   client.subscribe(lightState);
});
//////////////
//ON MESSAGE//
//////////////
client.on('message', function(topic,message) {
   var message = JSON.parse(message);
   switch(topic) {
       // * On Wakeword
       case wakeword:
           everloop.startWaiting();
           console.log('Wakeword Detected');
       break;
       // * On Light State Change
       case lightState:
           // Turn lights On/Off
           try{
               if (message.slots[0].rawValue === 'on'){
                   relay.lightsOn();
                   everloop.stopWaiting();
                   console.log('Lights On');
               }
               else if(message.slots[0].rawValue === 'off'){
                   relay.lightsOff();
                   everloop.stopWaiting();
                   console.log('Lights Off');
               }
           }
           // Expect error if `on` or `off` is not heard
           catch(e){
               console.log('Did not receive an On/Off state')
           }
       break;
       // * On Conversation End
       case sessionEnd:
           everloop.stopWaiting();
           console.log('Session Ended\n');
       break;
   }
});

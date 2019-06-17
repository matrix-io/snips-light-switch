/////////////
//VARIABLES//
/////////////
const matrix = require("@matrix-io/matrix-lite");
var matrix_device_leds = 0;// Holds amount of LEDs on MATRIX device
var methods = {};// Declaration of method controls at the end
var waitingToggle = false;
var counter = 0;

setInterval(function(){
   // Turns off all LEDs
   if (waitingToggle == false) {
           // Set individual LED value
           matrix.led.set({});
   }
   // Creates pulsing LED effect
   else if (waitingToggle == true) {
           // Set individual LED value
           matrix.led.set({
               b: (Math.round((Math.sin(counter) + 1) * 100) + 10),// Math used to make pulsing effect
           });
       
   };
   counter = counter + 0.2;
   // Store the Everloop image in MATRIX configuration
},50);
///////////////////
//WAITING METHODS//
///////////////////
methods.startWaiting = function() {
   waitingToggle = true;
};
methods.stopWaiting = function() {
   waitingToggle = false;
};
module.exports = methods;// Export methods in order to make them avaialble to other files 
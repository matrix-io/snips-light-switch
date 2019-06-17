 /////////////
//VARIABLES//
/////////////
const matrix = require("@matrix-io/matrix-lite");
var methods = {};// Declaration of method controls at the end
var relayPin = 0;// The GPIO pin connected to your relay

matrix.gpio.setFunction(0, "DIGITAL");
matrix.gpio.setMode(0,"output");
////////////////////
//ON & OFF METHODS//
////////////////////
methods.lightsOff = function() {
    matrix.gpio.setDigital(0,"ON");
   console.log("Lights Have Been Turned Off");
};
methods.lightsOn = function() {
    matrix.gpio.setDigital(0,"OFF");
   console.log("Lights Have Been Turned On");
};
module.exports = methods;// Export methods in order to make them avaialble to other files
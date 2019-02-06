/////////////
//VARIABLES//
/////////////

var zmq = require('zeromq');// Asynchronous Messaging Framework
var matrix_io = require('matrix-protos').matrix_io;// Protocol Buffers for MATRIX function
var matrix_ip = '127.0.0.1';// Local IP
var matrix_gpio_base_port = 20049;// Port for GPIO driver

var methods = {};// Declaration of method controls at the end


var relayPin = 0;// The GPIO pin connected to your relay

///////////////////
//KEEP ALIVE PORT//
///////////////////

// Create a Pusher socket
var pingSocket = zmq.socket('push');
// Connect Pusher to Keep-alive port
pingSocket.connect('tcp://' + matrix_ip + ':' + (matrix_gpio_base_port + 1));
// Send initial ping
pingSocket.send('');
// Send ping & toggle pin value every 2 seconds
setInterval(function(){
    pingSocket.send('');// Send ping
}, 2000);

//////////////
//ERROR PORT//
//////////////

// Create a Subscriber socket
var errorSocket = zmq.socket('sub');
// Connect Subscriber to Error port
errorSocket.connect('tcp://' + matrix_ip + ':' + (matrix_gpio_base_port + 2));
// Connect Subscriber to Error port
errorSocket.subscribe('');
// On Message
errorSocket.on('message', function(error_message){
    console.log('Error received: ' + error_message.toString('utf8'));// Log error
});

/////////////
//BASE PORT//
/////////////

// Create a Pusher socket
var configSocket = zmq.socket('push');
// Connect Pusher to Base port
configSocket.connect('tcp://' + matrix_ip + ':' + matrix_gpio_base_port);

// Create driver configuration
var outputConfig = matrix_io.malos.v1.driver.DriverConfig.create({
  // Update rate configuration
    delayBetweenUpdates: 0.01,// 0.01 seconds between updates
    timeoutAfterLastPing: 6.0,// Stop sending updates 6 seconds after pings
    //GPIO Configuration
    gpio: matrix_io.malos.v1.io.GpioParams.create({
        pin: relayPin,// Use pin 0
        mode: matrix_io.malos.v1.io.GpioParams.EnumMode.OUTPUT,// Set as output mode
        value: 0// Set initial pin value as off
    })
});

////////////////////
//ON & OFF METHODS//
////////////////////

methods.lightsOff = function() {
    outputConfig.gpio.value = 1;
    configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(outputConfig).finish());
    console.log("Lights Have Been Turned Off");
};

methods.lightsOn = function() {
    outputConfig.gpio.value = 0;
    configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(outputConfig).finish());
    console.log("Lights Have Been Turned On");
};

module.exports = methods;// Export methods in order to make them avaialble to other files
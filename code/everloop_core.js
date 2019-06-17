/////////////
//VARIABLES//
/////////////

var zmq = require('zeromq');// Asynchronous Messaging Framework
var matrix_io = require('matrix-protos').matrix_io;// Protocol Buffers for MATRIX function
var matrix_ip = '127.0.0.1';// Local IP
var matrix_everloop_base_port = 20021;// Port for Everloop driver
var matrix_device_leds = 0;// Holds amount of LEDs on MATRIX device

var methods = {};// Declaration of method controls at the end

var waitingToggle = false;

var counter = 0;

///////////////////
//KEEP ALIVE PORT//
///////////////////

// Create a Pusher socket
var pingSocket = zmq.socket('push')
// Connect Pusher to Keep-alive port
pingSocket.connect('tcp://' + matrix_ip + ':' + (matrix_everloop_base_port + 1));
// Send a single ping
pingSocket.send('');

//////////////
//ERROR PORT//
//////////////

// Create a Subscriber socket
var errorSocket = zmq.socket('sub');
// Connect Subscriber to Error port
errorSocket.connect('tcp://' + matrix_ip + ':' + (matrix_everloop_base_port + 2));
// Connect Subscriber to Error port
errorSocket.subscribe('');
// On Message
errorSocket.on('message', function(error_message){
  console.log('Error received: ' + error_message.toString('utf8'));// Log error
});

////////////////////
//DATA UPDATE PORT//
////////////////////

// Create a Subscriber socket
var updateSocket = zmq.socket('sub');
// Connect Subscriber to Data Update port
updateSocket.connect('tcp://' + matrix_ip + ':' + (matrix_everloop_base_port + 3));
// Subscribe to messages
updateSocket.subscribe('');
// On Message
updateSocket.on('message', function(buffer){
  var data = matrix_io.malos.v1.io.EverloopImage.decode(buffer);// Extract message
  matrix_device_leds = data.everloopLength;// Save MATRIX device LED count
});

/////////////
//BASE PORT//
/////////////

// Create a Pusher socket
var configSocket = zmq.socket('push');
// Connect Pusher to Base Port
configSocket.connect('tcp://' + matrix_ip + ':' + matrix_everloop_base_port);

// Create an empty Everloop image
var image = matrix_io.malos.v1.io.EverloopImage.create();

setInterval(function(){
    
    // Turns off all LEDs
    if (waitingToggle == false) {
        for (var i = 0; i < matrix_device_leds; ++i) {
            // Set individual LED value
            image.led[i] = {
                red: 0,
                green: 0,
                blue: 0,
                white: 0
            };
        }
    };

    // Creates pulsing LED effect
    if (waitingToggle == true) {
        for (var i = 0; i < matrix_device_leds; ++i) {
            // Set individual LED value
            image.led[i] = {
                red: 0,
                green: 0,
                blue: (Math.round((Math.sin(counter) + 1) * 100) + 10),// Math used to make pulsing effect
                white: 0
            };
        }
    };

    counter = counter + 0.2;

    // Store the Everloop image in MATRIX configuration
    var config = matrix_io.malos.v1.driver.DriverConfig.create({
        'image': image
    });

    // Send MATRIX configuration to MATRIX device
    if(matrix_device_leds > 0) {
        configSocket.send(matrix_io.malos.v1.driver.DriverConfig.encode(config).finish());
    };

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
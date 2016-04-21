var
	statistics = require('math-statistics'),
	usonic = require('r-pi-usonic'),
    async = require('async'),
    gpio = require('pi-gpio'),
    socket = require('socket.io'),
    Gpio = require('pigpio').Gpio;


var socket = require('socket.io-client')('http://141.117.161.70:22788/');


//the car code starts here
//----------------------------------

//Init for the Sensor

var leftPower = new Gpio(16, {
    mode: Gpio.OUTPUT
});
var rightPower = new Gpio(17, {
    mode: Gpio.OUTPUT
});

var leftPowerAmount = 255;
var rightPowerAmount = 255;
var distance_array = [];
var car = {

    //assign pin numbers to variables for later use
    motors: {


        leftFront: 40,
        leftBack: 38,
        //  rightPower: 36,
        rightFront: 13,
        rightBack: 15
    },

    //open the gpio pins and set them as outputs
    init: function () {
		//Init for the ultrasonics
		usonic.init(function (error){
			if(error){
				console.log("Error INIT sensors")
			} else{
				var echoPin = 8;
				var triggerPin = 7;
				var sensor = usonic.createSensor(echoPin, triggerPin, 1000);
			}
		});
        //   gpio.close(this.motors.leftPower);
        gpio.close(this.motors.leftFront);
        gpio.close(this.motors.leftBack);
        //   gpio.close(this.motors.rightPower);
        gpio.close(this.motors.rightFront);
        gpio.close(this.motors.rightBack);

        //     gpio.open(this.motors.leftPower, "output", function (err) {});
        gpio.open(this.motors.leftFront, "output", function (err) {});
        gpio.open(this.motors.leftBack, "output", function (err) {});

        //    gpio.open(this.motors.rightPower, "output", function (err) {});
        gpio.open(this.motors.rightFront, "output", function (err) {});
        gpio.open(this.motors.rightBack, "output", function (err) {});

        gpio.open(7, "output", function (err) {});
    },


    shootBall: function () {
        gpio.write(7, 1, function (err) {});
    },

    resetBall: function () {
        gpio.write(7, 0, function (err) {});
    },
    //for moving forward we power both motors
    moveForward: function () {

        leftPower.pwmWrite(leftPowerAmount, function (err) {});
        //gpio.write(this.motors.leftPower, 1, function (err) {});
        gpio.write(this.motors.leftFront, 1, function (err) {});

        rightPower.pwmWrite(rightPowerAmount, function (err) {});
        //  gpio.write(this.motors.rightPower, 1, function (err) {});
        gpio.write(this.motors.rightFront, 1, function (err) {});

    },

    //for moving backward we power both motors but in backward mode
    moveBackward: function () {
        leftPower.pwmWrite(leftPowerAmount, function (err) {});
        //  gpio.write(this.motors.leftPower, 1, function (err) {});
        gpio.write(this.motors.leftBack, 1, function (err) {});

        rightPower.pwmWrite(rightPowerAmount, function (err) {});
        //    gpio.write(this.motors.rightPower, 1, function (err) {});
        gpio.write(this.motors.rightBack, 1, function (err) {});
    },

    //for turning right we power the left motor
    moveRight: function () {
        leftPower.pwmWrite(leftPowerAmount, function (err) {});
        //  gpio.write(this.motors.leftPower, 1, function (err) {});
        gpio.write(this.motors.leftFront, 1, function (err) {});

        rightPower.pwmWrite(rightPowerAmount, function (err) {});

        //    gpio.write(this.motors.rightPower, 1, function (err) {});
        gpio.write(this.motors.rightBack, 1, function (err) {});
    },

    //for turning left we power the right motor
    moveLeft: function () {
        leftPower.pwmWrite(leftPowerAmount, function (err) {});
        //  gpio.write(this.motors.leftPower, 1, function (err) {});
        gpio.write(this.motors.leftBack, 1, function (err) {});

        rightPower.pwmWrite(rightPowerAmount, function (err) {});

        //   gpio.write(this.motors.rightPower, 1, function (err) {});
        gpio.write(this.motors.rightFront, 1, function (err) {});
    },

    moveLeftFWD: function () {
        leftPower.pwmWrite(leftPowerAmount, function (err) {});
        //  gpio.write(this.motors.leftPower, 1, function (err) {});
        gpio.write(this.motors.leftFront, 1, function (err) {});
        gpio.write(this.motors.leftBack, 0, function (err) {});

    },

    moveLeftBWD: function () {
        leftPower.pwmWrite(leftPowerAmount, function (err) {});
        //  gpio.write(this.motors.leftPower, 1, function (err) {});
        gpio.write(this.motors.leftFront, 0, function (err) {});
        gpio.write(this.motors.leftBack, 1, function (err) {});
    },


    stopLeft: function () {
        leftPower.pwmWrite(0, function (err) {});
        //   gpio.write(this.motors.leftPower, 0, function (err) {});
        gpio.write(this.motors.leftFront, 0, function (err) {});
        gpio.write(this.motors.leftBack, 0, function (err) {});
    },

    moveRightFWD: function () {
        rightPower.pwmWrite(rightPowerAmount, function (err) {});
        //   gpio.write(this.motors.rightPower, 1, function (err) {});
        gpio.write(this.motors.rightFront, 1, function (err) {});
        gpio.write(this.motors.rightBack, 0, function (err) {});

    },

    moveRightBWD: function () {
        rightPower.pwmWrite(rightPowerAmount, function (err) {});

        //   gpio.write(this.motors.rightPower, 1, function (err) {});
        gpio.write(this.motors.rightFront, 0, function (err) {});
        gpio.write(this.motors.rightBack, 1, function (err) {});

    },


    stopRight: function () {
        rightPower.pwmWrite(0, function (err) {});

        //   gpio.write(this.motors.rightPower, 0, function (err) {});
        gpio.write(this.motors.rightFront, 0, function (err) {});
        gpio.write(this.motors.rightBack, 0, function (err) {});
    },
	
	//Function to measure the range on the ultrasonic
	measure_distance: function() {
		//check if the array is full
		if(!distance_array || distance_array.length === 5){
			if(distance_array){
				//print the array
				print(distance_array);
			}
			//clear the array;
			distance_array = [];
		}
		//push the sensor data into the array
		distance_array.push(sensor());
	},
	//print array function for distance
	print: function(distances_array) {
		//get the median value in the array
		var distance = statistic.median(distances_array);
		//if it returns -1 that means nothing is in range
		if (distance < 0){
			console.log("Error");
		}else{
			//else print the distance 
			console.log('Distance: ' + distance.toFixed(1) + ' cm');
		}
		
	},
	

    //stop both motors in all directions
    stop: function () {
        leftPower.pwmWrite(0, function (err) {});
        rightPower.pwmWrite(0, function (err) {});

        //   gpio.write(this.motors.leftPower, 0, function (err) {});
        gpio.write(this.motors.leftFront, 0, function (err) {});
        gpio.write(this.motors.leftBack, 0, function (err) {});
        //   gpio.write(this.motors.rightPower, 0, function (err) {});
        gpio.write(this.motors.rightFront, 0, function (err) {});
        gpio.write(this.motors.rightBack, 0, function (err) {});
        gpio.write(7, 0, function (err) {});

    }
};



socket.on('connect', function () {
    console.log("RC C");
    socket.emit('car-connected', socket.id);
});
socket.on('push-position', function (data) {
    console.log("user shot with the following data: window width - " + data.windowW + " x -" + data.x + " y -" + data.y + " velocity -" + data.velocity);
});

socket.on('disconnect', function () {
    socket.emit('car-connected', 'false');
});

socket.on('move', function (direction) {
    console.log(direction);
	measure_distance();
	
    switch (direction) {
    case 'shoot':
        car.shootBall();
        break;
    case 'resetShot':
        car.resetBall();
        break;
    case 'up':
        car.moveForward();
		measure_distance();
        break;
    case 'down':
        car.moveBackward();
		measure_distance();
        break;
    case 'left':
        car.moveLeft();
		measure_distance();
        break;
    case 'right':
        car.moveRight();
		measure_distance();
        break;
    case 'leftSide':
        car.moveLeftFWD();
        break;
    case 'leftSideBWD':
        car.moveLeftBWD();
        break;
    case 'leftStop':
        car.stopLeft();
        break
    case 'rightSide':
        car.moveRightFWD();
        break;
    case 'rightSideBWD':
        car.moveRightBWD();
        break;
    case 'rightStop':
        car.stopRight();
        break

    }
});
//listen for stop signal
socket.on('stop', function () {
    console.log("Stop!");
    car.stop();
});


car.init();

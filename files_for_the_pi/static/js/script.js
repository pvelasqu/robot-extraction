// javascript for using a gamepad

var socket = io.connect(),
    ui = {
        up: $('.btn-up'),
        left: $('.btn-left'),
        down: $('.btn-down'),
        right: $('.btn-right'),
        all: $('.btn')
    },
    activeClass = 'is-active',
    isPressed = false;



$(document).ready(function () {

    // Attach it to the window so it can be inspected at the console.


    //listen for key presses
    $(document).keydown(function (e) {
        //don't do anything if there's already a key pressed
        if (isPressed) return;

        isPressed = true;
        switch (e.which) {
        case 38:
            socket.emit('move', 'up');
            ui.up.addClass(activeClass);
            break;
        case 37:
            socket.emit('move', 'left');
            ui.left.addClass(activeClass);
            break;
        case 40:
            socket.emit('move', 'down');
            ui.down.addClass(activeClass);
            break;
        case 39:
            socket.emit('move', 'right');
            ui.right.addClass(activeClass);
            break;
        case 32:
            socket.emit('move', 'shoot');
            ui.right.addClass(activeClass);
            break;
        }
    });

    //stop all motors when any key is released
    $(document).keyup(function (e) {
        ui.all.removeClass(activeClass);
        socket.emit('stop');
        isPressed = false;
    });


    $("#btn-up")
        .tapstart(function () {
            socket.emit('move', 'up');
            ui.up.addClass(activeClass);
        })
        .tapend(function () {
            ui.all.removeClass(activeClass);
            socket.emit('stop');
        });

    $("#btn-down")
        .tapstart(function () {
            socket.emit('move', 'down');
            ui.up.addClass(activeClass);
        })
        .tapend(function () {
            ui.all.removeClass(activeClass);
            socket.emit('stop');
        });

    $("#btn-left")
        .tapstart(function () {
            socket.emit('move', 'left');
            ui.up.addClass(activeClass);
        })
        .tapend(function () {
            ui.all.removeClass(activeClass);
            socket.emit('stop');
        });

    $("#btn-right")
        .tapstart(function () {
            socket.emit('move', 'right');
            ui.up.addClass(activeClass);
        })
        .tapend(function () {
            ui.all.removeClass(activeClass);
            socket.emit('stop');
        });


    // Attach it to the window so it can be inspected at the console.
    window.gamepad = new Gamepad();
    gamepad.bind(Gamepad.Event.CONNECTED, function (device) {
        console.log('Connected', device);

        $('#gamepads').append('<li id="gamepad-' + device.index + '"><h1>Gamepad #' + device.index + ': &quot;' + device.id + '&quot;</h1></li>');

        var mainWrap = $('#gamepad-' + device.index),
            statesWrap,
            logWrap,
            control,
            value,
            i;

        mainWrap.append('<strong>State</strong><ul id="states-' + device.index + '"></ul>');
        mainWrap.append('<strong>Events</strong><ul id="log-' + device.index + '"></ul>');

        statesWrap = $('#states-' + device.index)
        logWrap = $('#log-' + device.index)

        for (control in device.state) {
            value = device.state[control];

            statesWrap.append('<li>' + control + ': <span id="state-' + device.index + '-' + control + '">' + value + '</span></li>');
        }
        for (i = 0; i < device.buttons.length; i++) {
            value = device.buttons[i];
            statesWrap.append('<li>Raw Button ' + i + ': <span id="button-' + device.index + '-' + i + '">' + value + '</span></li>');
        }
        for (i = 0; i < device.axes.length; i++) {
            value = device.axes[i];
            statesWrap.append('<li>Raw Axis ' + i + ': <span id="axis-' + device.index + '-' + i + '">' + value + '</span></li>');
        }

        $('#connect-notice').hide();
    });

    gamepad.bind(Gamepad.Event.DISCONNECTED, function (device) {
        console.log('Disconnected', device);

        $('#gamepad-' + device.index).remove();

        if (gamepad.count() == 0) {
            $('#connect-notice').show();
        }
    });

    gamepad.bind(Gamepad.Event.TICK, function (gamepads) {
        var gamepad,
            wrap,
            control,
            value,
            i,
            j;


        for (i = 0; i < gamepads.length; i++) {
            gamepad = gamepads[i];
            wrap = $('#gamepad-' + i);

            if (gamepad) {
                for (control in gamepad.state) {
                    value = gamepad.state[control];

                    $('#state-' + gamepad.index + '-' + control + '').html(value);
                }
                for (j = 0; j < gamepad.buttons.length; j++) {
                    value = gamepad.buttons[j];

                    $('#button-' + gamepad.index + '-' + j + '').html(value);
                }
                for (j = 0; j < gamepad.axes.length; j++) {
                    value = gamepad.axes[j];

                    $('#axis-' + gamepad.index + '-' + j + '').html(value);
                }
            }
        }
    });

    gamepad.bind(Gamepad.Event.BUTTON_DOWN, function (e) {
        $('#log-' + e.gamepad.index).append('<li>' + e.control + ' down</li>');
        console.log(e.gamepad + " was pressed " + e.control);
        if (e.control == "LEFT_BOTTOM_SHOULDER") {
            console.log("Moving Left side");
            socket.emit('move', 'leftSide');
            ui.left.addClass(activeClass);
        } else if (e.control == "RIGHT_BOTTOM_SHOULDER") {
            console.log("Moving Right side");
            socket.emit('move', 'rightSide');
            ui.right.addClass(activeClass);
        } else if (e.control == "FACE_2") {
            console.log("Shoot!!");
            socket.emit('move', 'shoot');
            ui.right.addClass(activeClass);
        }

    });

    gamepad.bind(Gamepad.Event.BUTTON_UP, function (e) {
        $('#log-' + e.gamepad.index).append('<li>' + e.control + ' up</li>');
        if (e.control == "LEFT_BOTTOM_SHOULDER") {
            console.log("Stopping Left side");
            socket.emit('move', 'leftStop');
            ui.left.removeClass(activeClass);
        } else if (e.control == "RIGHT_BOTTOM_SHOULDER") {
            console.log("Stopping Right side");
            socket.emit('move', 'rightStop');
            ui.right.removeClass(activeClass);
        } else if (e.control == "FACE_2") {
            console.log("Reset Shot");
            socket.emit('move', 'resetShot');
            ui.right.addClass(activeClass);
        }


    });

    gamepad.bind(Gamepad.Event.AXIS_CHANGED, function (e) {
        $('#log-' + e.gamepad.index).append('<li>' + e.axis + ' changed to ' + e.value + '</li>');
        console.log(e.gamepad.state.LEFT_BOTTOM_SHOULDER);
        console.log(e.gamepad.axes[5]);
        console.log(e.gamepad.axes[1]);
        console.log(e.axis);
        if (e.axis == "EXTRA_AXIS_2" && e.gamepad.state.RIGHT_BOTTOM_SHOULDER == 0) {
            if (e.value > 0.05) {
                console.log("Movin' Backwards on the right");
                socket.emit('move', 'rightSideBWD');
                ui.right.addClass(activeClass);
            } else if (e.value < -0.05) {
                console.log("Movin' Forwards on the right");
                socket.emit('move', 'rightSide');
                ui.right.addClass(activeClass);
            } else {
                console.log("Stopped on the right");
                socket.emit('move', 'rightStop');
                ui.right.removeClass(activeClass);
            }
        } else if (e.axis == "LEFT_STICK_Y" && e.gamepad.state.RIGHT_BOTTOM_SHOULDER == 0) {
            if (e.value > 0.1) {
                console.log("Movin' Backwards on the left");
                socket.emit('move', 'leftSideBWD');
                ui.left.addClass(activeClass);
            } else if (e.value < -0.1) {
                console.log("Movin' Forwards on the left");
                socket.emit('move', 'leftSide');
                ui.left.addClass(activeClass);
            } else {
                console.log("Stopped on the left");
                socket.emit('move', 'leftStop');
                ui.left.removeClass(activeClass);
            }

        }

    });

    if (!gamepad.init()) {
        alert('Your browser does not support gamepads, get the latest Google Chrome or Firefox.');
    }



});
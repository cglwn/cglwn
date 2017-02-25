'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function () {
    var sceneGraphModule = createSceneGraphModule();
    var appContainer = document.getElementById('app-container');
    var state = createNodeState();
    var SELECT_STATE = state.SELECT_STATE;
    var HOVER_STATE = state.HOVER_STATE;
    //initialize initial state of canvas

    var canvas = document.getElementById('canvas');
    canvas.setAttribute('width', '800');
    canvas.setAttribute('height', '600');

    //initialize initial state of context to render at centre
    var context = canvas.getContext('2d');
    context.strokeStyle = "black";
    context.strokeRect(0, 0, 800, 600);
    context.font="16px Arial";

    //initialize and draw root(car) node
    var carNode = new sceneGraphModule.CarNode();
    carNode.startPositionTransform.translate(400, 300);

    //initialize axles
    var frontAxleNode = new sceneGraphModule.AxleNode(sceneGraphModule.FRONT_AXLE_PART);
    frontAxleNode.startPositionTransform.translate(0, 13);
    frontAxleNode.objectTransform.scale(25/30, 1);
    var backAxleNode = new sceneGraphModule.AxleNode(sceneGraphModule.BACK_AXLE_PART);
    backAxleNode.startPositionTransform.translate(0,-13);
    backAxleNode.objectTransform.scale(25/30, 1);
    carNode.addChild(frontAxleNode);
    carNode.addChild(backAxleNode);

    //initialize dem wheels
    var flWheelNode = new sceneGraphModule.TireNode(sceneGraphModule.FRONT_LEFT_TIRE_PART);
    flWheelNode.startPositionTransform.translate(15,0);
    var frWheelNode = new sceneGraphModule.TireNode(sceneGraphModule.FRONT_RIGHT_TIRE_PART);
    frWheelNode.startPositionTransform.translate(-15,0);
    var blWheelNode = new sceneGraphModule.TireNode(sceneGraphModule.BACK_LEFT_TIRE_PART);
    blWheelNode.startPositionTransform.translate(15,0);
    var brWheelNode = new sceneGraphModule.TireNode(sceneGraphModule.BACK_RIGHT_TIRE_PART);
    brWheelNode.startPositionTransform.translate(-15,0);
    frontAxleNode.addChild(flWheelNode);
    frontAxleNode.addChild(frWheelNode);
    backAxleNode.addChild(brWheelNode);
    backAxleNode.addChild(blWheelNode);

    carNode.render(context);

    var startDrag = false;
    var dragX;
    var dragY;
    //handle click events
    canvas.addEventListener('mousemove', function (e) {
        var bounds = canvas.getBoundingClientRect();
        var x = e.clientX - bounds.left;
        var y = e.clientY - bounds.top;

        if (carNode.state == SELECT_STATE.DEFAULT) {
            carNode.setState(HOVER_STATE.DEFAULT);
        }

        var inObject = carNode.pointInObject({x: x, y: y});

        var wheelHovered = flWheelNode.state == HOVER_STATE.HOVER_WHEEL ||
            frWheelNode.state == HOVER_STATE.HOVER_WHEEL ||
            blWheelNode.state == HOVER_STATE.HOVER_WHEEL ||
            brWheelNode.state == HOVER_STATE.HOVER_WHEEL;
        if (wheelHovered) {
            carNode.setState(HOVER_STATE.HOVER_WHEEL);
        }
        var dx = x - dragX;
        var dy = y - dragY;
        if (carNode.state == SELECT_STATE.DRAGGABLE) {
            carNode.objectTransform.translate(dx, dy);
            dragX = x;
            dragY = y;
        } else if (carNode.state == SELECT_STATE.SCALABLE_LENGTH) {
            var startT = carNode.startPositionTransform;
            var objectT = carNode.objectTransform;
            var MAX_SCALE = 4;
            var MIN_SCALE = 1;

            var scaleY = (startT.getScaleY() * 25 * objectT.getScaleY() + dy * carNode.stretchFactor) / 25;
            scaleY = Math.min(MAX_SCALE, scaleY);
            scaleY = Math.max(MIN_SCALE, scaleY);


            var length = 50 * startT.getScaleY() * objectT.getScaleY();
            frontAxleNode.startPositionTransform = AffineTransform.getTranslateInstance(0, length/2 - 12);
            backAxleNode.startPositionTransform = AffineTransform.getTranslateInstance(0, -(length/2 - 12));

            carNode.startPositionTransform.m11_ = scaleY;
            dragX = x;
            dragY = y;
        } else if (carNode.state == SELECT_STATE.SCALABLE_WIDTH) {
            var startT = carNode.startPositionTransform;
            var objectT = carNode.objectTransform;
            var MAX_SCALE = 6;
            var MIN_SCALE = 1;

            var scaleX = (startT.getScaleX() * 25 * objectT.getScaleX() + dx *carNode.stretchFactor) / 25;
            scaleX = Math.min(MAX_SCALE, scaleX);
            scaleX = Math.max(MIN_SCALE, scaleX);

            var width = 25 * startT.getScaleX() * objectT.getScaleX();

            var stretchTransform = AffineTransform.getScaleInstance(25/30 * scaleX, 1);

            frontAxleNode.objectTransform = stretchTransform
                .concatenate(AffineTransform.getTranslateInstance(frontAxleNode.objectTransform.getTranslateX(),
                                                                  frontAxleNode.objectTransform.getTranslateY()));
            backAxleNode.objectTransform = stretchTransform
                .concatenate(AffineTransform.getTranslateInstance(backAxleNode.objectTransform.getTranslateX(),
                                                                  backAxleNode.objectTransform.getTranslateY()));
            carNode.startPositionTransform.m00_ = scaleX;
            dragX = x;
            dragY = y;
        } else if (carNode.state == SELECT_STATE.ROTATABLE) {
            carNode.startPositionTransform.rotate(Math.atan2(dy/dx));
            dragX = x;
            dragY = y;
        } else if(carNode.state == SELECT_STATE.WHEEL) {
            var startT = frontAxleNode.startPositionTransform;
            var objectT = frontAxleNode.objectTransform;
            var MAX_SCALE = 2;
            var MIN_SCALE = 1;

            var scaleX = (startT.getScaleX() * 25 * objectT.getScaleX() + dx)/20;
            scaleX = Math.min(MAX_SCALE, scaleX);
            scaleX = Math.max(MIN_SCALE, scaleX);

            frontAxleNode.startPositionTransform.m00_ = scaleX;
            backAxleNode.startPositionTransform.m00_ = scaleX;
            dragX = x;
            dragY = y;
        }  else {
            context.clearRect(1, 1, canvas.width-2, canvas.height-2);
            context.fillText(carNode.state, 20, 20);
            carNode.setState(SELECT_STATE.DEFAULT);
            carNode.render(context);
            return;
            dragX = x;
            dragY = y;
        }


        context.clearRect(1, 1, canvas.width-2, canvas.height-2);
        context.fillText(carNode.state, 20, 20);
        carNode.render(context);
    });

    canvas.addEventListener('mouseup', function (e) {
        //http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
        var bounds = canvas.getBoundingClientRect();
        var inObject = carNode.pointInObject({
            x: e.clientX - bounds.left,
            y: e.clientY - bounds.top
        });
        if (carNode.state != SELECT_STATE.DEFAULT) {
            carNode.setState(SELECT_STATE.DEFAULT);
        }

        context.clearRect(1, 1, canvas.width-2, canvas.height-2);
        context.fillText(carNode.state, 20, 20);
        carNode.render(context);
    });

    canvas.addEventListener('mousedown', function (e) {
        //http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
        var bounds = canvas.getBoundingClientRect();
        var x = e.clientX - bounds.left;
        var y = e.clientY - bounds.top;

        carNode.setState(SELECT_STATE.MOUSE_DOWN);
        var inObject = carNode.pointInObject({x: x, y: y});
        var wheelSelected = flWheelNode.state == SELECT_STATE.WHEEL ||
            frWheelNode.state == SELECT_STATE.WHEEL ||
            blWheelNode.state == SELECT_STATE.WHEEL ||
            brWheelNode.state == SELECT_STATE.WHEEL;
        if (inObject || wheelSelected) {
            dragX = x;
            dragY = y;
            if (wheelSelected) {
                carNode.setState(SELECT_STATE.WHEEL);
            }
            console.log(carNode.state);
        } else {
            carNode.setState(SELECT_STATE.DEFAULT);
        }

        context.clearRect(1, 1, canvas.width-2, canvas.height-2);
        context.fillText(carNode.state, 20, 20);
        carNode.render(context);
    });

    canvas.addEventListener('keydown', function(e) {
        carNode.objectTransform.translate(0, 100);
        context.clearRect(1, 1, canvas.width-2, canvas.height-2);
        carNode.render(context);
    }, true);
});

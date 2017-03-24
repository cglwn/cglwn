"use strict";

const Color = {
    Red: "#e06666",
    Blue: "#6fa8dc",
    Gray: "#efefef",
    Green: "#93c47d",
    Yellow: "#ffd966"
};

class State {
    constructor(x, y, theta) {
        this.height = height;
        this.width = width;
    }
}

class OptimizationVisualization {
    constructor() {}
}

/**
 * Draws a triangle on a 2D Canvas. Assumes the fill and stroke styles have been
 * set.
 * @param context2D The 2D context.
 * @param x1 The x value of vertex 1.
 * @param y1 The y value of vertex 1.
 * @param x2 The x value of vertex 2.
 * @param y2 The y value of vertex 2.
 * @param x3 The x value of vertex 3.
 * @param y3 The y value of vertex 3.
 */
function drawTriangle(context2D, x1, y1, x2, y2, x3, y3) {
    context2D.beginPath();
    context2D.moveTo(x1, y1);
    context2D.lineTo(x2, y2);
    context2D.stroke();

    context2D.beginPath();
    context2D.moveTo(x2, y2);
    context2D.lineTo(x3, y3);
    context2D.stroke();

    context2D.beginPath();
    context2D.moveTo(x3, y3);
    context2D.lineTo(x1, y1);
    context2D.stroke();
}


/**
 * Draws a circle on a 2D Canvas. Assumes the fill and stroke styles have been
 * set.
 * @param context2D The 2D context.
 * @param centerX The x-coordinate of the circle's center.
 * @param centerY The y-coordinate of the circle's center.
 * @param radius The radius of the circle.
 */
function drawCircle(context2D, centerX, centerY, radius) {
    context2D.beginPath();
    context2D.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context2D.fill();
}

/**
 * Draws a pose on a 2D Canvas. Assumes the fill and stroke styles have been
 * set.
 * @param context2D The 2D context.
 * @param x The x translation of the pose relative the the context's frame.
 * @param y The y translation of the pose relative the the context's frame.
 * @param theta The angle of rotation of the pose relative to the context's
 *     frame.
 */
function drawPose(context2D, x, y, theta) {
    const scale = 10;
    context2D.save();

    // Draw the x-axis of the pose gnommon.
    context2D.strokeStyle = Color.Red;
    context2D.beginPath();
    context2D.moveTo(x, y);
    context2D.lineTo(x + scale * Math.cos(theta), y + scale * Math.sin(theta));
    context2D.stroke();
    context2D.closePath();

    // Draw the y-axis of the pose gnommon.
    context2D.beginPath();
    context2D.strokeStyle = Color.Green;
    context2D.moveTo(x, y);
    context2D.lineTo(x + scale * Math.cos(theta + Math.PI / 2), y + scale * Math.sin(theta + Math.PI / 2));
    context2D.stroke();
    context2D.closePath();

    context2D.restore();
}

/**
 * Draws a SLAM optimization step from GTSAM.
 * @param context2D The 2D context.
 * @param data An object containing the data. See slam_data.js for an example.
 */
function drawSlamData(context2D, data) {
    // Draw the text.
    context2D.fillStyle = "black";
    context2D.fillText(data.id, 30, 30);

    //Draw the poses and landmarks.
    const scale = 10;
    const offset = 50;
    for (const value of data.values) {
        // context2D.fillText(value.key, value.x, value.y);
        if (value.key.includes("l")) {
            // Draw a landmark.
            context2D.fillStyle = Color.Yellow;
            drawCircle(context2D, scale * value.value.x + offset, scale * value.value.y + offset, 2.0);
        } else if (value.key.includes("x")){
            // Draw a pose.
            drawPose(context2D, scale * value.value.x + offset,
                     scale * value.value.y + offset, value.value.theta);
        }
    }
}

/**
 * Demo some of the draw functions.
 * @param context2D The 2D context.
 */
function demoDrawing(context2D) {
    context2D.fillStyle = Color.Gray;
    context2D.fillRect(10, 10, 100, 100);

    context2D.strokeStyle = Color.Yellow;
    drawTriangle(context2D, 0 + 10, 0 + 10, 50 + 10, Math.sqrt(30000 / 4) + 10, 0 + 10, 100 + 10);

    // Set the stroke to be blue.
    context2D.fillStyle = Color.Blue;
    drawCircle(context2D, 50, 50, 10);

    drawPose(context2D, 30, 30, Math.PI / 8.0);
}

document.addEventListener("DOMContentLoaded", function(event) {
    let articleContainer = document.getElementById("article-container");
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");

    // demoDrawing(context);

    context.save();
    if (slam_data) {
        var i = 0;
        function tick() {
            context.clearRect(0, 0, 1000, 600);
            drawSlamData(context, slam_data[i]);
            i = (i + 1) % slam_data.length;
        }
        tick();
        var waitOnFirstPoseInterval = setInterval(() => {
            clearInterval(waitOnFirstPoseInterval);
            setInterval(tick, 1000);
        }, 5000);
    } else {
        context.fillText("Could not find SLAM data.", 50, 50);
    }
    context.restore();
});

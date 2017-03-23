"use strict";

class State {
    constructor(x, y, theta) {
        this.height = height;
        this.width = width;
    }
}

class Application {}

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
    const scale = 20;
    context2D.save();

    // Draw the x-axis of the pose gnommon.
    context2D.strokeStyle = "red";
    context2D.beginPath();
    context2D.moveTo(x, y);
    context2D.lineTo(x + scale * Math.cos(theta), y + scale * Math.sin(theta));
    context2D.stroke();
    context2D.closePath();

    // Draw the y-axis of the pose gnommon.
    context2D.beginPath();
    context2D.strokeStyle = "blue";
    context2D.moveTo(x, y);
    context2D.lineTo(x + scale * Math.cos(theta + Math.PI / 2), y + scale * Math.sin(theta + Math.PI / 2));
    context2D.stroke();
    context2D.closePath();

    context2D.restore();
}

document.addEventListener("DOMContentLoaded", function(event) {
    let articleContainer = document.getElementById("article-container");
    let canvas = document.getElementById("canvas");
    let context = canvas.getContext("2d");

    // Draw a rectangle.
    context.fillStyle = "yellow";
    context.fillRect(10, 10, 100, 100);

    context.strokeStyle = "green";
    drawTriangle(context, 0 + 10, 0 + 10, 50 + 10, Math.sqrt(30000 / 4) + 10, 0 + 10, 100 + 10);

    // Set the stroke to be blue.
    context.fillStyle = "blue";
    drawCircle(context, 50, 50, 10);

    drawPose(context, 30, 30, Math.PI / 8.0);
});

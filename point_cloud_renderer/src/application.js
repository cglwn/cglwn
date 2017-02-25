class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.matrix_storage = Array(rows);

        for (let i = 0; i < rows; i++) {
            this.matrix_storage[i] = Array(cols);
        }

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.matrix_storage[i][j] = 0;
            }
        }
    }

    set(row, col, value) {
        if (row < 0 || row > this.rows || col < 0 || col > this.cols) {
            throw ("Out of bounds call on Matrix.set");
        }
        this.matrix_storage[row][col] = value;
    }

    get(row, col) {
        if (row < 0 || row > this.rows || col < 0 || col > this.cols) {
            throw ("Out of bounds call on Matrix.get");
        }
        return this.matrix_storage[row][col];
    }

    multiply(rhs_matrix) {
        if (this.cols !== rhs_matrix.rows) {
            throw ("Matrix sizes do not match.");
        }

        let result = new Matrix(this.rows, rhs_matrix.cols);

        //TODO(cglwn) Optimize this if it is too slow.
        //TODO(cglwn) Could refactor this class to hold Linear Algebra vectors.
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < rhs_matrix.cols; j++) {
                let result_ij = 0.0;

                for (let k = 0; k < this.cols; k++) {
                    result_ij += this.get(i, k) * rhs_matrix.get(k, j);
                }
                result.set(i, j, result_ij);
            }
        }
        return result;
    }

    print() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                console.log("i: " + i);
                console.log("j: " + j);
                console.log(this.matrix_storage[i][j]);
            }
        }
    }
}

class PlyFile {
    constructor(ply) {
        let plylines = ply.split("\n");
        console.log(plylines);
        for (var i = 0; i < 36; i++) {
            let tokens = plylines[i].split(" ");
            let x = tokens[0];
            let y = tokens[1];
            let z = tokens[2];
            console.log(tokens);
            console.log(x);
        }
    }
}

class PinholeCamera {
    constructor(fx, fy, cx, cy) {
        this.fx = fx;
        this.fy = fy;
        this.cx = cx;
        this.cy = cy;
    }

    projectPoint(p_ca) {
        const p_im_x = p_ca.x / p_ca.z;
        const p_im_y = p_ca.y / p_ca.z;

        return {
            x: this.fx * p_im_x + this.cx,
            y: this.fy * p_im_y + this.cy
        };
    }
}

function drawCircleAt(context, circle, color = "red") {
    context.save();
    context.beginPath();
    context.translate(circle.cx - circle.r, circle.cy - circle.r);
    context.scale(circle.r, circle.r);
    context.arc(1, 1, 1, 0, 2 * Math.PI, false);
    context.restore();
    // context.stroke();

    const path = new Path2D();
    context.fillStyle = color;
    path.ellipse(circle.cx, circle.cy, circle.r, circle.r, 0, 0, 2 * Math.PI, false);
    context.fill(path);
    return context;
}

function colorScale(values) {
    // Choose an appropriate color scheme.
    // Get the color for all of the values.
}

/**
 *
 * @param context A 2D drawing context to draw the point on.
 * @param point A point in the camera frame.
 * @param color
 * @param rotation
 */
function drawPoint(context, point, color = "red", translation = [0.0, 0.0, 0.0], rotation = [0.0, 0.0, 0.0]) {
    const camera = new PinholeCamera(20, 20, 20, 20);
    if (point[2] < 0.0) {
        return;
    }

    let distance = point[0] * point[0] + point[1] * point[1] + point[2] * point[2];
    const im_px = camera.projectPoint(translatePoint(translation[0],
        translation[1],
        translation[2], rotatePoint(rotation[0],
            rotation[1] * Math.PI / 180,
            rotation[2] * Math.PI / 180, {
                x: point[0],
                y: point[1],
                z: point[2]
            })));

    drawCircleAt(context, {
        cx: im_px.x,
        cy: im_px.y,
        r: 5
    }, color);
}

class Scene3DView {
    constructor(camera_model) {
        if (camera_model == undefined) {
            throw ("`camera_model` is a required field for constructor `Scene3DView`");
        }
        camera_model.addObserver();
    }
}

class PinholeCameraModel {
    constructor(camera) {
        if (camera == undefined) {
            throw ("camera is a requried field for constructor PinholeCameraModel");
        }

        this.callbacks = [];
        this.camera = camera;
    }

    addObserver(callback) {
        this.callbacks.push(callback);
    }

    incrementFx() {
        this.camera.fx = this.camera.fx + 1;
        this.callbacks.forEach((callback) => {
            callback(this.camera);
        });
    }
}


const colors = {
    grayscale: (values) => {
        const max_value = Math.max(...values);
        return values.map((value) => {
            const scaled_value = Math.round(255 * value / max_value);
            const hex = scaled_value.toString(16);
            return "#" + hex + hex + hex;
        });
    }
};

function rotatePoint(roll, pitch, yaw, point) {
    const yaw_matrix = new Matrix(3, 3);
    yaw_matrix.set(0, 0, Math.cos(yaw));
    yaw_matrix.set(0, 1, -Math.sin(yaw));
    yaw_matrix.set(1, 0, Math.sin(yaw));
    yaw_matrix.set(1, 1, Math.cos(yaw));
    yaw_matrix.set(2, 2, 1);

    const pitch_matrix = new Matrix(3, 3);
    pitch_matrix.set(0, 0, Math.cos(pitch));
    pitch_matrix.set(0, 2, Math.sin(pitch));
    pitch_matrix.set(2, 0, -Math.sin(pitch));
    pitch_matrix.set(2, 2, Math.cos(pitch));
    pitch_matrix.set(1, 1, 1);

    const roll_matrix = new Matrix(3, 3);
    roll_matrix.set(1, 1, Math.cos(roll));
    roll_matrix.set(2, 1, Math.sin(roll));
    roll_matrix.set(1, 2, -Math.sin(roll));
    roll_matrix.set(2, 2, Math.cos(roll));
    roll_matrix.set(0, 0, 1);

    const rotation_matrix = yaw_matrix
        .multiply(pitch_matrix)
        .multiply(roll_matrix);

    const point_matrix = new Matrix(3, 1);
    point_matrix.set(0, 0, point.x);
    point_matrix.set(1, 0, point.y);
    point_matrix.set(2, 0, point.z);

    const rotated_point = rotation_matrix.multiply(point_matrix);


    return {
        x: rotated_point.get(0, 0),
        y: rotated_point.get(1, 0),
        z: rotated_point.get(2, 0)
    };
}

function translatePoint(x, y, z, point) {
    return {
        x: point.x + x,
        y: point.y + y,
        z: point.z + z
    };
}

class ApplicationModel {
    constructor(points, translation, rotation) {
        this.points = points;
        this.x = translation[0];
        this.y = translation[1];
        this.z = translation[2];
        this.roll = rotation[0];
        this.pitch = rotation[1];
        this.yaw = rotation[2];
        this.observers = [];
    }

    setRotation(rotation) {
        this.roll = rotation[0];
        this.pitch = rotation[1];
        this.yaw = rotation[2];
        this.notifyObservers();
    }

    setTranslation(translation) {
        this.x = translation[0];
        this.y = translation[1];
        this.z = translation[2];
        this.notifyObservers();
    }

    addObserver(observer) {
        this.observers.push(observer);
    }


    notifyObservers() {
        this.observers.forEach(observer =>
            observer(this.points,
                this.x,
                this.y,
                this.z,
                this.roll,
                this.pitch,
                this.yaw));
    }


};

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#90C3D4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const x1 = [13.32, 12.84, 3.05];
    const x2 = [1.44, 1.84, 1.06];
    const x3 = [5.56, 5.84, 1.024];

    const zs = [x1, x2, x3].map(point => point[2]);
    const point_colors = colors.grayscale(zs);
    drawPoint(ctx, x1, point_colors[0]);
    drawPoint(ctx, x2, point_colors[1]);
    drawPoint(ctx, x3, point_colors[2]);

    canvas.addEventListener("click", (event) => {
        console.log("Clicked");
    });

    const camera = new PinholeCamera(20, 20, 20, 20);
    const model = new PinholeCameraModel(camera);

    model.addObserver((camera) => {
        console.log("Camera fx is now:");
        console.log(camera.fx);
    });

    model.incrementFx();
    model.incrementFx();
    const m1 = new Matrix(1, 1);
    m1.set(0, 0, 2);
    console.log("m1");
    console.log(m1.print());
    console.log("m1");
    console.log("m1");
    console.log("m1");
    console.log("m1");
    console.log("m1");
    const m2 = new Matrix(1, 1);
    m2.set(0, 0, 3);

    console.log(m1.multiply(m2).print());

    app_model = new ApplicationModel([x1, x2, x3], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]);
    app_model.addObserver((points, x, y, z, roll, pitch, yaw) => {
        points.forEach(point => {
            drawPoint(ctx, point, "red", [x, y, z], [roll, pitch, yaw]);
        });
    });

    app_model.addObserver((points, x, y, z, roll, pitch, yaw) => {
        console.log("New x is " + x);
        console.log("New Yaw is " + yaw);
    });

    // app_model.setRotation([0, 250, 300]);


    const xSlider = document.getElementById("x-slider");
    xSlider.addEventListener("input", () => {
        ctx.fillStyle = "#90C3D4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        app_model.setTranslation([parseFloat(xSlider.value), app_model.y, app_model.z]);
    });

    const ySlider = document.getElementById("y-slider");
    ySlider.addEventListener("input", () => {
        ctx.fillStyle = "#90C3D4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        app_model.setTranslation([app_model.x, parseFloat(ySlider.value), app_model.z]);
    });

    const zSlider = document.getElementById("z-slider");
    zSlider.addEventListener("input", () => {
        ctx.fillStyle = "#90C3D4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        app_model.setTranslation([app_model.x, app_model.y, parseFloat(zSlider.value)]);
    });

    const rollSlider = document.getElementById("roll-slider");
    rollSlider.addEventListener("input", () => {
        ctx.fillStyle = "#90C3D4";
        ctx.fill(0, 0, canvas.width, canvas.height);
        app_model.setRotation([parseFloat(rollSlider.value), app_model.pitch, app_model.yaw]);
    });

    const pitchSlider = document.getElementById("pitch-slider");
    pitchSlider.addEventListener("input", () => {
        ctx.fillStyle = "#90C3D4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        app_model.setRotation([app_model.roll, parseFloat(pitchSlider.value), app_model.yaw]);
    });

    const yawSlider = document.getElementById("yaw-slider");
    yawSlider.addEventListener("input", () => {
        ctx.fillStyle = "#90C3D4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        app_model.setRotation([app_model.roll, app_model.pitch, parseFloat(yawSlider.value)]);
    });

    document.addEventListener("keypress", e => {
        switch (e.key) {
            case "w":
                ctx.fillStyle = "#90C3D4";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                app_model.setTranslation([app_model.x, app_model.y, app_model.z + 0.01]);
                break;
            case "a":
                ctx.fillStyle = "#90C3D4";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                app_model.setTranslation([app_model.x, app_model.y - 0.01, app_model.z]);
                break;
            case "s":
                ctx.fillStyle = "#90C3D4";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                app_model.setTranslation([app_model.x, app_model.y, app_model.z - 0.01]);
                break;
            case "d":
                console.log("d");
                ctx.fillStyle = "#90C3D4";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                app_model.setTranslation([app_model.x, app_model.y + 0.01, app_model.z]);
                break;
            default:
                return;
        }
    });
});

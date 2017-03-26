class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.matrixStorage = Array(rows);

        for (let i = 0; i < rows; i++) {
            this.matrixStorage[i] = Array(cols);
        }

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.matrixStorage[i][j] = 0;
            }
        }
    }

    set(row, col, value) {
        if (row < 0 || row > this.rows || col < 0 || col > this.cols) {
            throw ("Out of bounds call on Matrix.set");
        }
        this.matrixStorage[row][col] = value;
    }

    get(row, col) {
        if (row < 0 || row > this.rows || col < 0 || col > this.cols) {
            throw ("Out of bounds call on Matrix.get");
        }
        return this.matrixStorage[row][col];
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
                console.log(this.matrixStorage[i][j]);
            }
        }
    }
}

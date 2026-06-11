const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;
canvas.style.border = "1px solid black";
document.body.appendChild(canvas);

var gridSize;

const randomGradientVectors = [
    [1, 0],
    [0.8, 0.6],
    [0, 1],
    [-0.8, 0.6],
    [-1, 0],
    [-0.8, -0.6],
    [0, -1],
    [0.8, -0.6]
 ]

var gradientVectors = []
var pixelMatrix = []
var min_gradient, max_gradient;

(function init() {
    pixelMatrix = []
    for(let i=0; i < canvas.width; i++) {
        var row = []
        for(let j=0; j < canvas.width; j++) {
            row.push(0);
        }
        pixelMatrix.push(row);
    }
})();

function reset() {
    gradientVectors = []
    min_gradient = 99999;
    max_gradient = -9999;    
}

// divide pixels into grid
// generate random gradient vectors at each grid corner
function generateRandomGradientVectors() {
    var randomVector;
    for(let i=0; i < (canvas.width / gridSize) + 1; i++) {
        var row = []
        for(let j=0; j < (canvas.width / gridSize) + 1; j++) {
            var randomVector 
            if (mode == "perlin") {
                randomVector = randomGradientVectors[Math.floor(Math.random() * randomGradientVectors.length)]
            } else {
                var randomScalarList = [0, 0.25, 0.5, 0.75, 1, -0.25, -0.5, -0.75, -1]
                randomVector = randomScalarList[Math.floor(Math.random() * 9)]
                randomVector = (2* Math.random()) - 1 // [0,1] -> [-1, 1] 
            }
            row.push(randomVector)
        }
        gradientVectors.push(row);
    }
}

function interpolate(a0, a1, weight) {
    var t = weight
    var cubic = a0 + (a1 - a0) * (6 * Math.pow(t, 5) - 15 * Math.pow(t,4) + 10 * Math.pow(t,3))
    var linear = a0 + (a1 - a0) * t
    return cubic
}

// compute result for each pixel
// 1 - locate grid
// 2 - get grid vectors (gradient vectors)
// 3 - get pixel coordinates w.r.t grid
// 4 - calculate displacement vector w.r.t gradient vector's position
function computePerlinNoiseScalarForPixels(amplitude) {
    for(let i=0; i < canvas.width; i++) {
        let row = [];
        for(let j=0; j < canvas.width; j++) {
            // 1
            var grid_i = Math.floor(i / gridSize); 
            var grid_j = Math.floor(j / gridSize);


            // 2
            var g1 = gradientVectors[grid_i][grid_j]
            var g2 = gradientVectors[grid_i][grid_j + 1]
            var g3 = gradientVectors[grid_i + 1][grid_j]
            var g4 = gradientVectors[grid_i + 1][grid_j + 1]
            
            // 3
            var pixel_y = (i % gridSize) * (1/gridSize)
            var pixel_x = (j % gridSize) * (1/gridSize)

            // 4
            var d1 = [pixel_x, pixel_y]
            var d2 = [pixel_x - 1, pixel_y]
            var d3 = [pixel_x, pixel_y - 1]
            var d4 = [pixel_x - 1, pixel_y - 1]

            var dot1 = getDotProduct(d1, g1);
            var dot2 = getDotProduct(d2, g2);
            var dot3 = getDotProduct(d3, g3);
            var dot4 = getDotProduct(d4, g4);

            // 6 - interpolate
            
            // 6.1 - inerpolate top 2 corners
            // bilinear -> (dot1 * (1-pixel_x)) + (dot2 * pixel_x) 
            var top_influence = interpolate(dot1, dot2, pixel_x)
            // 6.2 - Interpolate bottom 2 corners
            var bottom_influence =  interpolate(dot3, dot4, pixel_x)

            // 6.3 - final interpolaion
            var result = interpolate(top_influence, bottom_influence, pixel_y)

            pixelMatrix[i][j] += result * amplitude
            // row.push(result);

            /*
            if (result < min_gradient) {
                min_gradient = result;
            } 
            if (result > max_gradient) {
                max_gradient = result;
            }*/
        }
        // pixelMatrix.push(row);
    }
}

function computeValueNoiseScalarForPixels(amplitude) {
    for(let i=0; i < canvas.width; i++) {
        let row = [];
        for(let j=0; j < canvas.width; j++) {
            var grid_i = Math.floor(i / gridSize); 
            var grid_j = Math.floor(j / gridSize);    
            
            var g1 = gradientVectors[grid_i][grid_j]
            var g2 = gradientVectors[grid_i][grid_j + 1]
            var g3 = gradientVectors[grid_i + 1][grid_j]
            var g4 = gradientVectors[grid_i + 1][grid_j + 1]    
            
            var pixel_y = (i % gridSize) * (1/gridSize)
            var pixel_x = (j % gridSize) * (1/gridSize)
            
            var top_influence = interpolate(g1, g2, pixel_x)
            var bottom_influence =  interpolate(g3, g4, pixel_x)

            var result = interpolate(top_influence, bottom_influence, pixel_y)

            pixelMatrix[i][j] += result * amplitude
            // row.push(result);

            /*
            if (result < min_gradient) {
                min_gradient = result;
            } 
            if (result > max_gradient) {
                max_gradient = result;
            } */
        }
        // pixelMatrix.push(row);
    }
}

function getDotProduct(v1, v2) {
    return (v1[0] * v2[0]) + 
            (v1[1] * v2[1])
}

function mapScalarToRGBAndDisplay(mode) {
    for(let i=0; i<canvas.width; i++) {
        for (let j=0; j<canvas.width; j++) {
            if (pixelMatrix[i][j] < min_gradient) {
                min_gradient = pixelMatrix[i][j];
            } 
            if (pixelMatrix[i][j] > max_gradient) {
                max_gradient = pixelMatrix[i][j];
            }                
        }
    }

    var scalarRange = max_gradient;
    var color;

    for(let i=0; i<canvas.width; i++) {
        for (let j=0; j<canvas.width; j++) {
            color = ((pixelMatrix[i][j] + scalarRange) / (scalarRange * 2)) * 255            
            ctx.fillStyle = `rgb(${color}, ${color}, ${color})`;
            ctx.fillRect(i, j, 1, 1);
        }
    }
}
// interpolate 

export function frame(size, amplitude) {
    reset();
    gridSize = size;

    if(mode == "perlin") {
        generateRandomGradientVectors(mode);
        computePerlinNoiseScalarForPixels(amplitude);
        mapScalarToRGBAndDisplay(mode);
    } else {
        generateRandomGradientVectors(mode);
        computeValueNoiseScalarForPixels(amplitude);
        mapScalarToRGBAndDisplay(mode);
    }
}

// var mode="value";
var mode="perlin";

// Different octaves
frame(40, 1);
frame(20, 0.5);
frame(10, 0.25);

// normalize and display
mapScalarToRGBAndDisplay();
// requestAnimationFrame(frame);

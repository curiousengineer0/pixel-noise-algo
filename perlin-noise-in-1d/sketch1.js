var start = 0;

function setup() {
    createCanvas(400, 400);
    createCanvas(400, 400);
    background(51);
}

function draw() {
    background(51);
    noFill();
    stroke(255);
    beginShape();
    var xoff = start;
    for(let x=0; x < width; x++) {
        xoff += 0.01
        // y = map(Math.random(), 0, 1, 0, height);
        y = map(noise(xoff), 0, 1, 0, height);
        vertex(x, y);
    }
    start += 0.01
    endShape();
    // noLoop();
}

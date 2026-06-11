import { frame } from "./perlin.js";
var slider = document.getElementById("grid-size-slider");
var output = document.getElementById("grid-size-textbox");

output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)

slider.addEventListener('input', function() {
    output.innerHTML = this.value;
    frame(parseInt(this.value));
});



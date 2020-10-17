// Helper functions

// Helper function generateRandomColorSet - Generates a random 4 colors combination 
function generateRandomColorSet() {
  currentColors.color1 = getRandomLessSaturatedRGB();
  currentColors.color2 = getRandomRGB();
  currentColors.color3 = getRandomRGB();  
  currentColors.color4 = getRandomRGB();
  
  for (let color of shoeColor1) {
    color.style.fill = `rgb(${currentColors.color1.red}, ${currentColors.color1.green}, ${currentColors.color1.blue})`;
  }
  for (let color of shoeColor2) {
    color.style.fill = `rgb(${currentColors.color2.red}, ${currentColors.color2.green}, ${currentColors.color2.blue})`;
  }
  for (let color of shoeColor3) {
    color.style.fill = `rgb(${currentColors.color3.red}, ${currentColors.color3.green}, ${currentColors.color3.blue})`;
  }
  for (let color of shoeColor4) {
    color.style.fill = `rgb(${currentColors.color4.red}, ${currentColors.color4.green}, ${currentColors.color4.blue})`;
  }
}

// Helper function getRandomRGB - generates a random RGB color where each R, G, or B value is limited to 31-223 range to avoid color very close to black or white
function getRandomRGB() {
  return {
    red: rangedRandomVal(31, 223),
    green: rangedRandomVal(31, 223),
    blue: rangedRandomVal(31, 223),
  };
}

// Helper function getRandomLessSaturatedRGB - generates a random RGB color that is 50% desaturated as it will be used for the main color of the shoe color1
function getRandomLessSaturatedRGB() {  
  let randomHSL = {
    hue: rangedRandomValAvoidingARange(0, 360, 20, 200), // avoiding 81-140 hue range to avoid weir greens
    satuartion: rangedRandomVal(1, 50) / 100, // value in 2 decimals instead of percentage, max 50 for less stuaration
    lightness: rangedRandomVal(5, 95) / 100, // value in 2 decimals instead of percentage
  };
  let arrayRGB = convertHSLToRGB(randomHSL.hue, randomHSL.satuartion, randomHSL.lightness);
  return {
    red: arrayRGB[0],
    green: arrayRGB[1],
    blue: arrayRGB[2],
  };
}

// Helper function convertHSLToRGB - converts an HSL color to RGB color
function convertHSLToRGB(hue, saturation, lightness){
  // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
  if(hue == undefined){
    return [0, 0, 0];
  }

  var chroma = (1 - Math.abs((2 * lightness) - 1)) * saturation;
  var huePrime = hue / 60;
  var secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

  huePrime = Math.floor(huePrime);
  var red;
  var green;
  var blue;

  if (huePrime === 0) {
    red = chroma;
    green = secondComponent;
    blue = 0;
  } else if (huePrime === 1) {
    red = secondComponent;
    green = chroma;
    blue = 0;
  } else if (huePrime === 2) {
    red = 0;
    green = chroma;
    blue = secondComponent;
  } else if (huePrime === 3) {
    red = 0;
    green = secondComponent;
    blue = chroma;
  } else if (huePrime === 4) {
    red = secondComponent;
    green = 0;
    blue = chroma;    
  } else if (huePrime === 5) {
    red = chroma;
    green = 0;
    blue = secondComponent;
  }

  var lightnessAdjustment = lightness - (chroma / 2);
  red += lightnessAdjustment;
  green += lightnessAdjustment;
  blue += lightnessAdjustment;

  return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
};

// Helper function rangedRandomVal - generates a random number within min to max range
function rangedRandomVal(min, max) {
  return Math.floor(Math.random() * (max - min) + 1) + min;
}

// Helper function rangedRandomValAvoidingARange - generates a random number within min to max range but avoiding the range avoidMin to avoidMax
function rangedRandomValAvoidingARange(min, max, avoidMin, avoidMax) {
  let randomValue = rangedRandomVal(min, max);
  return ((randomValue >= avoidMin) && (randomValue <= avoidMax)) ? rangedRandomValAvoidingARange(min, max, avoidMin, avoidMax) : randomValue;
}

// Select elements in DOM
const shoeSVG = document.querySelector('#shoeSVG');
const shoeColor1 = document.querySelectorAll('.shoe-color-1');
const shoeColor2 = document.querySelectorAll('.shoe-color-2');
const shoeColor3 = document.querySelectorAll('.shoe-color-3');
const shoeColor4 = document.querySelectorAll('.shoe-color-4');
const ratings = document.querySelectorAll('.rating');
const recommendationGrid = document.querySelector('#recommendationGrid');
const report = document.querySelector('#report');
const resetTraining = document.querySelector('#resetTraining');
const resetTrainingNo = document.querySelector('#resetTrainingNo');
const resetTrainingYes = document.querySelector('#resetTrainingYes');
const resetTrainingOk = document.querySelector('#resetTrainingOk');
const promptConfirmReset = document.querySelector('#promptConfirmReset');
const promptDoneReset = document.querySelector('#promptDoneReset');

// Current colors object based on user rating
const currentColors = {
  color1: {},
  color2: {},
  color3: {},
  color4: {},
}

// Start by colorizing the shoe randomly for rating and predicting color set combinations
generateRandomColorSet();
predictColorSetCombinations();

// Show training counts from previous page loads
if (window.localStorage.trainingDataHPCR) {
  const previousSessionsDataCount = JSON.parse(window.localStorage.trainingDataHPCR).length - initialDataCount
  if (previousSessionsDataCount > 0) {
    const previousTrainingReport = document.createElement('li');
    previousTrainingReport.innerHTML = `Previously, you have trained MLPCR ${previousSessionsDataCount} time${previousSessionsDataCount > 1 ? 's' : ''}.`;
    report.appendChild(previousTrainingReport);
  }  
}

// Event - ratings buttons click
ratings.forEach((rating, i) => {
  // Score has to be a value between 0 and 1
  const score = (4 - i) / 4;
  rating.addEventListener('click', saveTrainingData.bind(saveTrainingData, score));
});

// Event - resetTraining button click
resetTraining.addEventListener('click', () => {
  promptConfirmReset.classList.toggle('prompt-show');
});

// Event - resetTrainingNo button click
resetTrainingNo.addEventListener('click', () => {
  promptConfirmReset.classList.toggle('prompt-show');
});

// Event - resetTrainingYes button click
resetTrainingYes.addEventListener('click', () => {
  resetTrainingData();
  promptConfirmReset.classList.toggle('prompt-show');
  promptDoneReset.classList.toggle('prompt-show');
});

// Event - resetTrainingYes button click
resetTrainingYes.addEventListener('click', () => {
  promptDoneReset.classList.toggle('prompt-show');
});

// Function saveTrainingData - save a new trainig data in localStorage, then generate color set, and update report
function saveTrainingData(score) {
  const data = JSON.parse(window.localStorage.trainingDataHPCR);

  const userDataCount = JSON.parse(window.localStorage.trainingDataHPCR).length - initialDataCount + 1;
  const previousColorSet = [
    document.querySelector('.shoe-color-1').style.fill,
    document.querySelector('.shoe-color-2').style.fill,
    document.querySelector('.shoe-color-3').style.fill,
    document.querySelector('.shoe-color-4').style.fill,
  ];

  data.push({
    input: [ // input dimensions ranging from 0 to 1 for each RGB 0-255 values
      Math.round(currentColors.color1.red / 2.55) / 100,
      Math.round(currentColors.color1.green / 2.55) / 100,
      Math.round(currentColors.color1.blue / 2.55) / 100,
      Math.round(currentColors.color2.red / 2.55) / 100,
      Math.round(currentColors.color2.green / 2.55) / 100,
      Math.round(currentColors.color2.blue / 2.55) / 100,
      Math.round(currentColors.color3.red / 2.55) / 100,
      Math.round(currentColors.color3.green / 2.55) / 100,
      Math.round(currentColors.color3.blue / 2.55) / 100,
      Math.round(currentColors.color4.red / 2.55) / 100,
      Math.round(currentColors.color4.green / 2.55) / 100,
      Math.round(currentColors.color4.blue / 2.55) / 100,
    ],
    output: [score], // output dimension ranging from 0 to 1
  })

  window.localStorage.trainingDataHPCR = JSON.stringify(data);
  
  predictColorSetCombinations();
  generateRandomColorSet();
  updateReport(userDataCount, score, previousColorSet);
}

// Function predictColorSetCombinations - generates sets of 4 colors based on rating data
function predictColorSetCombinations() {
  const data = JSON.parse(window.localStorage.trainingDataHPCR);
  if (!data.length) {
    return;
  }

  // Define empty content inside recommendationGrid initially
  recommendationGrid.innerHTML = '';
  
  // Create a new neural network with brain.js
  const net = new brain.NeuralNetwork({
    activation: 'leaky-relu'
  });
  const results = [];

  // Train the neural network with data from localStorage
  net.train(data);

  // Generate color combinations
  for (let index = 0; index < 50000; index++) {
    const color1 = getRandomLessSaturatedRGB();
    const color2 = getRandomRGB();
    const color3 = getRandomRGB();
    const color4 = getRandomRGB();
    const colors = [
      Math.round(color1.red / 2.55) / 100,
      Math.round(color1.green / 2.55) / 100,
      Math.round(color1.blue / 2.55) / 100,
      Math.round(color2.red / 2.55) / 100,
      Math.round(color2.green / 2.55) / 100,
      Math.round(color2.blue / 2.55) / 100,
      Math.round(color3.red / 2.55) / 100,
      Math.round(color3.green / 2.55) / 100,
      Math.round(color3.blue / 2.55) / 100,      
      Math.round(color4.red / 2.55) / 100,
      Math.round(color4.green / 2.55) / 100,
      Math.round(color4.blue / 2.55) / 100,
    ]

    // Run the color combinations through the neural network to get the score and push it in results array
    const [ score ] = net.run(colors);
    results.push({
      color1,
      color2,
      color3,
      color4,
      score
    });
  }

  // Function sortedResults - to sort score data in descending order
  const sortedResults = results.sort(function(a, b) {
    var a = a.score;
    var b = b.score;
    return b - a;
  });

  // Keep the top 12 results for updating recommendationGrid
  for (let index = 0; index < 12; index++) {
    addNewColorSet(sortedResults[index]);
  }
}

// Function addNewRecommendation - adds a new color set recommendation in recommendationGrid
function addNewColorSet({color1, color2, color3, color4, score}) {
  const newColorSet = document.createElement('div');
  const scoreOutOf5 = (score * 5 / 4).toFixed(2); // round to 2 decmail places
  newColorSet.classList.add('col-4');
  newColorSet.innerHTML = `
  <div class="recommended-item shadow">
    <div class="recommended-svg-wrap">
      <svg version="1.1" class="shoe-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1056.4 747.9" xml:space="preserve">
        <g>
          <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M221.9,134.3c0,0-21-11.5-31.2-35c-10.2-23.5-1.7-45.8,15.9-56.1c17.6-10.3,29.2-6.7,40.6,4.3 c11.4,11,14.9,48.8,14.9,48.8l-18.7,8.6c0,0-3.4-49.6-26.5-56.9C193.8,40.8,164.2,84.3,221.9,134.3z"/>
          <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M233.9,117.7c0,0-37.9-41.4-15-68.9c0,0,0.9-5.6-14.7-1.5c-15.6,4.1-24.5,34.4-13.6,52 c11,17.6,31.2,35,31.2,35L233.9,117.7z"/>
          <path class="shoe-color-darkened" d="M233.9,117.7c0,0-37.9-41.4-15-68.9c0,0,0.9-5.6-14.7-1.5c-15.6,4.1-24.5,34.4-13.6,52 c11,17.6,31.2,35,31.2,35L233.9,117.7z"/>
        </g>
        <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M242.9,97c0,0,18.8,11.9,21.4,44.9c2.7,33.1,5.2,61.1,35.4,73.9c30.2,12.8,67.1,13.9,98.3-0.9 c31.2-14.7,69.7-51.7,99.9-27c30.2,24.7,95.2,81.9,126.5,107.1c31.3,25.2,68.6,69.5,101,79c32.4,9.5,52.2,3.2,52.2,3.2 s74.2,52.1,113.2,72.8c39,20.7,71.6,37.8,77.9,57.6c6.4,19.8,10.9,48.8-0.8,63.2c-11.7,14.5-46.3,27-92.1,27.5 c-45.8,0.5-181.6-13.1-235-24.3c-53.4-11.2-154-56.3-194.9-63.5c-40.9-7.3-154.7-46.7-215-69.8c-60.3-23.2-133.1-80.9-133.1-80.9 s8.2-5.5,14.7-18.1c6.5-12.6,12.1-48.6,16.5-55.3c4.4-6.7,7.4-7.8,7.4-7.8s8.5-39.7,21.6-62.3C170.9,193.7,220.7,111,242.9,97z"/>
        <path class="shoe-color-lightened" d="M242.9,97c0,0,18.8,11.9,21.4,44.9c2.7,33.1,5.2,61.1,35.4,73.9c30.2,12.8,67.1,13.9,98.3-0.9 c31.2-14.7,69.7-51.7,99.9-27c30.2,24.7,95.2,81.9,126.5,107.1c31.3,25.2,68.6,69.5,101,79c32.4,9.5,52.2,3.2,52.2,3.2 s74.2,52.1,113.2,72.8c39,20.7,71.6,37.8,77.9,57.6c6.4,19.8,10.9,48.8-0.8,63.2c-11.7,14.5-46.3,27-92.1,27.5 c-45.8,0.5-181.6-13.1-235-24.3c-53.4-11.2-154-56.3-194.9-63.5c-40.9-7.3-154.7-46.7-215-69.8c-60.3-23.2-133.1-80.9-133.1-80.9 s8.2-5.5,14.7-18.1c6.5-12.6,12.1-48.6,16.5-55.3c4.4-6.7,7.4-7.8,7.4-7.8s8.5-39.7,21.6-62.3C170.9,193.7,220.7,111,242.9,97z"/>
        <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M112.4,341.7c6.5-12.6,12.1-48.6,16.5-55.3c4.4-6.7,7.4-7.8,7.4-7.8s8.5-39.7,21.6-62.3 c13-22.6,62.9-105.4,85-119.3c0,0,18.8,11.9,21.4,44.9c2.7,33.1,5.2,61.1,35.4,73.9c30.2,12.8,67.1,13.9,98.3-0.9 c9.5-4.5,19.8-11.1,30.2-17.4v0l288.7,228c0,0-51.2,34.7-39.5,52.7c11.6,17.9,25.3,20.5,59.3,6.5c34-14.1,37.2-10.1,95,6.3 c57.8,16.4,75.5,15.9,98.6,9.2c10.9-3.2,15.1-10.7,16.4-17.8c11.3,8.2,19.1,16.4,21.9,25.1c6.4,19.8,10.9,48.8-0.8,63.2 c-11.7,14.5-46.3,27-92.1,27.5c-45.8,0.5-181.6-13.1-235-24.3c-53.4-11.2-154-56.3-194.9-63.5c-40.9-7.3-154.7-46.7-215-69.8 c-8.3-3.2-16.8-7-25.4-11.3L122,377.8c-14.8-10.6-24.3-18.1-24.3-18.1S105.9,354.2,112.4,341.7z"/>
        <path style="fill: rgb(${color2.red}, ${color2.green}, ${color2.blue});" d="M650.2,385.8c0,0-114.3,66.2-179.4,125.6l40.8,24.3c0,0,107.7-86.7,182.6-121.9L650.2,385.8z"/>
        <path style="fill: rgb(${color2.red}, ${color2.green}, ${color2.blue});" d="M579.3,318.7c0,0-162.4,93.3-220.8,148.4l50.6,19.4c0,0,122.8-86.8,203.6-131.3L579.3,318.7z"/>
        <path style="fill: rgb(${color3.red}, ${color3.green}, ${color3.blue});" d="M128.8,286.4c4.4-6.7,7.4-7.8,7.4-7.8s8.5-39.7,21.6-62.3c6-10.3,19.6-33.3,34.8-56.4 c19.2,39.3,66,130.4,95.6,148.5c37.9,23.3,153.9-63.1,153.9-63.1l-22.9-33.9l18.7-6.1l74.8,59.1l5.4,6c0,0-131.4,81.7-207.6,135.5 c0,0-160.3-70.6-187.4-101.2C125.2,296.2,127.1,289,128.8,286.4z"/>
        <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M131.9,282.3C131.9,282.3,131.8,282.3,131.9,282.3C131.8,282.3,131.9,282.3,131.9,282.3z"/>
        <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M169,322c-17.4-9.3-46.8-29.3-46.8-29.3s22.5-53.8,35.6-76.3c3.9-6.8,11.3-19.2,20.2-33.5 c11,22,28.6,55.4,44.8,79.6c22,33,53.6,98.9,62.6,132C252,377.1,191.6,334,169,322z"/>
        <path class="shoe-color-darkened" d="M169,322c-17.4-9.3-46.8-29.3-46.8-29.3s22.5-53.8,35.6-76.3c3.9-6.8,11.3-19.2,20.2-33.5 c11,22,28.6,55.4,44.8,79.6c22,33,53.6,98.9,62.6,132C252,377.1,191.6,334,169,322z"/>
        <path style="fill: rgb(${color2.red}, ${color2.green}, ${color2.blue});" d="M624.4,295.1c-31.3-25.2-96.3-82.4-126.5-107.1c-5.1-4.2-56.4,6.1-61.9,5.1c-2.6-3.5-30.1-27.2-30.1-27.2 s10.7-82.5,55.8-85.9c8.1-0.6,120.4,142.9,153.7,171.6c33.4,28.7,106,97.5,124.9,105.1c18.9,7.6,37.2,20.5,37.2,20.5 s-19.8,6.3-52.2-3.2C693,364.5,655.7,320.3,624.4,295.1z"/>
        <path style="fill: rgb(${color2.red}, ${color2.green}, ${color2.blue});" d="M435.5,95.7c46.2,45.1,160.6,155.4,187,166c2.1,0.8,4.1,1.3,6.2,1.5c-4.9-4.3-9.4-8.3-13.3-11.7 C582,222.9,469.7,79.4,461.6,80C449.9,80.8,441.5,87,435.5,95.7z"/>
        <path class="shoe-color-lightened" d="M435.5,95.7c46.2,45.1,160.6,155.4,187,166c2.1,0.8,4.1,1.3,6.2,1.5c-4.9-4.3-9.4-8.3-13.3-11.7 C582,222.9,469.7,79.4,461.6,80C449.9,80.8,441.5,87,435.5,95.7z"/>
        <g>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M549.6,179.1c7.4-0.4,25.3,25.3,27.3,37.1c2,11.9,4.5,39.2,4.5,39.2l-27.1-19.6L549.6,179.1z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M591.5,267.7l4-47.1c0,0,20.4,9.1,23.7,25.1c3.3,16-7,39.3-7,39.3L591.5,267.7z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M627.1,292.7l3.6-38.6c0,0,23.3,12.3,24.4,28.5c1.1,16.1-2.8,34.8-2.8,34.8L627.1,292.7z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M679.9,338.5l-7.7-45.7c0,0,21.7,10.5,25,29.2c3.2,18.6,0.7,33.4,0.7,33.4L679.9,338.5z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M711.6,360.1l3.6-28.4c0,0,22.9,8.6,21.6,19.3c-1.2,10.7-4.4,20.9-4.4,20.9L711.6,360.1z"/>
        </g>
        <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M398,214.9c-31.2,14.7-68.2,13.7-98.3,0.9c-30.2-12.8-32.7-40.8-35.4-73.9c-2.1-26.2-14.3-39.1-19.3-43.3 c2.7-2,7.1-3.5,14.3-3.3c19.7,0.5,39.9,18.7,40.7,37.1c0.7,18.4,16.6,62,53.5,69.9c23,4.9,44.7,5.3,63.4,2.3 C410.3,208.4,404,212.1,398,214.9z"/>
        <path class="shoe-color-darkened" d="M398,214.9c-31.2,14.7-68.2,13.7-98.3,0.9c-30.2-12.8-32.7-40.8-35.4-73.9c-2.1-26.2-14.3-39.1-19.3-43.3 c2.7-2,7.1-3.5,14.3-3.3c19.7,0.5,39.9,18.7,40.7,37.1c0.7,18.4,16.6,62,53.5,69.9c23,4.9,44.7,5.3,63.4,2.3 C410.3,208.4,404,212.1,398,214.9z"/>
        <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M462,181.5c12.5-3.4,24.7-2.6,35.8,6.4c30.2,24.7,95.2,81.9,126.5,107.1c31.3,25.2,68.6,69.5,101,79 c32.4,9.5,52.2,3.2,52.2,3.2s25,17.6,53.6,36.3c-4.7,9.2-16.6,22.4-47.1,25.9c-48.1,5.6-95.5-8.1-164-64.3 C551.5,319,432,208.1,432,208.1S449.2,192.6,462,181.5z"/>
        <path class="shoe-color-darkened" d="M462,181.5c12.5-3.4,24.7-2.6,35.8,6.4c30.2,24.7,95.2,81.9,126.5,107.1c31.3,25.2,68.6,69.5,101,79 c32.4,9.5,52.2,3.2,52.2,3.2s25,17.6,53.6,36.3c-4.7,9.2-16.6,22.4-47.1,25.9c-48.1,5.6-95.5-8.1-164-64.3 C551.5,319,432,208.1,432,208.1S449.2,192.6,462,181.5z"/>
        <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M237.9,135.3c2.2-14.7-1.9-23.2-6.5-28c4.3-4.7,8.2-8.3,11.4-10.3c0,0,18.8,11.9,21.4,44.9 c2.7,33.1,5.2,61.1,35.4,73.9c30.2,12.8,67.1,13.9,98.3-0.9c21.5-10.2,46.5-30.9,69.9-34.7c32.1-1.9,34.3,17.2,51.9,26.1 c33.1,28.1,79.6,68.6,104.6,88.7c6,4.8,12.2,10.4,18.6,16.3c-18.9-17.6-118-90.7-141.8-111.8c-23.8-21.1-33.2-2.4-73.3,18.2 c-40.2,20.5-70.7,32.5-126.1,22.9C246.4,230.9,233.5,165,237.9,135.3z"/>
        <path class="shoe-color-lightened" d="M237.9,135.3c2.2-14.7-1.9-23.2-6.5-28c4.3-4.7,8.2-8.3,11.4-10.3c0,0,18.8,11.9,21.4,44.9 c2.7,33.1,5.2,61.1,35.4,73.9c30.2,12.8,67.1,13.9,98.3-0.9c21.5-10.2,46.5-30.9,69.9-34.7c32.1-1.9,34.3,17.2,51.9,26.1 c33.1,28.1,79.6,68.6,104.6,88.7c6,4.8,12.2,10.4,18.6,16.3c-18.9-17.6-118-90.7-141.8-111.8c-23.8-21.1-33.2-2.4-73.3,18.2 c-40.2,20.5-70.7,32.5-126.1,22.9C246.4,230.9,233.5,165,237.9,135.3z"/>
        <g>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M500.9,207.4c0,0,45.1-5.1,66.3-0.5c21.3,4.6,38.9,19.9,28.5,21.1c-10.4,1.2-45-2.8-63.1,1.9 c-18.1,4.7-18,6.5-28,3.8C494.8,231,488.7,214.2,500.9,207.4z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M546.3,246.3c0,0,33.6-9.4,60.3-2.4c26.8,6.9,32.9,15,15.9,17.9c-17.1,3-54.6,16-65.6,13.6 C545.8,273,529.5,264.9,546.3,246.3z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M582.1,286.1c13.6-12.9,56.5-19.4,73.6-10.9c17.1,8.5,32.2,27.3,20.8,24c-11.4-3.3-39.1,1.2-57.1,7.7 c-18,6.5-31.6,9.4-36.5,1.4C578,300.2,573.5,294.2,582.1,286.1z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M626.8,322.1c10.4-7.3,51.8-18.8,68.1-7.5c16.2,11.3,33.7,29,21.5,25.6c-12.2-3.5-23.3-10.5-45.2-2.7 c-21.9,7.8-29.7,12.7-41,7.8C618.7,340.3,616.1,329.5,626.8,322.1z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M670.2,361.1c12.2-15.9,56.4-17.3,69.2-11.8c12.9,5.5,34.6,15.1,13.3,20.7c-21.3,5.6-50,14.4-65.4,13.6 C671.8,382.9,659.7,374.8,670.2,361.1z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M746.2,410.1c-14.1,0-27.4-2-28.1-8.9c-0.7-6.9,8.9-29.4,17.4-39.6c8.5-10.2,23.2-1,31.8,3.3 C775.9,369.3,746.2,410.1,746.2,410.1z"/>
          <path class="shoe-color-lightened" d="M500.9,207.4c0,0,45.1-5.1,66.3-0.5c21.3,4.6,38.9,19.9,28.5,21.1c-10.4,1.2-45-2.8-63.1,1.9 c-18.1,4.7-18,6.5-28,3.8C494.8,231,488.7,214.2,500.9,207.4z"/>
          <path class="shoe-color-lightened" d="M546.3,246.3c0,0,33.6-9.4,60.3-2.4c26.8,6.9,32.9,15,15.9,17.9c-17.1,3-54.6,16-65.6,13.6 C545.8,273,529.5,264.9,546.3,246.3z"/>
          <path class="shoe-color-lightened" d="M582.1,286.1c13.6-12.9,56.5-19.4,73.6-10.9c17.1,8.5,32.2,27.3,20.8,24c-11.4-3.3-39.1,1.2-57.1,7.7 c-18,6.5-31.6,9.4-36.5,1.4C578,300.2,573.5,294.2,582.1,286.1z"/>
          <path class="shoe-color-lightened" d="M626.8,322.1c10.4-7.3,51.8-18.8,68.1-7.5c16.2,11.3,33.7,29,21.5,25.6c-12.2-3.5-23.3-10.5-45.2-2.7 c-21.9,7.8-29.7,12.7-41,7.8C618.7,340.3,616.1,329.5,626.8,322.1z"/>
          <path class="shoe-color-lightened" d="M670.2,361.1c12.2-15.9,56.4-17.3,69.2-11.8c12.9,5.5,34.6,15.1,13.3,20.7c-21.3,5.6-50,14.4-65.4,13.6 C671.8,382.9,659.7,374.8,670.2,361.1z"/>
          <path class="shoe-color-lightened" d="M746.2,410.1c-14.1,0-27.4-2-28.1-8.9c-0.7-6.9,8.9-29.4,17.4-39.6c8.5-10.2,23.2-1,31.8,3.3 C775.9,369.3,746.2,410.1,746.2,410.1z"/>
        </g>
        <g>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M933.7,595.1c0,0-171.9-17.7-280.6-53.8c-108.7-36.1-160.8-79.2-194-92.8c-33.3-13.7-39.7-7.7-39.7-7.7 s-46.8-47.8-73-52.9c-26.2-5.1-74.4-4.9-92.1-17.9c-17.6-13.1-66.6-54.2-98.2-67.3c-31.6-13.2-31.6-13.2-31.6-13.2l6.3-14.5 c0,0-33.2,17.2-39.7,51c-6.6,33.8-5.1,102.4-0.5,106c0,0,74.9,35.3,107.4,45.4c32.6,10.1,67.8,15.2,92.2,21 c24.4,5.8,59.7-6.3,75.3-5.9c15.6,0.4,20,0.4,24.6,12.7c4.6,12.3,28.9,49.5,46.7,57.3c17.8,7.8,113.6,35.1,129.3,39.3 c15.7,4.1,132.7,22.8,155.4,23.7c22.6,0.9,145.5,1.5,163.8-2.9C903.8,618.2,933.7,595.1,933.7,595.1z"/>
          <path style="fill: rgb(${color1.red}, ${color1.green}, ${color1.blue});" d="M981.3,553.5c-1.3-11.1-36.8-0.2-42.8,12.7c-6,12.9-33.2,53.2-92.6,52.1c-59.4-1-190,3.3-247.6-11.4 c-57.6-14.7-113.2-30.8-136-39.6c-22.8-8.8-47.5-17.1-56.4-39c-8.9-21.9-10.3-32.7-24.6-35.5c-14.4-2.8-56.2,4.8-77.1,4.3 c-20.9-0.6-74.3-10.1-110.8-25.1c-5.7-2.3-12.1-5-18.8-7.9C138.1,448.5,88,427.8,88,427.8l1.1,12.4l12,6l4.2,0.8l3.9,6.8 l51.6,18.8l12-2.9l6.1,13.5l53.1,15.6c0,0,17.3-8,16.4-3c-1,5.1-1,5.1-1,5.1l37.9,12.6c0,0,45.7-13.9,71.8-8.8 c26.2,5.1,37.9,12.6,37.9,12.6s8.4,24.4,19.9,37.2c11.5,12.8,34.1,23,36.5,24c2.4,1.1,9.3-7.2,9.3-7.2l6.6,2.2l0.7,14.2L511,596 l2-5.7l18.4,4.5l-0.3,10.5c0,0,30.4,10.3,37.3,10.8c6.9,0.5,11.5-4.8,11.5-4.8l11.8,2.3l2.9,7.7c0,0,25.8,6.9,41.4,8.1 c15.6,1.2,16.9-5.6,16.9-5.6s83.4,12.7,135.7,14.2c52.3,1.4,158-14.7,169-17C968.6,618.5,985.8,593,981.3,553.5z"/>
          <path class="shoe-color-darkened" d="M981.3,553.5c-1.3-11.1-36.8-0.2-42.8,12.7c-6,12.9-33.2,53.2-92.6,52.1c-59.4-1-190,3.3-247.6-11.4 c-57.6-14.7-113.2-30.8-136-39.6c-22.8-8.8-47.5-17.1-56.4-39c-8.9-21.9-10.3-32.7-24.6-35.5c-14.4-2.8-56.2,4.8-77.1,4.3 c-20.9-0.6-74.3-10.1-110.8-25.1c-5.7-2.3-12.1-5-18.8-7.9C138.1,448.5,88,427.8,88,427.8l1.1,12.4l12,6l4.2,0.8l3.9,6.8 l51.6,18.8l12-2.9l6.1,13.5l53.1,15.6c0,0,17.3-8,16.4-3c-1,5.1-1,5.1-1,5.1l37.9,12.6c0,0,45.7-13.9,71.8-8.8 c26.2,5.1,37.9,12.6,37.9,12.6s8.4,24.4,19.9,37.2c11.5,12.8,34.1,23,36.5,24c2.4,1.1,9.3-7.2,9.3-7.2l6.6,2.2l0.7,14.2L511,596 l2-5.7l18.4,4.5l-0.3,10.5c0,0,30.4,10.3,37.3,10.8c6.9,0.5,11.5-4.8,11.5-4.8l11.8,2.3l2.9,7.7c0,0,25.8,6.9,41.4,8.1 c15.6,1.2,16.9-5.6,16.9-5.6s83.4,12.7,135.7,14.2c52.3,1.4,158-14.7,169-17C968.6,618.5,985.8,593,981.3,553.5z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M278.2,423.1c-14.8-5.4-135.5-47-146.5-49.1c-11-2.1-14.1,13.9-10.8,24.2c3.3,10.3,14.7,28.3,42.4,34.5 c27.7,6.3,91.1,27.4,108,26.3C288.1,458,297.5,430.1,278.2,423.1z"/>
          <path class="shoe-color-darkened" d="M278.2,423.1c-14.8-5.4-135.5-47-146.5-49.1c-11-2.1-14.1,13.9-10.8,24.2c3.3,10.3,14.7,28.3,42.4,34.5 c27.7,6.3,91.1,27.4,108,26.3C288.1,458,297.5,430.1,278.2,423.1z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M494.3,528.9c-15.4-6.6-61.4-26.7-67.6-13.2c-6.2,13.6,3.4,27.7,18.9,33.4c15.6,5.7,39.4,13.8,49.9-1.7 C506,531.9,494.3,528.9,494.3,528.9z"/>
          <path class="shoe-color-darkened" d="M494.3,528.9c-15.4-6.6-61.4-26.7-67.6-13.2c-6.2,13.6,3.4,27.7,18.9,33.4c15.6,5.7,39.4,13.8,49.9-1.7 C506,531.9,494.3,528.9,494.3,528.9z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M598.4,561.4c-16.9-3.5-51.4-15.3-55-1.1c-3.6,14.2,5.5,21.2,38.3,28.5c32.8,7.3,40.3-4.4,39.9-15.9 C621.2,561.4,611,564,598.4,561.4z"/>
          <path class="shoe-color-darkened" d="M598.4,561.4c-16.9-3.5-51.4-15.3-55-1.1c-3.6,14.2,5.5,21.2,38.3,28.5c32.8,7.3,40.3-4.4,39.9-15.9 C621.2,561.4,611,564,598.4,561.4z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M287.9,444.6c2.7-8.3,0.5-17.8-9.7-21.5c-14.8-5.4-135.5-47-146.5-49.1c-8.8-1.7-12.5,8.2-12,17.6 L287.9,444.6z"/>
          <path class="shoe-color-darkened" d="M287.9,444.6c2.7-8.3,0.5-17.8-9.7-21.5c-14.8-5.4-135.5-47-146.5-49.1c-8.8-1.7-12.5,8.2-12,17.6 L287.9,444.6z"/>
          <path class="shoe-color-darkened" d="M287.9,444.6c2.7-8.3,0.5-17.8-9.7-21.5c-14.8-5.4-135.5-47-146.5-49.1c-8.8-1.7-12.5,8.2-12,17.6 L287.9,444.6z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M452.8,528.5c11.8,3.9,27.7,9,45.3,14.5c5.6-11.7-3.8-14.1-3.8-14.1c-15.4-6.6-61.4-26.7-67.6-13.2 c-0.1,0.3-0.2,0.6-0.3,0.9C431.8,520.3,440.1,524.3,452.8,528.5z"/>
          <path class="shoe-color-darkened" d="M452.8,528.5c11.8,3.9,27.7,9,45.3,14.5c5.6-11.7-3.8-14.1-3.8-14.1c-15.4-6.6-61.4-26.7-67.6-13.2 c-0.1,0.3-0.2,0.6-0.3,0.9C431.8,520.3,440.1,524.3,452.8,528.5z"/>
          <path class="shoe-color-darkened" d="M452.8,528.5c11.8,3.9,27.7,9,45.3,14.5c5.6-11.7-3.8-14.1-3.8-14.1c-15.4-6.6-61.4-26.7-67.6-13.2 c-0.1,0.3-0.2,0.6-0.3,0.9C431.8,520.3,440.1,524.3,452.8,528.5z"/>
          <path style="fill: rgb(${color4.red}, ${color4.green}, ${color4.blue});" d="M620.4,580.5c0.9-2.4,1.3-5,1.2-7.6c-0.4-11.5-10.6-8.9-23.2-11.5c-15.6-3.2-46.2-13.5-53.6-3.9 C573.4,566.3,601.4,574.8,620.4,580.5z"/>
          <path class="shoe-color-darkened" d="M620.4,580.5c0.9-2.4,1.3-5,1.2-7.6c-0.4-11.5-10.6-8.9-23.2-11.5c-15.6-3.2-46.2-13.5-53.6-3.9 C573.4,566.3,601.4,574.8,620.4,580.5z"/>
          <path class="shoe-color-darkened" d="M620.4,580.5c0.9-2.4,1.3-5,1.2-7.6c-0.4-11.5-10.6-8.9-23.2-11.5c-15.6-3.2-46.2-13.5-53.6-3.9 C573.4,566.3,601.4,574.8,620.4,580.5z"/>
        </g>
      </svg>
    </div>
    <div class="recommended-info">
      <span>${scoreOutOf5}</span>out of 5
    </div>
  </div>  
  `;
  recommendationGrid.appendChild(newColorSet);
}

// Function updateReport - updates the report
function updateReport(userDataCount, score, previousColorSet) {
  let userRating = '';
  switch (score) {
    case 0:
      userRating = 'very bad'
      break;
    case 0.25:
      userRating = 'bad'
      break;
    case 0.5:
      userRating = 'okay'
      break;
    case 0.75:
      userRating = 'good'
      break;
    case 1:
      userRating = 'very good'
      break;
    default:
      userRating = 'confusing';
      break;
  }
  const newReportEntry = document.createElement('li');
  newReportEntry.innerHTML = `<span style="color: white;">Training #${userDataCount}:</span> MLPCR has learnt color set `
  newReportEntry.innerHTML += `
  <div class="report-color">
    <div style="background-color: ${previousColorSet[0]};"></div>
    <div style="background-color: ${previousColorSet[1]};"></div>
    <div style="background-color: ${previousColorSet[2]};"></div>
    <div style="background-color: ${previousColorSet[3]};"></div>
  </div>
  `;
  newReportEntry.innerHTML += ` is ${userRating}.`;
  report.appendChild(newReportEntry);
  report.scrollTop = report.scrollHeight;
}

// Function resetTrainingData - resets training data
function resetTrainingData() {
  localStorage.removeItem('trainingDataHPCR');
  report.innerHTML = `
  <li>Training has been reset.</li>
  <li>Neural Network MLPCR is ready.</li>
  <li>==============================</li>
  `;
  loadInitialData();
}

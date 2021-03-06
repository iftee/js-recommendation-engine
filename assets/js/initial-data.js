// Initialize preset trainingData for localStorage
const initialData = [
  {input: [0.92, 0.93, 0.94, 0.85, 0.18, 0.16, 0.75, 0.18, 0.16, 0.05, 0.05, 0.05], output: [0.75]},
  {input: [0.79, 0.8, 0.85, 0.79, 0.79, 0.75, 0.09, 0.09, 0.09, 0.85, 0.85, 0.85], output: [0.75]},
  {input: [0.92, 0.9, 0.82, 0.79, 0.79, 0.78, 0.07, 0.07, 0.07, 0.82, 0.82, 0.83], output: [0.75]},
  {input: [0.45, 0.48, 0.45, 0.66, 0.83, 0.15, 0.02, 0.02, 0.02, 0.82, 0.82, 0.83], output: [0.75]},
  {input: [0.09, 0.16, 0.4, 0.01, 0.02, 0.16, 0.01, 0.02, 0.16, 0.94, 0.94, 0.94], output: [0.75]},
  {input: [0.12, 0.12, 0.12, 0.8, 0.8, 0.81, 0.8, 0.8, 0.81, 0.8, 0.8, 0.81], output: [0.75]},
  {input: [0.85, 0.84, 0.83, 0.93, 0.33, 0.49, 0.09, 0.07, 0.08, 0.92, 0.91, 0.93], output: [0.75]},
  {input: [0.19, 0.24, 0.29, 0.33, 0.74, 0.94, 0.33, 0.74, 0.94, 0.7, 0.79, 0.86], output: [0.75]},
  {input: [0.93, 0.93, 0.92, 0.09, 0.07, 0.08, 0.09, 0.07, 0.08, 0.93, 0.93, 0.92], output: [0.75]},
  {input: [0.45, 0.45, 0.47, 0.06, 0.06, 0.06, 0.06, 0.06, 0.06, 0.91, 0.93, 0.93], output: [0.75]},
  {input: [0.62, 0.74, 0.71, 0.84, 0.89, 0.76, 0.75, 0.77, 0.76, 0.2, 0.73, 0.86], output: [0.75]},
  {input: [0.83, 0.84, 0.84, 0.96, 0.12, 0.19, 0.96, 0.12, 0.19, 0.02, 0.12, 0.31], output: [0.75]},
  {input: [0.11, 0.09, 0.11, 1, 0.4, 0.49, 1, 0.4, 0.49, 0.2, 0.59, 0.71], output: [0.75]},
  {input: [0.73, 0.67, 0.68, 0.84, 0.84, 0.85, 0.81, 0.79, 0.8, 0.62, 0.68, 0.72], output: [0.75]},
  {input: [0.81, 0.78, 0.75, 0.73, 0.12, 0.18, 0, 0.46, 0.71, 0.8, 0.79, 0.78], output: [0.75]},
  {input: [0.11, 0.11, 0.12, 0.81, 0.7, 0.65, 0.27, 0.34, 0.38, 0.8, 0.79, 0.78], output: [0.75]},
  {input: [0.33, 0.38, 0.51, 0.19, 0.3, 0.48, 0.19, 0.3, 0.48, 0.77, 0.79, 0.8], output: [0.75]},
  {input: [0.19, 0.3, 0.38, 0.96, 0.44, 0.64, 0.97, 0.35, 0.1, 0.76, 0.85, 0.88], output: [0.75]},
  {input: [0.16, 0.16, 0.26, 0.24, 0.67, 0.68, 0.83, 0.27, 0.48, 0.84, 0.86, 0.86], output: [0.75]},
  {input: [0.13, 0.12, 0.14, 0.69, 0.16, 0.46, 0.57, 0.82, 0.27, 0.84, 0.86, 0.86], output: [0.75]}
];

const initialDataCount = initialData.length;

function loadInitialData() {
  if (!window.localStorage.trainingDataHPCR) {
    window.localStorage.trainingDataHPCR = window.localStorage.trainingDataHPCR || JSON.stringify(initialData);
  }
}

loadInitialData();
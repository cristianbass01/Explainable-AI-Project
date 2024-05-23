const counterfactuals = [
    {
      inputProbability: 63,
      predictionProbability: 79,
      inputClass:1,
      predictedClass: 0,
      changes: ['BMI', 'HbA1c level'],
      features: [
        // { name: 'Gender', value: 'Male', counterfactual: 'Male', locked: true, changed: false },
        // { name: 'BMI', value: 'Medium (23.1)', counterfactual: 'Higher (26.3)', locked: true, changed: true },
        // { name: 'HbA1c level', value: 'Low (3.5)', counterfactual: 'Higher (4.6)', locked: true, changed: true },
      ],
      hiddenFeatures: [
        // { name: 'Blood Glucose', value: 'Medium (157)', counterfactual: 'Higher (191)', locked: false, changed: true },
        // { name: 'Age', value: 'High (72)', locked: false, changed: false },
      ],
    },
  ];
  
  export default counterfactuals;
  
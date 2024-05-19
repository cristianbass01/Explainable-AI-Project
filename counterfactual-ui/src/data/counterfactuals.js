const counterfactuals = [
    {
      inputProbability: 63,
      predictionProbability: 79,
      changes: ['BMI', 'HbA1c level'],
      features: [
        { name: 'Gender', value: 'Male', counterfactual: 'Male', locked: true, changed: false },
        { name: 'BMI', value: 'Medium (23.1)', counterfactual: 'Higher (26.3)', locked: true, changed: true },
        { name: 'HbA1c level', value: 'Low (3.5)', counterfactual: 'Higher (4.6)', locked: true, changed: true },
      ],
      hiddenFeatures: [
        { name: 'Blood Glucose', value: 'Medium (157)', counterfactual: 'Higher (191)', locked: false, changed: true },
        { name: 'Age', value: 'High (72)', locked: false, changed: false },
      ],
    },
    {
      inputProbability: 50,
      predictionProbability: 85,
      changes: ['Age', 'Blood Glucose'],
      features: [
        { name: 'Gender', value: 'Female', counterfactual: 'Female', locked: true, changed: false },
        { name: 'Age', value: 'Medium (45)', counterfactual: 'Higher (60)', locked: true, changed: true },
        { name: 'Blood Glucose', value: 'Low (100)', counterfactual: 'Higher (160)', locked: true, changed: true },
      ],
      hiddenFeatures: [
        { name: 'BMI', value: 'Low (18.5)', counterfactual: 'Higher (24)', locked: false, changed: true },
        { name: 'HbA1c level', value: 'Medium (5.7)', counterfactual: 'Higher (6.2)', locked: false, changed: true },
      ],
    },
  ];
  
  export default counterfactuals;
  
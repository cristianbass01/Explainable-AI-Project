import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Divider, Alert, Snackbar } from '@mui/material';
import FeatureList from './FeatureList';
import HiddenFeatureList from './HiddenFeatureList';

const Counterfactual = ({ counterfactual, inputFeatures, datasetName, setInputFeatures, modelName, targetVariable, generateCounterfactualRef }) => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(null);
  const [features, setFeatures] = useState(inputFeatures);

  const [openSuccess, setOpenSuccess] = useState(true);
  const [openWarning, setOpenWarning] = useState(true);

  useEffect(() => {
    setSelectedCounterfactual({ ...counterfactual, hiddenFeatures: [], features: inputFeatures });
  }, [counterfactual, inputFeatures]);

  const transformDatasetToInputFeatures = (dataset) => {
    console.log("Dataset:", dataset);
    return Object.keys(dataset.columns).map((column) => (
      {
      name: column,
      type: dataset.columns[column].type,
      values: dataset.columns[column].values,
      locked: false,
    }));
  };

  useEffect(() => {
    // fetch the dataset based on the dataset name
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/datasets/');
        const data = await response.json();
        //find the dataset with the name datasetName
        const dataset = Object.values(data.datasets).find(d => d.title === datasetName);

        if (!dataset) {
          console.error("Dataset not found");
          return;
        }
        // eslint-disable-next-line
        inputFeatures = transformDatasetToInputFeatures(dataset);
        const transformedFeatures = transformDatasetToInputFeatures(dataset);
        setFeatures(transformedFeatures);
        //Remove the target variable from the features
        const targetIndex = transformedFeatures.findIndex(feature => feature.name === targetVariable);
        transformedFeatures.splice(targetIndex, 1);
        setInputFeatures(transformedFeatures);
      } catch (error) {
        console.error('Error fetching dataset:', error);
      }
    }

    fetchData();
  }, [datasetName, setInputFeatures]);


  if (!selectedCounterfactual) {
    return <div>Loading...</div>;
  }

  const hideFeature = (index) => {
    const featureToHide = selectedCounterfactual.features[index];
    const updatedFeatures = selectedCounterfactual.features.filter((_, i) => i !== index);
    const updatedHiddenFeatures = [...selectedCounterfactual.hiddenFeatures, featureToHide];
    setSelectedCounterfactual({ ...selectedCounterfactual, features: updatedFeatures, hiddenFeatures: updatedHiddenFeatures });
  };

  const showFeature = (index) => {
    const featureToShow = selectedCounterfactual.hiddenFeatures[index];
    const updatedHiddenFeatures = selectedCounterfactual.hiddenFeatures.filter((_, i) => i !== index);
    const updatedFeatures = [...selectedCounterfactual.features, featureToShow];
    setSelectedCounterfactual({ ...selectedCounterfactual, hiddenFeatures: updatedHiddenFeatures, features: updatedFeatures });
  };

  const toggleLock = (index, isHidden) => {
    if (isHidden) {
      const updatedHiddenFeatures = [...selectedCounterfactual.hiddenFeatures];
      updatedHiddenFeatures[index].locked = !updatedHiddenFeatures[index].locked;
      setSelectedCounterfactual({ ...selectedCounterfactual, hiddenFeatures: updatedHiddenFeatures });
    } else {
      const updatedFeatures = [...selectedCounterfactual.features];
      updatedFeatures[index].locked = !updatedFeatures[index].locked;
      setSelectedCounterfactual({ ...selectedCounterfactual, features: updatedFeatures });
    }
  };

  const isChanged = (ogFeature, cfFeature) => {
    if (String(ogFeature) === "true" && (String(cfFeature) === "true" || String(cfFeature) === "1")) {
      return false;
    }
    if (String(ogFeature) === "false" && (String(cfFeature) === "false" || String(cfFeature) === "0")) {
      return false;
    }
    return String(ogFeature) !== String(cfFeature);;
  }

  const parseCounterfactual = (raw_data) => {

    return raw_data.counterfactuals.map(item => {

      // Initialize the counterfactual features, changes, and hidden features
      const CounterfactualFeatures = [];
      const changes = [];
      const hiddenFeatures = [];

      // Extract the input and prediction probabilities
      const originalData = raw_data.original;
      const predictionProbability = (item.probability * 100).toFixed(1);
      const inputProbability = (originalData["probability"] * 100).toFixed(1);
      const inputClass = originalData[targetVariable];
      const predictedClass = item[targetVariable];
      
      // Extract the features
      for (let feature of features) {
        if (feature === targetVariable) {
          continue; // Skip the target variable
        }

        // Create a dictionary for each feature
        const featureDict = {};

        featureDict['name'] = feature.name;

        // Extract the feature name, counterfactual, value, and lock status
        // Iterate over the original data 
        for (const key in originalData) {
          if (originalData.hasOwnProperty(key)) {
            const value = originalData[key];
            if (key === featureDict['name']) {
              featureDict['value'] = value;
            }
          }
        }
        featureDict['counterfactual'] = item[feature.name];
        featureDict['locked'] = feature.locked;
        featureDict['changed'] = isChanged(feature.value, featureDict['counterfactual']);
        if (featureDict['changed']) {
          changes.push(feature.name);
        }
        if (feature.isHidden || !featureDict['changed']) {
          hiddenFeatures.push(featureDict);
        }
        else {
          CounterfactualFeatures.push(featureDict);
        }

      }
      // Add to a counterFactual to return
      const counterFactual = {}
      counterFactual['inputProbability'] = inputProbability;
      counterFactual['predictionProbability'] = predictionProbability;
      counterFactual['changes'] = changes;
      counterFactual['features'] = CounterfactualFeatures;
      counterFactual['hiddenFeatures'] = hiddenFeatures;
      counterFactual["inputClass"] = inputClass;
      counterFactual["predictedClass"] = predictedClass;
      return counterFactual;
    });

  }

  const generateCounterfactual = async () => {
    try {
      const query = features.reduce((acc, feature) => {

        console.log("Feature:", feature);
        if (feature.type === 'categorical') {
          if (feature.value === 'true') {
            acc[feature.name] = 1;
          }
          else if (feature.value === 'false') {
            acc[feature.name] = 0;
          }
          else {
            acc[feature.name] = feature.value;
          }
        }
        else if (feature.type === 'numeric') {
          acc[feature.name] = parseFloat(feature.value);
        }
        return acc;
      }, {});

      const response = await fetch('http://localhost:8000/counterfactual/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({
          query: query,
          modelName: modelName,
          dataset: datasetName,
          type: 'DICE',
          featuresToVary: features.filter(feature => !feature.locked).map(feature => feature.name),
        }),
      });

      const data = await response.json();

      // Update the state with the received counterfactual
      if (data) {
        const newCounterFactual = parseCounterfactual(data);
        const updatedFeatures = newCounterFactual[0].features;
        const updatedHiddenFeatures = newCounterFactual[0].hiddenFeatures;
        const predictionProbability = newCounterFactual[0].predictionProbability;
        const inputProbability = newCounterFactual[0].inputProbability;
        const inputClass = newCounterFactual[0].inputClass;
        const predictedClass = newCounterFactual[0].predictedClass;
        console.log(data);
        setSelectedCounterfactual({ predictedClass: predictedClass, inputClass: inputClass, predictionProbability: predictionProbability, inputProbability: inputProbability, features: updatedFeatures, hiddenFeatures: updatedHiddenFeatures });

      } else {
        console.error("Counterfactual not generated:", data);
      }
    } catch (error) {
      console.error('Error generating counterfactual:', error);
    }
  };

  generateCounterfactualRef.current = generateCounterfactual;


  return (
    <>
    
    <Card style={{ margin: '20px', backgroundColor: '#f0f0f0' }}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <Typography variant="body1" style={{ fontFamily: 'Pacifico, cursive' }}>Input</Typography>
            <Typography variant="h6" style={{ fontFamily: 'Pacifico, cursive' }}>{selectedCounterfactual.inputProbability}% {targetVariable}: {selectedCounterfactual.inputClass}</Typography>
          </div>
          <div>
            <Typography variant="body1" style={{ fontFamily: 'Pacifico, cursive' }}>Counterfactual</Typography>
            <Typography variant="h6" style={{ color: 'red', fontFamily: 'Pacifico, cursive' }}>{selectedCounterfactual["predictionProbability"]}% {targetVariable}: {selectedCounterfactual.predictedClass}</Typography>
          </div>
        </div>
        <Divider />
        <FeatureList features={selectedCounterfactual.features} title="Features" onHideFeature={hideFeature} onLockToggle={(index) => toggleLock(index, false)} />
        <HiddenFeatureList features={selectedCounterfactual.hiddenFeatures} title="Hidden Features" onShowFeature={showFeature} onLockToggle={(index) => toggleLock(index, true)} />
      </CardContent>
    </Card>
    <Snackbar 
      open={openSuccess} 
      autoHideDuration={4000} 
      onClose={() => setOpenSuccess(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert 
        severity="success" 
        style={{ margin: '0px 0px 100px 20px', maxWidth: '700px' }}
        onClose={() => setOpenSuccess(false)}
      >
        Uploaded successfully!
      </Alert>
    </Snackbar>
    <Snackbar 
      open={openWarning} 
      autoHideDuration={8000} 
      onClose={() => setOpenWarning(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      <Alert 
        severity="warning" 
        style={{ margin: '20px', maxWidth: '700px' }}
        onClose={() => setOpenWarning(false)}
      >
        Now it's time to input your original instance on the left-upper corner and start generating!
      </Alert>
    </Snackbar>
  </>
  );
};

export default Counterfactual;
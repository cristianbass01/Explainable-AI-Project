import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Divider } from '@mui/material';
import FeatureList from './FeatureList';
import HiddenFeatureList from './HiddenFeatureList';

const Counterfactual = ({ counterfactual, inputFeatures, datasetName, setInputFeatures, modelName, targetVariable }) => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(counterfactual);
  const [features, setFeatures] = useState(inputFeatures);

  useEffect(() => {
    console.log("Counterfactual updated:", counterfactual);
    setSelectedCounterfactual(counterfactual);
  }, [counterfactual]);

  useEffect(() => {
    setFeatures(inputFeatures);
  }, [inputFeatures]);


  const transformDatasetToInputFeatures = (dataset) => {
    return Object.keys(dataset.columns).map((column) => ({
      name: column,
      type: dataset.columns[column].type,
      values: dataset.columns[column].values,
      locked: false,
    }));
  };

  useEffect(() => {
    console.log("Dataset name:", datasetName);
    console.log("Model name:", modelName);
    console.log("Target variable:", targetVariable);

    // fetch the dataset based on the dataset name
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/datasets/');
        const data = await response.json();
        //find the dataset with the name datasetName
        console.log(Object.values(data.datasets));
        const dataset = Object.values(data.datasets).find(d => d.title === "processed_data"); //TODO: change to datasetNam

        if (!dataset) {
          console.error("Dataset not found");
          return;
        }
        console.log("Dataset found:", dataset);
        inputFeatures = transformDatasetToInputFeatures(dataset);
        const transformedFeatures = transformDatasetToInputFeatures(dataset);
        console.log("Transformed features:", transformedFeatures);
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
    return null;  // or some fallback UI
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

  const generateCounterfactual = async () => {
    console.log("Generating counterfactual...");
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
            acc[feature.name] = parseInt(feature.value)
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
          modelName: "model",
          dataset: "processed_data",
          type: 'DICE',
        }),
      });

      const data = await response.json();
      console.log("Generated counterfactual:", data);

      // Update the state with the received counterfactual
      if (data) {
        setSelectedCounterfactual(data);
      } else {
        console.error("Counterfactual not generated:", data);
      }
    } catch (error) {
      console.error('Error generating counterfactual:', error);
    }
  };

  return (
    <Card style={{ margin: '20px', backgroundColor: '#f0f0f0' }}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <Typography variant="body1" style={{ fontFamily: 'Pacifico, cursive' }}>Input</Typography>
            <Typography variant="h6" style={{ fontFamily: 'Pacifico, cursive' }}>{selectedCounterfactual.inputProbability}% Non-Diabetic</Typography>
          </div>
          <div>
            <Typography variant="body1" style={{ fontFamily: 'Pacifico, cursive' }}>Counterfactual</Typography>
            <Typography variant="h6" style={{ color: 'red', fontFamily: 'Pacifico, cursive' }}>{selectedCounterfactual.predictionProbability}% Diabetic</Typography>
          </div>
          <div>
            <button style={{ fontFamily: 'Pacifico, cursive', backgroundColor: 'lightblue', padding: '10px', borderRadius: '5px', border: '1' }} onClick={generateCounterfactual}>Generate Counterfactual</button>
          </div>
        </div>
        <Divider />
        <FeatureList features={selectedCounterfactual.features} title="Features" onHideFeature={hideFeature} onLockToggle={(index) => toggleLock(index, false)} />
        <HiddenFeatureList features={selectedCounterfactual.hiddenFeatures} title="Hidden Features" onShowFeature={showFeature} onLockToggle={(index) => toggleLock(index, true)} />
      </CardContent>
    </Card>
  );
};

export default Counterfactual;

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Divider } from '@mui/material';
import FeatureList from './FeatureList';
import HiddenFeatureList from './HiddenFeatureList';

const Counterfactual = ({ counterfactual, inputFeatures }) => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(counterfactual);
  const [features, setFeatures] = useState(inputFeatures);

  useEffect(() => {
    console.log("Counterfactual updated:", counterfactual);
    setSelectedCounterfactual(counterfactual);
  }, [counterfactual]);

  useEffect(() => {
    setFeatures(inputFeatures);
  }, [inputFeatures]);

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

  const generateCounterfactual = () => {
    console.log("Generating counterfactual...");
    // Mock the generation of a new counterfactual
    const mockCounterfactual = {
      inputProbability: 80,  // Example mock data
      predictionProbability: 95,  // Example mock data
      features: features,  // Use the updated input features
      hiddenFeatures: []
    };
    setSelectedCounterfactual(mockCounterfactual);
    console.log("Mock generated counterfactual:", mockCounterfactual);
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

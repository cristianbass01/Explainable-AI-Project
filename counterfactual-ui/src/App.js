import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Counterfactual from './components/Counterfactual';
import UploadPage from './components/UploadPage';
import counterfactuals from './data/counterfactuals';

const App = () => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(counterfactuals[0]);
  const [inputFeatures, setInputFeatures] = useState(selectedCounterfactual.features);
  const [datasetName, setDatasetName] = useState('');
  const [modelName, setModelName] = useState('');
  const [targetVariable, setTargetVariable] = useState('');

  const handleSelectCounterfactual = (counterfactual) => {
    setSelectedCounterfactual(counterfactual);
    setInputFeatures(counterfactual.features);
  };

  const handleUploadFeatures = (features) => {
    setInputFeatures(features);
    const updatedCounterfactual = { ...selectedCounterfactual, features };
    setSelectedCounterfactual(updatedCounterfactual);
  };

  const handleToggleLock = (index) => {
    const newFeatures = [...inputFeatures];
    newFeatures[index].locked = !newFeatures[index].locked;
    setInputFeatures(newFeatures);
    const updatedCounterfactual = { ...selectedCounterfactual, features: newFeatures };
    setSelectedCounterfactual(updatedCounterfactual);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" />} />
        <Route path="/upload" element={<UploadPage setDatasetName={setDatasetName} setModelName={setModelName} setTargetVariable={setTargetVariable} targetVariable={targetVariable} />} />
        <Route 
          path="/app" 
          element={
            <>
              <AppHeader 
                onSelectCounterfactual={handleSelectCounterfactual} 
                onUploadFeatures={handleUploadFeatures} 
                onToggleLock={handleToggleLock}
                newInputFeatures={inputFeatures}
                targetVariable={targetVariable}
              />
              <Counterfactual 
                counterfactual={selectedCounterfactual} 
                inputFeatures={inputFeatures} 
                onToggleLock={handleToggleLock}
                datasetName={datasetName}
                setInputFeatures={setInputFeatures}
                onUploadFeatures={handleUploadFeatures}
                modelName={modelName}
                targetVariable={targetVariable}
              />
            </>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;

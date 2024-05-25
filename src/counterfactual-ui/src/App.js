import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Counterfactual from './components/Counterfactual';
import UploadPage from './components/UploadPage';
import Home from './components/Home';
import counterfactuals from './data/counterfactuals';

const App = () => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(counterfactuals[0]);
  const [inputFeatures, setInputFeatures] = useState(selectedCounterfactual.features);
  const [datasetName, setDatasetName] = useState('');
  const [modelName, setModelName] = useState('');
  const [targetVariable, setTargetVariable] = useState('');
  const generateCounterfactualRef = useRef();

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
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/upload" 
          element={
            <>
              <AppHeader 
                setTargetVariable={setTargetVariable}
                targetVariable={targetVariable}
                setDatasetName={setDatasetName}
                datasetName={datasetName}
                setModelName={setModelName}
                modelName={modelName}
              />
              <UploadPage 
                setDatasetName={setDatasetName} 
                datasetName={datasetName} 
                setModelName={setModelName} 
                modelName={modelName} 
                setTargetVariable={setTargetVariable} 
                targetVariable={targetVariable}
              />
            </>
          } />
        <Route 
          path="/home" 
          element={
            <>
              <AppHeader 
                setTargetVariable={setTargetVariable}
                targetVariable={targetVariable}
                setDatasetName={setDatasetName}
                datasetName={datasetName}
                setModelName={setModelName}
                modelName={modelName}
              />
              < Home />
            </>
          } 
        />
        <Route path="/counterfactual" 
          element={
            <>
              <AppHeader 
                setTargetVariable={setTargetVariable}
                targetVariable={targetVariable}
                setDatasetName={setDatasetName}
                datasetName={datasetName}
                setModelName={setModelName}
                modelName={modelName}
              />
              <Counterfactual 
                counterfactual={null} 
                inputFeatures={inputFeatures} 
                onToggleLock={handleToggleLock}
                datasetName={datasetName}
                setInputFeatures={setInputFeatures}
                onUploadFeatures={handleUploadFeatures}
                modelName={modelName}
                targetVariable={targetVariable}
                generateCounterfactualRef={generateCounterfactualRef}
              />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Counterfactual from './components/Counterfactual';
import UploadPage from './components/UploadPage';
import counterfactuals from './data/counterfactuals';

const App = () => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(counterfactuals[0]);
  const [inputFeatures, setInputFeatures] = useState(selectedCounterfactual.features);

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
        <Route path="/upload" element={<UploadPage onUploadFeatures={handleUploadFeatures} />} />
        <Route 
          path="/app" 
          element={
            <>
              <AppHeader 
                onSelectCounterfactual={handleSelectCounterfactual} 
                onUploadFeatures={handleUploadFeatures} 
                onToggleLock={handleToggleLock}
              />
              <Counterfactual 
                counterfactual={selectedCounterfactual} 
                inputFeatures={inputFeatures} 
                onToggleLock={handleToggleLock}
              />
            </>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;

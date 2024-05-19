import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Counterfactual from './components/Counterfactual';
import counterfactuals from './data/counterfactuals';  // Correct import

const App = () => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(counterfactuals[0]);
  const [inputFeatures, setInputFeatures] = useState([]);

  const handleSelectCounterfactual = (counterfactual) => {
    setSelectedCounterfactual(counterfactual);
  };

  const handleUploadFeatures = (features) => {
    setInputFeatures(features);
  };

  return (
    <Router>
      <AppHeader 
        onSelectCounterfactual={handleSelectCounterfactual} 
        onUploadFeatures={handleUploadFeatures} 
      />
      <Routes>
        <Route path="/" element={<Counterfactual counterfactual={selectedCounterfactual} inputFeatures={inputFeatures} />} />
      </Routes>
    </Router>
  );
};

export default App;

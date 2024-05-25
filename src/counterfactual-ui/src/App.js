import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AppHeader from './components/AppHeader';
import Counterfactual from './components/Counterfactual';
import UploadPage from './components/UploadPage';
import Home from './components/Home';
import counterfactuals from './data/counterfactuals';

const App = () => {
  const [datasetName, setDatasetName] = useState('');
  const [modelName, setModelName] = useState('');
  const [targetVariable, setTargetVariable] = useState('');

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
                datasetName={datasetName}
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

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Counterfactual from './components/Counterfactual';
import UploadPage from './components/UploadPage';
import Home from './components/Home';

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
              <UploadPage 
                setDatasetName={setDatasetName} 
                datasetName={datasetName} 
                setModelName={setModelName} 
                modelName={modelName} 
                setTargetVariable={setTargetVariable} 
                targetVariable={targetVariable}
              />
          } />
        <Route 
          path="/home" 
          element={    
            < Home 
              datasetName={datasetName} 
              setDatasetName={setDatasetName} 
              modelName={modelName} 
              setModelName={setModelName} 
              targetVariable={targetVariable} 
              setTargetVariable={setTargetVariable}
            />
          } 
        />
        <Route path="/counterfactual" 
          element={  
              <Counterfactual 
                datasetName={datasetName}
                setDatasetName={setDatasetName}
                modelName={modelName}
                setModelName={setModelName}
                targetVariable={targetVariable}
                setTargetVariable={setTargetVariable}
              />
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

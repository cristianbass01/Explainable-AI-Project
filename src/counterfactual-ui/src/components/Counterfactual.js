import React, { useEffect, useState, useRef } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Box, Button, Drawer, Card, Grid, CardContent, Typography, Divider, Alert, Snackbar, IconButton } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FeatureList from './FeatureList';
import HiddenFeatureList from './HiddenFeatureList';

const Counterfactual = ({ counterfactual, inputFeatures, datasetName, setInputFeatures, modelName, targetVariable, generateCounterfactualRef, onUploadFeatures, onToggleLock }) => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(null);
  const [features, setFeatures] = useState(inputFeatures);
  const [openWarning, setOpenWarning] = useState(true);
  const [drawerInputOpen, setDrawerInputOpen] = useState(false);
  const [drawerCounterfactualOpen, setDrawerCounterfactualOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setSelectedCounterfactual({ ...counterfactual, hiddenFeatures: [], features: inputFeatures });
  }, [counterfactual, inputFeatures]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/datasets/');
        const data = await response.json();
        const dataset = Object.values(data.datasets).find(d => d.title === datasetName);

        if (!dataset) {
          console.error("Dataset not found");
          return;
        }

        inputFeatures = transformDatasetToInputFeatures(dataset);
        const transformedFeatures = transformDatasetToInputFeatures(dataset);
        setFeatures(transformedFeatures);
        const targetIndex = transformedFeatures.findIndex(feature => feature.name === targetVariable);
        transformedFeatures.splice(targetIndex, 1);
        setInputFeatures(transformedFeatures);
      } catch (error) {
        console.error('Error fetching dataset:', error);
      }
    }

    fetchData();
  }, [datasetName, setInputFeatures]);

  const transformDatasetToInputFeatures = (dataset) => {
    return Object.keys(dataset.columns).map((column) => ({
      name: column,
      type: dataset.columns[column].type,
      values: dataset.columns[column].values,
      locked: false,
    }));
  };

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
      const CounterfactualFeatures = [];
      const changes = [];
      const hiddenFeatures = [];

      const originalData = raw_data.original;
      const predictionProbability = (item.probability * 100).toFixed(1);
      const inputProbability = (originalData["probability"] * 100).toFixed(1);
      const inputClass = originalData[targetVariable];
      const predictedClass = item[targetVariable];

      for (let feature of features) {
        if (feature === targetVariable) {
          continue;
        }

        const featureDict = {};
        featureDict['name'] = feature.name;

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
        } else {
          CounterfactualFeatures.push(featureDict);
        }
      }

      const counterFactual = {};
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
        if (feature.type === 'categorical') {
          if (feature.value === 'true') {
            acc[feature.name] = 1;
          } else if (feature.value === 'false') {
            acc[feature.name] = 0;
          } else {
            acc[feature.name] = feature.value;
          }
        } else if (feature.type === 'numeric') {
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

  const renderInputFeaturesForm = () => {
    if (inputFeatures.length === 0) {
      console.error('No input features found');
      return null;
    }

    return (
      <Box sx={{ padding: 2, maxHeight: "100%", overflowY: 'auto' }}>
        <Typography variant="h6" gutterBottom>Input Features</Typography>
        <form>
          {inputFeatures.map((feature, index) => (
            <Grid container spacing={2} alignItems="center" key={index} sx={{ marginBottom: 2 }}>
              <Grid item>
                <IconButton onClick={() => onToggleLock(index)}>
                  {feature.locked ? <LockIcon /> : <LockOpenIcon />}
                </IconButton>
              </Grid>
              <Grid item xs>
                <Typography variant="subtitle1" noWrap>{feature.name}</Typography>
              </Grid>
              <Grid item xs={7}>
                {feature.type === 'categorical' && feature.values ? (
                  <select
                    value={feature.value || ''}
                    onChange={(e) => {
                      const newFeatures = [...inputFeatures];
                      newFeatures[index].value = e.target.value;
                      setInputFeatures(newFeatures);
                      onUploadFeatures(newFeatures);
                    }}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    disabled={feature.locked}
                  >
                    <option value="" disabled>Select {feature.name}</option>
                    {feature.values.map((value, i) => (
                      <option key={i} value={value}>{value.toString()}</option>
                    ))}
                  </select>
                ) : feature.type === 'categorical' && feature.values === undefined ? (
                  <select
                    value={feature.value || ''}
                    onChange={(e) => {
                      const newFeatures = [...inputFeatures];
                      newFeatures[index].value = e.target.value;
                      setInputFeatures(newFeatures);
                      onUploadFeatures(newFeatures);
                    }}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    disabled={feature.locked}
                  >
                    <option value="" disabled>Select {feature.name}</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <input
                    type="number"
                    placeholder={`Enter ${feature.name}`}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    value={feature.value || ''}
                    onChange={(e) => {
                      const newFeatures = [...inputFeatures];
                      newFeatures[index].value = e.target.value;
                      setInputFeatures(newFeatures);
                      onUploadFeatures(newFeatures);
                    }}
                    disabled={feature.locked}
                  />
                )}
              </Grid>
            </Grid>
          ))}
        </form>
        <Box sx={{ textAlign: 'right' }}>
          <Button
            variant='contained'
            onClick={() => {
              generateCounterfactualRef.current();
              setDrawerInputOpen(false);
            }}
          >
            Generate Counterfactual
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <div ref={containerRef} style={{ transition: 'margin 0.3s', marginLeft: drawerInputOpen ? 800 : 0, marginRight: drawerCounterfactualOpen ? 800 : 0 }}>
      <Grid container alignContent={'start'} style={{ minHeight: 'calc(100vh - 64px)', width: '100%', height: '100%' }} backgroundColor='#0B2230'>
        <Grid item xs={3} style={{ display: 'flex', justifyContent: 'flex-start' }} marginTop={'20px'}>
          {(!drawerInputOpen && !drawerCounterfactualOpen) && (
            <Button
              edge="start"
              color="primary"
              variant="contained"
              aria-label="menu"
              onClick={() => setDrawerInputOpen(true)}
              endIcon={<ChevronRightIcon />}
              style={{ borderRadius: '0 20px 20px 0' }}
            >
              <Typography variant="h5" color={'white'}>
              Change original instance
              </Typography>
            </Button>
          )}
        </Grid>
        <Grid container direction="row" item xs={6} spacing={2} justifyContent="center" alignItems="center" marginTop={'0px'}>
          {datasetName && (
            <Grid item>
              <Box border={3} borderColor="primary.main" p={1} borderRadius={5}>
                <Typography variant="h6" color={'white'}>Dataset Name: {datasetName}</Typography>
              </Box>
            </Grid>
          )}
          {modelName && (
            <Grid item>
              <Box border={3} borderColor="primary.main" p={1} borderRadius={5}>
                <Typography variant="h6" color={'white'} >Model Name: {modelName}</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        <Grid item xs={3} style={{ display: 'flex', justifyContent: 'flex-end' }} marginTop={'20px'}>
          {(!drawerCounterfactualOpen && !drawerInputOpen) && (
            <Button
              edge="start"
              color="primary"
              variant="contained"
              aria-label="menu"
              onClick={() => setDrawerCounterfactualOpen(true)}
              startIcon={<ChevronLeftIcon />}
              style={{ borderRadius: '20px 0 0 20px' }}
            > 
            <Typography variant="h5" color={'white'}>
              Change Counterfactual
            </Typography>
            </Button>
          )}
        </Grid>

        <Drawer anchor="left" open={drawerInputOpen} onClose={() => setDrawerInputOpen(false)}>
          <Box
            sx={{ minWidth: 800, padding: 2, maxWidth: "80%" }}
            role="presentation"
          >
            {renderInputFeaturesForm()}
          </Box>
        </Drawer>

        <Drawer anchor="right" open={drawerCounterfactualOpen} onClose={() => setDrawerCounterfactualOpen(false)}>
          <Box
            sx={{ minWidth: 800, padding: 2, maxWidth: "80%" }}
            role="presentation"
          >
            {renderInputFeaturesForm()}
          </Box>
        </Drawer>

        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <main style={{ maxWidth: 1200, flexGrow: 1, padding: '20px' }}>
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
                {selectedCounterfactual.features.length > 0 &&
                  <FeatureList features={selectedCounterfactual.features} title="Features" onHideFeature={hideFeature} onLockToggle={(index) => toggleLock(index, false)} />
                }
                {selectedCounterfactual.hiddenFeatures.length > 0 &&
                  <HiddenFeatureList features={selectedCounterfactual.hiddenFeatures} title="Hidden Features" onShowFeature={showFeature} onLockToggle={(index) => toggleLock(index, true)} />
                }
              </CardContent>
            </Card>
          </main>
        </Grid>
      </Grid>
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
    </div>
  );
};

export default Counterfactual;

import React, { useEffect, useState, useRef } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Box, Button, Drawer, Card, Grid, CardContent, Typography, Divider, Alert, Snackbar, IconButton, Backdrop, TextField } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import FeatureList from './FeatureList';
import HiddenFeatureList from './HiddenFeatureList';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import CircularProgress from '@mui/material/CircularProgress';
import AppHeader from './AppHeader';
import LoadingCat from './../images/cat-cats.gif';

const Counterfactual = ({datasetName, setDatasetName, modelName, setModelName, targetVariable, setTargetVariable}) => {
  const [selectedCounterfactual, setSelectedCounterfactual] = useState(null);
  const [features, setFeatures] = useState([]);
  const [openWarning, setOpenWarning] = useState(true);
  const [drawerInputOpen, setDrawerInputOpen] = useState(true);
  const [drawerCounterfactualOpen, setDrawerCounterfactualOpen] = useState(false);
  const [alternativeCounterfactuals, setAlternativeCounterfactuals] = useState([]);
  const [numCounterfactuals, setNumCounterfactuals] = useState(1);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const containerRef = useRef(null);

  const [isShuffling, setIsShuffling] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

        const transformedFeatures = transformDatasetToInputFeatures(dataset);
        const targetIndex = transformedFeatures.findIndex(feature => feature.name === targetVariable);
        transformedFeatures.splice(targetIndex, 1);
        setFeatures(transformedFeatures);
        setSelectedCounterfactual({ features: transformedFeatures, hiddenFeatures: [] });
      } catch (error) {
        console.error('Error fetching dataset:', error);
      }
    }

    fetchData();
  }, [datasetName, targetVariable]);

  const handleToggleLock = (index) => {
    const newFeatures = [...features];
    newFeatures[index].locked = !newFeatures[index].locked;
    setFeatures(newFeatures);
    const updatedCounterfactual = { ...selectedCounterfactual, features: newFeatures };
    setSelectedCounterfactual(updatedCounterfactual);
  };

  const fetchInstances = async (nInstances) => {
    try {
      const response = await fetch('http://localhost:8000/sampleDataset/',  {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
        },
        body: JSON.stringify({
          count: nInstances,
          dataset: datasetName,
        }),
      });

      const data = await response.json();
      const instances = data.samples;
      console.log("Instances found:", instances);

      if (instances) {
        const oldFeatures = [...features];
        return instances.map((instance) => {
          const newFeatures = oldFeatures.map((feature) => {
            const newFeature = { ...feature };
            newFeature.value = instance[feature.name];
            return newFeature;
          });
          return newFeatures;
        });
      }
      
    } catch (error) {
      console.error('Error fetching instance:', error);
    }
  };

  const transformDatasetToInputFeatures = (dataset) => {
    return Object.keys(dataset.columns).map((column) => ({
      name: column,
      type: dataset.columns[column].type,
      values: dataset.columns[column].values,
      locked: false,
    }));
  };

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
    return String(ogFeature) !== String(cfFeature);
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

  const generateCounterfactuals = async (count) => {
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
          count: parseInt(count),
          featuresToVary: features.filter(feature => !feature.locked).map(feature => feature.name),
        }),
      });

      const data = await response.json();

      if (data) {
        const newCounterfactuals = parseCounterfactual(data);
        setAlternativeCounterfactuals(newCounterfactuals);
        setSelectedCounterfactual(newCounterfactuals[0]);
        setSelectedCardIndex(0);
      } else {
        console.error("Counterfactual not generated:", data);
      }
    } catch (error) {
      console.error('Error generating counterfactual:', error);
    }
  };

  const renderInputFeaturesForm = () => {
    if (features.length === 0) {
      console.error('No input features found');
      return null;
    }

    return (
      <Box sx={{ padding: 2, maxHeight: "100%", overflowY: 'auto' }}>
        <Grid container justifyContent="center" alignItems="center" marginBottom={'10px'}>
          <Grid item xs={11}>
            <Typography variant="h5">Input Features</Typography>
          </Grid>
          <Grid item xs={1} justifyContent={'center'}>
            <IconButton onClick={() => setDrawerInputOpen(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </Grid>
        </Grid>
        
        <Divider/>
        <Grid container justifyContent="end" marginTop={2} marginBottom={2}>
          <Button 
            variant='contained'
            endIcon={<ShuffleIcon />}
            onClick={async () => {
              setIsShuffling(true);
              const instances = await fetchInstances(1);
              if (instances && instances.length > 0) {
                setFeatures(instances[0]);
                console.log('Instances found:', instances[0]);
              } else {
                console.error('No instances found');
              }
              setIsShuffling(false);
            }} >
              <Typography variant="h6">
                Shuffle Instance
              </Typography>
          </Button>
        </Grid>
        <form>
          {features.map((feature, index) => (
            <Grid container spacing={2} alignItems="center" key={index} sx={{ marginBottom: 2 }}>
              <Grid item>
                <IconButton onClick={() => handleToggleLock(index)}>
                  {feature.locked ? <LockIcon /> : <LockOpenIcon />}
                </IconButton>
              </Grid>
              <Grid item xs>
                <Typography variant="h6" noWrap>
                  {feature.name.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                {feature.type === 'categorical' && feature.values ? (
                  <TextField
                    select
                    size="small"
                    value={feature.value || ''}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index].value = e.target.value;
                      setFeatures(newFeatures);
                    }}
                    fullWidth
                    disabled={feature.locked}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="" disabled>Select {feature.name}</option>
                    {feature.values.map((value, i) => (
                      <option key={i} value={value}>{value.toString()}</option>
                    ))}
                  </TextField>
                ) : feature.type === 'categorical' && feature.values === undefined ? (
                  <TextField
                    select
                    size="small"
                    value={feature.value || ''}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index].value = e.target.value;
                      setFeatures(newFeatures);
                    }}
                    fullWidth
                    disabled={feature.locked}
                    SelectProps={{
                      native: true,
                    }}
                  >
                    <option value="" disabled>Select {feature.name}</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </TextField>
                ) : (
                  <TextField
                    type="number"
                    size="small"
                    placeholder={`Enter ${feature.name}`}
                    fullWidth
                    value={feature.value || ''}
                    onChange={(e) => {
                      const newFeatures = [...features];
                      newFeatures[index].value = e.target.value;
                      setFeatures(newFeatures);
                    }}
                    disabled={feature.locked}
                  />
                )}
              </Grid>
            </Grid>
          ))}
        </form>
        <Divider />
        
        <Grid container justifyContent="center" marginTop={2}>
          <Grid item xs={8}>
            <Typography variant="h6" gutterBottom>Number of Counterfactuals: </Typography>
            
          </Grid>
          <Grid item xs={4}>
          <TextField
              type="number"
              size="small"
              fullWidth
              value={numCounterfactuals}
              onChange={(e) => setNumCounterfactuals(parseInt(e.target.value))}
              InputProps={{ inputProps: { min: 1 } }}
            />
          </Grid>
          <Grid item xs={12} marginTop={2}>
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant='contained'
                onClick={() => {
                  setIsGenerating(true);
                  setAlternativeCounterfactuals([]);
                  setSelectedCounterfactual(null);
                  generateCounterfactuals(numCounterfactuals).then(() => {
                    setIsGenerating(false);
                    setDrawerCounterfactualOpen(true);
                  });
                  setDrawerInputOpen(false);
                }}
              >
                <Typography variant="h6">
                  Generate Counterfactual
                </Typography>
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderAlternativeCounterfactuals = () => {
    return (
      <Box sx={{ padding: 2, maxHeight: "100%", overflowY: 'auto' }}>
        <Grid container justifyContent="center" alignItems="center">
          <Grid item xs={1}>
            <IconButton onClick={() => setDrawerCounterfactualOpen(false)}>
              <ChevronRightIcon />
            </IconButton>
          </Grid>
          <Grid item xs={11}>
            <Typography variant="h5" align="right">Alternative Counterfactuals</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ marginBottom: 2 }}/>
        {alternativeCounterfactuals.map((cf, index) => (
          <Card key={index} 
                sx={{ 
                  marginBottom: 2, 
                  cursor: 'pointer',
                  backgroundColor: selectedCardIndex === index ? '#1976d2' : 'white',
                  color: selectedCardIndex === index ? 'white' : 'black',
                }} 
            onClick={() => {
              setSelectedCounterfactual(alternativeCounterfactuals[index]);
              setSelectedCardIndex(index);
            }}>
            <CardContent>
              <Typography variant="h6">Counterfactual {index + 1}</Typography>
              <Typography variant="subtitle1">Prediction Probability: {cf.predictionProbability}%</Typography>
              <Typography variant="subtitle1">Changes: {cf.changes.length}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <>
    <AppHeader 
                setDatasetName={setDatasetName}
                datasetName={datasetName}
                setModelName={setModelName}
                modelName={modelName}
                setTargetVariable={setTargetVariable}
                targetVariable={targetVariable}
      />
    <div ref={containerRef} style={{ transition: 'margin 0.3s', marginLeft: drawerInputOpen ? 600 : 0, marginRight: drawerCounterfactualOpen ? 400 : 0, marginTop:'64px' }}>
      <Backdrop open={isGenerating} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
        >
          <img src={LoadingCat} alt="Loading" height="200"/>
          <CircularProgress color="inherit" />
        </Box>
      </Backdrop>
      <Backdrop open={isShuffling} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center"
          >
            <img src={LoadingCat} alt="Loading" height="200"/>
            <CircularProgress color="inherit" />
          </Box>
        </Backdrop>
      <Grid container alignContent={'start'} style={{ minHeight: 'calc(100vh - 64px)', width: '100%', height: '100%' }} backgroundColor='#0B2230'>
        {( !drawerInputOpen) && (
        <Grid item xs={3.5} style={{ display: 'flex', justifyContent: 'flex-start' }} marginTop={'20px'}>
            <Button
              edge="start"
              color="primary"
              variant="contained"
              aria-label="menu"
              onClick={() => setDrawerInputOpen(true)}
              endIcon={<ChevronRightIcon />}
              style={{ borderRadius: '0 20px 20px 0' }}
            >
              <Typography variant="h6" color={'white'}>
                Choose original instance
              </Typography>
            </Button>
        </Grid>
        )}
        <Grid container direction="row" 
            item xs= {(!drawerCounterfactualOpen && !drawerInputOpen) ? 5 : (!drawerCounterfactualOpen || !drawerInputOpen) ? 8.5 : 12}
            spacing={2} 
            justifyContent="center" 
            alignItems="center" 
            marginTop={'0px'}>
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
        {(!drawerCounterfactualOpen) && (
        <Grid item xs={3.5} style={{ display: 'flex', justifyContent: 'flex-end' }} marginTop={'20px'}>
            <Button
              edge="start"
              color="primary"
              variant="contained"
              aria-label="menu"
              onClick={() => setDrawerCounterfactualOpen(true)}
              startIcon={<ChevronLeftIcon />}
              style={{ borderRadius: '20px 0 0 20px' }}
            > 
              <Typography variant="h6" color={'white'}>
                Choose Counterfactual
              </Typography>
            </Button>
        </Grid>
        )}

        <Drawer anchor="left" open={drawerInputOpen} 
          variant="persistent"
          onClose={() => setDrawerInputOpen(false)}>
          <Box
            sx={{ width: 600, padding: 2, marginTop: '64px'}}
            role="presentation"
          >
            {renderInputFeaturesForm()}
          </Box>
        </Drawer>
        
        <Drawer anchor="right" open={drawerCounterfactualOpen} 
          variant="persistent"
          onClose={() => setDrawerCounterfactualOpen(false)}
          marginTop={'64px'}>
          <Box
            sx={{ width: 400, padding: 2, marginTop: '64px'}}
            role="presentation"
          >
            {renderAlternativeCounterfactuals()}
          </Box>
        </Drawer>

        <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <main style={{ maxWidth: 1200, flexGrow: 1, padding: '20px' }}>
            <Card style={{ margin: '20px', backgroundColor: '#f0f0f0' }}>
              <CardContent>
                {
                  selectedCounterfactual && selectedCounterfactual.changes && selectedCounterfactual.changes.length > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div>

                          <Typography variant="body1" style={{ fontSize: '30px' }}  color='primary' >Original Instance</Typography>
                            { selectedCounterfactual &&
                              <Typography variant="h6" style={{fontSize: '30px' }}  color='primary'>
                                {selectedCounterfactual.inputProbability}% {targetVariable}: {selectedCounterfactual.inputClass}
                              </Typography>
                            }
                        </div>
                        <div>
                          <Typography variant="body1" style={{ fontSize: '30px' }} color='red'>Counterfactual</Typography>
                          {
                            selectedCounterfactual && (
                              <Typography variant="h6" style={{ fontSize: '30px' }} color= 'red' >
                                {selectedCounterfactual["predictionProbability"]}% {targetVariable}: {selectedCounterfactual.predictedClass}
                              </Typography>
                            )
                          }
                        </div>
                        
                      </div>
                      <Divider />
                    </>
                  )

                }
                
                {selectedCounterfactual && selectedCounterfactual.features.length > 0 &&
                  <FeatureList features={selectedCounterfactual.features} title="Features" onHideFeature={hideFeature} onLockToggle={(index) => toggleLock(index, false)} />
                }
                {selectedCounterfactual && selectedCounterfactual.hiddenFeatures.length > 0 &&
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
          Input your original instance and start generating!
        </Alert>
      </Snackbar>
    </div>
    </>
  );
};

export default Counterfactual;

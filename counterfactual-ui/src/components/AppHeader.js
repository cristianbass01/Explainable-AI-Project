import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import counterfactuals from '../data/counterfactuals';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import { Box, Button, Typography, Grid, Select, MenuItem, FormControl, InputLabel, Divider, DialogTitle, Alert, Snackbar } from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const AppHeader = ({ onSelectCounterfactual, onUploadFeatures, onToggleLock, newInputFeatures, setDatasetName, datasetName, setModelName, modelName, setTargetVariable, targetVariable}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputFeatures, setInputFeatures] = useState([]);
  const [showFeaturesForm, setShowFeaturesForm] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [openDatasetAlert, setOpenDatasetAlert] = useState(false);
  const [openModelAlert, setOpenModelAlert] = useState(false);

  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [modelType, setModelType] = useState('');

  useEffect(() => {
    setInputFeatures(newInputFeatures);
  }, [newInputFeatures]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/datasets/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Datasets found:", data)
        setDatasets(data.datasets);
      } catch (error) {
        console.error('Error fetching loaded datasets:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/models/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Model found:", data)
        setModels(data.models);
      } catch (error) {
        console.error('Error fetching loaded models:', error);
      }
    };

    fetchData();
  }, []);

  const handleConfirm = () => {
    if (!datasetName) {
      setOpenDatasetAlert(true);
    } else if (!modelName) {
      setOpenModelAlert(true);
    } else {
      setOpenSelect(false);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleSelectCounterfactual = (counterfactual) => {
    onSelectCounterfactual(counterfactual);
    setDrawerOpen(false);
  };

  const handleDatasetNameChange = (event) => {
    setDatasetName(event.target.value);
    const foundDataset = datasets.find((dataset) => dataset.title === event.target.value);

    if (foundDataset) {
      console.log('Dataset selected:', foundDataset.title);
      setTargetVariable(foundDataset.target);
    } else {
      console.log('No dataset found with that name');
    }
  };

  const handleModelNameChange = (event) => {
    setModelName(event.target.value);
    const foundModel = models.find((model) => model.title === event.target.value);

    if (foundModel) {
      console.log('Model selected:', foundModel.title);
      setModelType(foundModel.type);
    } else {
      console.log('No model found with that name');
    }
  };

  
  const renderInputFeaturesForm = () => {
    if (inputFeatures.length === 0) {
      console.error('No input features found');
      return null;
    }

    return (
      <Box sx={{ padding: 2, maxHeight: 400, overflowY: 'auto' }}>
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
        <Box sx={{ textAlign: 'center' }}>
          <IconButton onClick={() => setShowFeaturesForm(false)}>
            <ArrowDropUpIcon />
          </IconButton>
          <Typography variant="caption">Hide Form</Typography>
        </Box>
      </Box>
    );
  };

  return (
    <>
      <AppBar position="static" style={{ background: '#f5f5f5', color: '#000' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1, fontFamily: 'Pacifico, cursive' }}>
            Select Counterfactual
          </Typography>

          {datasetName && modelName && (
            <Box display="flex" justifyContent="center">
              <Typography variant="h6" style={{ marginRight: '10px' }}>
                Dataset: {datasetName} | Model: {modelName}
              </Typography>
            </Box>
          )}
          <Button
            variant='contained'
            onClick={() => setOpenSelect(true)}
            startIcon={<FileOpenIcon />}
            style={{ marginRight: '10px' }}
          >
            Select
          </Button>
          <Dialog
            fullWidth
            maxWidth="md"
            open={openSelect}
            TransitionComponent={Transition}
            keepMounted
            onClose={() => setOpenSelect(false)}
            aria-describedby="dialog-slide-select"
            PaperProps={{
              component: 'form',
              onSubmit: (event) => {
                console.log('Dataset selected:', datasetName);
                console.log('Model selected:', modelName);
                setOpenSelect(false);
              },
            }}
          >
            <DialogTitle fontSize={'35px'}>{"Select your dataset and model"}</DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={7}>
                  <FormControl fullWidth>
                    <InputLabel id="upload-dataset-label">Dataset</InputLabel>
                    <Select
                      labelId="upload-dataset-label"
                      id="select-dataset"
                      value={datasetName}
                      label="Dataset"
                      onChange={handleDatasetNameChange}
                    >
                      {datasets.map((dataset) => (
                        <MenuItem key={dataset.title} value={dataset.title}>{dataset.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="h5">
                    {targetVariable ? `Target variable: ${targetVariable}` : 'No dataset selected'}
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  <FormControl fullWidth>
                    <InputLabel id="select-model-label">Model</InputLabel>
                    <Select
                      labelId="select-model-label"
                      id="select-model"
                      value={modelName}
                      label="Model"
                      onChange={handleModelNameChange}
                    >
                      {models.map((model) => (
                        <MenuItem key={model.title} value={model.title}>{model.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="h5">
                    {modelType ? `Model type: ${modelType}` : 'No model selected'}
                  </Typography>
                </Grid>
              </Grid>
              
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setDatasetName('')
                setModelName('')
                setTargetVariable('')
                setModelType('')
                setOpenSelect(false)
                }}>
                Cancel
              </Button>
              <Button 
                variant="contained"
                onClick={handleConfirm}
                >
                  Confirm
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar open={openDatasetAlert} autoHideDuration={6000} onClose={() => setOpenDatasetAlert(false)}>
            <Alert onClose={() => setOpenDatasetAlert(false)} severity="error">
              Please select a dataset.
            </Alert>
          </Snackbar>

          <Snackbar open={openModelAlert} autoHideDuration={6000} onClose={() => setOpenModelAlert(false)}>
            <Alert onClose={() => setOpenModelAlert(false)} severity="error">
              Please select a model.
            </Alert>
          </Snackbar>

          <Button
            variant='contained'
            onClick={() => navigate('/upload') }
            startIcon={<UploadFileIcon />}
          >
            Upload
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 300, padding: 2 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Typography variant="h6" gutterBottom>
            Select Counterfactual
          </Typography>
          <List>
            {counterfactuals.map((counterfactual, index) => (
              <ListItem button key={index} onClick={() => handleSelectCounterfactual(counterfactual)}>
                <Box sx={{ width: '100%' }}>
                  <Typography variant="subtitle1">Counterfactual {index + 1}</Typography>
                  <Typography variant="body2">Number of changes: {counterfactual.changes.length}</Typography>
                  <Typography variant="body2">Features changed: {counterfactual.changes.join(', ')}</Typography>
                  <Typography variant="body2">Prediction probability: {counterfactual.predictionProbability}%</Typography>
                  {index < counterfactuals.length - 1 && <Divider sx={{ marginY: 1 }} />}
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      
      {showFeaturesForm ? renderInputFeaturesForm() : (
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          <IconButton onClick={() => setShowFeaturesForm(true)}>
            <ArrowDropDownIcon />
          </IconButton>
          <Typography variant="caption">Change Input</Typography>
        </Box>
      )}
    </>
  );
};

export default AppHeader;

import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Button, Typography, Grid, Select, MenuItem, FormControl, InputLabel, Divider, DialogTitle, Alert, AlertTitle, Snackbar } from '@mui/material';
import Modal from './Modal';
import TutorialOverlay from './TutorialOverlay';
import logo from './../images/logo.png';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AppHeader = ({  setDatasetName, 
                      datasetName, 
                      setModelName, 
                      modelName, 
                      setTargetVariable, 
                      targetVariable, 
                       }) => {
  const [openSelect, setOpenSelect] = useState(false);
  const [openDatasetAlert, setOpenDatasetAlert] = useState(false);
  const [openModelAlert, setOpenModelAlert] = useState(false);

  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [models, setModels] = useState([]);
  const [modelType, setModelType] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [openError, setOpenError] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleError = () => {
    setOpenError(true);
    setTimeout(() => {
      setOpenError(false);
    }, 10000);
  };

  const handleDatasetNameChange = (event) => {
    setDatasetName(event.target.value);
    const foundDataset = datasets.find((dataset) => dataset.title === event.target.value);

    if (foundDataset) {
      console.log('Dataset selected:', foundDataset.title);
      setTargetVariable(foundDataset.target);
    } else {
      console.log('No dataset found with that name');
      setErrorText('No dataset found with that name');
      handleError();
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
      setErrorText('No model found with that name');
      handleError();
    }
  };
  
  const fetchDatasets = async () => {
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
      setErrorText('Error fetching loaded datasets:'+ error);
      handleError();
    }
  };
  
  const fetchModels = async () => {
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
      setErrorText('Error fetching loaded models:'+ error);
      handleError();
    }
  };

  const handleConfirm = () => {
    if (!datasetName) {
      setOpenDatasetAlert(true);
    } else if (!modelName) {
      setOpenModelAlert(true);
    } else {
      setOpenSelect(false);
      navigate('/counterfactual');
    }
  };

  const selectDialog = (
    <>
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
        <DialogTitle fontSize={'30px'} color={'primary'}>{"Select your dataset and model"}</DialogTitle>
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
              <Typography variant="h6">
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
              <Typography variant="h6">
                {modelType ? `Model type: ${modelType}` : 'No model selected'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant='outlined'
            onClick={() => {
              setDatasetName('');
              setTargetVariable('');
              setModelName('');
              setModelType('');
              setOpenSelect(false)
            }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={openDatasetAlert} autoHideDuration={6000} onClose={() => setOpenDatasetAlert(false)}>
        <Alert severity="error" onClose={() => setOpenDatasetAlert(false)} variant='filled'>
          <Typography variant="h6">Please select a dataset</Typography>
        </Alert>
      </Snackbar>
      <Snackbar open={openModelAlert} autoHideDuration={6000} onClose={() => setOpenModelAlert(false)}>
        <Alert severity="error" onClose={() => setOpenModelAlert(false)} variant='filled'>
          <Typography variant="h6">Please select a model</Typography>
        </Alert>
      </Snackbar>
    </>
  );

  return (
    <>
      <Snackbar open={openError} autoHideDuration={10000} onClose={() => setOpenError(false)}>
        <Alert severity="error" variant="filled" onClose={() => setOpenError(false)}>
          <AlertTitle>Error</AlertTitle>
          {errorText}
        </Alert>
      </Snackbar>

      <AppBar position="fixed" style={{ background: '#f5f5f5', color: '#000', height: '64px' }}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs>
            <IconButton
                onClick={() => {
                  setDatasetName('');
                  setTargetVariable('');
                  setModelName('');
                  setModelType('');
                  navigate('/home');
                }}
              >
                <img src={logo} alt="logo" style={{ width: '50px', height: 'auto' }} />
              </IconButton>
            </Grid>
            <Grid item>
              <Button
                variant='contained'
                onClick={() => {
                  fetchDatasets();
                  fetchModels();
                  setOpenSelect(true)
                }}
                startIcon={<FileOpenIcon />}
                style={{ marginRight: '10px' }}
              >
                <Typography variant="h6">
                  Select
                </Typography>
              </Button>
              {selectDialog}
              <Button
                variant='contained'
                onClick={() => navigate('/upload')}
                startIcon={<UploadFileIcon />}
              >
                <Typography variant="h6">
                  Upload
                </Typography>
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                startIcon={<HelpOutlineIcon />}
                onClick={() => setShowModal(true)}
              >
                <Typography variant="h6">
                  Help
                </Typography>
              </Button>
              < div >
                <Modal show={showModal} onClose={() => setShowModal(false)}>
                  <TutorialOverlay />
                </Modal>
              </div >
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default AppHeader;

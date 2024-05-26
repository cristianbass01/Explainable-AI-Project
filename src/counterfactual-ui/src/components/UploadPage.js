import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, Select, MenuItem, FormControl, InputLabel, Divider, Snackbar, Alert, AlertTitle } from '@mui/material';
import {PostAdd, NoteAdd, Upload} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom';
import AppHeader from './AppHeader';

const UploadPage = ({ datasetName,
                      setDatasetName, 
                      modelName,
                      setModelName, 
                      targetVariable,
                      setTargetVariable, 
                       }) => {
  const datasetFileInputRef = useRef(null);
  const modelFileInputRef = useRef(null);
  const [datasetFile, setDatasetFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [modelType, setModelType] = useState('');
  const navigate = useNavigate();

  const [openError, setOpenError] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleError = () => {
    setOpenError(true);
    setTimeout(() => {
      setOpenError(false);
    }, 10000);
  };

  useEffect(() => {
    setDatasetName('');
    setModelName('');
    setTargetVariable('');
  }, [setDatasetName, setModelName, setTargetVariable]);

  const handleDatasetFileChange = (event) => {
    const file = event.target.files[0];
    setDatasetFile(file);
    const name = file.name.split('.')[0];
    console.log('Setting dataset name to:', name);
    setDatasetName(name); 
  };

  const handleModelFileChange = (event) => {
    setModelFile(event.target.files[0]);
    const name = event.target.files[0].name.split('.')[0];
    console.log('Setting model name to:', name);
    setModelName(name);
  };

  const handleUploadFiles = async () => {
    if (!datasetFile || !modelFile || !targetVariable || !modelType) {
      alert('Please select both files and specify the target variable and model type');
      return;
    }
  
    try {
      const formData = new FormData();
      formData.append('title', datasetFile.name.split('.')[0]);
      formData.append('file', datasetFile);
      formData.append('target', targetVariable);
      const fileType = datasetFile.type;
      formData.append('type', fileType.split('/')[1]);
  
      const options = {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        body: formData,
      };
  
      const datasetResponse = await fetch('http://localhost:8000/uploadDataset/', options);
      if (!datasetResponse.ok) {
        setErrorText('Error uploading the dataset. Please try again.');
        handleError();
      }
      const modelFormData = new FormData();
      const modelTitle = modelFile.name.split('.')[0];
  
      modelFormData.append('file', modelFile);
      modelFormData.append('type', modelType);
      modelFormData.append('title', modelTitle);
  
      const modelOptions = {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
        body: modelFormData,
      };
  
      const modelResponse = await fetch('http://localhost:8000/uploadModels/', modelOptions);

      if (!modelResponse.ok) {
        setErrorText('Error uploading the model. Please try again.');
        handleError();
      }

      navigate('/counterfactual');
  
    } catch (error) {
      console.error(error);
      setErrorText('Error uploading files. Please try again.');
      handleError();
    }
  };

  return (
    <>
      <AppHeader 
                  setTargetVariable={setTargetVariable}
                  targetVariable={targetVariable}
                  setDatasetName={setDatasetName}
                  datasetName={datasetName}
                  setModelName={setModelName}
                  modelName={modelName}
                />

      <Snackbar open={openError} autoHideDuration={10000} onClose={() => setOpenError(false)}>
        <Alert severity="error" variant="filled" onClose={() => setOpenError(false)}>
          <AlertTitle>Error</AlertTitle>
          {errorText}
        </Alert>
      </Snackbar>

      <Box sx={{ minHeight: 'calc(100vh)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: "#0B2230" }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 900, maxHeight: 700 }}>
          <Typography variant="h3" color='primary'>Upload Files</Typography>
          <Divider style={{ margin: '20px 0' }} />
          <Typography variant="h4">Dataset</Typography>
          <Grid container spacing={2} alignItems={'center'}>
            <Grid item xs={5}>
              <Button
                startIcon={<NoteAdd />}
                variant="contained"
                color="primary"
                onClick={() => datasetFileInputRef.current.click()}
                fullWidth
              >
                Add New Dataset
              </Button>
              <input
                type="file"
                accept=".csv,.xlsx"
                style={{ display: 'none' }}
                ref={datasetFileInputRef}
                onChange={handleDatasetFileChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5">
                {datasetFile ? `Selected dataset file: ${datasetFile.name}` : 'No dataset file selected'}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                value = {targetVariable}
                label="Target Variable"
                onChange={(e) => setTargetVariable(e.target.value)}
                fullWidth
              />
              <Divider style={{ margin: '20px 0' }} />
            </Grid>
          </Grid>
          <Typography variant="h4" gutterBottom>Model</Typography>
          <Grid container spacing={2} alignItems={'center'}>
            <Grid item xs={5}>
              <Button
                startIcon={<PostAdd />}
                variant="contained"
                color="primary"
                onClick={() => modelFileInputRef.current.click()}
                fullWidth
              >
                Add New Model
              </Button>
              <input
                type="file"
                accept=".h5,.pkl,.joblib"
                style={{ display: 'none' }}
                ref={modelFileInputRef}
                onChange={handleModelFileChange}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h5">
                {modelFile ? `Selected model file: ${modelFile.name}` : 'No model file selected'}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="model-type-label">Model Type</InputLabel>
                <Select
                  labelId="model-type-label"
                  value={modelType}
                  label="Model Type"
                  onChange={(e) => setModelType(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="sklearn">Scikit Learn</MenuItem>
                  <MenuItem value="TF2">Tensorflow 2.x</MenuItem>
                  <MenuItem value="TF1">Tensorflow 1.x</MenuItem>
                  <MenuItem value="PYT">Pytorch</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sx={{ textAlign: 'center', marginTop: '20px' }}>
              <Button 
                size='large'
                startIcon={<Upload />}
                variant="contained" 
                color="primary" 
                onClick={handleUploadFiles}
              >
                Upload Files
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </>
  );
};

export default UploadPage;

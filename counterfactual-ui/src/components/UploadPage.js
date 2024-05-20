import React, { useState, useRef } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const UploadPage = ({ setDatasetName, setModelName, setTargetVariable, targetVariable }) => {
  const datasetFileInputRef = useRef(null);
  const modelFileInputRef = useRef(null);
  const [datasetFile, setDatasetFile] = useState(null);
  const [modelFile, setModelFile] = useState(null);
  const [modelType, setModelType] = useState('');
  const navigate = useNavigate();

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
      const datasetData = await datasetResponse;
      console.log(datasetData);
  
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
      const modelData = await modelResponse;
      console.log(modelData);
      navigate('/app');
  
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ padding: 4, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 600 }}>
        <Typography variant="h4" gutterBottom>Upload Files</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => datasetFileInputRef.current.click()}
              fullWidth
            >
              Choose Dataset File
            </Button>
            <input
              type="file"
              accept=".csv,.xlsx"
              style={{ display: 'none' }}
              ref={datasetFileInputRef}
              onChange={handleDatasetFileChange}
            />
            <Typography variant="body2" sx={{ marginTop: 1, textAlign: 'center' }}>
              {datasetFile ? `Selected dataset file: ${datasetFile.name}` : 'No dataset file selected'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => modelFileInputRef.current.click()}
              fullWidth
            >
              Choose Model File
            </Button>
            <input
              type="file"
              accept=".h5,.pkl,.joblib"
              style={{ display: 'none' }}
              ref={modelFileInputRef}
              onChange={handleModelFileChange}
            />
            <Typography variant="body2" sx={{ marginTop: 1, textAlign: 'center' }}>
              {modelFile ? `Selected model file: ${modelFile.name}` : 'No model file selected'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="model-type-label">Model Type</InputLabel>
              <Select
                labelId="model-type-label"
                value={modelType}
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
          <Grid item xs={12}>
            <TextField
              label="Target Variable"
              onChange={(e) => setTargetVariable(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleUploadFiles}>
              Upload Files
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default UploadPage;

import React, { useState, useRef } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import counterfactuals from '../data/counterfactuals';

const AppHeader = ({ onSelectCounterfactual, onUploadFeatures, onToggleLock }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const fileInputRef = useRef(null);
  const [inputFeatures, setInputFeatures] = useState([]);
  const [showFeaturesForm, setShowFeaturesForm] = useState(false);
  const [targetVariable, setTargetVariable] = useState('');
  const [file, setFile] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

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

  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUploadDataset = () => {
    if (!file || !targetVariable) {
      alert('Please select a file and specify the target variable');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('target', targetVariable);

    fetch('http://localhost:8000/uploadDataset/', {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        // Handle the server response
        console.log(data);
        // Assuming data.features is an array of feature objects returned from the server
        setInputFeatures(data.features);
        onUploadFeatures(data.features);
        setShowFeaturesForm(true);
      })
      .catch(error => {
        // Handle any errors
        console.error(error);
      });

    handleMenuClose();
  };

  const renderInputFeaturesForm = () => {
    if (inputFeatures.length === 0) return null;

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
                <input
                  type={feature.type === 'numeric' ? 'number' : 'text'}
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
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <SettingsIcon />
          </IconButton>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
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
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          setShowUploadForm(true);
          handleMenuClose();
          setTimeout(() => {
            fileInputRef.current.click();
          }, 0);
        }}>
          Upload Dataset
        </MenuItem>
      </Menu>
      <input
        type="file"
        accept=".csv,.xlsx"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {showUploadForm && (
        <Box sx={{ padding: 2 }}>
          <Typography variant="h6" gutterBottom>Upload Dataset</Typography>
          <TextField
            label="Target Variable"
            value={targetVariable}
            onChange={(e) => setTargetVariable(e.target.value)}
            fullWidth
            sx={{ marginBottom: 2 }}
          />
          <Typography variant="body2" sx={{ marginTop: 2 }}>
            {file ? `Selected file: ${file.name}` : 'No file selected'}
          </Typography>
          <Button variant="contained" color="primary" onClick={handleUploadDataset} sx={{ marginTop: 2 }}>
            Upload Dataset
          </Button>
        </Box>
      )}
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

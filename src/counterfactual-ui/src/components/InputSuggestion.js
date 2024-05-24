import React, { useState } from 'react';
import { Grid, Alert, Snackbar } from '@mui/material/';

const InputFeatureSuggestion = () => {
  const [openSuccess, setOpenSuccess] = useState(true);
  const [openWarning, setOpenWarning] = useState(true);

  return (
    <Grid container style={{ minHeight: 'calc(100vh - 64px)', alignItems: 'flex-start', justifyContent: 'center', backgroundColor:'#0B2230' }}>
      <Grid item xs={12} style={{ alignItems: 'center' }}>
      <Snackbar 
          open={openSuccess} 
          autoHideDuration={4000} 
          onClose={() => setOpenSuccess(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert 
            severity="success" 
            style={{ margin: '20px', maxWidth: '700px' }}
            onClose={() => setOpenSuccess(false)}
          >
            Uploaded successfully!
          </Alert>
        </Snackbar>
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
      </Grid>
    </Grid>
  );
};

export default InputFeatureSuggestion;
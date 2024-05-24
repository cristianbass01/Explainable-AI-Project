import React from 'react';
import { Grid, Typography } from '@mui/material/';

const InputFeatureSuggestion = () => {
  return (
    <>
      <Grid container spacing={0} style={{ minHeight: 'calc(100vh - 64px)', alignItems: 'center' }}>
        <Grid item xs={12}>
          
          <Typography variant="h5" align="center" style={{ color: 'red', marginBottom: '10px' }}>
            GOOD JOB! Now it's time to input some features. You can use the menu on the left corner!
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};

export default InputFeatureSuggestion;
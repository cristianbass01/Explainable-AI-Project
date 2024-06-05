import React from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Divider, Box, Grid } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TooltipWrapper from './ToolTipWrapper';

const FeatureList = ({ features, title, onHideFeature, onLockToggle }) => {

  const getCounterfactualDescription = (originalValue, counterfactualValue) => {
    if (typeof originalValue !== 'string' || !originalValue.includes('(')){
      return `The counterfactual value is ${counterfactualValue}.`;
    }
    
    originalValue = originalValue.split('(')[1].split(')')[0];

    const counterfactualBinning = counterfactualValue.split('(')[0].toLowerCase();
    counterfactualValue = counterfactualValue.split('(')[1].split(')')[0];

    return `The counterfactual value ${counterfactualValue} is ${counterfactualBinning} than the original value ${originalValue}.`;
  }

  const getOriginalDescription = (originalValue) => {
    if (typeof originalValue !== 'string' || !originalValue.includes('(')){
      return `The original value is ${originalValue}.`;
    }

    const originalBinning = originalValue.split('(')[0].toLowerCase().replace('mid', 'medium');
    originalValue = originalValue.split('(')[1].split(')')[0];

    return `The original value ${originalValue} is considered "${originalBinning}" with respect to all the values in the dataset.`;
  }

  return (
    <div style={{ margin: '20px 0' }}>
      <Typography variant="h5"> {title}</Typography>
      <Box sx={{ overflowY: 'auto' }}>
        <List>
          {features.map((feature, index) => (
            <div key={index}>
              <ListItem>
                <TooltipWrapper description={`Make ${feature.title} ${feature.locked ? 'changeable' : 'not changeble'}.`}>
                  <IconButton onClick={() => onLockToggle(index)} edge="start">
                    {feature.locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                </TooltipWrapper>
                <TooltipWrapper description={`Hide ${feature.title} feature.`}>
                  <IconButton onClick={() => onHideFeature(index)} edge="start">
                    <VisibilityIcon />
                  </IconButton>
                </TooltipWrapper>
                <ListItemText
                  primary={
                    <Grid container alignItems="center">
                      <Grid item xs={5} marginLeft={'20px'}>
                        <Typography variant="h6">
                          {feature.title}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Box position="relative"  display="flex" alignItems="center">
                          <TooltipWrapper description={getOriginalDescription(feature.value)}>
                            <Typography variant="h6"  color='primary'>
                              {feature.value}
                            </Typography>
                          </TooltipWrapper>
                        </Box>
                      </Grid>
                      { feature.changed && (
                        <>
                          <Grid item sx={{ display: 'flex', justifyContent: 'center' }}>
                            <ArrowForwardIcon color='error'/>
                          </Grid>
                          <Grid item xs={3}>
                            <Box display= 'flex' justifyContent={'end'}>
                              <TooltipWrapper description={getCounterfactualDescription(feature.value, feature.counterfactual)}>
                                <Typography variant="h6" sx={{ color: 'red', textAlign: 'right' }}>
                                  {feature.counterfactual}
                                </Typography> 
                              </TooltipWrapper>
                            </Box>
                          </Grid>
                        </>
                      )
                    } 
                    </Grid>
                  }
                />
              </ListItem>
              {index < features.length - 1 && <Divider />}
            </div>
          ))}
        </List>
      </Box>
    </div>
  );
};

export default FeatureList;

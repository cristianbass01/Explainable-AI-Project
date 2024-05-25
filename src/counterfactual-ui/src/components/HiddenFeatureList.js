import React from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Divider, Box, Accordion, AccordionSummary, AccordionDetails, Grid } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning'; 
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HiddenFeatureList = ({ features, title, onShowFeature, onLockToggle }) => {
  const hasChangedFeature = features.some(feature => feature.changed);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant="h6" sx={{ fontSize: '30px' }}>
          {hasChangedFeature && <WarningIcon style={{ color: 'red', verticalAlign: 'middle', marginRight: '5px' }} />}
          {title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ overflowY: 'auto' }}>
          <List>
            {features.map((feature, index) => (
              <div key={index}>
                <ListItem>
                  <IconButton onClick={() => onLockToggle(index)} edge="start">
                    {feature.locked ? <LockIcon /> : <LockOpenIcon />}
                  </IconButton>
                  <IconButton onClick={() => onShowFeature(index)} edge="start">
                    <VisibilityIcon />
                  </IconButton>
                  <ListItemText
                    primary={
                      <Grid container alignItems="center">
                      <Grid item xs={5}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '26px' }}>
                          {feature.name.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                        </Typography>
                      </Grid>
                      <Grid item xs={3}>
                        <Typography variant="h6" sx={{ fontSize: '26px' }} color='primary'>
                          {feature.value}
                        </Typography>
                      </Grid>
                      { feature.changed && (
                        <>
                        <Grid item sx={{ display: 'flex', justifyContent: 'center' }}>
                          <ArrowForwardIcon color='error'/>
                        </Grid>
                        <Grid item xs={3}>
                          <Typography variant="h6" sx={{ color: 'red', fontSize: '26px',  textAlign: 'right' }}>
                            {feature.counterfactual}
                          </Typography> 
                        </Grid>
                        </>
                      )
                    } 
                    </Grid>
                    }
                    primaryTypographyProps={{ style: { fontWeight: 'bold', fontSize: '26px' } }}
                  />
                </ListItem>
                {index < features.length - 1 && <Divider />}
              </div>
            ))}
          </List>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default HiddenFeatureList;

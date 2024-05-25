import React from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Divider, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningIcon from '@mui/icons-material/Warning'; 

const HiddenFeatureList = ({ features, title, onShowFeature, onLockToggle }) => {
  const hasChangedFeature = features.some(feature => feature.changed);

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant="h6">
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
                    primary={feature.name}
                    secondary={
                      feature.changed ? (
                        <Box component="span">
                          <span>{feature.value}</span>
                          <span style={{ color: 'red' }}> → {feature.counterfactual}</span>
                        </Box>
                      ) : (
                        feature.value
                      )
                    }
                    primaryTypographyProps={{ style: { fontWeight: 'bold' } }}
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

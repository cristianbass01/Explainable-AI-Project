import React from 'react';
import { List, ListItem, ListItemText, IconButton, Typography, Divider, Box } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const FeatureList = ({ features, title, onHideFeature, onLockToggle }) => {
  return (
    <div style={{ margin: '20px 0' }}>
      <Typography variant="h6">{title}</Typography>
      <Box sx={{ overflowY: 'auto' }}>
        <List>
          {features.map((feature, index) => (
            <div key={index}>
              <ListItem>
                <IconButton onClick={() => onLockToggle(index)} edge="start">
                  {feature.locked ? <LockIcon /> : <LockOpenIcon />}
                </IconButton>
                <IconButton onClick={() => onHideFeature(index)} edge="start">
                  <VisibilityOffIcon />
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
    </div>
  );
};

export default FeatureList;

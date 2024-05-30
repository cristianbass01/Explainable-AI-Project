import React, { useRef } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';

const TooltipWrapper = ({ description, children }) => {
  const positionRef = useRef({
    x: 0,
    y: 0,
  });
  const popperRef = useRef(null);
  const areaRef = useRef(null);

  const handleMouseMove = (event) => {
    positionRef.current = { x: event.clientX, y: event.clientY };

    if (popperRef.current != null) {
      popperRef.current.update();
    }
  };

  return (
    <Tooltip 
      title={
      <Typography variant="h6" color='white'>
          {description}
      </Typography>
      }
      placement='top-start'
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
      arrow
      PopperProps={{
      popperRef,
      anchorEl: {
          getBoundingClientRect: () => {
          return new DOMRect(
              positionRef.current.x,
              areaRef.current.getBoundingClientRect().y,
              0,
              0,
          );
          },
      },
      }}
    >
      <Box
        ref={areaRef}
        onMouseMove={handleMouseMove}
        
        >
        {children}
      </Box>
    </Tooltip>
  );
};

export default TooltipWrapper;
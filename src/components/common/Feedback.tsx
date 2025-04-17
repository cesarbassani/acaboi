// src/components/common/Feedback.tsx
import React from 'react';
import { Snackbar, Alert, AlertProps } from '@mui/material';

interface FeedbackProps {
  open: boolean;
  message: string;
  severity: AlertProps['severity'];
  onClose: () => void;
}

const Feedback: React.FC<FeedbackProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Feedback;
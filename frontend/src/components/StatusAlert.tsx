import React from 'react';
import { Alert, AlertProps } from '@mui/material';

interface StatusAlertProps extends Omit<AlertProps, 'severity'> {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({
  type,
  message,
  onClose,
  sx,
  ...props
}) => {
  if (!message) return null;

  return (
    <Alert
      severity={type}
      onClose={onClose}
      sx={{ mb: 3, ...sx }}
      {...props}
    >
      {message}
    </Alert>
  );
};

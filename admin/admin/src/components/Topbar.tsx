import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, Avatar } from '@mui/material';

const Topbar: React.FC = () => {
  // TODO: Lấy thông tin admin từ context hoặc API
  const admin = { name: 'Admin', email: 'admin@example.com' };
  return (
    <AppBar position="static" color="inherit" elevation={1} sx={{ zIndex: 1201 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" color="primary">Smart Study Admin</Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar>{admin.name[0]}</Avatar>
          <Box>
            <Typography variant="subtitle1">{admin.name}</Typography>
            <Typography variant="caption" color="text.secondary">{admin.email}</Typography>
          </Box>
          <Button color="error" variant="outlined">Logout</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default Topbar; 
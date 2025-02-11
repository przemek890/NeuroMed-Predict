import React from 'react';
import { Box, Typography } from '@mui/material';

interface HeaderProps {
  logo: string;
}

const Header: React.FC<HeaderProps> = ({ logo }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0, justifyContent: 'center', mt: -2 }}>
    <img
      src={logo}
      alt="Logo"
      style={{ width: '60px', height: '60px', marginRight: '8px', objectFit: 'cover' }}
    />
    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
      MEDICAL GPT
    </Typography>
  </Box>
);

export default Header;

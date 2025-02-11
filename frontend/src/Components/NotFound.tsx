import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '160px',
            fontWeight: 800,
            mb: 2,
            color: theme.palette.text.primary
          }}
        >
          404
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: theme.palette.text.primary
          }}
        ></Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: '400px',
            mb: 4,
            color: theme.palette.text.secondary
          }}
        >
          {t('pageNotFoundMessage')}
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/')}
          sx={{
            px: 4,
            py: 1.5,
            backgroundColor: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark
            }
          }}
        >
          {t('backToHome')}
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
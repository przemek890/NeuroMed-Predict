import React from 'react';
import { Box, Typography, Grid, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const Main: React.FC = () => {
    const theme = useTheme();
    const darkMode: boolean = theme.palette.mode === 'dark';
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '30px',
                textAlign: 'center',
                backgroundColor: darkMode ? '#1f1f23' : '#f5f5f5',
                color: darkMode ? '#ffffff' : '#000000',
                minHeight: '100vh',
                marginTop: '-30px',
            }}
        >
            <div style={{ paddingTop: '32px' }} />
            <Typography
                variant="h2"
                gutterBottom
                style={{
                    fontWeight: 'bold',
                    color: darkMode ? '#ffffff' : '#3f51b5',
                    textAlign: 'center',
                    marginBottom: '32px',
                }}
            >
                {t('welcomeTitle')}
            </Typography>

            <Typography
                variant="h6"
                gutterBottom
                style={{
                    marginBottom: '40px',
                    color: darkMode ? '#ffffff' : '#000000',
                }}
            >
                {t('welcomeText')}
            </Typography>

            <Grid container spacing={4} justifyContent="center" alignItems="center">
                <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Link to="/heartdisease" style={{ textDecoration: 'none' }}>
                        <img
                            src="/img/2.jpg"
                            alt={t('heartDiseasePrediction')}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                border: darkMode ? '2px solid #ffffff' : ' 2px solid #BBBBBB',
                            }}
                        />
                        <Typography
                            variant="h6"
                            style={{ marginTop: '20px', color: darkMode ? '#ffffff' : '#000000', textAlign: 'center' }}
                        >
                            {t('heartDiseasePrediction')}
                        </Typography>
                    </Link>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/heartdisease"
                        style={{ marginTop: '10px' }}
                    >
                        {t('learnMore')}
                    </Button>
                </Grid>

                <Grid item xs={12} md={5} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Link to="/diabetes" style={{ textDecoration: 'none' }}>
                        <img
                            src="/img/1.jpg"
                            alt={t('diabetesPrediction')}
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                border: darkMode ? '2px solid #ffffff' : ' 2px solid #BBBBBB',
                            }}
                        />
                        <Typography
                            variant="h6"
                            style={{ marginTop: '20px', color: darkMode ? '#ffffff' : '#000000', textAlign: 'center' }}
                        >
                            {t('diabetesPrediction')}
                        </Typography>
                    </Link>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/diabetes"
                        style={{ marginTop: '10px' }}
                    >
                        {t('learnMore')}
                    </Button>
                </Grid>
            </Grid>

            <Box sx={{ margin: '40px', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    {t('startExploring')}
                </Typography>
                <Button
                    data-testid="about-us-button"
                    variant="outlined"
                    color="secondary"
                    component={Link}
                    to="/info"
                    sx={{
                        color: darkMode ? '#ffffff' : '#000000',
                        borderColor: darkMode ? '#ffffff' : '#000000',
                    }}
                >
                    {t('aboutUs')}
                </Button>
            </Box>
        </Box>
    );
};

export default Main;

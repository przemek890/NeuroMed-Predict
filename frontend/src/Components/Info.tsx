import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, Grid, Paper, Container, IconButton, CircularProgress } from '@mui/material';
import { Tooltip as MuiTooltip, TooltipProps as MuiTooltipProps } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import formatMessageContent from '../Utils/formatMessageContent';

interface PredictionData {
  precision: number[];
  recall: number[];
  accuracy: number;
  loss: number;
  train_samples: number;
  val_samples: number;
  test_samples: number;
}

interface Data {
  Heartdisease_prediction: PredictionData | string;
  Diabetes_prediction: PredictionData | string;
}

interface CustomTooltipProps extends MuiTooltipProps {
  interactive?: boolean;
}

const Tooltip: React.FC<CustomTooltipProps> = (props) => {
  return <MuiTooltip {...props} />;
};

const Info = (): JSX.Element => {
  const { t } = useTranslation();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState({
    models: false,
    dataProcessing: false,
    imageGeneratedByAI: false,
    experimental: false,
  });
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    // @ts-ignore
    const domain = window.REACT_APP_DOMAIN;
    fetch(`${domain}:5000/api/get_data`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: Data) => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        setError(true);
        setLoading(false);
      });
  }, []);

  const handleTooltipOpen = (section: 'models' | 'dataProcessing' | 'experimental' | 'imageGeneratedByAI'): void => {
    setTooltipOpen(prev => ({
      ...prev,
      [section]: true,
    }));
  };

  const handleTooltipClose = (section: 'models' | 'dataProcessing' | 'experimental' | 'imageGeneratedByAI'): void => {
    setTooltipOpen(prev => ({
      ...prev,
      [section]: false,
    }));
  };

  const renderModelDetails = (modelName: string, predictionData: PredictionData | string): JSX.Element => (
    <Paper elevation={3} sx={{ padding: 3, margin: '16px auto', width: '100%' }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>{modelName}</Typography>
      {typeof predictionData === "object" ? (
        <>
          <Typography data-testid="precision">
            <b>{t('precision')}:</b> {predictionData.precision.map((value, index) => `${index === 0 ? t('well') : t('sick')}: ${value}`).join(', ')}
          </Typography>
          <Typography data-testid="recall">
            <b>{t('recall')}:</b> {predictionData.recall.map((value, index) => `${index === 0 ? t('well') : t('sick')}: ${value}`).join(', ')}
          </Typography>
          <Typography data-testid="accuracy">
            <b>{t('accuracy')}:</b> {predictionData.accuracy}
          </Typography>
          <Typography data-testid="loss">
            <b>{t('loss')}:</b> {predictionData.loss}
          </Typography>
          <Typography data-testid="train-samples">
            <b>{t('trainSamples')}:</b> {predictionData.train_samples}
          </Typography>
          <Typography data-testid="val-samples">
            <b>{t('valSamples')}:</b> {predictionData.val_samples}
          </Typography>
          <Typography data-testid="test-samples">
            <b>{t('testSamples')}:</b> {predictionData.test_samples}
          </Typography>
        </>
      ) : (
        <Typography color="textSecondary">{t('noData')}</Typography>
      )}
    </Paper>
  );

  // @ts-ignore
  return (
    <Container maxWidth="lg">
      <Box p={4}>
        <Box display="flex" flexDirection="row" alignItems="center" mb={2} justifyContent="flex-start">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {t('modelsInfo')}
          </Typography>
          <Tooltip
            title={t('tooltipModels')}
            placement={isMobile ? "bottom" : "right"}
            arrow
            interactive
            open={tooltipOpen.models}
            onClose={() => handleTooltipClose('models')}
            disableHoverListener
          >
            <IconButton
              size="small"
              sx={{ marginTop: '-4px', marginLeft: '8px' }}
              onTouchStart={() => handleTooltipOpen('models')}
              onTouchEnd={() => handleTooltipClose('models')}
              onClick={() => handleTooltipOpen('models')}
            >
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 4 }} />

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" fontWeight="bold">{t('failedToLoadData')}</Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6}>
              {renderModelDetails(t('heartDisease'), data?.Heartdisease_prediction)}
            </Grid>
            <Grid item xs={12} sm={6}>
              {renderModelDetails(t('diabetes'), data?.Diabetes_prediction)}
            </Grid>
          </Grid>
        )}

        <Divider sx={{ my: 6 }} />

        <Paper elevation={3} sx={{ padding: 3, margin: '16px auto', width: '100%' }}>
          <Box display="flex" flexDirection="row" alignItems="center" mb={2} justifyContent="flex-start">
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t('dataProcessingInfo')}
            </Typography>
            <Tooltip
              title={t('tooltipDataProcessing')}
              placement={isMobile ? "bottom" : "right"}
              arrow
              interactive={true}
              open={tooltipOpen.dataProcessing}
              onClose={() => handleTooltipClose('dataProcessing')}
              disableHoverListener
            >
              <IconButton
                size="small"
                sx={{ marginTop: '-4px', marginLeft: '8px' }}
                onTouchStart={() => handleTooltipOpen('dataProcessing')}
                onTouchEnd={() => handleTooltipClose('dataProcessing')}
                onClick={() => handleTooltipOpen('dataProcessing')}
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography>{t('dataProcessingDescription')}</Typography>
          <Typography
            dangerouslySetInnerHTML={{
              __html: formatMessageContent(t('dataProcessingAdmin'),"#773baf")
            }}
          />
          <Typography>{t('dataProcessingUsage')}</Typography>
        </Paper>

        <Divider sx={{ my: 6 }} />

        <Paper elevation={3} sx={{ padding: 3, margin: '16px auto', width: '100%' }}>
          <Box display="inline-flex" alignItems="center" gap={0.5}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t('imageDisclaimerTitle')}
            </Typography>
            <Tooltip
              title={t('tooltipImageGeneratedByAI')}
              placement="right"
              arrow
              interactive={true}
              open={tooltipOpen.imageGeneratedByAI}
              onClose={() => handleTooltipClose('imageGeneratedByAI')}
              disableHoverListener
            >
              <IconButton
                size="small"
                sx={{ padding: 0, marginLeft: '4px' }}
                onTouchStart={() => handleTooltipOpen('imageGeneratedByAI')}
                onTouchEnd={() => handleTooltipClose('imageGeneratedByAI')}
                onClick={() => handleTooltipOpen('imageGeneratedByAI')}
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Typography>
            {t('imageDisclaimer')}
          </Typography>

          <ul style={{ marginTop: '16px', paddingLeft: '20px', color: '#773baf' }}>
              <li>
                <a
                  href="https://www.istockphoto.com/pl/zdj%C4%99cie/doros%C5%82y-m%C4%99%C5%BCczyzna-z-zawa%C5%82em-serca-lub-chorob%C4%85-zgagi%C4%85-serca-gm700262796-129677181"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iStock/stevanovicigor
                </a>
              </li>
              <li style={{ marginTop: '8px' }}>
                <a
                  href="https://www.istockphoto.com/pl/zdj%C4%99cie/zoom-lekarza-cukrzycy-lub-starszej-kobiety-r%C4%99ce-z-badania-krwi-cukru-lub-badania-gm1445321341-483765088?searchscope=image%2Cfilm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  iStock/PeopleImages
                </a>
              </li>
            </ul>

          <Typography mt={3}>
            {t('imageGeneratedByAI')}
          </Typography>
        </Paper>

        <Divider sx={{ my: 6 }} />

        <Paper elevation={3} sx={{ padding: 3, margin: '16px auto', width: '100%' }}>
          <Box display="flex" flexDirection="row" alignItems="center" mb={2} justifyContent="flex-start">
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {t('experimentalInfo')}
            </Typography>
            <Tooltip
              title={t('tooltipExperimental')}
              placement={isMobile ? "bottom" : "right"}
              arrow
              interactive
              open={tooltipOpen.experimental}
              onClose={() => handleTooltipClose('experimental')}
              disableHoverListener
            >
              <IconButton
                size="small"
                sx={{ marginTop: '-4px', marginLeft: '8px' }}
                onTouchStart={() => handleTooltipOpen('experimental')}
                onTouchEnd={() => handleTooltipClose('experimental')}
                onClick={() => handleTooltipOpen('experimental')}
              >
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography>{t('experimentalModelDescription')}</Typography>
          <Typography>{t('experimentalModelDataProcessing')}</Typography>

            <Typography variant="h6" fontWeight="bold" mt={3}>
              {t('promptToActionInfoTitle')}
            </Typography>
            <Typography>
              1. {t('changeThemeAction')}
            </Typography>
            <Typography>
              2. {t('changeLanguageAction')}
            </Typography>
            <Typography>
              3. {t('searchMedicalFacilityAction')}
            </Typography>

          <Typography mt={3}>
          {t('legalDocumentation')}{' '}
            <a href="https://console.groq.com/docs/legal" target="_blank" rel="noopener noreferrer" style={{ color: '#773baf' }}>
              {t('legalDocumentationLink')}
            </a>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Info;
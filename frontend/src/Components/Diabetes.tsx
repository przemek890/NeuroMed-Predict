import React, {ChangeEvent, FormEvent, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { OutlinedInput, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Divider, IconButton, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/system';
import useMediaQuery from "@mui/material/useMediaQuery";

const redAsteriskStyle = {
  '& .MuiFormLabel-asterisk': {
    color: 'red',
  },
};

const StyledTextField = styled(TextField)(redAsteriskStyle);
const StyledFormControl = styled(FormControl)(redAsteriskStyle);

interface FormValues {
  age: string;
  sex: string;
  highChol: string;
  cholCheck: string;
  bmi: string;
  smoker: string;
  heartDiseaseorAttack: string;
  physActivity: string;
  fruits: string;
  veggies: string;
  hvyAlcoholConsump: string;
  genHlth: string;
  mentHlth: string;
  physHlth: string;
  diffWalk: string;
  stroke: string;
  highBP: string;
}

interface ServerResponse {
  status: string;
  "P(A)": string;
  "~P(A)": string;
}

const Diabetes: React.FC  = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ServerResponse | null>(null);
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleTooltipToggle = (tooltipName: string | null) => () => {
    setTooltipOpen(tooltipOpen === tooltipName ? null : tooltipName);
  };

  const [values, setValues] = useState<FormValues>({
        age: '',
        sex: '',
        highChol: '',
        cholCheck: '',
        bmi: '',
        smoker: '',
        heartDiseaseorAttack: '',
        physActivity: '',
        fruits: '',
        veggies: '',
        hvyAlcoholConsump: '',
        genHlth: '',
        mentHlth: '',
        physHlth: '',
        diffWalk: '',
        stroke: '',
        highBP: '',
    });

  const handleChange = (event: ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    if (name) {
      setValues({
        ...values,
        [name]: value as string,
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
        // @ts-ignore
        const domain = window.REACT_APP_DOMAIN;
        const response = await fetch(`${domain}:5000/api/create_2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (error: any) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  const tooltips: Record<keyof FormValues, string> = {
    age: t('tooltip_age'),
    sex: t('tooltip_sex'),
    highChol: t('tooltip_highChol'),
    cholCheck: t('tooltip_cholCheck'),
    bmi: t('tooltip_bmi'),
    smoker: t('tooltip_smoker'),
    heartDiseaseorAttack: t('tooltip_heartDiseaseorAttack'),
    physActivity: t('tooltip_physActivity'),
    fruits: t('tooltip_fruits'),
    veggies: t('tooltip_veggies'),
    hvyAlcoholConsump: t('tooltip_hvyAlcoholConsump'),
    genHlth: t('tooltip_genHlth'),
    mentHlth: t('tooltip_mentHlth'),
    physHlth: t('tooltip_physHlth'),
    diffWalk: t('tooltip_diffWalk'),
    stroke: t('tooltip_stroke'),
    highBP: t('tooltip_highBP'),
  };

    return (
        <div>
            <div style={{ paddingTop: '64px' }}/>
            <h1 style={{ textAlign: "center", marginTop: "-30px" }}>{t('diabetes').toUpperCase()}</h1>
            <form onSubmit={handleSubmit}>
                <Box width={1 / 2} mx="auto">
                    {Object.keys(values).map((key) => (
                        <Box display="flex" alignItems="center" mb={2} key={key}>
                            {key === 'age' || key === 'bmi' || key === 'mentHlth' || key === 'physHlth' ? (
                            <StyledTextField
                            fullWidth
                            required
                            {...(!isMobile && { type: "number" })}
                            inputMode="numeric"
                            label={t(key)}
                            name={key}
                            value={values[key]}
                            onChange={handleChange as any}
                            inputProps={{ 
                              min: key === 'age' ? 18 : key === 'bmi' ? 12 : 0,
                              max: key === 'age' ? 120 : key === 'bmi' ? 96 : 30,
                              step: key === 'bmi' ? 0.01 : 1 
                            }}
                          />
                            ) : key === 'sex' ? (
                                <StyledFormControl fullWidth required>
                                    <InputLabel id={`${key}-label`}>
                                        {t('sex')}
                                    </InputLabel>
                                    <Select
                                        labelId={`${key}-label`}
                                        name={key}
                                        value={values[key]}
                                        onChange={handleChange as any}
                                        input={<OutlinedInput label={t('sex')} />}
                                    >
                                        <MenuItem value="1.0">{t('male')}</MenuItem>
                                        <MenuItem value="0.0">{t('female')}</MenuItem>
                                    </Select>
                                </StyledFormControl>
                            ) : key === 'genHlth' ? (
                                <StyledFormControl fullWidth required>
                                    <InputLabel id={`${key}-label`}>
                                        {t('genHlth')}
                                    </InputLabel>
                                    <Select
                                        labelId={`${key}-label`}
                                        name={key}
                                        value={values[key]}
                                        onChange={handleChange as any}
                                        input={<OutlinedInput label={t('genHlth')} />}
                                    >
                                        <MenuItem value="1">{t('excellent')}</MenuItem>
                                        <MenuItem value="2">{t('veryGood')}</MenuItem>
                                        <MenuItem value="3">{t('good')}</MenuItem>
                                        <MenuItem value="4">{t('fair')}</MenuItem>
                                        <MenuItem value="5">{t('poor')}</MenuItem>
                                    </Select>
                                </StyledFormControl>
                            ) : (
                                <StyledFormControl fullWidth required>
                                    <InputLabel id={`${key}-label`}>
                                        {t(key)}
                                    </InputLabel>
                                    <Select
                                        labelId={`${key}-label`}
                                        name={key}
                                        value={values[key]}
                                        onChange={handleChange as any}
                                        input={<OutlinedInput label={t(key)} />}
                                    >
                                        <MenuItem value="1.0">{t('yes')}</MenuItem>
                                        <Divider />
                                        <MenuItem value="0.0">{t('no')}</MenuItem>
                                    </Select>
                                </StyledFormControl>
                            )}
                            <Tooltip
                                title={tooltips[key]}
                                placement="top"
                                open={tooltipOpen === key}
                                onClose={handleTooltipToggle(null)}
                                arrow
                            >
                                <IconButton onClick={handleTooltipToggle(key)}>
                                    <HelpOutlineIcon />
                                </IconButton>
                            </Tooltip>
                            <Box height={16} />
                        </Box>
                    ))}
                    <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '16px' }}>
                        {t('submit')}
                    </Button>
                </Box>
            </form>
              <Box display="flex" justifyContent="center" style={{ marginBottom: '30px' }}>
                {data && data.status !== "ERROR" ? (
                  <div>
                    <TableContainer style={{
                      width: '100%',
                      maxWidth: '600px',
                      overflow: 'hidden',
                    }}>
                      <Table sx={{
                        width: '100%',
                        tableLayout: 'auto',
                      }}>
                        <TableHead>
                          <TableRow>
                            <TableCell></TableCell>
                            <TableCell>{t('diabetes')}</TableCell>
                            <TableCell>{t('probability')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <TableCell>1</TableCell>
                            <TableCell>{t('yes')}</TableCell>
                            <TableCell>{data["P(A)"]}%</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>2</TableCell>
                            <TableCell>{t('no')}</TableCell>
                            <TableCell>{data["~P(A)"]}%</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box height={16} />
                  </div>
                ) : data && data.status === "ERROR" ? (
                  <p style={{ textAlign: "left", fontSize: "9px" }}>{t('errorMessage')}</p>
                ) : null}
              </Box>
        </div>
    );
};

export default Diabetes;
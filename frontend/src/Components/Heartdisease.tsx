import React, {ChangeEvent, useState} from 'react';
import { OutlinedInput, TextField, FormControl, InputLabel, Select, MenuItem, Button, Box, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Divider, IconButton, Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { styled } from '@mui/system';
import { useTranslation } from 'react-i18next';
import useMediaQuery from "@mui/material/useMediaQuery";

const redAsteriskStyle = {
    '& .MuiFormLabel-asterisk': {
        color: 'red',
    },
};

const StyledTextField = styled(TextField)(redAsteriskStyle);
const StyledFormControl = styled(FormControl)(redAsteriskStyle);

interface Values {
  highBP: string;
  highChol: string;
  cholCheck: string;
  bmi: string;
  smoker: string;
  stroke: string;
  diabetes: string;
  physActivity: string;
  fruits: string;
  veggies: string;
  hvyAlcoholConsump: string;
  anyHealthcare: string;
  noDocbcCost: string;
  genHlth: string;
  mentHlth: string;
  physHlth: string;
  diffWalk: string;
  sex: string;
  age: string;
  education: string;
  income: string;
}

const Heartdisease = () => {
    const [data, setData] = useState<Record<string, any> | null>(null);
    const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);
    const isMobile = useMediaQuery('(max-width:600px)');
    const { t } = useTranslation();

    const [values, setValues] = useState<Values>({
        highBP: '',
        highChol: '',
        cholCheck: '',
        bmi: '',
        smoker: '',
        stroke: '',
        diabetes: '',
        physActivity: '',
        fruits: '',
        veggies: '',
        hvyAlcoholConsump: '',
        anyHealthcare: '',
        noDocbcCost: '',
        genHlth: '',
        mentHlth: '',
        physHlth: '',
        diffWalk: '',
        sex: '',
        age: '',
        education: '',
        income: '',
    });

    const handleChange = (event: ChangeEvent<{ name: string; value: unknown }>) => {
        const { name, value } = event.target;
        setValues({
          ...values,
          [name]: value as string,
        });
    };

    const handleTooltipToggle = (tooltipName: string) => () => {
        setTooltipOpen(tooltipOpen === tooltipName ? null : tooltipName);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // @ts-ignore
            const domain = window.REACT_APP_DOMAIN;
            const response = await fetch(`${domain}:5000/api/create_1`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(values)
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

  const tooltips: Record<keyof Values, string> = {
        highBP: t('tooltip_highBP'),
        highChol: t('tooltip_highChol'),
        cholCheck: t('tooltip_cholCheck'),
        bmi: t('tooltip_bmi'),
        smoker: t('tooltip_smoker'),
        stroke: t('tooltip_stroke'),
        diabetes: t('tooltip_diabetes'),
        physActivity: t('tooltip_physActivity'),
        fruits: t('tooltip_fruits'),
        veggies: t('tooltip_veggies'),
        hvyAlcoholConsump: t('tooltip_hvyAlcoholConsump'),
        anyHealthcare: t('tooltip_anyHealthcare'),
        noDocbcCost: t('tooltip_noDocbcCost'),
        genHlth: t('tooltip_genHlth'),
        mentHlth: t('tooltip_mentHlth'),
        physHlth: t('tooltip_physHlth'),
        diffWalk: t('tooltip_diffWalk'),
        sex: t('tooltip_sex'),
        age: t('tooltip_age'),
        education: t('tooltip_education'),
        income: t('tooltip_income')
    };

    return (
        <div>
            <div style={{ paddingTop: '64px' }}/>
            <h1 style={{ textAlign: 'center', marginTop: '-30px' }}>{t('heartDisease').toUpperCase()}</h1>
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
                                    onChange={handleChange}
                                    inputProps={{ 
                                        min: key === 'age' ? 18 : key === 'bmi' ? 12 : 0,
                                        max: key === 'age' ? 120 : key === 'bmi' ? 96 : 30,
                                        step: key === 'bmi' ? 0.01 : 1 
                                      }}
                                />
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
                                        {key === 'sex' ? (
                                            [
                                                <MenuItem key="male" value="1">{t('male')}</MenuItem>,
                                                <Divider key="divider1" />,
                                                <MenuItem key="female" value="0">{t('female')}</MenuItem>
                                            ]
                                        ) : key === 'diabetes' ? (
                                            [
                                                <MenuItem key="noDiabetes" value="0">{t('noDiabetes')}</MenuItem>,
                                                <Divider key="divider2" />,
                                                <MenuItem key="preDiabetes" value="1">{t('preDiabetes')}</MenuItem>,
                                                <Divider key="divider3" />,
                                                <MenuItem key="diabetes" value="2">{t('diabetes')}</MenuItem>
                                            ]
                                        ) : key === 'education' ? (
                                            [
                                                <MenuItem key="noEducation" value="1">{t('noEducation')}</MenuItem>,
                                                <MenuItem key="elementary" value="2">{t('elementary')}</MenuItem>,
                                                <MenuItem key="highSchool" value="3">{t('highSchool')}</MenuItem>,
                                                <MenuItem key="someCollege" value="4">{t('someCollege')}</MenuItem>,
                                                <MenuItem key="collegeGraduate" value="5">{t('collegeGraduate')}</MenuItem>
                                            ]
                                        ) : key === 'genHlth' ? (
                                            [
                                              <MenuItem key="excellent" value="1">{t('excellent')}</MenuItem>,
                                              <MenuItem key="veryGood" value="2">{t('veryGood')}</MenuItem>,
                                              <MenuItem key="good" value="3">{t('good')}</MenuItem>,
                                              <MenuItem key="fair" value="4">{t('fair')}</MenuItem>,
                                              <MenuItem key="poor" value="5">{t('poor')}</MenuItem>
                                            ]
                                          ) : key === 'income' ? (
                                            [
                                                <MenuItem key="lessThan10k" value="1">{t('lessThan10k')}</MenuItem>,
                                                <MenuItem key="10kTo15k" value="2">{t('10kTo15k')}</MenuItem>,
                                                <MenuItem key="15kTo20k" value="3">{t('15kTo20k')}</MenuItem>,
                                                <MenuItem key="20kTo25k" value="4">{t('20kTo25k')}</MenuItem>,
                                                <MenuItem key="25kTo35k" value="5">{t('25kTo35k')}</MenuItem>,
                                                <MenuItem key="35kTo50k" value="6">{t('35kTo50k')}</MenuItem>,
                                                <MenuItem key="50kTo75k" value="7">{t('50kTo75k')}</MenuItem>,
                                                <MenuItem key="moreThan75k" value="8">{t('moreThan75k')}</MenuItem>
                                            ]
                                        ) : (
                                            [
                                                <MenuItem key="yes" value="1.0">{t('yes')}</MenuItem>,
                                                <Divider key="divider4" />,
                                                <MenuItem key="no" value="0.0">{t('no')}</MenuItem>
                                            ]
                                        )}
                                    </Select>
                                </StyledFormControl>
                            )}
                            <Tooltip
                                title={tooltips[key]}
                                placement="top"
                                open={tooltipOpen === key}
                                onClose={handleTooltipToggle(null)}
                                leaveDelay={3000}
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
            <Box height={32} />
              <Box display="flex" justifyContent="center" style={{ marginBottom: '30px' }}>
                {data && data.status !== "ERROR" ? (
                  <div>
                    <TableContainer style={{
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden',
                    }}>
                      <Table sx={{
                        width: '100%',
                        tableLayout: 'auto',
                      }}>
                        <TableHead>
                          <TableRow>
                            <TableCell></TableCell>
                            <TableCell>{t('heartDisease')}</TableCell>
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

export default Heartdisease;
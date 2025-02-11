import React, { useState, MouseEvent, useEffect  } from 'react';
import { createTheme, ThemeProvider, Fab } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import Button from "@mui/material/Button";
import Switch from '@mui/material/Switch';
import { FaSun, FaMoon, FaBook, FaInfoCircle, FaVirus } from 'react-icons/fa';
import { AppBar, Stack, Toolbar, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';
import Flag from 'react-world-flags';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import Main from "./Components/Main";
import Heartdisease from "./Components/Heartdisease";
import Diabetes from "./Components/Diabetes";
import NotebookDiabetes from "./Components/NotebookDiabetes";
import NotebookHeartdisease from "./Components/NotebookHeartdisease";
import Info from "./Components/Info";
import GPT from "./Components/GPT/GPT";
import NotFound from "./Components/NotFound";

const App = () => {
    const [darkMode, setDarkMode] = useState<boolean>(false);
    const [anchorElNotebooks, setAnchorElNotebooks] = useState<null | HTMLElement>(null);
    const [anchorElPathologies, setAnchorElPathologies] = useState<null | HTMLElement>(null);
    const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [anchorElLanguage, setAnchorElLanguage] = useState<null | HTMLElement>(null);
    const { i18n, t } = useTranslation();

    const isMobile = useMediaQuery('(max-width:600px)');

    const handleThemeChange = (isDark: boolean): void => {
        setDarkMode(isDark);
    };

    const handleLanguageChange = (lang: string): void => {
        i18n.changeLanguage(lang);
    };

    const [sessionToken, setSessionToken] = useState<string | null>(null);

      useEffect(() => {
        const initializeSession = async () => {
          try {
             const domain = process.env.REACT_APP_DOMAIN;
             const response = await fetch(`${domain}:5000/api/session`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              }
            });
      
            if (!response.ok) {
              throw new Error('Failed to initialize session');
            }
      
            const data = await response.json();
            setSessionToken(data.token);
            console.log('Session initialized successfully');
          } catch (err) {
            console.error('Session initialization error:', err);
          }
        };
      
        initializeSession();

      }, []);

    const theme = createTheme({
        palette: {
            primary: {
                main: darkMode ? '#ffffff' : '#000000',
            },
            mode: darkMode ? 'dark' : 'light',
            background: {
                default: darkMode ? '#1f1f23' : '#eaeaea',
            },
        },
    });

    const handleNotebooksClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElNotebooks(event.currentTarget);
    };

    const handleNotebooksClose = (): void => {
        setAnchorElNotebooks(null);
    };

    const handlePathologiesClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElPathologies(event.currentTarget);
    };

    const handlePathologiesClose = (): void => {
        setAnchorElPathologies(null);
    };

    const handleMobileMenuClick = (event: MouseEvent<HTMLElement>): void => {
        setMobileMenuAnchorEl(event.currentTarget);
    };

    const handleMobileMenuClose = (): void => {
        setMobileMenuAnchorEl(null);
    };

    const handleDarkModeToggle = (): void => {
        setDarkMode(!darkMode);
    };

    const handleLanguageClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElLanguage(event.currentTarget);
    };

    const handleLanguageClose = (lang?: string): void => {
        if (lang) {
            i18n.changeLanguage(lang);
        }
        setAnchorElLanguage(null);
    };

    return (
        <Router>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <AppBar position="static">
                    <Toolbar style={{ backgroundColor: '#000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            <Link component={RouterLink} to="/" underline="none" color="inherit">
                                {t('medicalPrediction')}
                            </Link>
                        </Typography>
                        {isMobile ? (
                            <Stack direction="row" alignItems="center">
                                <IconButton color="inherit" onClick={handleMobileMenuClick}>
                                    <FaVirus />
                                </IconButton>
                                <Menu
                                    anchorEl={mobileMenuAnchorEl}
                                    open={Boolean(mobileMenuAnchorEl)}
                                    onClose={handleMobileMenuClose}
                                >
                                    <MenuItem onClick={handleMobileMenuClose}>
                                        <Link component={RouterLink} to="/heartdisease" underline="none" color="inherit">
                                            {t('heartDisease')}
                                        </Link>
                                    </MenuItem>
                                    <MenuItem onClick={handleMobileMenuClose}>
                                        <Link component={RouterLink} to="/diabetes" underline="none" color="inherit">
                                            {t('diabetes')}
                                        </Link>
                                    </MenuItem>
                                </Menu>
                                <IconButton color="inherit" onClick={handleNotebooksClick}>
                                    <FaBook />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorElNotebooks}
                                    open={Boolean(anchorElNotebooks)}
                                    onClose={handleNotebooksClose}
                                >
                                    <MenuItem onClick={handleNotebooksClose}>
                                        <Link component={RouterLink} to="/notebook-heartdisease" underline="none" color="inherit">
                                            {t('notebookHeartDisease')}
                                        </Link>
                                    </MenuItem>
                                    <MenuItem onClick={handleNotebooksClose}>
                                        <Link component={RouterLink} to="/notebook-diabetes" underline="none" color="inherit">
                                            {t('notebookDiabetes')}
                                        </Link>
                                    </MenuItem>
                                </Menu>
                                <IconButton color="inherit">
                                    <Link component={RouterLink} to="/info" underline="none" color="inherit">
                                        <FaInfoCircle style={{ transform: 'translateY(3px)' }} />
                                    </Link>
                                </IconButton>
                                <IconButton
                                  aria-label="dark-mode-toggle"
                                  color="inherit"
                                  onClick={handleDarkModeToggle}
                                >
                                  {darkMode ? <FaSun /> : <FaMoon />}
                                </IconButton>
                            </Stack>
                        ) : (
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Button color="inherit" onClick={handlePathologiesClick}>{t('pathologies')}</Button>
                                <Menu
                                    id="pathologies-menu"
                                    anchorEl={anchorElPathologies}
                                    keepMounted
                                    open={Boolean(anchorElPathologies)}
                                    onClose={handlePathologiesClose}
                                >
                                    <MenuItem onClick={handlePathologiesClose}>
                                        <Link component={RouterLink} to="/heartdisease" underline="none" color="inherit">
                                            {t('heartDisease')}
                                        </Link>
                                    </MenuItem>
                                    <MenuItem onClick={handlePathologiesClose}>
                                        <Link component={RouterLink} to="/diabetes" underline="none" color="inherit">
                                            {t('diabetes')}
                                        </Link>
                                    </MenuItem>
                                </Menu>
                                <Button color="inherit" onClick={handleNotebooksClick}>{t('notebooks')}</Button>
                                <Menu
                                    id="notebooks-menu"
                                    anchorEl={anchorElNotebooks}
                                    keepMounted
                                    open={Boolean(anchorElNotebooks)}
                                    onClose={handleNotebooksClose}
                                >
                                    <MenuItem onClick={handleNotebooksClose}>
                                        <Link component={RouterLink} to="/notebook-heartdisease" underline="none" color="inherit">
                                            {t('notebookHeartDisease')}
                                        </Link>
                                    </MenuItem>
                                    <MenuItem onClick={handleNotebooksClose}>
                                        <Link component={RouterLink} to="/notebook-diabetes" underline="none" color="inherit">
                                            {t('notebookDiabetes')}
                                        </Link>
                                    </MenuItem>
                                </Menu>
                                <Button color="inherit">
                                    <Link component={RouterLink} to="/info" underline="none" color="inherit">
                                        {t('info')}
                                    </Link>
                                </Button>
                                <IconButton color="inherit" onClick={handleDarkModeToggle}>
                                    <Switch
                                        checked={darkMode}
                                        onChange={handleDarkModeToggle}
                                        icon={<FaMoon />}
                                        checkedIcon={<FaSun />}
                                        sx={{
                                            transform: 'scale(0.85)',
                                            position: 'relative',
                                            top: '-1px'
                                        }}
                                    />
                                </IconButton>
                            </Stack>
                        )}
                    </Toolbar>
                </AppBar>
                <Fab
                    color="primary"
                    aria-label="language"
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 1000,
                    }}
                    onClick={handleLanguageClick}
                >
                    <LanguageIcon />
                </Fab>
                <Menu
                    id="language-menu"
                    anchorEl={anchorElLanguage}
                    keepMounted
                    open={Boolean(anchorElLanguage)}
                    onClose={() => handleLanguageClose()}
                >
                    <MenuItem onClick={() => handleLanguageClose('en')}>
                        <Flag code="US" height="16" width="24" style={{ marginRight: 8 }} />
                        {t('English')}
                    </MenuItem>
                    <MenuItem onClick={() => handleLanguageClose('pl')}>
                        <Flag code="PL" height="16" width="24" style={{ marginRight: 8 }} />
                        {t('Polish')}
                    </MenuItem>
                </Menu>

                <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/heartdisease" element={<Heartdisease />} />
                    <Route path="/diabetes" element={<Diabetes />} />
                    <Route path="/notebook-heartdisease" element={<NotebookHeartdisease />} />
                    <Route path="/notebook-diabetes" element={<NotebookDiabetes />} />
                    <Route path="/info" element={<Info />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
                <GPT
                    onThemeChange={handleThemeChange}
                    onLanguageChange={handleLanguageChange}
                    sessionToken={sessionToken}
                    setSessionToken={setSessionToken}
                />
            </ThemeProvider>
        </Router>
    );
};

export default App;

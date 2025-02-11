import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, Typography, Paper, Menu, MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

interface InputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: () => void;
  handleReset: () => void;
  openFileDialog: () => void;
  getRootProps: () => any;
  getInputProps: () => any;
  fileName: string;
  fileUploaded: boolean;
  handleRemoveFile: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({
  inputText,
  setInputText,
  handleSendMessage,
  handleReset,
  openFileDialog,
  getRootProps,
  getInputProps,
  fileName,
  fileUploaded,
  handleRemoveFile
}) => {
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [submenuAnchorEl, setSubmenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMenu, setCurrentMenu] = useState<string | null>(null);
  const textFieldRef = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const inputAreaRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (anchorEl) {
        updateMenuPosition(textFieldRef.current);
      }
      if (submenuAnchorEl) {
        updateSubmenuPosition(textFieldRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [anchorEl, submenuAnchorEl]);

  const updateMenuPosition = (textFieldElement: HTMLElement | null) => {
    if (!textFieldElement) return;

    const rect = textFieldElement.getBoundingClientRect();
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    const topPosition = Math.min(
      -10,
      -(viewportHeight - rect.top - 10)
    );

    setMenuPosition({
      top: topPosition,
      left: 0
    });
  };

  const updateSubmenuPosition = (textFieldElement: HTMLElement | null) => {
    if (!textFieldElement) return;

    const rect = textFieldElement.getBoundingClientRect();
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    const topPosition = Math.min(
      -40,
      -(viewportHeight - rect.top - 40)
    );

    setSubmenuPosition({
      top: topPosition,
      left: 0
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    setInputText(value);

    const atSymbolIndex = value.lastIndexOf('@');
    if (atSymbolIndex !== -1 && cursorPosition === atSymbolIndex + 1) {
      setAnchorEl(textFieldRef.current);
      updateMenuPosition(textFieldRef.current);
    } else {
      setAnchorEl(null);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSubmenuAnchorEl(null);
  };

  const handleMenuClick = (menuType: string) => {
    setCurrentMenu(menuType);
    setSubmenuAnchorEl(textFieldRef.current);
    setAnchorEl(null);
    updateSubmenuPosition(textFieldRef.current);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmenuSelect = (option = 'light') => {
    let newInputText = '@';

    if (currentMenu === 'theme') {
      newInputText += `${t('change_theme_to')} ${option === 'light' ? t('light') : t('dark')}`;
    } else if (currentMenu === 'language') {
      newInputText += `${t('change_language_to')} ${option === 'pl' ? t('polish') : t('english')}`;
    }

    setInputText(newInputText);
    handleClose();
  };

  const menuStyles = {
    '& .MuiPaper-root': {
      width: 'auto',
      minWidth: '140px',
      position: 'fixed',
      maxHeight: '200px',
      marginTop: '37px',
      marginLeft: '10px',
    }
  };

  return (
    <Box
      ref={inputAreaRef}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        position: 'relative',
        width: '100%'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1, marginTop: '-15px' }}>
        <IconButton onClick={handleReset} color="secondary" sx={{ alignSelf: 'flex-start', ml: '-15px' }}>
          <RestartAltIcon />
        </IconButton>
        <IconButton onClick={openFileDialog} sx={{ alignSelf: 'flex-start', ml: '-15px' }}>
          <AttachFileIcon />
        </IconButton>
      </Box>

      {fileUploaded && (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 10px',
            backgroundColor: theme.palette.background.default,
            borderRadius: 1,
            position: 'relative',
            marginTop: '10px',
            marginLeft: '-10px',
            marginRight: '10px',
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <InsertDriveFileIcon sx={{ marginRight: '6px', color: theme.palette.primary.main }} />
          <Typography variant="caption" sx={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fileName}
          </Typography>
          <IconButton
            onClick={handleRemoveFile}
            size="small"
            sx={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              color: theme.palette.error.main,
              padding: '0px',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}

      <Box {...getRootProps()} sx={{ flexGrow: 1, position: 'relative' }}>
        <TextField
          ref={textFieldRef}
          fullWidth
          multiline
          variant="outlined"
          value={inputText}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={t('type_message')}
          sx={{ pr: 4 }}
        />
        <Box sx={{ position: 'absolute', right: '-16px', bottom: 8 }}>
          <IconButton onClick={handleSendMessage} color="primary">
            <SendIcon />
          </IconButton>
        </Box>
        <input {...getInputProps()} style={{ display: 'none' }} />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          sx={menuStyles}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: '2px',
                width: '5px',
                height: '5px',
                backgroundColor: theme.palette.error.main,
                color: theme.palette.common.white,
                borderRadius: '50%',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
              }}
            >
              <CloseIcon fontSize="inherit" style={{ fontSize: '0.75rem' }} />
            </IconButton>
            <MenuItem onClick={() => handleMenuClick('theme')}>
              {t('change_theme_to')}
            </MenuItem>
            <MenuItem onClick={() => handleMenuClick('language')}>
              {t('change_language_to')}
            </MenuItem>
          </Box>
        </Menu>

        <Menu
          anchorEl={submenuAnchorEl}
          open={Boolean(submenuAnchorEl)}
          onClose={handleClose}
          sx={menuStyles}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: '2px',
                width: '5px',
                height: '5px',
                backgroundColor: theme.palette.error.main,
                color: theme.palette.common.white,
                borderRadius: '50%',
                zIndex: 1,
                '&:hover': {
                  backgroundColor: theme.palette.error.dark,
                },
              }}
            >
              <CloseIcon fontSize="inherit" style={{ fontSize: '0.75rem' }} />

            </IconButton>
            {currentMenu === 'theme' && (
              <>
                <MenuItem onClick={() => handleSubmenuSelect('light')}>
                  {t('light')}
                </MenuItem>
                <MenuItem onClick={() => handleSubmenuSelect('dark')}>
                  {t('dark')}
                </MenuItem>
              </>
            )}
            {currentMenu === 'language' && (
              <>
                <MenuItem onClick={() => handleSubmenuSelect('pl')}>
                  {t('polish')}
                </MenuItem>
                <MenuItem onClick={() => handleSubmenuSelect('en')}>
                  {t('english')}
                </MenuItem>
              </>
            )}
          </Box>
        </Menu>

      </Box>
    </Box>
  );
};

export default InputArea;

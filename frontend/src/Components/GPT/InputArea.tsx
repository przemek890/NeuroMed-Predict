import React, { useRef, useState } from 'react';
import { Box, TextField, IconButton, Typography, Paper, CircularProgress, Menu, MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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
  isGenerating?: boolean;
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
  handleRemoveFile,
  isGenerating = false
}) => {
  const textFieldRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();
  const inputAreaRef = useRef(null);
  const [atPrefixEnabled, setAtPrefixEnabled] = useState(false);
  const [dollarPrefixEnabled, setDollarPrefixEnabled] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const setCursorPosition = (element: HTMLTextAreaElement | HTMLInputElement, position: number) => {
    setTimeout(() => {
      if (element && element.setSelectionRange) {
        element.focus();
        element.setSelectionRange(position, position);
      } else if (element) {
        element.focus();
      }
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (dollarPrefixEnabled && !value.startsWith('$')) {
      if (value === '' || !value.startsWith('$')) {
        value = '$';
      }
    }

    if (atPrefixEnabled && !value.startsWith('@')) {
      if (value === '' || !value.startsWith('@')) {
        value = '@';
      }
    }

    const hasAtPrefix = value.startsWith('@');
    const hasDollarPrefix = value.startsWith('$');

    setAtPrefixEnabled(hasAtPrefix);
    setDollarPrefixEnabled(hasDollarPrefix);

    setInputText(value);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && !isGenerating) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      const input = event.target as HTMLTextAreaElement | HTMLInputElement;
      const cursorPosition = input.selectionStart;

      if ((dollarPrefixEnabled && cursorPosition === 1 && inputText.startsWith('$')) ||
          (atPrefixEnabled && cursorPosition === 1 && inputText.startsWith('@'))) {
        event.preventDefault();
      }
    }
  };

  const toggleAtPrefix = () => {
    if (dollarPrefixEnabled) {
      setDollarPrefixEnabled(false);
      setAtPrefixEnabled(true);
      if (inputText.startsWith('$')) {
        setInputText(`@${inputText.slice(1)}`);
      } else {
        setInputText(`@${inputText}`);
      }
    } else {
      setAtPrefixEnabled((prev) => !prev);
      if (!atPrefixEnabled) {
        setInputText(`@${inputText.replace(/^@/, '')}`);
      } else {
        setInputText(inputText.replace(/^@/, ''));
      }
    }

    if (textFieldRef.current) {
      setCursorPosition(textFieldRef.current, 1);
    }
  };

  const toggleDollarPrefix = (event: React.MouseEvent<HTMLElement>) => {
    if (atPrefixEnabled) {
      setAtPrefixEnabled(false);
      setInputText(inputText.replace(/^@/, ''));
    }

    if (!dollarPrefixEnabled) {
      setDollarPrefixEnabled(true);
      setInputText(`$${inputText.replace(/^[$@]/, '')}`);
      setAnchorEl(event.currentTarget);
      
      setTimeout(() => {
        if (textFieldRef.current) {
          setCursorPosition(textFieldRef.current, 1);
        }
      }, 0);
    } else {
      setDollarPrefixEnabled(false);
      setInputText(inputText.replace(/^$/, ''));
    }
  };

  const handleMenuItemClick = (command: string) => {
    const newText = `$${command}`;
    setInputText(newText);
    setAnchorEl(null);

    if (textFieldRef.current) {
      setCursorPosition(textFieldRef.current, newText.length);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
        <IconButton 
          onClick={handleReset} 
          color="secondary" 
          sx={{ alignSelf: 'flex-start', ml: '-15px' }}
          disabled={isGenerating}
        >
          <RestartAltIcon />
        </IconButton>
        <IconButton 
          onClick={openFileDialog} 
          sx={{ alignSelf: 'flex-start', ml: '-15px' }}
          disabled={isGenerating}
        >
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
            opacity: isGenerating ? 0.7 : 1,
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
            disabled={isGenerating}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      )}

      <Box {...getRootProps()} sx={{ flexGrow: 1, position: 'relative' }}>
        <TextField
          inputRef={textFieldRef}
          fullWidth
          multiline
          variant="outlined"
          value={inputText}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onKeyDown={handleKeyDown}
          placeholder={t('type_message')}
          sx={{ pr: 4 }}
          disabled={isGenerating}
        />
        <Box sx={{ position: 'absolute', right: '-16px', bottom: 8, display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={toggleAtPrefix} 
            color={atPrefixEnabled ? "primary" : "default"}
            disabled={isGenerating}
            title="Add @ prefix"
          >
            <AlternateEmailIcon />
          </IconButton>
          <IconButton 
            onClick={toggleDollarPrefix} 
            color={dollarPrefixEnabled ? "primary" : "default"}
            disabled={isGenerating}
            title="System commands"
          >
            <AttachMoneyIcon />
          </IconButton>
          {isGenerating ? (
            <IconButton color="primary" disabled>
              <CircularProgress size={24} color="primary" />
            </IconButton>
          ) : (
            <IconButton 
              onClick={handleSendMessage} 
              color="primary"
              disabled={inputText.trim() === '' && !fileUploaded}
            >
              <SendIcon />
            </IconButton>
          )}
        </Box>
        <input {...getInputProps()} style={{ display: 'none' }} />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleMenuItemClick('Switch to dark theme')}>
          🌙 Switch to dark theme
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Switch to light theme')}>
          ☀️ Switch to light theme
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Change language to Polish')}>
          🇵🇱 Change language to Polish
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Change language to English')}>
          🇺🇸 Change language to English
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick('Find a doctor in ')}>
          👨‍⚕️ Find a doctor
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default InputArea;

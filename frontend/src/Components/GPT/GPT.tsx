import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Drawer, Box, Typography, Snackbar } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslation } from 'react-i18next';

// @ts-ignore
import logoLight from '../../img/logo_1.png';
// @ts-ignore
import logoDark from '../../img/logo_2.png';

import DrawerToggle from './DrawerToggle';
import MessageList from './MessageList';
import InputArea from './InputArea';
import Header from "./Header";
import WelcomeMessage from './WelcomeMessage';

interface GPTProps {
  onThemeChange: (isDark: boolean) => void;
  onLanguageChange: (langCode: string) => void;
  sessionToken: string;
  setSessionToken: (sessionToken: string) => void;
}

interface ConversationMessage {
  type: 'user' | 'bot';
  content: string;
  alert?: boolean;
  task?: boolean;
}

const GPT: React.FC<GPTProps> = ({ onThemeChange, onLanguageChange, sessionToken, setSessionToken }) => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const [fileUploaded, setFileUploaded] = useState<boolean>(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:600px)');

  const handleSystemIntent = (intentResponse: string) => {
    try {
      const intent = JSON.parse(intentResponse);

      if (intent.has_intent && intent.confidence >= 0.5) {
        switch (intent.intent_type) {
          case 'theme_change':
            if (intent.intent_value === 'dark' || intent.intent_value === 'light') {
              onThemeChange(intent.intent_value === 'dark');
            }
            break;
          case 'language_change':
            if (intent.intent_value === 'english' || intent.intent_value === 'polish') {
              const langCode = intent.intent_value === 'english' ? 'en' : 'pl';
              onLanguageChange(langCode);
              i18n.changeLanguage(langCode);
            }
            break;
          case 'doctor_contact':
            const searchDoctors = async () => {
              try {
                // @ts-ignore
                const domain = window.REACT_APP_DOMAIN;
                const response = await fetch(`${domain}:5000/api/search`, {
                  method: 'POST',
                  headers: {
                  'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                  street: intent.search_details?.street ?? null,
                  city: intent.search_details?.city ?? null,
                  medical_field: intent.search_details?.medical_field ?? null
                  }),
                });
                const data = await response.json();
                
                if (data.count === 0 || !data.data.length) {
                  setConversation(prev => [...prev, {
                    type: 'bot',
                    content: `***${t('found')} 0 ${t('doctors')}***`,
                    task: true
                  }]);
                  return;
                }

                const formattedData = data.data.map((doctor: any) => (
                  `***${doctor.name}***\n` +
                  `${t('address')}: ${doctor.street} ${doctor.building}, ${doctor.postal_code} ${doctor.city}\n` +
                  `${t('phone')}: ${doctor.phone}\n` +
                  `${t('email')}: ${doctor.email}\n` +
                  `${t('specialization')}: ${doctor.medical_field}\n`
                )).join('\n');
                
                const message = `***${t('found')} ${data.count} ${t('doctors')}:***\n\n${formattedData}`;
                setConversation(prev => [...prev, {
                  type: 'bot',
                  content: message,
                  task: true
                }]);
              } catch (error) {
                setConversation(prev => [...prev, {
                  type: 'bot',
                  content: t('doctor_search_failed'),
                  alert: true
                }]);
              }
            };
            searchDoctors();
            return; 
          default:
            setConversation(prev => [...prev, {
              type: 'bot',
              content: t('system_command_executed', { command: intent.intent_type }),
              task: true
            }]);
        }
        if (intent.intent_type !== 'doctor_contact') {
          setConversation(prev => [...prev, {
            type: 'bot',
            content: t('system_command_executed', { command: intent.intent_type }),
            task: true
          }]);
        }
      } else {
        setConversation(prev => [...prev, {
          type: 'bot',
          content: t('unrecognized_system_command'),
          alert: true
        }]);
      }
    } catch (error) {
      console.error(t('intent_parse_error'), error);
      setConversation(prev => [...prev, {
        type: 'bot',
        content: t('unrecognized_system_command'),
        alert: true
      }]);
    }
  };

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleRemoveFile = useCallback(() => {
    setFileName('');
    setFileContent('');
    setFileUploaded(false);
    console.log(t('file_removed'));
  }, [t]);

  const handleSendMessage = () => {
    if (inputText.trim() !== '' || fileName) {
      const userMessage = fileName
        ? `${inputText.trim()}\n\n[${t('uploaded_file')}: ${fileName}]`
        : inputText.trim();

      setConversation(prev => [...prev, { type: 'user', content: userMessage }]);

      if (inputText.trim().startsWith('@')) {
        fetchSystemIntent(inputText.trim());
      } else {
        fetchFromServer(inputText.trim(), fileName, fileContent);
      }

      setInputText('');
      setFileName('');
      setFileContent('');
      setFileUploaded(false);
    }
  };

  const fetchSystemIntent = async (message: string) => {
    try {
      // @ts-ignore
      const domain = window.REACT_APP_DOMAIN;
      const response = await fetch(`${domain}:5000/api/askGPT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          message: message,
          isSystemCommand: true,
        }),
      });

      if (response.status === 200) {
        const result = await response.text();
        if (result.includes("***ERROR***:")) {
          const errorMessage = result.split("***ERROR***:")[1].trim();
          setConversation(prev => [...prev, {
            type: 'bot',
            content: errorMessage,
            alert: true
          }]);
        } else {
          handleSystemIntent(result);
        }
      } else {
        throw new Error(t('system_command_failed'));
      }
    } catch (error) {
      console.error(t('system_command_error'), error);
      setConversation(prev => [...prev, {
        type: 'bot',
        content: t('system_command_failed'),
        alert: true
      }]);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error(t('failed_to_copy'), err);
      });
  };

  const handleReset = useCallback(() => {
    setConversation([]);
    setInputText('');
    setFileName('');
    setFileContent('');
    setFileUploaded(false);
  
    const resetSession = async () => {
      try {
      // @ts-ignore
      const domain = window.REACT_APP_DOMAIN;
        const response = await fetch(`${domain}:5000/api/session`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to reset session');
        }
  
        const data = await response.json();
        setSessionToken(data.token);
      } catch (err) {
        console.error('Session reset error:', err);
      }
    };
    resetSession();
  
    console.log('Conversation reset');
  }, [setSessionToken]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();

    reader.onabort = () => console.log(t('file_reading_aborted'));
    reader.onerror = () => console.log(t('file_reading_failed'));
    reader.onload = () => {
      const content = reader.result;
      setFileName(file.name);
      setFileContent(content as string);
      setFileUploaded(true);
    };

    if (file.type.match(/text|csv|json|xml|html|excel|spreadsheet|plain/)) {
      reader.readAsText(file);
    } else {
      alert(t('upload_valid_file'));
    }
  }, [t]);

  const { getRootProps, getInputProps, open: openFileDialog } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'text/html': ['.html'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
    },
  });

  const fetchFromServer = async (prompt: string, fileName: string, fileContent: string) => {
    try {
      // @ts-ignore
      const domain = window.REACT_APP_DOMAIN;
      const response = await fetch(`${domain}:5000/api/askGPT`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          message: prompt,
          fileName: fileName,
          fileContent: fileContent,
        }),
      });

      if (response.status === 429) {
        const errorData = await response.json();
        const errorMessage = t('rate_limit_exceeded', { retry_after: errorData.retry_after });
        setConversation(prev => [...prev, {
          type: 'bot',
          content: errorMessage,
          alert: true
        }]);
        return;
      }

      if (response.status === 401) {
        const errorData = await response.json();
        if (errorData.message === "Invalid or expired token") {
          setSessionToken('');
        setConversation(prev => [...prev, {
        type: 'bot',
        content: t('invalid_or_expired_token'),
        alert: true
          }]);
          return;
        }
      }

      if (!response || !response.body) {
        const errorMessage = t('errorMessage');
        setConversation(prev => [...prev, {
          type: 'bot',
          content: errorMessage,
          alert: true
        }]);
        return;
      }


      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let botMessage = '';
      const botMessagePlaceholder = { type: 'bot', content: '' };
      setConversation((prev: any) => [...prev, botMessagePlaceholder]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        botMessage += chunk;

        const containsError = botMessage.includes("***ERROR***:");
        setConversation(prev => {
          const updatedConversation = [...prev];
          if (containsError) {
            const errorMessage = botMessage.split("***ERROR***:")[1].trim();
            updatedConversation[updatedConversation.length - 1] = {
              type: 'bot',
              content: errorMessage,
              alert: true
            };
          } else {
            updatedConversation[updatedConversation.length - 1] = {
              type: 'bot',
              content: botMessage,
              alert: botMessage.includes("***ERROR***")
            };
          }
          return updatedConversation;
        });

        if (containsError) break;
      }
    } catch (error) {
      console.error(t('error_fetching_data'), error);
      const errorMessage = {
        type: 'bot',
        content: t('failed_to_fetch_data'),
        alert: true
      };
      setConversation((prev: any) => [...prev, errorMessage]);
    }
  };
  useEffect(() => {
    const scrollTimeout = setTimeout(() => {
      if (conversationEndRef.current) {
        conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 10);

    return () => clearTimeout(scrollTimeout);
  }, [conversation]);

  return (
    <>
      <WelcomeMessage setConversation={setConversation}/>
      <DrawerToggle open={open} toggleDrawer={toggleDrawer} isMobile={isMobile} />
      <Drawer
        anchor="left"
        open={open}
        onClose={toggleDrawer}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : '600px',
            borderTopRightRadius: '20px',
            borderBottomRightRadius: '20px',
            backgroundColor: theme.palette.background.default,
            color: theme.palette.primary.main,
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ padding: '15px', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Header logo={theme.palette.mode === 'dark' ? logoDark : logoLight} />
          <MessageList
            conversation={conversation}
            conversationEndRef={conversationEndRef}
            handleCopyCode={handleCopyCode}
          />
          <InputArea
            inputText={inputText}
            setInputText={setInputText}
            handleSendMessage={handleSendMessage}
            handleReset={handleReset}
            openFileDialog={openFileDialog}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            fileName={fileName}
            fileUploaded={fileUploaded}
            handleRemoveFile={handleRemoveFile}
          />
          <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
            {t('medical_gpt_disclaimer')}
          </Typography>
        </Box>
      </Drawer>
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={t('code_copied_to_clipboard')}
      />
    </>
  );
};

export default GPT;

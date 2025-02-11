import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Message {
  type: 'bot' | 'user';
  content: string;
}

interface WelcomeMessageProps {
  setConversation: React.Dispatch<React.SetStateAction<Message[]>>;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ setConversation }) => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const welcomeMessage: Message = {
      type: 'bot',
      content: t('welcome_message'),
    };
    setConversation((prev) => {
      if (prev.length === 0) {
        return [welcomeMessage];
      } else if (prev[0].type === 'bot') {
        return [{ ...prev[0], content: t('welcome_message') }, ...prev.slice(1)];
      }
      return prev;
    });
  }, [setConversation, t, i18n.language]);

  return null;
};

export default WelcomeMessage;

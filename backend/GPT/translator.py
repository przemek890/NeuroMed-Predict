from deep_translator import GoogleTranslator
from langdetect import detect
from typing import Tuple, Optional

def translate_message(message: str) -> Tuple[Optional[str], str]:
    """
    Translates a given message to English if it's in a different language and
    detects the original language.

    :param message: The input message to detect and translate.
    :return: A tuple containing:
        - The detected original language as a string (e.g., 'en', 'fr', 'es'),
          or None if detection fails.
        - The translated message in English, or an error message if translation fails.
    """
    try:
        original_language: str = detect(message)

        if original_language != 'en':
            translated_message: str = GoogleTranslator(source='auto', target='en').translate(message)
        else:
            translated_message: str = message

        return original_language, translated_message

    except Exception as e:
        return None, "***ERROR***: Translation error"

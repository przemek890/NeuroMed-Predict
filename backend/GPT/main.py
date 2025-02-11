from typing import Generator, Optional, Union, Any
import groq
from pymongo import collection
from .chat_handler import ask_gpt, ask_gpt_for_intent
from .similiarity import QueryValidator
from .translator import translate_message

def handle_message(
    message: str,
    file_name: Optional[str],
    file_content: Optional[str],
    client: groq.Client, 
    session_id: str,
    collectionGPT: collection.Collection,
    flags: Optional[dict[str, Union[str, bool]]] = None
) -> Generator[str, None, None]:
    """
    Handles an incoming message, processes it, and yields the appropriate responses.

    :param message: The incoming user message to be processed.
    :param file_name: The name of the file to include in the context, if provided.
    :param file_content: The content of the file to include in the context, if provided.
    :param client: The GPT client instance used to process the message.
    :param session_id: The unique identifier for the current session, used to manage conversation context.
    :param collectionGPT: A MongoDB collection object for storing and retrieving session data.
    :param flags: Optional flags to modify behavior or enable specific features. Defaults to None.
    :return: A generator that yields chunks of responses as strings.
    """
    try:
        original_language: str
        translated_message: str

        original_language, translated_message = translate_message(message)

        if "***ERROR***: Translation error" in translated_message:
            yield translated_message
            return

        if QueryValidator.is_query_allowed(translated_message):
            yield "***ERROR***: Illegal query"
            return

        if translated_message.startswith('@'):
            message_content: str = translated_message[1:].strip()
            json_response: str = ask_gpt_for_intent(message_content, client, flags)
            yield json_response
        else:
            for chunk in ask_gpt(
                translated_message,
                original_language,
                client,
                collectionGPT,
                session_id,
                file_name,
                file_content,
                flags
            ):
                yield chunk

    except Exception as e:
        yield f"***ERROR***: processing message: {str(e)}"

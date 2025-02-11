import json
import os
from typing import Generator, Optional
import groq
from immutables import Map
from jsonschema import ValidationError, validate
from pymongo import collection
from .jsonSchemaValidation import INTENT_SCHEMA
from .prompts import MedicalPrompter

def ask_gpt_for_intent(
    message_content: str, 
    client: groq.Client, 
    flags: Map = Map()
) -> str:
    """
    Sends a message to GPT for intent detection and returns the result.

    :param message_content: The content of the user's message.
    :param client: The Groq client instance for sending requests.
    :param flags: Optional flags to determine additional rules.
    :return: A JSON-formatted string containing the detected intent or an error message.
    """

    flags = flags or Map()
    system_message: str = "SYSTEM RULES:\n"

    rule_types: dict[str, str] = {
        "id": "intent_detection",
    }

    def balance_braces(content: str) -> str:
        """
        Balances unmatched opening braces by appending missing closing braces
        and removes all content before the first opening brace.

        Args:
            content (str): The input string potentially containing unbalanced braces.

        Returns:
            str: The processed string with balanced braces and trimmed content.
        """
        brace_index = content.find('{')
        if brace_index != -1:
            content = content[brace_index:]

        open_braces = content.count('{')
        close_braces = content.count('}')

        if open_braces > close_braces:
            content += '}' * (open_braces - close_braces)

        return content

    for flag, rule_type in rule_types.items():
        if flags.get(flag, True):
            system_message += MedicalPrompter.get_rules(rule_type)

    user_message: str = MedicalPrompter.get_user_message(message_content)
    model: str = os.getenv("GROQ_GPT_MODEL", "llama-3.3-70b-versatile")

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.0,
            max_tokens=150,
            top_p=0.1,
            stop="}",
            stream=False
        )
        response_content: str = balance_braces(completion.choices[0].message.content)

        response_json: dict = json.loads(response_content)

        validate(instance=response_json, schema=INTENT_SCHEMA)

        return response_content

    except ValidationError as ve:
        return f'{{"***ERROR***": "Invalid response format: {str(ve)}"}}'

    except groq.RateLimitError:
        return '{"***ERROR***": "Rate limit exceeded"}'

    except Exception as e:
        return f'{{"***ERROR***": "Unable to process intent: {str(e)}"}}'


def ask_gpt(
    message: str, 
    original_language: str, 
    client: groq.Client, 
    collectionGPT: collection.Collection,
    session_id: str,
    file_name: Optional[str] = None, 
    file_content: Optional[str] = None,
    flags: Map = Map()
) -> Generator[str, None, None]:
    """
    Sends a message to GPT and yields responses.

    :param message: The user's message to process.
    :param original_language: The language of the original message.
    :param client: The Groq client instance for sending requests.
    :param file_name: Optional file name to include in the request context.
    :param file_content: Optional file content to include in the request context.
    :param flags: Optional flags to modify behavior or apply specific rules.
    :return: A generator yielding strings as responses.
    """

    flags = flags or Map()

    rule_types: dict[str, str] = {
        "gp": "general_principles",
        "sr": "security_rules",
        "cr": "coding_rules",
    }

    system_message: str = "***SYSTEM RULES***\n"
    for flag, rule_type in rule_types.items():
        if flags.get(flag, True):
            system_message += MedicalPrompter.get_rules(rule_type)

    system_message += "***PREVIOUS CONVERSATION HISTORY***:\n"
    system_message += MedicalPrompter.get_latest_records(collectionGPT, session_id)

    user_message: str = (
        "***USER MESSAGE***:\n"
        + MedicalPrompter.get_user_message(message, original_language)
        + MedicalPrompter.get_file_content(file_name, file_content)
    )
    
    model: str = os.getenv("GROQ_GPT_MODEL", "llama-3.3-70b-versatile")

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.3,
            max_tokens=8000,
            top_p=0.5,
            stream=True,
            stop=None
        )
        for chunk in completion:
            yield chunk.choices[0].delta.content or ""

    except groq.RateLimitError:
        yield "***ERROR***: Rate limit exceeded. Please try again later."
    except Exception as e:
        yield f"***ERROR***: Unable to process request: {str(e)}"



def summarize_user_and_bot(user_message: str, bot_message: str, client: groq.Client) -> str:
    """
    Generates a brief summary of a user message and bot response in one or two sentences.

    :param user_message: The user's message.
    :param bot_message: The bot's response.
    :param client: Groq client instance.
    :return: A concise summary of the interaction.
    """
    try:
        model: str = os.getenv("GROQ_GPT_MODEL", "llama-3.3-70b-versatile")

        prompt = MedicalPrompter.get_summary_prompt(user_message,bot_message)

        completion = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=300,
            top_p=0.1,
            stream=False,
            stop=None
        )

        return completion.choices[0].message.content.strip()

    except Exception as e:
        return f"***ERROR***: {str(e)}"
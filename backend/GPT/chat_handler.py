import json
import os
from typing import Generator, Optional
import groq
from immutables import Map
from jsonschema import ValidationError, validate
from pymongo import collection
from .jsonSchemaValidation import INTENT_SCHEMA
from .prompts import MedicalPrompter
import requests
from bs4 import BeautifulSoup

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


def gpt_search(query: str, client, original_language, flags: dict = None,):
    flags = flags or Map()

    API_KEY = os.getenv("GOOGLE_API_KEY")
    CX = os.getenv("GOOGLE_CX")

    if not query:
        yield "***ERROR***: No query provided"
        return
    
    user_message: str = (
        "***USER MESSAGE***:\n"
        + MedicalPrompter.get_user_message(query, original_language)
    )

    rule_types: dict[str, str] = {
        "sr": "security_rules",
        "sh": "search_rules",
    }
    system_message: str = "***SYSTEM RULES***\n"
    for flag, rule_type in rule_types.items():
        if flags.get(flag, True):
            system_message += MedicalPrompter.get_rules(rule_type)
    
    system_message += "***SEARCH RESULTS***:\n"

    try:
        search_url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={API_KEY}&cx={CX}&num=3"
        search_response = requests.get(search_url, timeout=10)
        
        if search_response.status_code != 200:
            yield f"***ERROR***: Google Search API returned status code {search_response.status_code}"
            return
            
        search_data = search_response.json()
        
        if "error" in search_data:
            yield f"***ERROR***: {search_data['error']['message']}"
            return
            
        urls = []
        for item in search_data.get("items", []):
            if item.get("link"):
                urls.append(item.get("link"))
                
        if not urls:
            yield "***ERROR***: No search results found"
            return
            
    except Exception as e:
        yield f"***ERROR***: Search failed: {str(e)}"
        return

    valid_urls = []
    combined_text = ""
    errors = []
    
    for url in urls:
        try:
            response = requests.get(url, timeout=5)
            
            if response.status_code == 403:
                errors.append(f"***ERROR***: Access forbidden (403) for URL: {url}")
                continue
            elif response.status_code >= 400:
                errors.append(f"***ERROR***: HTTP error {response.status_code} for URL: {url}")
                continue
                
            soup = BeautifulSoup(response.text, 'html.parser')
            for script in soup(["script", "style"]):
                script.extract()
            text = soup.get_text(separator=' ', strip=True)
            
            if not text or len(text) < 50:
                errors.append(f"***ERROR***: Insufficient content from URL: {url}")
                continue
                
            MAX_CHARS_PER_URL = 2500
            combined_text += f"\n--- Content from {url} ---\n"
            combined_text += text[:MAX_CHARS_PER_URL]
            
            valid_urls.append(url)
            
            if len(valid_urls) >= 3:
                break
                
        except requests.exceptions.Timeout:
            errors.append(f"***ERROR***: Request timed out for URL: {url}")
            continue
        except requests.exceptions.ConnectionError:
            errors.append(f"***ERROR***: Connection error for URL: {url}")
            continue
        except Exception as e:
            errors.append(f"***ERROR***: {str(e)} for URL: {url}")
            continue
    
    if not valid_urls:
        for error in errors:
            yield error
        yield "***ERROR***: Could not retrieve content from any URL"
        return
        
    MAX_TOTAL_CHARS = 5000
    if len(combined_text) > MAX_TOTAL_CHARS:
        combined_text = combined_text[:MAX_TOTAL_CHARS]
        
    system_message += combined_text

    model = os.getenv("GROQ_GPT_MODEL", "llama-3.3-70b-versatile")

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=0.0,
            max_tokens=500,
            top_p=0.1,
            stream=True,
            stop=None
        )

        for chunk in completion:
            content = chunk.choices[0].delta.content or ""
            yield content

    except Exception as e:
        yield f"***ERROR***: LLM request failed: {str(e)}"
        return

    yield "\n---\n"
    
    for i, url in enumerate(valid_urls):
        if i == 0:
            yield f"🔗 {url}\n"
        else:
            yield f"{url}\n"
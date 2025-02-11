import re
import random
import string
from typing import List

def generate_secret_pattern(length: int = 15) -> str:
    """
    Generates a random alphanumeric secret pattern.

    :param length: The length of the generated pattern. Default is 15.
    :return: A randomly generated secret pattern string.
    """
    characters: str = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def generate_secret_patterns(count: int = 6) -> List[str]:
    """
    Generates a list of random alphanumeric secret patterns.

    :param count: The number of patterns to generate. Default is 6.
    :return: A list of randomly generated secret pattern strings.
    """
    return [generate_secret_pattern() for _ in range(count)]

SECRET_PATTERNS: List[str] = generate_secret_patterns()

def contains_secret(text: str) -> bool:
    """
    Checks if the given text contains any of the generated secret patterns.

    :param text: The text to check for the presence of secret patterns.
    :return: True if any secret pattern is found in the text, False otherwise.
    """
    for pattern in SECRET_PATTERNS:
        if re.search(pattern, text):
            return True
    return False

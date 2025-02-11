from typing import TypedDict, Literal, Union, Optional, Dict, Any

class SearchDetailsSchema(TypedDict, total=False):
    medical_field: Optional[str]
    name: Optional[str]
    street: Optional[str]
    city: Optional[str]

class IntentSchema(TypedDict):
    """
    Represents the schema for intent detection results.

    :field type: The type of the schema, always "object".
    :field properties: A dictionary defining the properties of the schema:
        - `has_intent`: A boolean indicating whether an intent was detected.
        - `intent_type`: A string or null, representing the type of intent
          (e.g., "theme_change", "language_change", "doctor_contact").
        - `intent_value`: A string or null, representing the specific value of the intent
          (e.g., "dark", "light", "english", "polish", or "search_database").
        - `confidence`: A float between 0.0 and 1.0, representing the confidence of the intent detection.
        - `search_details`: An optional dictionary with information for a search query,
          which is only required if `intent_value` is "search_database".
    :field required: A list of properties that are mandatory in the schema.
    """
    type: Literal["object"]
    properties: Dict[
        str,
        Dict[str, Union[Literal["boolean", "string", "number"], list[str], float, Dict[str, Any], bool]]
    ]
    required: list[Literal["has_intent", "intent_type", "intent_value", "confidence"]]

INTENT_SCHEMA: IntentSchema = {
    "type": "object",
    "properties": {
        "has_intent": {"type": "boolean"},
        "intent_type": {
            "type": "string",
            "enum": ["theme_change", "language_change", "doctor_contact"]
        },
        "intent_value": {
            "type": "string",
            "enum": ["dark", "light", "english", "polish", "search_database"]
        },
        "confidence": {
            "type": "number",
            "minimum": 0.0,
            "maximum": 1.0
        },
        "search_details": {
            "type": ["object", "null"],
            "properties": {
                "medical_field": {"type": ["string", "null"]},
                "name": {"type": ["string", "null"]},
                "street": {"type": ["string", "null"]},
                "city": {"type": ["string", "null"]},
            },
        },
    },
    "required": ["has_intent", "intent_type", "intent_value", "confidence"]
}

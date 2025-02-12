import datetime
import json
import os
import re
import uuid
from typing import Dict, Any, Union
import groq
import pandas as pd
import torch
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from pymongo import MongoClient, collection
from torch import Tensor
from GPT.chat_handler import summarize_user_and_bot as summarize_conversation
from tools import stream_response, generate_jwt, require_valid_token
import __main__
from Models.net.predict_1 import Model_1
from Models.net.predict_2 import Model_2
""""""""""""""""""""""""""""""""""""""""""""
__main__.Model_1 = Model_1
__main__.Model_2 = Model_2

app = Flask(__name__)
cors_origins = os.getenv("DOMAIN", "http://localhost:3000")
CORS(app, resources={r"/*": {"origins": cors_origins}}, supports_credentials=True)


connection: str = os.getenv('MONGO_CONNECTION_STRING',"")
client: MongoClient = MongoClient(connection)

db = client["Medical_prediction"]

collection1: collection.Collection = db['Heartdisease_prediction']
collection2: collection.Collection = db['Diabetes_prediction']
collection3: collection.Collection = db['Data']
collection4: collection.Collection = db['GPT']
collection5: collection.Collection = db['Doctors']

@app.route('/api/session', methods=['POST'])
def manage_session():
    """
    Create a new session and generate JWT token.

    This endpoint creates a new session with a unique UUID and generates a corresponding JWT token.

    Returns:
        tuple: A tuple containing:
            - dict: JSON response with:
                - message (str): Success message
                - token (str): Generated JWT token
            - int: HTTP 200 status code
    """
    new_session_id = str(uuid.uuid4())
    token = generate_jwt(new_session_id)
    return jsonify({
        "message": "New session created",
        "token": token
    }), 200

@app.route('/api/askGPT', methods=['POST'])
@require_valid_token
def ask_gpt_endpoint(session_id: str) -> Response:
    """
    Protected endpoint to interact with GPT-like models for streaming responses.
    Session verification is handled by the require_valid_token decorator.

    Args:
        session_id: Automatically injected by the decorator after token verification
    """
    try:
        data: Dict[str, Any] = request.json or {}
        message: str = data.get('message', '')
        file_name: str = data.get('fileName', '')
        file_content: str = data.get('fileContent', '')

        response_content = []
        client: groq.Groq = groq.Groq()

        def generate_stream():
            for chunk in stream_response(message, file_name, file_content, client, session_id, collection4):
                response_content.append(chunk)
                yield chunk

        response = Response(generate_stream(), content_type='text/event-stream')

        @response.call_on_close
        def save_to_database():
            bot_message = ''.join(response_content)
            try:
                # summary = summarize_conversation(
                #     user_message=message,
                #     bot_message=bot_message,
                #     client=client
                # )

                document = {
                    "session_id": session_id,
                    "user_message": message,
                    "bot_message": bot_message,
                    # "summary": summary,
                    "file_name": file_name,
                    "file_content": file_content,
                    "date_added": datetime.datetime.now()
                }
                collection4.insert_one(document)

            except Exception as db_error:
                print(f"Error saving interaction to the database: {db_error}")

        return response

    except Exception as e:
        return Response(f"***ERROR***: {e}", status=500)

@app.route('/api/search', methods=['POST'])
def search_doctors():
    """
    Search for doctors based on provided search parameters.

    This endpoint accepts POST requests with JSON data containing search parameters
    and returns matching doctor records from the database.

    Args:
        JSON payload with the following optional parameters:
            street (str): Street name to search for
            city (str): City name to search for
            medical_field (str): Medical specialization to search for

    Returns:
        JSON response with:
            - success (200):
                {
                    'count': number of matches,
                    'data': list of matching doctor records
                }
            - not found (404):
                {
                }
            - bad request (400):
                {
                    'error': 'At least one search parameter must be provided'
                }
            - server error (500):
                {
                    'error': 'Database error message'
                }
    """
    data = request.get_json()
    street = data.get('street')
    city = data.get('city')
    medical_field = data.get('medical_field')

    if all(param is None for param in [street, city, medical_field]):
        return jsonify({
            'error': 'At least one search parameter (street, city, or medical_field) must be provided'
        }), 400

    query_conditions = []

    if street is not None:
        query_conditions.append({
            "street": {"$regex": re.escape(street.lower()), "$options": "i"}
        })

    if city is not None:
        query_conditions.append({
            "city": {"$regex": re.escape(city.lower()), "$options": "i"}
        })

    if medical_field is not None:
        query_conditions.append({
            "medical_field": {"$regex": re.escape(medical_field.lower()), "$options": "i"}
        })

    query = {"$and": query_conditions}

    try:
        collection5 = db['Doctors']
        results = list(collection5.find(
            query,
            {'_id': 0}
        ))

        if not results:
            return jsonify({
                'message': 'No matching records found',
                'data': []
            }), 404

        return jsonify({
            'message': 'Records found',
            'count': len(results),
            'data': results
        }), 200

    except Exception as e:
        return jsonify({
            'error': f'Database error occurred: {str(e)}'
        }), 500

@app.route('/')
def home() -> str:
    """
    Home route that simply returns a greeting message.

    :return: A string message.
    """
    return "Cogito, ergo sum"

@app.route('/api/create_1', methods=['POST'])
def create_1() -> Union[str, Response]:
    """
    Endpoint to predict outcomes using Model_1.
    :return: JSON string with predictions or a Flask Response object with an error message.
    """
    try:
        data: Dict[str, Any] = request.get_json()

        model_path: str = './Models/predict_1.pth'
        model: torch.nn.Module = torch.load(model_path, weights_only=False)
        model.eval()

        def map_age_to_group(age: Any) -> int:
            age = int(age)
            if 18 <= age <= 24:
                return 1
            elif 25 <= age <= 79:
                return int((age - 25) // 5 + 2)
            elif 80 <= age <= 120:
                return 13
            else:
                return None

        data.pop('_id', None)
        processed_data: Dict[str, Union[float, int]] = {}
        for k, v in data.items():
            if k == 'age':
                processed_data[k] = map_age_to_group(v)
            elif isinstance(v, str) and v.replace('.', '', 1).isdigit():
                processed_data[k] = float(v)
            else:
                processed_data[k] = v

        inputs_list = list(processed_data.values())
        inputs: Tensor = torch.tensor([inputs_list], dtype=torch.float32)

        with torch.no_grad():
            outputs: Tensor = model(inputs)
            probabilities: Tensor = torch.sigmoid(outputs)

        samples: Dict[str, Any] = data.copy()
        samples['P(A)'] = round((probabilities.cpu().numpy().flatten() * 100).item(), 2)
        samples['~P(A)'] = round(((1 - probabilities.cpu().numpy().flatten()) * 100).item(), 2)

        df: pd.DataFrame = pd.DataFrame([samples])
        json_result: str = df.to_json(orient='records', lines=True)
        collection2.insert_one(json.loads(json_result))

        return json_result

    except Exception as e:
        return jsonify({"status": str(e)}), 500


@app.route('/api/create_2', methods=['POST'])
def create_2() -> Union[str, Response]:
    """
    Endpoint to predict outcomes using Model_2.
    :return: JSON string with predictions or a Flask Response object with an error message.
    """
    try:
        data: Dict[str, Any] = request.get_json()

        model_path: str = './Models/predict_2.pth'
        model = torch.load(model_path, weights_only=False)

        def map_age_to_group(age: Any) -> int:
            age = int(age)
            if 18 <= age <= 24:
                return 1
            elif 25 <= age <= 79:
                return int((age - 25) // 5 + 2)
            elif 80 <= age <= 120:
                return 13
            else:
                return None

        data.pop('_id', None)
        processed_data: Dict[str, Union[float, int]] = {}
        for k, v in data.items():
            if k == 'age':
                processed_data[k] = map_age_to_group(v)
            elif isinstance(v, str) and v.replace('.', '', 1).isdigit():
                processed_data[k] = float(v)
            else:
                processed_data[k] = v

        df: pd.DataFrame = pd.DataFrame([processed_data])

        outputs: Tensor = model.predict_proba(df.values)
        probabilities: Tensor = torch.tensor(outputs[:, 1], dtype=torch.float32)

        samples: Dict[str, Any] = data.copy()
        samples['P(A)'] = round((probabilities.cpu().numpy().flatten() * 100).item(), 2)
        samples['~P(A)'] = round(((1 - probabilities.cpu().numpy().flatten()) * 100).item(), 2)

        df = pd.DataFrame([samples])
        json_result = df.to_json(orient='records', lines=True)
        collection2.insert_one(json.loads(json_result))

        return json_result
    except Exception as e:
        return jsonify({"status": str(e)}), 500


@app.route('/api/get_data', methods=['GET'])
def get_data() -> Response:
    """
    Endpoint to retrieve the latest prediction data.
    :return: A Flask Response object with prediction data or an error message.
    """
    try:
        diabetes_data_list = list(collection3.find({"name": "Diabetes_prediction"}))
        heartdisease_data_list = list(collection3.find({"name": "Heartdisease_prediction"}))

        diabetes_data = (
            max(diabetes_data_list, key=lambda x: x.get("date_inserted", datetime.datetime.min))
            if diabetes_data_list else "no data"
        )
        if isinstance(diabetes_data, dict):
            diabetes_data.pop('_id', None)
            diabetes_data.pop('date_inserted', None)

        heartdisease_data = (
            max(heartdisease_data_list, key=lambda x: x.get("date_inserted", datetime.datetime.min))
            if heartdisease_data_list else "no data"
        )
        if isinstance(heartdisease_data, dict):
            heartdisease_data.pop('_id', None)
            heartdisease_data.pop('date_inserted', None)

        data: Dict[str, Any] = {
            "Diabetes_prediction": diabetes_data,
            "Heartdisease_prediction": heartdisease_data
        }
        return jsonify(data)

    except Exception as e:
        return jsonify({"status": str(e)}), 500

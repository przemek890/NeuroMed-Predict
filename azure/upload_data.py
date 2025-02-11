import argparse
import time
from pymongo import MongoClient
from pymongo.errors import BulkWriteError
from bson import ObjectId
import json
import csv
from datetime import datetime

def convert_json_document(document):
    if "_id" in document and "$oid" in document["_id"]:
        document["_id"] = ObjectId(document["_id"]["$oid"])

    if "date_inserted" in document and "$date" in document["date_inserted"]:
        date_str = document["date_inserted"]["$date"]
        if date_str.endswith('Z'):
            date_str = date_str[:-1]
        document["date_inserted"] = datetime.fromisoformat(date_str)

    return document

parser = argparse.ArgumentParser(description="Upload data to MongoDB")
parser.add_argument("connection_string", help="MongoDB connection string")
parser.add_argument("data_file", help="Path to the data file (JSON or CSV)")
parser.add_argument("--batch_size", type=int, default=10, help="Number of documents per batch")
parser.add_argument("--retry_delay", type=float, default=1.0, help="Delay in seconds before retrying after an error")
parser.add_argument("--records_per_second", type=int, default=100, help="Target number of records to insert per second")
args = parser.parse_args()

client = MongoClient(args.connection_string)
db = client["Medical_prediction"]
collection = db["Data"]
collection2 = db["Doctors"]

def process_csv_file(file_path):
    documents = []
    with open(file_path, "r", encoding="utf-8") as file:
        reader = csv.DictReader(file, delimiter=";")
        for row in reader:
            document = {key: str(value) if value != "" else None for key, value in row.items()}
            documents.append(convert_json_document(document))
    return documents

def process_json_file(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)
        if isinstance(data, list):
            return [convert_json_document(doc) for doc in data]
        else:
            return [convert_json_document(data)]

def calculate_delay(records_per_second, batch_size):
    return (batch_size / records_per_second)

def insert_documents_in_batches(collection, documents, batch_size, retry_delay, records_per_second):
    delay_between_batches = calculate_delay(records_per_second, batch_size)
    successful_inserts = 0
    failed_inserts = []
    total_batches = len(documents) // batch_size + (1 if len(documents) % batch_size else 0)

    for i in range(0, len(documents), batch_size):
        batch = documents[i:i + batch_size]
        current_batch = i // batch_size + 1
        retries = 0
        max_retries = 3

        while retries < max_retries:
            try:
                result = collection.insert_many(batch, ordered=False)
                successful_inserts += len(result.inserted_ids)
                print(f"Batch {current_batch}/{total_batches}: Inserted {len(result.inserted_ids)} documents.")
                break
            except BulkWriteError as bwe:
                successful_ops = bwe.details.get('nInserted', 0)
                successful_inserts += successful_ops
                failed_docs = [batch[error['index']] for error in bwe.details.get('writeErrors', [])]

                if retries < max_retries - 1:
                    retries += 1
                    print(f"Partial success - inserted {successful_ops}/{len(batch)} documents. Retry {retries}/{max_retries}...")
                    time.sleep(retry_delay * retries)
                    batch = failed_docs
                else:
                    failed_inserts.extend(failed_docs)
                    print(f"Failed to insert {len(failed_docs)} documents after {max_retries} retries.")
                    break
            except Exception as e:
                if retries < max_retries - 1:
                    retries += 1
                    print(f"Error in batch {current_batch}: {str(e)}. Retry {retries}/{max_retries}...")
                    time.sleep(retry_delay * retries)
                else:
                    print(f"Error in batch {current_batch}: {str(e)}. No more retries.")
                    failed_inserts.extend(batch)
                    break

        print(f"Waiting {delay_between_batches:.3f}s before next batch.")
        time.sleep(delay_between_batches)

    print(f"\nFinal Summary:")
    print(f"Successfully inserted: {successful_inserts}")
    print(f"Failed to insert: {len(failed_inserts)}")
    return failed_inserts

try:
    if args.data_file.endswith(".csv"):
        documents = process_csv_file(args.data_file)
        target_collection = collection2
    elif args.data_file.endswith(".json"):
        documents = process_json_file(args.data_file)
        target_collection = collection
    else:
        raise ValueError("Unsupported file format. Please use CSV or JSON.")

    failed_docs = insert_documents_in_batches(
        target_collection,
        documents,
        args.batch_size,
        args.retry_delay,
        args.records_per_second
    )

    if failed_docs:
        print("\nRetrying failed documents with smaller batch size...")
        insert_documents_in_batches(
            target_collection,
            failed_docs,
            max(1, args.batch_size // 2),
            args.retry_delay * 2,
            args.records_per_second // 2
        )

except Exception as e:
    print(f"An error occurred: {e}")
finally:
    client.close()

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime
import argparse

parser = argparse.ArgumentParser(description="Send test results as an email.")
parser.add_argument("sender_email", type=str, help="Sender's email address.")
parser.add_argument("receiver_email", type=str, help="Receiver's email address.")
parser.add_argument("password", type=str, help="Sender's email password.")
parser.add_argument("smtp_server", type=str, help="SMTP server address.")
parser.add_argument("filenames", type=str, nargs='+', help="Names of the files with test results.")
args = parser.parse_args()

sender_email = args.sender_email
receiver_email = args.receiver_email
password = args.password

current_date = datetime.now().strftime("%Y-%m-%d")
subject = f"Deployment - [{current_date}]"
body = """
        Logs regarding implementation and tests performed on the Azure Microsoft platform.\n\n
        - To analyze video materials from tests, unpack videos.zip\n
        - To analyze deployment logs, see deployment.log\n
        - To analyze test results, unpack logs.zip.To run a static page to visualize them, change the file extension: app.js.txt --> app.js\n
       """
message = MIMEMultipart()
message["From"] = sender_email
message["To"] = receiver_email
message["Subject"] = subject
message.attach(MIMEText(body, "plain"))

for filename in args.filenames:
    try:
        with open(filename, "rb") as file:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(file.read())
            encoders.encode_base64(part)
            part.add_header("Content-Disposition", f"attachment; filename={filename}")
            message.attach(part)
    except FileNotFoundError:
        print(f"Error: File {filename} not found.")

try:
    with smtplib.SMTP(args.smtp_server, 587) as server:
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message.as_string())
    print("Email sent successfully!")
except Exception as e:
    print(f"Error sending email: {e}")

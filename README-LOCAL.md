# Medical Prediction - Deployment Guide

To deploy the application locally, you have three options:
- Use VSCode extension for automated terminal setup or do it manually
- Run both services together using Docker Compose
- Run in Azure Cloud for production deployment

Below are the details for each method:

---

## 1. PYTHON / NPM:

##### 1.0. Prerequisites

Verify that you have `python3 --version` `npm --version` `npx --version`

##### 1.1. Environment Variables Setup

Add the following environment variables to your shell configuration file (e.g., `~/.zshrc` or `~/.bashrc`):

```bash
export MONGO_CONNECTION_STRING="YOUR_MONGO_CONNECTION_STRING" # e.g. mongodb+srv://user:pass@cluster.mongodb.net/db
export GROQ_API_KEY="YOUR_GROQ_API_KEY>"                      # e.g. gsk_...
export GROQ_GPT_MODEL="YOUR_MODEL_NAME"                       # e.g. llama-3.3-70b-versatile
export REACT_APP_DOMAIN="YOUR_DOMAIN"                         # e.g. http://localhost or http://192.168...
```

Then reload your shell configuration:
```bash
source ~/.zshrc  # ~/.bashrc
```

##### 1.2a. VSCode extension:
- Install the "Restore Terminals" extension in VSCode
- Restart VSCode
- The project will automatically activate terminals for:
    - Backend
    - Frontend
    - Cypress testing

##### 1.2b. Running Services Separately

```bash
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python3.12 main.py
```

```bash
# You may skip domain.py script by previous setting domain manually
python3 domain.py && cd frontend && npm start
```

```bash
cd cypress && npm i cypress -D && npx cypress open
```

**Access:**
- http://localhost:3000
- http://<SERVER_IP>:3000

**Note**:
- This approach allows for automatic refreshing of the application in the browser after changes are made to the frontend code.
- Changes are immediately visible, which accelerates the development and testing process.
- Ideal for developers working on the frontend who need quick feedback

---

### 2. DOCKER // DOCKER COMPOSE:

##### 2.0. Prerequisites

Verify that you have `docker --version` and `docker-compose --version`.

##### 2.1. Environment Variables Setup

Configure environment variables in [`docker-compose.yml`](docker-compose.yml#L1-L11):

```yaml
x-REACT_APP_DOMAIN: &REACT_APP_DOMAIN
    REACT_APP_DOMAIN: <<<YOUR_DOMAIN>>>

x-MONGO_CONNECTION_STRING: &MONGO_CONNECTION_STRING
    MONGO_CONNECTION_STRING: <<<YOUR_MONGO_CONNECTION_STRING>>>

x-GROQ_API_KEY: &GROQ_API_KEY
    GROQ_API_KEY: <<<YOUR_GROQ_API_KEY>>>

x-GROQ_GPT_MODEL: &GROQ_GPT_MODEL
    GROQ_GPT_MODEL: <<<YOUR_MODEL_NAME>>>
```

Replace the placeholder values (<<<...>>>) with your actual configuration.

##### 2.2. Build and Run

Start all services with:

```bash
docker-compose up --build
```

**Access:**
- http://localhost:3000
- http://<SERVER_IP>:3000

***Note***:
- In this approach, after making changes to the frontend code, the frontend container must be restarted to see those changes.
- This means a longer response time when modifications are made, which can slow down the development process.
- May be beneficial during testing or preparation for deployment when application stability is a priority

# Multi-Agent-Interviewer
<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python Badge"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI Badge"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Badge"/>
  <img src="https://img.shields.io/badge/AutoGen-9A00FF?style=for-the-badge" alt="AutoGen Badge"/>
  <img src="https://img.shields.io/badge/Groq-00C65E?style=for-the-badge" alt="Groq Badge"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License Badge"/>
</p>
An autonomous, multi-agent AI system (AutoGen, Groq) that conducts, proctors, and evaluates technical Excel interviews in real-time. Built with FastAPI and React.
An end-to-end, full-stack application designed to automate the technical screening process for Excel-proficient roles. This platform leverages a sophisticated multi-agent system to conduct dynamic, real-time interviews, provide intelligent skill evaluation, and generate detailed performance reports to streamline the hiring pipeline.

__Note:__ Open Excel Sheet button is enabled but there is no Excel sheet provided by me, therefore, it will show that "No Sheets are provided". Its not an error, anyone can provide the sheets link in the code for running the project.

## 🚀 Live Demo

**Check out the live deployed application:** **[Live Demo Link](https://mock-interviewer-cn.netlify.app/)**

*   **Admin Login:** `admin1@cn.com` / `Admin@123`
*   **Candidate Login:** `candidate1@abc.com` / `Candidate@123`

---
## 🖼️ Project Showcase

<table>
  <tr>
    <td align="center">
      <em>Candidate Dashboard</em><br/><br/>
      <img src="https://github.com/user-attachments/assets/dfb69fda-3be6-4146-a82d-a0dbf756ecaf" width="100%" alt="Login Page">
    </td>
    <td align="center">
      <em>Interview Details</em><br/><br/>
      <img src="https://github.com/user-attachments/assets/ff8a8d7f-8ecf-4ef8-8b7b-74deaa6e027e" width="100%" alt="Candidate Dashboard">
    </td>
  </tr>
  <tr>
    <td align="center">
      <em>Live Interview Interface</em><br/><br/>
      <img src="https://github.com/user-attachments/assets/30f8037d-a18c-4732-81b8-bdd7eb50dfd6" width="100%" alt="Admin Dashboard Application List">
    </td>
    <td align="center">
      <em>Admin Dashboard (Application List)</em><br/><br/>
      <img src="https://github.com/user-attachments/assets/89ca6d72-c7e3-4b99-9580-a82646a1e5a9" width="100%" alt="Live Interview Interface with Proctoring">
    </td>
  </tr>
  <tr>
    <td align="center">
      <em>Candidate Application Details</em><br/><br/>
      <img src="https://github.com/user-attachments/assets/c43040db-0f10-4dd7-a281-2485e5092838" width="100%" alt="Real-time Agent Simulation">
    </td>
    <td align="center">
      <em>AI-Generated Report Modal</em><br/><br/>
      <img src="https://github.com/user-attachments/assets/3c7abb34-489c-48cb-ac0b-fa9ba501c762" width="100%" alt="Interview Transcript Modal">
    </td>
  </tr>
  <tr>
    <td align="center">
      <em>Interview Transcript Modal</em><br/><br/>
      <img width="1901" height="912" alt="React-App (4)" src="https://github.com/user-attachments/assets/cfb0dd4d-54ba-4e63-b804-8f5df34b0893" />
    </td>
    <td align="center">
      <em>Agent Analytics and Agent Simulation (Real-time)</em><br/><br/>
      <img src="https://github.com/user-attachments/assets/59889679-6783-46e7-82d6-42c6e9318f6c" width="100%" alt="AI Generated Report Modal">
    </td>
  </tr>
</table>
---
## ✨ Key Features

*   **🤖 Multi-Agent Conversation:** Utilizes Microsoft's AutoGen framework to orchestrate a natural, multi-turn interview between specialized AI agents.
*   **🧠 Intelligent Evaluation:** Employs high-performance LLMs from Groq (GPT-OSS, Llama-4, Gemma2) for nuanced question generation, response evaluation, and report creation.
*   **🎥 Real-time Proctoring:** Features a live proctoring agent built with OpenCV that streams video from the candidate's webcam to detect anomalies like screen deviation, multiple faces, or persistent gaze aversion.
*   **📝 Dynamic Feedback Loop (RAG):** The system "learns" from admin feedback. Submitted critiques are stored and fed back into the Interviewer Agent's context for future interviews, improving its performance over time.
*   **📊 Comprehensive Admin Dashboard:** An intuitive interface for admins to review candidate applications, view detailed interview transcripts, analyze AI-generated performance reports, and provide feedback.
*   **⚙️ Live Agent Simulation:** A real-time, turn-by-turn simulation between the Interviewer and a mock Candidate Agent, allowing admins to monitor and test agent behavior.
*   **☁️ Fully Deployed:** A complete CI/CD pipeline with the backend deployed on Render (PostgreSQL) and the frontend on Netlify.

---

## 🏛️ System Architecture

This project follows a modern, decoupled full-stack architecture. The frontend is a Single Page Application (SPA) that communicates with a backend REST API and WebSocket services.
```mermaid
graph TD
    %% Define Styles
    classDef default fill:#f9f9f9,stroke:#ddd,stroke-width:2px;
    
    subgraph " "
        direction LR
        subgraph "Frontend (React on Netlify)"
            B["<div style='padding: 10px; font-weight: bold;'>fa:fa-react React SPA</div>"]
        end
        subgraph "User"
            A["fa:fa-user-tie Candidate / Admin"]
        end
    end

    subgraph "Backend (FastAPI on Render)"
        C["fa:fa-server API Endpoints"]
        D["fa:fa-plug Proctoring WebSocket"]
        E["fa:fa-plug Simulation WebSocket"]
        F["<div style='padding: 10px; font-weight: bold;'>fa:fa-cogs AutoGen Orchestrator</div>"]
    end
    
    subgraph "AI Agents (Groq LLMs)"
        G["fa:fa-robot Interviewer Agent"]
        H["fa:fa-robot Evaluation & Feedback Agent"]
        I["fa:fa-robot Candidate Agent (Sim)"]
    end

    subgraph "Infrastructure"
        J["fa:fa-database PostgreSQL Database"]
        K["fa:fa-bolt Redis Cache"]
        L["fa:fa-video OpenCV Service"]
    end

    %% Connections
    A -- Interacts with --> B
    B -- HTTP API Calls --> C
    B -- WebSocket --> D
    B -- WebSocket --> E
    
    C -- Business Logic --> F
    D -- Video Frames --> L
    E -- Triggers --> F
    
    F -- Manages --> G
    F -- Manages --> H
    F -- Manages --> I
    
    G -- API Call --> Groq
    H -- API Call --> Groq
    I -- API Call --> Groq
    
    F -- Reads/Writes --> J
    C -- Caches Data in --> K
    
    L -- Anomaly Data --> D
```

## 🛠️ Tech Stack

### Category	Technology
* __Backend__	
![alt text](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![alt text](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)
![alt text](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white)
![alt text](https://img.shields.io/badge/OpenCV-5C3EE8?style=flat-square&logo=opencv&logoColor=white)

* __Frontend__
![alt text](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![alt text](https://img.shields.io/badge/React_Router-CA4245?style=flat-square&logo=react-router&logoColor=white)
![alt text](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

* __AI__	
![alt text](https://img.shields.io/badge/AutoGen-9A00FF?style=flat-square)
![alt text](https://img.shields.io/badge/Groq-00C65E?style=flat-square)
![alt text](https://img.shields.io/badge/OpenAI-412991?style=flat-square&logo=openai&logoColor=white)

* __Database__	
![alt text](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![alt text](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)

* __Deployment__	
![alt text](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![alt text](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)
![alt text](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)

## 🔧 Setup and Local Installation
To run this project on your local machine, follow these steps.
### Prerequisites
1. Git
2. Python 3.11+
3. Node.js
4. npm
5. Redis (running on the default port 6379)
   
#### 1. Clone the Repository
```Bash
git clone https://github.com/[YOUR_GITHUB_USERNAME]/[YOUR_REPOSITORY_NAME].git
cd [YOUR_REPOSITORY_NAME]
```
#### 2. Backend Setup
Run all commands from a new terminal in the /backend directory.
```
# 1. Navigate to the backend folder
cd backend

# 2. Create and activate a virtual environment
python -m venv .venv
# Windows
.\.venv\Scripts\activate
# MacOS/Linux
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create a .env file and fill in your API keys
cp .env.example .env 
# Now, open the .env file and add your secret keys.

# 5. Start the backend server
uvicorn main:app --reload
```
The backend will be running at http://localhost:8000.
#### 3. Frontend Setup
Run all commands from a new, separate terminal in the /frontend directory.
```
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create a .env file for the frontend
# The file should contain: REACT_APP_API_BASE_URL=http://localhost:8000/api
cp .env.example .env

# 4. Start the frontend server (with HTTPS for camera access)
npm start
```
The frontend will open at https://localhost:3000.
## 🚀 Deployment
The application is deployed with a CI/CD pipeline:
* __Backend (FastAPI):__ Deployed as a Web Service on Render, connected to a managed PostgreSQL database. The deployment automatically rebuilds on every push to the main branch.
* __Frontend (React):__ Deployed on Netlify, linked to the same GitHub repository. It includes a _redirects file to correctly handle SPA routing.
## 🗺️ Future Roadmap

* Implement a persistent vector database (e.g., Pinecone, ChromaDB) for a more scalable RAG implementation.

* Introduce robust JWT-based user authentication for both candidates and admins.

* Fine-tune a smaller, open-source model on high-quality interview transcripts to reduce reliance on external APIs.

* Expand the admin dashboard with more detailed analytics on agent performance and candidate success rates.

* Add support for different roles and interview types (e.g., Python, SQL).


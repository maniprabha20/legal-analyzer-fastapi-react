\# AI Legal Document Analyzer



An AI-powered web application that helps users analyze legal documents such as lease agreements.



The application uses Retrieval-Augmented Generation (RAG) to extract useful information from uploaded PDF documents and provide AI-generated summaries, risk analysis, key clauses, and answers with page citations.



\## Live Demo



Frontend:

https://legal-analyzer-fastapi-react-1.onrender.com



Backend API:

https://legal-analyzer-fastapi-react.onrender.com



\## Features



\- User registration and login

\- JWT-based authentication

\- Secure document ownership

\- PDF document upload

\- PDF text extraction

\- Document chunking

\- Vector embeddings using FastEmbed

\- Similarity-based document retrieval

\- RAG-based question answering

\- AI-generated document summary

\- Legal risk analysis

\- Key clause extraction

\- Page-based citations

\- Download uploaded documents

\- Analysis reports

\- PostgreSQL database using Supabase

\- Supabase Storage for PDF files

\- React-based user interface

\- FastAPI backend

\- Deployed frontend and backend



\## Tech Stack



\### Frontend



\- React

\- Vite

\- Axios

\- React Router

\- React Bootstrap

\- React Markdown

\- React PDF



\### Backend



\- Python

\- FastAPI

\- SQLAlchemy

\- AsyncPG

\- Pydantic

\- JWT Authentication

\- Bcrypt



\### AI / RAG



\- FastEmbed

\- ONNX Runtime

\- LangChain

\- Groq LLM

\- RAG (Retrieval-Augmented Generation)

\- Cosine Similarity



\### Database and Storage



\- PostgreSQL

\- Supabase Database

\- Supabase Storage



\### Deployment



\- Render



\## Project Structure



```text

legal-doc-analyzer/

│

├── backend/

│   ├── auth.py

│   ├── chunking.py

│   ├── citations.py

│   ├── database.py

│   ├── documents.py

│   ├── embeddings.py

│   ├── ingestion.py

│   ├── llm.py

│   ├── main.py

│   ├── models.py

│   ├── pdf\_extraction.py

│   ├── rate\_limit.py

│   ├── reports.py

│   ├── report\_pdf.py

│   ├── retrieval.py

│   ├── schemas.py

│   ├── security.py

│   ├── storage.py

│   ├── user\_profile.py

│   ├── vector\_store.py

│   ├── requirements.txt

│   └── tests

│

├── frontend/

│   ├── src/

│   ├── index.html

│   ├── package.json

│   ├── package-lock.json

│   └── vite.config.js

│

└── README.md


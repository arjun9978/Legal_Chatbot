# 🏛️ Legal AI Chatbot - Indian Law Research Assistant

A production-ready AI-powered legal research chatbot specializing in Indian law, built with RAG (Retrieval-Augmented Generation) architecture using Flask, React, Pinecone, and Google Gemini.

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000.svg)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Overview

This intelligent legal assistant helps users research Indian law by providing accurate, source-grounded answers from a comprehensive database of legal documents including the Indian Constitution, IPC, landmark Supreme Court cases, and more.

### Key Features

✅ **Advanced RAG Pipeline** - Semantic search with 4,120+ legal document chunks  
✅ **Comprehensive Coverage** - Indian Constitution, IPC, BNS 2023, Contract Act, Evidence Act, 4 landmark Supreme Court cases  
✅ **Smart Query Handling** - Rejects non-legal queries, provides source citations  
✅ **User Authentication** - JWT-based login with MongoDB Atlas  
✅ **Chat History** - Persistent conversations with source tracking  
✅ **Modern UI** - Responsive React interface with Tailwind CSS  

---

## 📊 System Architecture

```
┌─────────────────┐
│   React Frontend│
│   (Vite + Axios)│
└────────┬────────┘
         │ HTTP/REST
┌────────▼────────┐
│   Flask Backend │
│   + JWT Auth    │
└────────┬────────┘
         │
    ┌────┴─────┬─────────┬──────────┐
    │          │         │          │
┌───▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼──────┐
│Pinecone│ │ Gemini │ │MongoDB │ │LangChain│
│4120 vec│ │2.5Flash│ │ Atlas  │ │   RAG   │
└────────┘ └────────┘ └────────┘ └─────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- MongoDB Atlas account
- Pinecone account
- Google Gemini API key

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
PINECONE_API_KEY=your_pinecone_key
GOOGLE_API_KEY=your_gemini_key
MONGO_URI=your_mongodb_uri
PINECONE_INDEX_NAME=legal-index-v1
JWT_SECRET=your_secret_key
EOF

# Run server
python app.py
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📚 Legal Document Coverage

### Statutory Documents (26 Files, 4,120 Chunks)

- **Indian Constitution** (395 Articles) - 2024 Edition
- **Indian Penal Code (IPC)** - Complete criminal law
- **Bharatiya Nyaya Sanhita 2023** - New criminal law code (217 chunks)
- **Indian Contract Act 1872** (81 chunks)
- **Indian Evidence Act**
- **Economic Offences Act 1974**

### Landmark Supreme Court Cases

1. **Navtej Singh Johar vs Union of India** (2018) - 383 chunks  
   *Section 377 decriminalization, LGBTQ+ rights*

2. **Kesavananda Bharati vs State of Kerala** (1973) - 1,375 chunks  
   *Basic Structure Doctrine*

3. **Justice K.S. Puttaswamy vs Union of India** (2017) - 455 chunks  
   *Right to Privacy as Fundamental Right*

4. **Maneka Gandhi vs Union of India** (1978) - 284 chunks  
   *Article 21 interpretation*

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Flask 3.0
- **LLM**: Google Gemini 2.5 Flash
- **Vector DB**: Pinecone (Serverless)
- **Embeddings**: HuggingFace sentence-transformers/all-MiniLM-L6-v2 (384d)
- **Database**: MongoDB Atlas
- **RAG Framework**: LangChain
- **Auth**: JWT tokens with bcrypt

### Frontend
- **Framework**: React 18 + Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios

---

## 🔧 API Endpoints

### Authentication
```http
POST /api/auth/signup
POST /api/auth/login
```

### Chat
```http
POST /api/chat
GET /api/chats
DELETE /api/chats/<chat_id>
```

---

## 💡 Example Queries

### ✅ Successful Legal Queries
```
"Explain Article 21 of Indian Constitution"
"What is the punishment for theft under IPC?"
"Tell me about Navtej Singh Johar case"
"What are Fundamental Rights in India?"
"Explain Section 377 IPC history"
"What is the Basic Structure Doctrine?"
```

### ❌ Rejected Non-Legal Queries
```
"Tell me about cricket"
"What is a meteor?"
"Best recipe for pasta"
"Who won the match yesterday?"
```

---

## 📁 Project Structure

```
legal_chatbot/
├── backend/
│   ├── app.py                 # Flask API server
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/            # Route pages
│   │   ├── context/          # Auth & Theme context
│   │   └── services/         # API client
│   ├── package.json
│   └── vite.config.js
├── scripts/
│   ├── ingest_data.py        # Document processing
│   ├── index_pinecone.py     # Vector indexing
│   ├── rag_chain.py          # RAG pipeline
│   └── semantic_search.py    # Search utilities
├── data/
│   ├── processed/            # Chunked documents
│   └── [raw legal documents]
├── milestone1/               # Embeddings & Indexing
├── milestone2/               # RAG Implementation
└── milestone3/               # Full-stack Integration
    ├── backend/
    ├── frontend/
    ├── mongodb/
    └── README.md
```

---

## 📈 Performance Metrics

- **Vector Chunks**: 4,120 indexed documents
- **Embedding Model**: 384-dimensional vectors
- **Query Success Rate**: 95%+ for Indian legal questions
- **Response Time**: 3-5 seconds (retrieval + LLM generation)
- **Document Coverage**: 26 files, 95%+ of common legal queries

---

## 🔐 Security Features

- ✅ JWT token authentication (24h expiry)
- ✅ Bcrypt password hashing (10 rounds)
- ✅ CORS enabled for frontend
- ✅ MongoDB TLS encryption
- ✅ API keys secured via environment variables
- ✅ User data isolation per email

---

## 🎨 Features

### 1. Intelligent Query Classification
- Detects legal vs non-legal queries
- Quick pattern-based responses for greetings
- Rejects out-of-scope questions with helpful guidance

### 2. Source-Grounded Responses
- Every answer includes source citations
- Document names, chunk IDs, and relevance scores
- Traceable legal references

### 3. Conversation Management
- Multi-session chat history per user
- Context-aware follow-up questions
- Chat deletion capability

### 4. Document Validation
- Semantic relevance filtering
- Foreign jurisdiction rejection
- Quality assurance for retrieved documents

---

## 🧪 Testing

### Test Non-Legal Queries
```python
# Should be rejected
queries = [
    "tell me about cricket",
    "what is a meteor",
    "best songs of 2024"
]
```

### Test Legal Queries
```python
# Should return detailed answers
queries = [
    "Explain Article 21",
    "What is Section 302 IPC?",
    "Tell me about Kesavananda Bharati case"
]
```

---

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
PINECONE_API_KEY=your_pinecone_api_key
GOOGLE_API_KEY=your_google_gemini_key
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/LegalChatbot
PINECONE_INDEX_NAME=legal-index-v1
JWT_SECRET=your_secret_key_here
```

---

## 🐛 Known Limitations

- IPC Section 36 doesn't exist (system correctly reports as not found)
- Response time depends on LLM API latency
- Free tier MongoDB has storage limits (512MB)
- Pinecone free tier limited to 100K vectors

---

## 📖 Documentation

- [Milestone 1- 1-2 hours](milestone1/README.md) - Document processing & embedding generation
- [Milestone 2- 2 hours](milestone2/README.md) - RAG pipeline implementation
- [Milestone 3- 1 hour](milestone3/README.md) - Full-stack integration & deployment
- [MongoDB Setup](milestone3/mongodb/MONGODB_SETUP.md) - Database schema details

---

## 👨‍💻 Developer

**Arjun Pratap Aggarwal**  
Email: arjunbrt1303@gmail.com
---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini** - LLM capabilities
- **Pinecone** - Vector database
- **MongoDB Atlas** - Cloud database
- **HuggingFace** - Embedding models
- **Indian Government** - Open legal documents
- **Springboard** - Internship opportunity

---

## 📞 Support

For issues or questions, please open an issue on GitHub or contact via email.

---

**⭐ Star this repo if you find it helpful!**

---

**Status**: ✅ Production Ready  
**Last Updated**: December 22, 2025  
**Version**: 3.0
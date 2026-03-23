from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import datetime
from functools import wraps
import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
import bcrypt
from werkzeug.utils import secure_filename
import PyPDF2
import docx
import io

# Load environment variables
load_dotenv()

# Add the scripts directory to the path to import rag_chain
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'scripts'))

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'fallback-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

# CORS Configuration - Allow Vercel frontend
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",  # Local development
            "http://localhost:3000",
            "https://legal-chatbot-seven.vercel.app",  # Your Vercel domain
            "https://legal-chatbot-git-main-arjun9978s-projects.vercel.app",  # Vercel preview
            "https://*.vercel.app"  # All Vercel preview deployments
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# MongoDB Connection
try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('DB_NAME', 'legai_db')]
    users_collection = db['users']
    chats_collection = db['chats']
    uploaded_documents_collection = db['uploaded_documents']
    print("[OK] Connected to MongoDB Atlas successfully!")
except Exception as e:
    print(f"[ERROR] MongoDB connection error: {e}")
    db = None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token.split(' ')[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Health check endpoint
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'message': 'LegAI Backend Server is running',
        'version': '1.0'
    })

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        if not name or not email or not password:
            return jsonify({'message': 'Missing required fields'}), 400
        
        # Check if user already exists
        if users_collection.find_one({'email': email}):
            return jsonify({'message': 'User already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Create user document
        user_doc = {
            'name': name,
            'email': email,
            'password': hashed_password,
            'created_at': datetime.datetime.utcnow()
        }
        
        users_collection.insert_one(user_doc)
        
        # Generate JWT token
        token = jwt.encode({
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'name': name,
                'email': email
            }
        }), 201
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'message': 'Error creating user', 'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'message': 'Missing email or password'}), 400
        
        # Find user in database
        user = users_collection.find_one({'email': email})
        
        if not user:
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Verify password
        if not bcrypt.checkpw(password.encode('utf-8'), user['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = jwt.encode({
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'token': token,
            'user': {
                'name': user['name'],
                'email': email
            }
        }), 200
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'message': 'Error logging in', 'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
@token_required
def chat():
    try:
        # Get user email from token
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_email = token_data.get('email')
        
        # Import here to avoid circular imports
        import sys
        import os
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
        
        from rag_chain import create_rag_chain, answer_legal_query
        
        data = request.get_json()
        query = data.get('query')
        chat_id = data.get('chat_id', None)
        
        if not query:
            return jsonify({'message': 'Query is required'}), 400
        
        # Create RAG chain (cache this in production)
        print(f"[QUERY] Processing query from {user_email}: {query}")
        rag_chain, retriever = create_rag_chain()
        
        # Fetch conversation history for this chat (for context in follow-up questions)
        chat_history = []
        uploaded_docs_text = ""
        
        if chat_id:
            previous_messages = chats_collection.find({
                'user_email': user_email,
                'chat_id': chat_id
            }).sort('created_at', 1).limit(10)  # Last 10 messages
            
            for msg in previous_messages:
                chat_history.append({"role": "user", "content": msg['query']})
                chat_history.append({"role": "assistant", "content": msg['response']})
            
            # Fetch any uploaded documents for this chat
            uploaded_docs = uploaded_documents_collection.find({
                'user_email': user_email,
                'chat_id': chat_id
            }).sort('uploaded_at', -1).limit(5)  # Last 5 uploaded docs
            
            for doc in uploaded_docs:
                uploaded_docs_text += f"\\n\\n--- Uploaded Document: {doc['filename']} ---\\n{doc['content'][:3000]}\\n"  # First 3000 chars
        
        # Get response from RAG chain with conversation history and uploaded documents
        response_text, retrieved_docs = answer_legal_query(
            query, rag_chain, retriever, chat_history, uploaded_docs_text
        )
        
        # Format sources from retrieved documents with better structure
        sources = []
        if retrieved_docs:
            for idx, doc in enumerate(retrieved_docs, 1):
                # Extract metadata
                metadata = doc.metadata if hasattr(doc, 'metadata') else {}
                content = doc.page_content if hasattr(doc, 'page_content') else str(doc)
                
                source_entry = {
                    'id': idx,
                    'content': content[:300] + '...' if len(content) > 300 else content,
                    'full_content': content,  # For detailed view
                    'source_file': metadata.get('source_file', 'Legal Database'),
                    'chunk_id': metadata.get('chunk_id', 'N/A'),
                    'document_type': metadata.get('document_type', 'Legal Document'),
                    'article_section': metadata.get('section', 'N/A')  # For constitutional articles
                }
                sources.append(source_entry)
        
        # Save chat to MongoDB
        chat_document = {
            'user_email': user_email,
            'chat_id': chat_id,
            'query': query,
            'response': response_text,
            'sources': sources,
            'created_at': datetime.datetime.utcnow()
        }
        chats_collection.insert_one(chat_document)
        print(f"[OK] Response generated and saved to database")
        
        return jsonify({
            'response': response_text,
            'sources': sources
        }), 200
        
    except Exception as e:
        print(f"[ERROR] Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'message': 'Error processing query',
            'error': str(e)
        }), 500

@app.route('/api/chats', methods=['GET'])
@token_required
def get_chats():
    try:
        # Get user email from token
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_email = token_data.get('email')
        
        # Get all unique chat_ids for this user with their first query as title
        pipeline = [
            {'$match': {'user_email': user_email}},
            {'$sort': {'created_at': -1}},
            {'$group': {
                '_id': '$chat_id',
                'title': {'$first': '$query'},
                'last_message': {'$first': '$created_at'}
            }},
            {'$sort': {'last_message': -1}}
        ]
        
        chats_cursor = chats_collection.aggregate(pipeline)
        chats = []
        for chat in chats_cursor:
            chats.append({
                'id': chat['_id'],
                'title': chat['title'][:50] + '...' if len(chat['title']) > 50 else chat['title'],
                'time': chat['last_message']
            })
        
        return jsonify({'chats': chats}), 200
        
    except Exception as e:
        print(f"❌ Error fetching chats: {str(e)}")
        return jsonify({'message': 'Error fetching chats', 'error': str(e)}), 500

@app.route('/api/chats/<chat_id>', methods=['GET'])
@token_required
def get_chat_messages(chat_id):
    try:
        # Get user email from token
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_email = token_data.get('email')
        
        # Get all messages for this chat
        messages_cursor = chats_collection.find({
            'user_email': user_email,
            'chat_id': int(chat_id)
        }).sort('created_at', 1)
        
        messages = []
        all_sources = []
        for msg in messages_cursor:
            messages.append({
                'role': 'user',
                'content': msg['query'],
                'id': str(msg['_id']) + '_q'
            })
            messages.append({
                'role': 'assistant',
                'content': msg['response'],
                'id': str(msg['_id']) + '_a'
            })
            if msg.get('sources'):
                all_sources.extend(msg['sources'])
        
        return jsonify({
            'messages': messages,
            'sources': all_sources
        }), 200
        
    except Exception as e:
        print(f"❌ Error fetching chat messages: {str(e)}")
        return jsonify({'message': 'Error fetching messages', 'error': str(e)}), 500

@app.route('/api/chats/<chat_id>', methods=['DELETE'])
@token_required
def delete_chat(chat_id):
    try:
        # Get user email from token
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_email = token_data.get('email')
        
        # Delete all messages for this chat
        result = chats_collection.delete_many({
            'user_email': user_email,
            'chat_id': int(chat_id)
        })
        
        print(f"✅ Deleted {result.deleted_count} messages from chat {chat_id}")
        
        return jsonify({
            'message': 'Chat deleted successfully',
            'deleted_count': result.deleted_count
        }), 200
    except Exception as e:
        print(f"❌ Error deleting chat: {str(e)}")
        return jsonify({'message': 'Error deleting chat', 'error': str(e)}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_content):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return None

def extract_text_from_docx(file_content):
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(io.BytesIO(file_content))
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        return None

@app.route('/api/upload', methods=['POST'])
@token_required
def upload_document():
    try:
        # Get user email from token
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_email = token_data.get('email')
        
        if 'file' not in request.files:
            return jsonify({'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'message': 'File type not allowed. Use PDF, DOCX, or TXT'}), 400
        
        filename = secure_filename(file.filename)
        file_content = file.read()
        
        # Extract text based on file type
        file_ext = filename.rsplit('.', 1)[1].lower()
        if file_ext == 'pdf':
            text = extract_text_from_pdf(file_content)
        elif file_ext == 'docx':
            text = extract_text_from_docx(file_content)
        elif file_ext == 'txt':
            text = file_content.decode('utf-8')
        else:
            return jsonify({'message': 'Unsupported file type'}), 400
        
        if not text or len(text.strip()) < 10:
            return jsonify({'message': 'Could not extract text from document'}), 400
        
        # Store document in MongoDB
        document = {
            'user_email': user_email,
            'filename': filename,
            'content': text,
            'uploaded_at': datetime.datetime.utcnow(),
            'chat_id': request.form.get('chat_id')  # Optional: associate with chat
        }
        result = uploaded_documents_collection.insert_one(document)
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'document_id': str(result.inserted_id),
            'filename': filename,
            'text_length': len(text)
        }), 200
        
    except Exception as e:
        print(f"❌ Error uploading document: {str(e)}")
        return jsonify({'message': 'Error uploading document', 'error': str(e)}), 500

@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile():
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_email = token_data.get('email')
        
        user = users_collection.find_one({'email': user_email}, {'_id': 0, 'password': 0})
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify({'user': user}), 200
    except Exception as e:
        return jsonify({'message': 'Error fetching profile', 'error': str(e)}), 500

@app.route('/api/user/update-profile', methods=['PUT'])
@token_required
def update_profile():
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_email = token_data.get('email')
        
        data = request.get_json()
        update_fields = {}
        
        if 'name' in data and data['name']:
            update_fields['name'] = data['name']
        
        if 'email' in data and data['email']:
            # Check if new email already exists
            if data['email'] != user_email:
                existing = users_collection.find_one({'email': data['email']})
                if existing:
                    return jsonify({'message': 'Email already in use'}), 400
                update_fields['email'] = data['email']
        
        if not update_fields:
            return jsonify({'message': 'No fields to update'}), 400
        
        users_collection.update_one({'email': user_email}, {'$set': update_fields})
        
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error updating profile', 'error': str(e)}), 500

@app.route('/api/user/change-password', methods=['PUT'])
@token_required
def change_password():
    try:
        token = request.headers.get('Authorization')
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
        token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        user_email = token_data.get('email')
        
        data = request.get_json()
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return jsonify({'message': 'Both current and new passwords required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'message': 'New password must be at least 6 characters'}), 400
        
        # Verify current password
        user = users_collection.find_one({'email': user_email})
        if not user or not bcrypt.checkpw(current_password.encode('utf-8'), user['password']):
            return jsonify({'message': 'Current password is incorrect'}), 401
        
        # Hash and update new password
        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        users_collection.update_one({'email': user_email}, {'$set': {'password': hashed_password}})
        
        return jsonify({'message': 'Password changed successfully'}), 200
    except Exception as e:
        return jsonify({'message': 'Error changing password', 'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200

if __name__ == '__main__':
    print("[STARTUP] Starting LegAI Backend Server...")
    print("[INFO] MongoDB Atlas connected")
    print("[INFO] Server running on http://localhost:5000")
    app.run(debug=True, port=5000, use_reloader=False)

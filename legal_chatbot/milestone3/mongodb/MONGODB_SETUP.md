# MongoDB Atlas Setup for LegalChatbot

## Database: LegalChatbot

### Collections:

#### 1. **users**
Stores user authentication information.

**Schema:**
```json
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (bcrypt hashed),
  "created_at": DateTime
}
```

**Indexes:**
- email: unique index

---

#### 2. **chats**
Stores user chat conversations.

**Schema:**
```json
{
  "_id": ObjectId,
  "user_email": String,
  "messages": [
    {
      "role": String ("user" | "assistant"),
      "content": String,
      "sources": [
        {
          "file": String,
          "chunk_id": String,
          "score": Number
        }
      ],
      "timestamp": DateTime
    }
  ],
  "created_at": DateTime,
  "updated_at": DateTime
}
```

**Indexes:**
- user_email: index for quick user lookup
- created_at: index for sorting

---

#### 3. **uploaded_documents**
Stores user-uploaded documents metadata.

**Schema:**
```json
{
  "_id": ObjectId,
  "user_email": String,
  "filename": String,
  "file_path": String,
  "file_size": Number,
  "upload_date": DateTime,
  "status": String ("processing" | "indexed" | "failed"),
  "chunks_created": Number,
  "error_message": String (optional)
}
```

**Indexes:**
- user_email: index
- upload_date: index

---

## Connection Details

**MongoDB Atlas Cluster:** 
- Region: AWS / us-east-1
- Tier: M0 (Free Tier)

**Connection String:**
```
mongodb+srv://<username>:<password>@cluster0.abcxyz.mongodb.net/LegalChatbot?retryWrites=true&w=majority
```

---

## Environment Variable

Add to `.env` file:
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.abcxyz.mongodb.net/LegalChatbot?retryWrites=true&w=majority
```

---

## Features Implemented

1. **User Authentication**: JWT-based login/signup
2. **Chat History**: Persistent conversation storage per user
3. **Source Tracking**: Each response includes source documents with scores
4. **Document Upload**: (Planned) Users can upload their own legal documents
5. **Multi-user Support**: Isolated chat histories per user

---

## Security

- Passwords hashed using bcrypt (10 rounds)
- JWT tokens expire after 24 hours
- MongoDB connection uses TLS encryption
- User data isolated by email (no cross-user access)

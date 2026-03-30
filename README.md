# 🚀 CollabDocs — Real-time Collaborative Document Editor

CollabDocs is a full-stack real-time collaborative document editor where multiple users can create, edit, and share documents simultaneously. It is inspired by tools like Google Docs and built using the MERN stack with Socket.io.

---

## 🌟 Features

### 🔐 Authentication

* Secure Signup/Login using JWT & bcrypt
* Protected routes for authorized access

### 📄 Document Management

* Create, edit, and delete documents
* Dashboard with all user documents

### ⚡ Real-time Collaboration

* Multiple users can edit the same document simultaneously
* Changes are synced instantly using Socket.io

### ⏳ Auto Save

* Documents are automatically saved every few seconds

### 🔗 Document Sharing

* Share documents via link
* Multiple users can join and collaborate in real-time

### 🎨 Modern UI/UX

* Built with React + Tailwind CSS
* Clean and responsive interface

---

## 🧠 Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Axios
* React Router DOM
* Socket.io-client
* React Quill (Rich Text Editor)

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* JWT Authentication
* bcrypt (password hashing)
* Socket.io
* dotenv

---

## 📂 Project Structure

```
collabdocs/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── sockets/
│   │   ├── config/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
```

---

## 🔄 How It Works

1. User logs in
2. Creates a document
3. Opens document → joins socket room
4. Edits content → changes are broadcast to other users
5. Auto-save updates MongoDB

---

## 🚀 Getting Started

### 🔧 Backend Setup

```bash
cd backend
npm install
npm run dev
```

### 🌐 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🌍 Local URLs

* Frontend → http://localhost:5173
* Backend → http://localhost:5000

---

## 📌 Future Improvements

* 👥 Live Cursor Tracking
* 🔐 Role-based access (Viewer/Editor)
* 🕒 Version History
* 🌙 Dark Mode
* 💬 Comments system

---

## 💡 Inspiration

Inspired by:

* Google Docs
* Notion
* Microsoft Word Online

---

## 👨‍💻 Author

**Ankit Kumar**
Student | Full Stack Developer

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and share with others!

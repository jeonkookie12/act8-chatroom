# Act8 - Chatroom Application

A full-stack real-time Chatroom application with WebSocket support, built with NestJS backend and React frontend.
## 🚀 Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **WebSocket Gateway** - Real-time communication
### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **CSS** - Custom styling
## 📁 Project Structure

```
├── chatrooms.sql              # SQL schema for chatroom database
├── backend/                   # NestJS WebSocket API
│   ├── src/
│   │   ├── chatroom.controller.ts
│   │   ├── chatroom.gateway.ts
│   │   ├── chatroom.service.ts
│   │   ├── message.entity.ts
│   │   └── websocket.service.ts
│   └── package.json
└── frontend/                  # React application
   ├── src/
   │   ├── App.jsx            # Main component
   │   └── main.jsx           # Entry point
   └── package.json
```
## 🎯 Features

### Real-Time Chat
- ✅ Join chatrooms
- ✅ Send and receive messages instantly
- ✅ Multiple chatrooms support
- ✅ User presence notifications
- ✅ Message history persistence

### UI Features
- ✅ Responsive chat interface
- ✅ User list display
- ✅ Room switching
- ✅ Message timestamps

## 🛠️ Setup Instructions
### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Database (MySQL/PostgreSQL/SQLite)
### Database Setup
1. Set up the database using `chatrooms.sql`.
2. Update backend `.env` with your database credentials.
### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
2. Install dependencies:
   ```bash
   npm install
3. Configure environment variables:
   - Create a `.env` file in the backend directory
   - Add your database and WebSocket config
### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
2. Install dependencies:
   ```bash
   npm install
3. Configure environment variables (if needed):
   - Create a `.env` file in the frontend directory
   - Add your API base URL:
## 📝 API & WebSocket Events

### REST Endpoints
- `GET /chatrooms` - List all chatrooms
- `POST /chatrooms` - Create a new chatroom
- `GET /chatrooms/:id/messages` - Get message history for a chatroom
### WebSocket Events
- `joinRoom` - Join a chatroom
- `leaveRoom` - Leave a chatroom
- `sendMessage` - Send a message to a room
- `receiveMessage` - Receive a message from a room
- `userJoined` - Notification when a user joins
- `userLeft` - Notification when a user leaves
## 📊 Database Entities

### Chatroom Entity
```typescript
{
   id: number
   name: string
   messages: Message[]
}

### Message Entity
```typescript
{
   id: number
   chatroom: Chatroom
   chatroomId: number
   sender: string
   content: string
   timestamp: Date
}

## 🧪 Testing
### Backend Tests
```bash
cd backend
npm run test
### End-to-End Tests
```bash
cd backend
npm run test:e2e
## 📚 Documentation

- Backend API documentation: [backend/BACKEND_DOCUMENTATION.md](backend/BACKEND_DOCUMENTATION.md)
- Backend README: [backend/README.md](backend/README.md)
- Frontend README: [frontend/README.md](frontend/README.md)

## 👨‍💻 Development
### Backend Architecture
- **Chatroom Gateway** - Handles WebSocket connections and events
- **Chatroom Service** - Business logic for chatrooms and messages
- **Entities** - TypeORM models for chatrooms and messages
- **Controllers** - REST endpoints for chatroom management

### Frontend Development
- **WebSocket Client** - Real-time communication with backend
- **Chat UI** - Message list, input, and user list
- **Room Management** - Join, leave, and switch rooms
- **Responsive Design**

## 🚢 Deployment

### Backend Deployment
- Set environment variables in production
- Configure database connection
- Enable CORS for frontend domain

### Frontend Deployment
- Build the production bundle: `npm run build`
- Deploy the `dist` folder to hosting service
- Configure production API URL

## 📄 License

This project is part of Laboratory Activities coursework.
# Real-Time Chat Application

A modern real-time chat application built with React, NestJS, and WebSocket.

## Features

- **Real-time messaging** using WebSocket connections
- **Multiple chat rooms** with persistent message history
- **Delete functionality** for messages and chatrooms
- **In-memory storage** for chat rooms and messages
- **Responsive UI** built with React and Tailwind CSS
- **REST API** for room management
- **CORS configured** for seamless development

## Tech Stack

### Frontend
- React 19
- Vite (development server)
- Socket.IO Client (WebSocket communication)
- Tailwind CSS (styling)

### Backend
- NestJS (Node.js framework)
- Socket.IO (WebSocket server)
- Express (HTTP server)
- TypeScript

## Architecture

- **Frontend** runs on port 5173 with Vite dev server
- **Backend** runs on port 3000 with NestJS
- **Database** MySQL with TypeORM for data persistence
- **WebSocket** connections for real-time messaging
- **REST API** endpoints for room management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL database server
- npm or yarn

## Database Setup

1. **Create MySQL database:**
   ```sql
   CREATE DATABASE chatroom_db;
   ```

2. **Import schema (optional):**
   The application will automatically create tables with TypeORM synchronization, but you can also import the provided schema:
   ```bash
   mysql -u root -p chatroom_db < chatroom_db.sql
   ```

3. **Update database credentials:**
   Edit `backend/src/app.module.ts` if your MySQL credentials differ from the defaults.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Activity_8
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Start the frontend server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:5173`

## Usage

1. Enter a username to log in
2. Join existing chat rooms (General Chat, Random) or create new ones
3. Send messages in real-time
4. Delete your own messages by clicking the × button on your messages
5. Delete custom chat rooms by clicking the × button next to room names (default rooms cannot be deleted)
6. Switch between rooms to see message history

## API Endpoints

### REST API (Backend)
- `GET /api/chatrooms` - Get all chat rooms
- `POST /api/chatrooms` - Create a new chat room
- `DELETE /api/chatrooms/:roomId` - Delete a chat room
- `GET /api/chatrooms/:roomId/messages` - Get messages for a room
- `POST /api/chatrooms/:roomId/messages` - Send a message to a room
- `DELETE /api/chatrooms/:roomId/messages/:messageId` - Delete a specific message

### WebSocket Events
- `join-room` - Join a chat room
- `send-message` - Send a message
- `delete-message` - Delete a message (users can only delete their own messages)
- `delete-room` - Delete a chat room
- `message` - Receive messages
- `message-deleted` - Notification when a message is deleted
- `chatroom-deleted` - Notification when a room is deleted
- `room-history` - Receive room message history
- `chatroom-created` - Notification of new room creation

## Development

- **Frontend proxy**: API requests are proxied through Vite to avoid CORS issues
- **Hot reload**: Both frontend and backend support hot reloading in development
- **TypeScript**: Full TypeScript support for type safety</content>
<parameter name="filePath">c:\Users\Jian Laurence\Downloads\Activity_8\README.md
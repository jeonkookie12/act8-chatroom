# Chatroom Backend Documentation

## Overview

This is a real-time chatroom backend application built with **NestJS**, **TypeORM**, **Socket.IO**, and **MySQL**. The application provides a RESTful API for managing chatrooms and messages, along with WebSocket support for real-time communication.

## Tech Stack

- **Framework**: NestJS v11.0.1
- **Database**: MySQL with TypeORM v11.0.0
- **Real-time Communication**: Socket.IO v11.1.11
- **Language**: TypeScript
- **Server**: Express

## Architecture

### Core Components

1. **Controllers**: Handle HTTP requests and responses
2. **Services**: Business logic and database operations
3. **Gateways**: WebSocket event handlers for real-time communication
4. **Entities**: Database models using TypeORM decorators
5. **Modules**: Organize related functionality

## Database Schema

### Tables

#### `chatrooms`
- `id` (VARCHAR 50, Primary Key): Unique chatroom identifier
- `name` (VARCHAR 100, Unique): Chatroom name
- `created_at` (TIMESTAMP): Creation timestamp

#### `messages`
- `id` (VARCHAR 50, Primary Key): Unique message identifier
- `room_id` (VARCHAR 50, Foreign Key): References chatrooms(id)
- `username` (VARCHAR 50): Username of the message sender
- `message` (TEXT): Message content
- `timestamp` (TIMESTAMP): Message timestamp

### Relationships
- One chatroom can have many messages (One-to-Many)
- Messages cascade delete when chatroom is deleted

## Configuration

### Database Connection
Location: `src/app.module.ts`

```typescript
TypeORM Configuration:
- Type: MySQL
- Host: 127.0.0.1
- Port: 3306
- Username: root
- Password: (empty by default)
- Database: chatroom_db
- Synchronize: true (automatically syncs entities with database)
```

### CORS Settings
Location: `src/main.ts`

Allowed origins:
- http://localhost:5173
- http://localhost:5174
- http://localhost:5175

Allowed methods: GET, POST, PUT, DELETE

### Server Configuration
- **Port**: 3000
- **Global API Prefix**: `/api`
- **Base URL**: `http://localhost:3000/api`

## API Endpoints

### Chatroom Management

#### 1. Get All Chatrooms
```
GET /api/chatrooms
```

**Response:**
```json
[
  {
    "id": "room_1234567890_abc123",
    "name": "General",
    "messageCount": 42
  }
]
```

**Description**: Returns all chatrooms with their message counts.

---

#### 2. Create Chatroom
```
POST /api/chatrooms
```

**Request Body:**
```json
{
  "name": "New Room"
}
```

**Response:**
```json
{
  "id": "room_1234567890_xyz789",
  "name": "New Room",
  "messageCount": 0
}
```

**Validation:**
- Name is required
- Name must not be empty or whitespace only
- Name must be unique (case-insensitive)

**Error Responses:**
- `400 Bad Request`: Invalid or missing name
- `400 Bad Request`: Chatroom name already exists

---

#### 3. Delete Chatroom
```
DELETE /api/chatrooms/:roomId
```

**Response:**
```json
{
  "success": true
}
```

**Description**: Deletes a chatroom and all its messages (cascade delete).

**Error Responses:**
- `404 Not Found`: Chatroom not found

---

### Message Management

#### 4. Get Messages
```
GET /api/chatrooms/:roomId/messages
```

**Response:**
```json
[
  {
    "id": "msg_1234567890_def456",
    "username": "john_doe",
    "message": "Hello everyone!",
    "timestamp": "2026-01-13T12:34:56.789Z",
    "roomId": "room_1234567890_abc123"
  }
]
```

**Description**: Returns all messages for a specific chatroom, sorted by timestamp (ascending).

**Error Responses:**
- `404 Not Found`: Chatroom not found

---

#### 5. Send Message
```
POST /api/chatrooms/:roomId/messages
```

**Request Body:**
```json
{
  "username": "john_doe",
  "message": "Hello everyone!"
}
```

**Response:**
```json
{
  "id": "msg_1234567890_ghi789",
  "username": "john_doe",
  "message": "Hello everyone!",
  "timestamp": "2026-01-13T12:34:56.789Z",
  "roomId": "room_1234567890_abc123"
}
```

**Validation:**
- Username is required
- Message is required

**Error Responses:**
- `400 Bad Request`: Missing username or message
- `400 Bad Request`: Chatroom not found

---

#### 6. Delete Message
```
DELETE /api/chatrooms/:roomId/messages/:messageId
```

**Request Body:**
```json
{
  "username": "john_doe"
}
```

**Response:**
```json
{
  "success": true
}
```

**Description**: Users can only delete their own messages.

**Validation:**
- Username is required
- Message must belong to the user

**Error Responses:**
- `400 Bad Request`: Missing username
- `404 Not Found`: Message not found or unauthorized

---

## WebSocket Events

### Connection Configuration

```typescript
Socket.IO Server:
- Endpoint: ws://localhost:3000
- CORS: Enabled for localhost:5173, 5174, 5175
- Transport: WebSocket with fallback to polling
```

### Client Events (Sent by Client)

#### 1. `join-room`
Join a chatroom and receive message history.

**Payload:**
```json
{
  "username": "john_doe",
  "roomId": "room_1234567890_abc123"
}
```

**Server Response:**
- Emits `room-history` with all messages
- Joins the client to the room

---

#### 2. `send-message`
Send a message to a chatroom.

**Payload:**
```json
{
  "username": "john_doe",
  "message": "Hello everyone!",
  "roomId": "room_1234567890_abc123"
}
```

**Server Response:**
- Broadcasts `message` event to all clients in the room
- Saves message to database

**Validation:**
- Username, message, and roomId are required
- Message cannot be empty or whitespace only

---

#### 3. `delete-message`
Delete a message (user can only delete their own messages).

**Payload:**
```json
{
  "username": "john_doe",
  "roomId": "room_1234567890_abc123",
  "messageId": "msg_1234567890_def456"
}
```

**Server Response:**
- Broadcasts `message-deleted` event to all clients in the room
- Removes message from database

---

### Server Events (Sent by Server)

#### 1. `room-history`
Sent when a client joins a room.

**Payload:**
```json
{
  "messages": [
    {
      "id": "msg_1234567890_def456",
      "username": "john_doe",
      "message": "Hello everyone!",
      "timestamp": "2026-01-13T12:34:56.789Z",
      "roomId": "room_1234567890_abc123"
    }
  ],
  "roomId": "room_1234567890_abc123"
}
```

---

#### 2. `message`
Broadcast when a new message is sent.

**Payload:**
```json
{
  "id": "msg_1234567890_ghi789",
  "username": "john_doe",
  "message": "Hello everyone!",
  "timestamp": "2026-01-13T12:34:56.789Z",
  "roomId": "room_1234567890_abc123"
}
```

---

#### 3. `message-deleted`
Broadcast when a message is deleted.

**Payload:**
```json
{
  "messageId": "msg_1234567890_def456",
  "roomId": "room_1234567890_abc123"
}
```

---

#### 4. `chatroom-created`
Broadcast when a new chatroom is created (optional).

**Payload:**
```json
{
  "id": "room_1234567890_xyz789",
  "name": "New Room",
  "messageCount": 0
}
```

---

#### 5. `error`
Sent when an error occurs during WebSocket operations.

**Payload:**
```json
{
  "message": "Error description"
}
```

---

## Project Structure

```
backend/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module with TypeORM config
│   ├── app.controller.ts          # Root controller
│   ├── app.service.ts             # Root service
│   ├── chatroom.module.ts         # Chatroom feature module
│   ├── chatroom.controller.ts     # REST API endpoints
│   ├── chatroom.service.ts        # Business logic
│   ├── chatroom.gateway.ts        # WebSocket handlers
│   ├── chatroom.entity.ts         # Chatroom database model
│   └── message.entity.ts          # Message database model
├── test/                          # E2E tests
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── nest-cli.json                  # NestJS CLI configuration
```

## Service Layer

### ChatroomService

**Key Methods:**

#### `getAllChatrooms()`
- Returns all chatrooms with message counts
- Uses TypeORM repository to fetch data

#### `createChatroom(name: string)`
- Creates a new chatroom
- Validates uniqueness (case-insensitive)
- Generates unique ID: `room_{timestamp}_{random}`

#### `getChatroomById(id: string)`
- Fetches a single chatroom by ID
- Returns chatroom with message count

#### `getMessages(roomId: string)`
- Fetches all messages for a chatroom
- Sorted by timestamp in ascending order

#### `addMessage(roomId, username, message)`
- Adds a new message to a chatroom
- Validates chatroom exists
- Generates unique ID: `msg_{timestamp}_{random}`

#### `deleteMessage(roomId, messageId, username)`
- Deletes a message
- Validates ownership (username match)
- Returns boolean success status

#### `deleteChatroom(roomId)`
- Deletes a chatroom
- Cascade deletes all associated messages
- Returns boolean success status

## Gateway Layer

### ChatroomGateway

**Lifecycle Hooks:**

- `handleConnection(client)`: Logs when a client connects
- `handleDisconnect(client)`: Logs when a client disconnects

**WebSocket Handlers:**

#### `handleJoinRoom`
1. Adds client to Socket.IO room
2. Fetches message history
3. Emits history to the client

#### `handleSendMessage`
1. Validates message data
2. Saves message to database
3. Broadcasts to all clients in room

#### `handleDeleteMessage`
1. Validates ownership
2. Deletes from database
3. Broadcasts deletion to all clients in room

**Broadcasting Methods:**

- `broadcastRoomCreated(room)`: Notifies all clients of new chatroom

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL Server
- npm or yarn

### Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Configure Database**
   - Create a MySQL database named `chatroom_db`
   - Update credentials in `src/app.module.ts` if needed
   - Import the SQL schema from `../chatrooms.sql`

3. **Run Development Server**
```bash
npm run start:dev
```

4. **Run Production Server**
```bash
npm run build
npm run start:prod
```

### Available Scripts

- `npm run start` - Start the application
- `npm run start:dev` - Start with hot-reload
- `npm run start:debug` - Start in debug mode
- `npm run build` - Build for production
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint code with ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Error Handling

### HTTP Status Codes

- **200 OK**: Successful request
- **400 Bad Request**: Validation error or invalid input
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Common Error Scenarios

1. **Duplicate Chatroom Name**
   - Status: 400
   - Message: "Chatroom name already exists"

2. **Empty Message**
   - Status: 400
   - Message: "Message cannot be empty"

3. **Unauthorized Message Deletion**
   - Status: 404
   - Message: "Message not found or you can only delete your own messages"

4. **Chatroom Not Found**
   - Status: 404
   - Message: "Chatroom not found"

## Security Considerations

### Current Implementation

1. **CORS**: Restricted to specific localhost origins
2. **Input Validation**: Basic validation on all endpoints
3. **Message Ownership**: Users can only delete their own messages

### Production Recommendations

1. **Authentication**: Implement JWT-based authentication
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Input Sanitization**: Sanitize messages to prevent XSS attacks
4. **Database**: Change `synchronize: false` in production
5. **Environment Variables**: Use `.env` file for sensitive configuration
6. **HTTPS**: Use SSL/TLS in production
7. **SQL Injection**: TypeORM provides protection, but validate all inputs

## Testing

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Logging

The application includes console logging for:
- Server startup/shutdown
- Client connections/disconnections
- API endpoint calls
- WebSocket events
- Database operations
- Error messages

**Example Logs:**
```
Server started successfully on port 3000
Client connected: abc123xyz
john_doe joined room room_1234567890_abc123
Processing message from john_doe in room room_1234567890_abc123
```

## Performance Considerations

### Database Optimization
- Indexes on frequently queried fields (id, room_id)
- Cascade deletes for efficient cleanup
- Connection pooling via TypeORM

### WebSocket Optimization
- Room-based broadcasting (only to relevant clients)
- Efficient event handlers
- Socket.IO transport optimization

## Future Enhancements

Potential improvements for the application:

1. **User Authentication**: Add user registration and login
2. **Private Messages**: One-to-one messaging
3. **Typing Indicators**: Show when users are typing
4. **Online Status**: Display online/offline users
5. **File Uploads**: Share images and files
6. **Message Reactions**: React to messages with emojis
7. **Message Editing**: Allow users to edit their messages
8. **Search Functionality**: Search messages within chatrooms
9. **User Roles**: Admin, moderator, and user roles
10. **Message Notifications**: Push notifications for new messages

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify MySQL is running
   - Check credentials in `app.module.ts`
   - Ensure `chatroom_db` database exists

2. **Port Already in Use**
   - Change port in `main.ts`
   - Kill process using port 3000: `npx kill-port 3000`

3. **CORS Errors**
   - Add your frontend URL to CORS origins in `main.ts`

4. **WebSocket Connection Failed**
   - Check Socket.IO CORS configuration
   - Verify frontend is connecting to correct URL

## License

UNLICENSED

## Support

For issues or questions, please refer to the project repository or contact the development team.

---

**Last Updated**: January 13, 2026
**Version**: 0.0.1

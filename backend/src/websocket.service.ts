import { Injectable } from '@nestjs/common';
import { WebSocketServer } from 'ws';
import { ChatroomService } from './chatroom.service';

interface UserData {
  username: string;
  roomId: string;
  ws: any;
}

@Injectable()
export class WebSocketService {
  private wss: WebSocketServer;
  private users = new Map<string, UserData>();
  private static instance: WebSocketService;

  constructor(
    private server: any,
    private chatroomService: ChatroomService,
  ) {
    WebSocketService.instance = this;
  }

  static getInstance(): WebSocketService {
    return WebSocketService.instance;
  }

  initialize() {
    try {
      // Create WebSocket server on port 3001 instead of attaching to HTTP server
      this.wss = new WebSocketServer({ port: 3001 });
      console.log('WebSocket server initialized successfully on port 3001');

      this.wss.on('connection', (ws) => {
        console.log('Native WebSocket client connected');

        ws.on('message', async (data) => {
          try {
            const message = JSON.parse(data.toString());
            await this.handleMessage(ws, message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
          }
        });

      ws.on('close', () => {
        console.log('Native WebSocket client disconnected');
        // Remove user from users map
        for (const [key, userData] of this.users.entries()) {
          if (userData.ws === ws) {
            this.users.delete(key);
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
    } catch (error) {
      console.error('Failed to initialize WebSocket server:', error);
    }
  }

  private async handleMessage(ws: any, message: any) {
    switch (message.type) {
      case 'join-room':
        await this.handleJoinRoom(ws, message);
        break;
      case 'send-message':
        await this.handleSendMessage(ws, message);
        break;
      default:
        ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
    }
  }

  private async handleJoinRoom(ws: any, message: any) {
    const { username, roomId } = message;

    // Create user data
    const userData: UserData = {
      username,
      roomId,
      ws
    };

    // Generate unique ID for user
    const userId = `${username}_${Date.now()}`;
    this.users.set(userId, userData);

    console.log(`${username} joined room ${roomId}`);

    try {
      // Send room history
      const messages = await this.chatroomService.getMessages(roomId);
      ws.send(JSON.stringify({
        type: 'room-history',
        messages
      }));
    } catch (error) {
      console.error('Error loading room history:', error);
      ws.send(JSON.stringify({
        type: 'room-history',
        messages: []
      }));
    }
  }

  private async handleSendMessage(ws: any, message: any) {
    // Find user by WebSocket connection
    let userData: UserData | undefined;
    for (const data of this.users.values()) {
      if (data.ws === ws) {
        userData = data;
        break;
      }
    }

    if (!userData) {
      ws.send(JSON.stringify({ type: 'error', message: 'User not authenticated' }));
      return;
    }

    try {
      const newMessage = await this.chatroomService.addMessage(
        userData.roomId,
        userData.username,
        message.message
      );

      // Broadcast to all users in the same room
      const broadcastMessage = {
        type: 'message',
        ...newMessage
      };

      for (const user of this.users.values()) {
        if (user.roomId === userData.roomId && user.ws.readyState === 1) {
          user.ws.send(JSON.stringify(broadcastMessage));
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      ws.send(JSON.stringify({ type: 'error', message: error.message }));
    }
  }

  // Method to broadcast chatroom creation
  broadcastChatroomCreated(chatroom: any) {
    const message = {
      type: 'chatroom-created',
      ...chatroom
    };

    for (const user of this.users.values()) {
      if (user.ws.readyState === 1) {
        user.ws.send(JSON.stringify(message));
      }
    }
  }
}
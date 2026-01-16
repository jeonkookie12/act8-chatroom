import {
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatroomService } from './chatroom.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class ChatroomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatroomService: ChatroomService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @MessageBody() data: { username: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { username, roomId } = data;

    // Join the room
    client.join(roomId);

    console.log(`${username} joined room ${roomId}`);

    try {
      // Send room history
      const messages = await this.chatroomService.getMessages(roomId);
      client.emit('room-history', { messages, roomId });
    } catch (error) {
      console.error('Error loading room history:', error);
      client.emit('error', { message: 'Failed to load room history' });
    }
  }

  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: { username: string; message: string; roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { username, message, roomId } = data;

    console.log(`Processing message from ${username} in room ${roomId}: ${message}`);

    try {
      // Step 1: Validate and process the message
      if (!username || !message || !roomId) {
        throw new Error('Missing required fields');
      }

      if (message.trim().length === 0) {
        throw new Error('Message cannot be empty');
      }

      // Step 2: Save message to database
      console.log('Saving message to database...');
      const savedMessage = await this.chatroomService.addMessage(roomId, username, message);
      console.log('Message saved successfully:', savedMessage);

      // Step 3: Broadcast to all clients in the room (including sender)
      console.log('Broadcasting message to room:', roomId);
      this.server.to(roomId).emit('message', savedMessage);

    } catch (error) {
      console.error('Error sending message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  // Method to broadcast room creation
  broadcastRoomCreated(room: any) {
    this.server.emit('chatroom-created', room);
  }

  @SubscribeMessage('delete-message')
  async handleDeleteMessage(
    @MessageBody() data: { username: string; roomId: string; messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { username, roomId, messageId } = data;

    console.log(`Processing delete message request from ${username} for message ${messageId} in room ${roomId}`);

    try {
      const deleted = await this.chatroomService.deleteMessage(roomId, messageId, username);
      if (deleted) {
        // Broadcast deletion to all clients in the room
        this.server.to(roomId).emit('message-deleted', { messageId, roomId });
        client.emit('delete-success', { messageId });
      } else {
        client.emit('delete-error', { message: 'Message not found or you can only delete your own messages' });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      client.emit('delete-error', { message: 'Failed to delete message' });
    }
  }

  @SubscribeMessage('delete-room')
  async handleDeleteRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId } = data;

    console.log(`Processing delete room request for room ${roomId}`);

    try {
      const deleted = await this.chatroomService.deleteChatroom(roomId);
      if (deleted) {
        // Broadcast room deletion to all clients
        this.server.emit('chatroom-deleted', { roomId });
        client.emit('delete-room-success', { roomId });
      } else {
        client.emit('delete-room-error', { message: 'Room not found or cannot be deleted' });
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      client.emit('delete-room-error', { message: 'Failed to delete room' });
    }
  }
}
import { Controller, Get, Post, Body, Param, NotFoundException, BadRequestException, Delete } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
// import { ChatroomGateway } from './chatroom.gateway';

@Controller('chatrooms')
export class ChatroomController {
  constructor(
    private readonly chatroomService: ChatroomService,
    // private readonly chatroomGateway: ChatroomGateway,
  ) {}

  @Get()
  async getAllChatrooms() {
    console.log('GET /api/chatrooms called');
    const rooms = await this.chatroomService.getAllChatrooms();
    console.log('Returning rooms:', rooms);
    return rooms;
  }

  @Post()
  async createChatroom(@Body() body: { name: string }) {
    console.log('=== CREATE CHATROOM REQUEST ===');
    console.log('Raw body:', JSON.stringify(body));
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body));
    console.log('Body values:', Object.values(body));
    try {
      const { name } = body;
      console.log('Extracted name:', `"${name}"`, 'Type:', typeof name, 'Length:', name ? name.length : 'undefined');
      console.log('✅ Name validation passed');
      if (!name || !name.trim()) {
        console.log('❌ Name validation failed - name is empty or whitespace');
        throw new BadRequestException('Chatroom name is required');
      }
      const newRoom = await this.chatroomService.createChatroom(name);
      const roomData = {
        id: newRoom.id,
        name: newRoom.name,
        messageCount: newRoom.messageCount
      };

      // Broadcast room creation to all connected WebSocket clients
      // this.chatroomGateway.broadcastRoomCreated(roomData);

      return roomData;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':roomId/messages')
  async getMessages(@Param('roomId') roomId: string) {
    try {
      const messages = await this.chatroomService.getMessages(roomId);
      return messages;
    } catch (error) {
      throw new NotFoundException('Chatroom not found');
    }
  }

  @Post(':roomId/messages')
  async sendMessage(
    @Param('roomId') roomId: string,
    @Body() body: { username: string; message: string }
  ) {
    try {
      const { username, message } = body;
      if (!username || !message) {
        throw new BadRequestException('Username and message are required');
      }
      const newMessage = await this.chatroomService.addMessage(roomId, username, message);

      return newMessage;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':roomId/messages/:messageId')
  async deleteMessage(
    @Param('roomId') roomId: string,
    @Param('messageId') messageId: string,
    @Body() body: { username: string }
  ) {
    try {
      const { username } = body;
      if (!username) {
        throw new BadRequestException('Username is required');
      }
      const deleted = await this.chatroomService.deleteMessage(roomId, messageId, username);
      if (!deleted) {
        throw new NotFoundException('Message not found or you can only delete your own messages');
      }
      return { success: true };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':roomId')
  async deleteChatroom(@Param('roomId') roomId: string) {
    try {
      const deleted = await this.chatroomService.deleteChatroom(roomId);
      if (!deleted) {
        throw new NotFoundException('Chatroom not found');
      }
      return { success: true };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chatroom as ChatroomEntity } from './chatroom.entity';
import { Message as MessageEntity } from './message.entity';

export interface Chatroom {
  id: string;
  name: string;
  messageCount: number;
}

export interface Message {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  roomId: string;
}

@Injectable()
export class ChatroomService implements OnModuleInit {
  constructor(
    @InjectRepository(ChatroomEntity)
    private chatroomRepository: Repository<ChatroomEntity>,
    @InjectRepository(MessageEntity)
    private messageRepository: Repository<MessageEntity>,
  ) {}

  async onModuleInit() {
    // Initialize database connection
    // Default rooms removed - users can create their own rooms
  }

  async getAllChatrooms(): Promise<Chatroom[]> {
    const chatrooms = await this.chatroomRepository.find();
    const chatroomsWithCount = await Promise.all(
      chatrooms.map(async (room) => {
        const messageCount = await this.messageRepository.count({ where: { roomId: room.id } });
        return {
          id: room.id,
          name: room.name,
          messageCount,
        };
      })
    );
    return chatroomsWithCount;
  }

  async createChatroom(name: string): Promise<Chatroom> {
    // Check if room name already exists
    const existingRoom = await this.chatroomRepository.findOne({ where: { name: name.toLowerCase() } });
    if (existingRoom) {
      throw new Error('Chatroom name already exists');
    }

    const newRoom = this.chatroomRepository.create({
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
    });

    await this.chatroomRepository.save(newRoom);

    return {
      id: newRoom.id,
      name: newRoom.name,
      messageCount: 0,
    };
  }

  async getChatroomById(id: string): Promise<Chatroom | null> {
    const room = await this.chatroomRepository.findOne({ where: { id } });
    if (!room) return null;

    const messageCount = await this.messageRepository.count({ where: { roomId: id } });
    return {
      id: room.id,
      name: room.name,
      messageCount,
    };
  }

  async getMessages(roomId: string): Promise<Message[]> {
    const messages = await this.messageRepository.find({
      where: { roomId },
      order: { timestamp: 'ASC' },
    });

    return messages.map(msg => ({
      id: msg.id,
      username: msg.username,
      message: msg.message,
      timestamp: msg.timestamp.toISOString(),
      roomId: msg.roomId,
    }));
  }

  async addMessage(roomId: string, username: string, message: string): Promise<Message> {
    const room = await this.chatroomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new Error('Chatroom not found');
    }

    const newMessage = this.messageRepository.create({
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      username,
      message,
    });

    await this.messageRepository.save(newMessage);

    return {
      id: newMessage.id,
      username: newMessage.username,
      message: newMessage.message,
      timestamp: newMessage.timestamp.toISOString(),
      roomId: newMessage.roomId,
    };
  }

  async deleteMessage(roomId: string, messageId: string, username: string): Promise<boolean> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId, roomId, username }
    });

    if (!message) {
      return false;
    }

    await this.messageRepository.remove(message);
    return true;
  }

  async deleteChatroom(roomId: string): Promise<boolean> {
    const room = await this.chatroomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      return false;
    }

    // Delete all messages in the room first
    await this.messageRepository.delete({ roomId });

    // Then delete the room
    await this.chatroomRepository.remove(room);

    return true;
  }
}
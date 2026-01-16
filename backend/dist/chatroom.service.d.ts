import { OnModuleInit } from '@nestjs/common';
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
export declare class ChatroomService implements OnModuleInit {
    private chatroomRepository;
    private messageRepository;
    constructor(chatroomRepository: Repository<ChatroomEntity>, messageRepository: Repository<MessageEntity>);
    onModuleInit(): Promise<void>;
    getAllChatrooms(): Promise<Chatroom[]>;
    createChatroom(name: string): Promise<Chatroom>;
    getChatroomById(id: string): Promise<Chatroom | null>;
    getMessages(roomId: string): Promise<Message[]>;
    addMessage(roomId: string, username: string, message: string): Promise<Message>;
    deleteMessage(roomId: string, messageId: string, username: string): Promise<boolean>;
    deleteChatroom(roomId: string): Promise<boolean>;
}

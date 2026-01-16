import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatroomService } from './chatroom.service';
export declare class ChatroomGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatroomService;
    server: Server;
    constructor(chatroomService: ChatroomService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleJoinRoom(data: {
        username: string;
        roomId: string;
    }, client: Socket): Promise<void>;
    handleSendMessage(data: {
        username: string;
        message: string;
        roomId: string;
    }, client: Socket): Promise<void>;
    broadcastRoomCreated(room: any): void;
    handleDeleteMessage(data: {
        username: string;
        roomId: string;
        messageId: string;
    }, client: Socket): Promise<void>;
    handleDeleteRoom(data: {
        roomId: string;
    }, client: Socket): Promise<void>;
}

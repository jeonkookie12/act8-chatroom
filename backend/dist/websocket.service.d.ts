import { ChatroomService } from './chatroom.service';
export declare class WebSocketService {
    private server;
    private chatroomService;
    private wss;
    private users;
    private static instance;
    constructor(server: any, chatroomService: ChatroomService);
    static getInstance(): WebSocketService;
    initialize(): void;
    private handleMessage;
    private handleJoinRoom;
    private handleSendMessage;
    broadcastChatroomCreated(chatroom: any): void;
}

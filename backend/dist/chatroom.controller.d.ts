import { ChatroomService } from './chatroom.service';
export declare class ChatroomController {
    private readonly chatroomService;
    constructor(chatroomService: ChatroomService);
    getAllChatrooms(): Promise<import("./chatroom.service").Chatroom[]>;
    createChatroom(body: {
        name: string;
    }): Promise<{
        id: string;
        name: string;
        messageCount: number;
    }>;
    getMessages(roomId: string): Promise<import("./chatroom.service").Message[]>;
    sendMessage(roomId: string, body: {
        username: string;
        message: string;
    }): Promise<import("./chatroom.service").Message>;
    deleteMessage(roomId: string, messageId: string, body: {
        username: string;
    }): Promise<{
        success: boolean;
    }>;
    deleteChatroom(roomId: string): Promise<{
        success: boolean;
    }>;
}

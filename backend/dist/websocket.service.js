"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WebSocketService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketService = void 0;
const common_1 = require("@nestjs/common");
const ws_1 = require("ws");
const chatroom_service_1 = require("./chatroom.service");
let WebSocketService = class WebSocketService {
    static { WebSocketService_1 = this; }
    server;
    chatroomService;
    wss;
    users = new Map();
    static instance;
    constructor(server, chatroomService) {
        this.server = server;
        this.chatroomService = chatroomService;
        WebSocketService_1.instance = this;
    }
    static getInstance() {
        return WebSocketService_1.instance;
    }
    initialize() {
        try {
            this.wss = new ws_1.WebSocketServer({ port: 3001 });
            console.log('WebSocket server initialized successfully on port 3001');
            this.wss.on('connection', (ws) => {
                console.log('Native WebSocket client connected');
                ws.on('message', async (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        await this.handleMessage(ws, message);
                    }
                    catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
                    }
                });
                ws.on('close', () => {
                    console.log('Native WebSocket client disconnected');
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
        }
        catch (error) {
            console.error('Failed to initialize WebSocket server:', error);
        }
    }
    async handleMessage(ws, message) {
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
    async handleJoinRoom(ws, message) {
        const { username, roomId } = message;
        const userData = {
            username,
            roomId,
            ws
        };
        const userId = `${username}_${Date.now()}`;
        this.users.set(userId, userData);
        console.log(`${username} joined room ${roomId}`);
        try {
            const messages = await this.chatroomService.getMessages(roomId);
            ws.send(JSON.stringify({
                type: 'room-history',
                messages
            }));
        }
        catch (error) {
            console.error('Error loading room history:', error);
            ws.send(JSON.stringify({
                type: 'room-history',
                messages: []
            }));
        }
    }
    async handleSendMessage(ws, message) {
        let userData;
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
            const newMessage = await this.chatroomService.addMessage(userData.roomId, userData.username, message.message);
            const broadcastMessage = {
                type: 'message',
                ...newMessage
            };
            for (const user of this.users.values()) {
                if (user.roomId === userData.roomId && user.ws.readyState === 1) {
                    user.ws.send(JSON.stringify(broadcastMessage));
                }
            }
        }
        catch (error) {
            console.error('Error sending message:', error);
            ws.send(JSON.stringify({ type: 'error', message: error.message }));
        }
    }
    broadcastChatroomCreated(chatroom) {
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
};
exports.WebSocketService = WebSocketService;
exports.WebSocketService = WebSocketService = WebSocketService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, chatroom_service_1.ChatroomService])
], WebSocketService);
//# sourceMappingURL=websocket.service.js.map
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatroomGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chatroom_service_1 = require("./chatroom.service");
let ChatroomGateway = class ChatroomGateway {
    chatroomService;
    server;
    constructor(chatroomService) {
        this.chatroomService = chatroomService;
    }
    async handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    async handleJoinRoom(data, client) {
        const { username, roomId } = data;
        client.join(roomId);
        console.log(`${username} joined room ${roomId}`);
        try {
            const messages = await this.chatroomService.getMessages(roomId);
            client.emit('room-history', { messages, roomId });
        }
        catch (error) {
            console.error('Error loading room history:', error);
            client.emit('error', { message: 'Failed to load room history' });
        }
    }
    async handleSendMessage(data, client) {
        const { username, message, roomId } = data;
        console.log(`Processing message from ${username} in room ${roomId}: ${message}`);
        try {
            if (!username || !message || !roomId) {
                throw new Error('Missing required fields');
            }
            if (message.trim().length === 0) {
                throw new Error('Message cannot be empty');
            }
            console.log('Saving message to database...');
            const savedMessage = await this.chatroomService.addMessage(roomId, username, message);
            console.log('Message saved successfully:', savedMessage);
            console.log('Broadcasting message to room:', roomId);
            this.server.to(roomId).emit('message', savedMessage);
        }
        catch (error) {
            console.error('Error sending message:', error);
            client.emit('error', { message: 'Failed to send message' });
        }
    }
    broadcastRoomCreated(room) {
        this.server.emit('chatroom-created', room);
    }
    async handleDeleteMessage(data, client) {
        const { username, roomId, messageId } = data;
        console.log(`Processing delete message request from ${username} for message ${messageId} in room ${roomId}`);
        try {
            const deleted = await this.chatroomService.deleteMessage(roomId, messageId, username);
            if (deleted) {
                this.server.to(roomId).emit('message-deleted', { messageId, roomId });
                client.emit('delete-success', { messageId });
            }
            else {
                client.emit('delete-error', { message: 'Message not found or you can only delete your own messages' });
            }
        }
        catch (error) {
            console.error('Error deleting message:', error);
            client.emit('delete-error', { message: 'Failed to delete message' });
        }
    }
    async handleDeleteRoom(data, client) {
        const { roomId } = data;
        console.log(`Processing delete room request for room ${roomId}`);
        try {
            const deleted = await this.chatroomService.deleteChatroom(roomId);
            if (deleted) {
                this.server.emit('chatroom-deleted', { roomId });
                client.emit('delete-room-success', { roomId });
            }
            else {
                client.emit('delete-room-error', { message: 'Room not found or cannot be deleted' });
            }
        }
        catch (error) {
            console.error('Error deleting room:', error);
            client.emit('delete-room-error', { message: 'Failed to delete room' });
        }
    }
};
exports.ChatroomGateway = ChatroomGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatroomGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatroomGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatroomGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete-message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatroomGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete-room'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatroomGateway.prototype, "handleDeleteRoom", null);
exports.ChatroomGateway = ChatroomGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
            methods: ['GET', 'POST'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [chatroom_service_1.ChatroomService])
], ChatroomGateway);
//# sourceMappingURL=chatroom.gateway.js.map
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
exports.ChatroomController = void 0;
const common_1 = require("@nestjs/common");
const chatroom_service_1 = require("./chatroom.service");
let ChatroomController = class ChatroomController {
    chatroomService;
    constructor(chatroomService) {
        this.chatroomService = chatroomService;
    }
    async getAllChatrooms() {
        console.log('GET /api/chatrooms called');
        const rooms = await this.chatroomService.getAllChatrooms();
        console.log('Returning rooms:', rooms);
        return rooms;
    }
    async createChatroom(body) {
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
                throw new common_1.BadRequestException('Chatroom name is required');
            }
            const newRoom = await this.chatroomService.createChatroom(name);
            const roomData = {
                id: newRoom.id,
                name: newRoom.name,
                messageCount: newRoom.messageCount
            };
            return roomData;
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async getMessages(roomId) {
        try {
            const messages = await this.chatroomService.getMessages(roomId);
            return messages;
        }
        catch (error) {
            throw new common_1.NotFoundException('Chatroom not found');
        }
    }
    async sendMessage(roomId, body) {
        try {
            const { username, message } = body;
            if (!username || !message) {
                throw new common_1.BadRequestException('Username and message are required');
            }
            const newMessage = await this.chatroomService.addMessage(roomId, username, message);
            return newMessage;
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async deleteMessage(roomId, messageId, body) {
        try {
            const { username } = body;
            if (!username) {
                throw new common_1.BadRequestException('Username is required');
            }
            const deleted = await this.chatroomService.deleteMessage(roomId, messageId, username);
            if (!deleted) {
                throw new common_1.NotFoundException('Message not found or you can only delete your own messages');
            }
            return { success: true };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
    async deleteChatroom(roomId) {
        try {
            const deleted = await this.chatroomService.deleteChatroom(roomId);
            if (!deleted) {
                throw new common_1.NotFoundException('Chatroom not found');
            }
            return { success: true };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message);
        }
    }
};
exports.ChatroomController = ChatroomController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChatroomController.prototype, "getAllChatrooms", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatroomController.prototype, "createChatroom", null);
__decorate([
    (0, common_1.Get)(':roomId/messages'),
    __param(0, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatroomController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':roomId/messages'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatroomController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Delete)(':roomId/messages/:messageId'),
    __param(0, (0, common_1.Param)('roomId')),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ChatroomController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Delete)(':roomId'),
    __param(0, (0, common_1.Param)('roomId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatroomController.prototype, "deleteChatroom", null);
exports.ChatroomController = ChatroomController = __decorate([
    (0, common_1.Controller)('chatrooms'),
    __metadata("design:paramtypes", [chatroom_service_1.ChatroomService])
], ChatroomController);
//# sourceMappingURL=chatroom.controller.js.map
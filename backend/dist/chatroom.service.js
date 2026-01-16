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
exports.ChatroomService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chatroom_entity_1 = require("./chatroom.entity");
const message_entity_1 = require("./message.entity");
let ChatroomService = class ChatroomService {
    chatroomRepository;
    messageRepository;
    constructor(chatroomRepository, messageRepository) {
        this.chatroomRepository = chatroomRepository;
        this.messageRepository = messageRepository;
    }
    async onModuleInit() {
    }
    async getAllChatrooms() {
        const chatrooms = await this.chatroomRepository.find();
        const chatroomsWithCount = await Promise.all(chatrooms.map(async (room) => {
            const messageCount = await this.messageRepository.count({ where: { roomId: room.id } });
            return {
                id: room.id,
                name: room.name,
                messageCount,
            };
        }));
        return chatroomsWithCount;
    }
    async createChatroom(name) {
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
    async getChatroomById(id) {
        const room = await this.chatroomRepository.findOne({ where: { id } });
        if (!room)
            return null;
        const messageCount = await this.messageRepository.count({ where: { roomId: id } });
        return {
            id: room.id,
            name: room.name,
            messageCount,
        };
    }
    async getMessages(roomId) {
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
    async addMessage(roomId, username, message) {
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
    async deleteMessage(roomId, messageId, username) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId, roomId, username }
        });
        if (!message) {
            return false;
        }
        await this.messageRepository.remove(message);
        return true;
    }
    async deleteChatroom(roomId) {
        const room = await this.chatroomRepository.findOne({ where: { id: roomId } });
        if (!room) {
            return false;
        }
        await this.messageRepository.delete({ roomId });
        await this.chatroomRepository.remove(room);
        return true;
    }
};
exports.ChatroomService = ChatroomService;
exports.ChatroomService = ChatroomService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chatroom_entity_1.Chatroom)),
    __param(1, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatroomService);
//# sourceMappingURL=chatroom.service.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatroomModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chatroom_controller_1 = require("./chatroom.controller");
const chatroom_service_1 = require("./chatroom.service");
const chatroom_gateway_1 = require("./chatroom.gateway");
const chatroom_entity_1 = require("./chatroom.entity");
const message_entity_1 = require("./message.entity");
let ChatroomModule = class ChatroomModule {
};
exports.ChatroomModule = ChatroomModule;
exports.ChatroomModule = ChatroomModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([chatroom_entity_1.Chatroom, message_entity_1.Message])],
        controllers: [chatroom_controller_1.ChatroomController],
        providers: [chatroom_service_1.ChatroomService, chatroom_gateway_1.ChatroomGateway],
        exports: [chatroom_service_1.ChatroomService, chatroom_gateway_1.ChatroomGateway],
    })
], ChatroomModule);
//# sourceMappingURL=chatroom.module.js.map
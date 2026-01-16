import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatroomController } from './chatroom.controller';
import { ChatroomService } from './chatroom.service';
import { ChatroomGateway } from './chatroom.gateway';
import { Chatroom } from './chatroom.entity';
import { Message } from './message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chatroom, Message])],
  controllers: [ChatroomController],
  providers: [ChatroomService, ChatroomGateway],
  exports: [ChatroomService, ChatroomGateway],
})
export class ChatroomModule {}
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ name: 'room_id', type: 'varchar', length: 50 })
  roomId: string;

  @Column({ type: 'varchar', length: 50 })
  username: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne('Chatroom', (chatroom: any) => chatroom.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  chatroom: any;
}
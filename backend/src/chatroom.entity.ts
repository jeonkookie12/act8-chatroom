import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn } from 'typeorm';

@Entity('chatrooms')
export class Chatroom {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany('Message', (message: any) => message.chatroom)
  messages: any[];
}

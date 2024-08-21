import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

type FeedFlagStatusStatus = 'none' | 'spam' | 'takedown' | 'other' | 'always-allow'

@Entity('feed_flag_status')
export class FeedFlagStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'text',
    unique: true,
    enum: ['none', 'spam', 'takedown', 'other', 'always-allow'],
  })
  status!: FeedFlagStatusStatus;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}

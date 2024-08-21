import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
  UpdateDateColumn } from 'typeorm';
import { FeedFlagStatus } from './feedFlagStatus';

@Entity('feed')
export class Feed {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  url!: string;

  @ManyToOne(() => FeedFlagStatus, feedFlagStatus => feedFlagStatus.id)
  feed_flag_status_id!: FeedFlagStatus;

  @Column({ type: 'timestamp', nullable: true })
  is_parsing!: Date | null;

  @Column({ type: 'int', default: 0 })
  parsing_priority!: number;

  @Column({ type: 'varchar', nullable: true })
  container_id!: string | null;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at!: Date;
}

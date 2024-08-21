import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
  UpdateDateColumn, JoinColumn} from 'typeorm';
import { FeedFlagStatus, FeedFlagStatusStatusEnum } from '@orm/entities/feed/feedFlagStatus';

@Entity('feed')
export class Feed {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  url!: string;

  @ManyToOne(() => FeedFlagStatus, feedFlagStatus => feedFlagStatus.id)
  @JoinColumn({ name: 'feed_flag_status_id' }) 
  feed_flag_status_id!: FeedFlagStatusStatusEnum;

  @Column({ type: 'timestamp', nullable: true })
  is_parsing!: Date | null;

  @Column({ type: 'int', default: 0 })
  parsing_priority!: number;

  @Column({ type: 'varchar', nullable: true })
  container_id!: string | null;
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany} from 'typeorm';
import { Channel } from '@orm/entities/channel/channel';
import { FeedFlagStatus } from '@orm/entities/feed/feedFlagStatus';
import { FeedLog } from './feedLog';

@Entity('feed')
export class Feed {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', unique: true })
  url!: string;

  @ManyToOne(() => FeedFlagStatus, feed_flag_status => feed_flag_status.id)
  @JoinColumn({ name: 'feed_flag_status_id' })
  feed_flag_status!: FeedFlagStatus;

  @OneToOne(() => FeedLog, feedLog => feedLog.feed)
  feed_log!: FeedLog;

  @Column({ type: 'timestamp', nullable: true })
  is_parsing!: Date | null;

  @Column({ type: 'int', default: 0 })
  parsing_priority!: number;

  @Column({ type: 'varchar', nullable: true })
  container_id!: string | null;

  @OneToOne(() => Channel, channel => channel.feed)
  channel!: Channel;
}

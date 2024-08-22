import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Feed } from './feed';

export enum FeedFlagStatusStatusEnum {
  None = 1,
  Spam = 2,
  Takedown = 3,
  Other = 4,
  AlwaysAllow = 5,
}

@Entity('feed_flag_status')
export class FeedFlagStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: FeedFlagStatusStatusEnum,
    default: FeedFlagStatusStatusEnum.None,
  })
  status!: FeedFlagStatusStatusEnum;

  @OneToMany(() => Feed, feed => feed.feed_flag_status)
  feeds!: Feed[];
}

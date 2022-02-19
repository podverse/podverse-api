import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Episode } from '.'

type LiveItemStatus = 'pending' | 'live' | 'ended'

@Entity('liveItem')
export class LiveItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  end: Date | null

  @Column()
  start: Date

  @Column()
  status: LiveItemStatus

  @OneToOne((type) => Episode, (episode) => episode.liveItem, {
    nullable: false,
    onDelete: 'CASCADE'
  })
  @JoinColumn()
  episode: Episode

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

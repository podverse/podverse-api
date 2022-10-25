import { LiveItemStatus } from 'podverse-shared'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'
import { Episode } from '.'

@Entity('liveItems')
export class LiveItem {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  chatIRCURL?: string

  @Index()
  @Column({
    type: 'date',
    nullable: true
  })
  end: Date | null

  @Index()
  @Column()
  start: Date

  @Index()
  @Column()
  status: LiveItemStatus

  @OneToOne(() => Episode, (episode) => episode.liveItem, {
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

import { IsInt, Min, ValidateIf } from 'class-validator'
import { Episode } from '~/entities'
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn
} from 'typeorm'
import { StatsTimeFrames, timeframeEnumValues } from '~/lib/stats'

@Entity('stats_episode')
export class StatsEpisode {
  @PrimaryColumn()
  id: string

  @Index()
  @ValidateIf((a) => a.play_count != null)
  @IsInt()
  @Min(0)
  @Column({ default: 0 })
  play_count: number

  @Index()
  @Column({
    type: 'enum',
    enum: timeframeEnumValues,
    nullable: false
  })
  timeframe: StatsTimeFrames

  @Index()
  @ManyToOne(() => Episode, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'episode_id' })
  episode: Episode

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

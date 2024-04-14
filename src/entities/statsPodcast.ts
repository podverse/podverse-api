import { IsInt, Min, ValidateIf } from 'class-validator'
import { Podcast } from '~/entities'
import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm'
import { StatsTimeFrames, timeframeEnumValues } from '~/lib/stats'

@Entity('stats_podcast')
export class StatsPodcast {
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
  @OneToOne(() => Podcast, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'podcast_id' })
  podcast: Podcast

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

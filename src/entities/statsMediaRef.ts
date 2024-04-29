import { IsInt, Min, ValidateIf } from 'class-validator'
import { MediaRef } from '~/entities'
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

@Entity('stats_media_ref')
export class StatsMediaRef {
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
  @ManyToOne(() => MediaRef, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'media_ref_id' })
  mediaRef: MediaRef

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}

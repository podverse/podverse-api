import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Queue } from '@/entities/queue/queue';

@Entity()
export class QueueResourceBase {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Queue, queue => queue.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'queue_id' })
  queue!: Queue;

  @Column({ type: 'numeric' })
  listPosition!: number;

  @Column({ type: 'numeric', default: 0 })
  playbackPosition!: number;

  @Column({ type: 'float', default: 0 })
  mediaFileDuration!: number;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;
}

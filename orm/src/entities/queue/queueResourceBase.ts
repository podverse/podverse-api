import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Queue } from '@orm/entities/queue/queue';

@Entity()
export class QueueResourceBase {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Queue, queue => queue.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'queue_id' })
  queue!: Queue;

  @Column({ type: 'numeric' })
  list_position!: number;

  @Column({ type: 'numeric', default: 0 })
  playback_position!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  media_file_duration!: string;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;
}

import { Entity, JoinColumn, ManyToOne, Unique } from "typeorm";
import { Clip } from "@/entities/clip";
import { QueueResourceBase } from "@/entities/queue/queueResourceBase";

@Entity()
@Unique(['queue'])
export class QueueResourceClip extends QueueResourceBase {
  @ManyToOne(() => Clip, clip => clip.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clip_id' })
  clip!: Clip;
}
import { Column, Entity, Unique } from "typeorm";
import { QueueResourceBase } from "@/entities/queue/queueResourceBase";

@Entity()
@Unique(['queue'])
export class QueueResourceItemAddByRss extends QueueResourceBase {
  @Column({ type: 'jsonb' })
  resourceData!: object;
}
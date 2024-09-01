import { Column, Entity, Unique } from "typeorm";
import { QueueResourceBase } from "@orm/entities/queue/queueResourceBase";

@Entity()
@Unique(['queue'])
export class QueueResourceItemAddByRss extends QueueResourceBase {
  @Column({ type: 'jsonb' })
  resource_data!: object;
}
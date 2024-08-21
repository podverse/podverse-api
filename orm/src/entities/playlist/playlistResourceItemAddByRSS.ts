import { Column, Entity } from "typeorm";
import { PlaylistResourceBase } from "@orm/entities/playlist/playlistResourceBase";

@Entity()
export class PlaylistResourceItemAddByRss extends PlaylistResourceBase {
  @Column({ type: 'jsonb' })
  resource_data!: object;
}
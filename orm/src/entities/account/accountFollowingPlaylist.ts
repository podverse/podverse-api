import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@orm/entities/account/account';
import { Playlist } from '@orm/entities/playlist/playlist';

@Entity()
export class AccountFollowingPlaylist {
  @PrimaryColumn()
  account_id!: number;

  @PrimaryColumn()
  playlist_id!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => Playlist, playlist => playlist.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlist_id' })
  playlist!: Playlist;
}
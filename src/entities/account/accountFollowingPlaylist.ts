import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Account } from '@/entities/account/account';
import { Playlist } from '@/entities/playlist/playlist';

@Entity()
export class AccountFollowingPlaylist {
  @PrimaryColumn()
  accountId!: number;

  @PrimaryColumn()
  playlistId!: number;

  @ManyToOne(() => Account, account => account.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account!: Account;

  @ManyToOne(() => Playlist, playlist => playlist.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlist_id' })
  playlist!: Playlist;
}
import { DataSource } from "typeorm";
import { config } from "@/config";
import { Account } from "@/entities/account/account";
import { AccountAdminRoles } from "@/entities/account/accountAdminRoles";
import { AccountAppStorePurchase } from "@/entities/account/accountAppStorePurchase";
import { AccountCredentials } from "@/entities/account/accountCredentials";
import { AccountFCMDevice } from "@/entities/account/accountFCMDevice";
import { AccountFollowingAccount } from "@/entities/account/accountFollowingAccount";
import { AccountFollowingAddByRssChannel } from "@/entities/account/accountFollowingAddByRSSChannel";
import { AccountFollowingChannel } from "@/entities/account/accountFollowingChannel";
import { AccountFollowingPlaylist } from "@/entities/account/accountFollowingPlaylist";
import { AccountGooglePlayPurchase } from "@/entities/account/accountGooglePlayPurchase";
import { AccountMembership } from "@/entities/account/accountMembership";
import { AccountMembershipStatus } from "@/entities/account/accountMembershipStatus";
import { AccountNotification } from "@/entities/account/accountNotification";
import { AccountPaypalOrder } from "@/entities/account/accountPayPalOrder";
import { AccountProfile } from "@/entities/account/accountProfile";
import { AccountResetPassword } from "@/entities/account/accountResetPassword";
import { AccountUpDevice } from "@/entities/account/accountUPDevice";
import { AccountVerification } from "@/entities/account/accountVerification";
import { Category } from "@/entities/category";
import { Feed } from "@/entities/feed/feed";
import { FeedFlagStatus } from "@/entities/feed/feedFlagStatus";
import { FeedLog } from "@/entities/feed/feedLog";
import { MediumValue } from "@/entities/mediumValue";
import { Channel } from "@/entities/channel/channel";
import { ChannelAbout } from "@/entities/channel/channelAbout";
import { ChannelCategory } from "@/entities/channel/channelCategory";
import { ChannelChat } from "@/entities/channel/channelChat";
import { ChannelDescription } from "@/entities/channel/channelDescription";
import { ChannelFunding } from "@/entities/channel/channelFunding";
import { ChannelImage } from "@/entities/channel/channelImage";
import { ChannelInternalSettings } from "@/entities/channel/channelInternalSettings";
import { ChannelItunesType } from "@/entities/channel/channelItunesType";
import { ChannelLicense } from "@/entities/channel/channelLicense";
import { ChannelLocation } from "@/entities/channel/channelLocation";
import { ChannelPerson } from "@/entities/channel/channelPerson";
import { ChannelPodroll } from "@/entities/channel/channelPodroll";
import { ChannelPodrollRemoteItem } from "@/entities/channel/channelPodrollRemoteItem";
import { ChannelPublisher } from "@/entities/channel/channelPublisher";
import { ChannelPublisherRemoteItem } from "@/entities/channel/channelPublisherRemoteItem";
import { ChannelRemoteItem } from "@/entities/channel/channelRemoteItem";
import { ChannelSeason } from "@/entities/channel/channelSeason";
import { ChannelSocialInteract } from "@/entities/channel/channelSocialInteract";
import { ChannelTrailer } from "@/entities/channel/channelTrailer";
import { ChannelTxtTag } from "@/entities/channel/channelTxt";
import { ChannelValueTag } from "@/entities/channel/channelValueTag";
import { ChannelValueTagReceipient } from "@/entities/channel/channelValueTagRecipient";
import { ChannelValueTagTimeSplit } from "@/entities/channel/channelValueTagTimeSplit";
import { ChannelValueTagTimeSplitReceipient } from "@/entities/channel/channelValueTagTimeSplitRecipient";
import { ChannelValueTagTimeSplitRemoteItem } from "@/entities/channel/channelValueTagTimeSplitRemoteItem";
import { Item } from "@/entities/item/item";
import { ItemAbout } from "@/entities/item/itemAbout";
import { ItemChapter } from "@/entities/item/itemChapter";
import { ItemChapterImage } from "@/entities/item/itemChapterImage";
import { ItemChapterLocation } from "@/entities/item/itemChapterLocation";
import { ItemChapters } from "@/entities/item/itemChapters";
import { ItemChat } from "@/entities/item/itemChat";
import { ItemContentLink } from "@/entities/item/itemContentLink";
import { ItemDescription } from "@/entities/item/itemDescription";
import { ItemEnclosure } from "@/entities/item/itemEnclosure";
import { ItemEnclosureIntegrity } from "@/entities/item/itemEnclosureIntegrity";
import { ItemEnclosureSource } from "@/entities/item/itemEnclosureSource";
import { ItemFunding } from "@/entities/item/ItemFunding";
import { ItemImage } from "@/entities/item/itemImage";
import { ItemItunesEpisodeType } from "@/entities/item/itemItunesEpisodeType";
import { ItemLicense } from "@/entities/item/itemLicense";
import { ItemLocation } from "@/entities/item/itemLocation";
import { ItemPerson } from "@/entities/item/itemPerson";
import { ItemSeason } from "@/entities/item/itemSeason";
import { ItemSeasonEpisode } from "@/entities/item/itemSeasonEpisode";
import { ItemSocialInteract } from "@/entities/item/itemSocialInteract";
import { ItemSoundbite } from "@/entities/item/itemSoundbite";
import { ItemTranscript } from "@/entities/item/itemTranscript";
import { ItemTxtTag } from "@/entities/item/itemTxtTag";
import { ItemValueTag } from "@/entities/item/itemValueTag";
import { ItemValueTagRecipient } from "@/entities/item/itemValueTagRecipient";
import { ItemValueTagTimeSplit } from "@/entities/item/itemValueTagTimeSplit";
import { ItemValueTagTimeSplitRecipient } from "@/entities/item/itemValueTagTimeSplitRecipient";
import { ItemValueTagTimeSplitRemoteItem } from "@/entities/item/itemValueTagTimeSplitRemoteItem";
import { LiveItem } from "@/entities/liveItem/liveItem";
import { LiveItemStatus } from "@/entities/liveItem/liveItemStatus";
import { Playlist } from "@/entities/playlist/playlist";
import { PlaylistResourceBase } from "@/entities/playlist/playlistResourceBase";
import { PlaylistResourceClip } from "@/entities/playlist/playlistResourceClip";
import { PlaylistResourceItem } from "@/entities/playlist/playlistResourceItem";
import { PlaylistResourceItemAddByRss } from "@/entities/playlist/playlistResourceItemAddByRSS";
import { PlaylistResourceItemChapter } from "@/entities/playlist/playlistResourceItemChapter";
import { PlaylistResourceItemSoundbite } from "@/entities/playlist/playlistResourceItemSoundbite";
import { Queue } from "@/entities/queue/queue";
import { QueueResourceBase } from "@/entities/queue/queueResourceBase";
import { QueueResourceClip } from "@/entities/queue/queueResourceItemClip";
import { QueueResourceItem } from "@/entities/queue/queueResourceItem";
import { QueueResourceItemAddByRss } from "@/entities/queue/queueResourceItemAddByRSS";
import { QueueResourceItemChapter } from "@/entities/queue/queueResourceItemChapter";
import { QueueResourceItemSoundbite } from "@/entities/queue/queueResourceItemSoundbite";
import { Clip } from "@/entities/clip";
import { MembershipClaimToken } from "@/entities/membershipClaimToken";
import { SharableStatus } from "@/entities/sharableStatus";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false,
  logging: false,
  entities: [
    Account,
    AccountAdminRoles,
    AccountAppStorePurchase,
    AccountCredentials,
    AccountFCMDevice,
    AccountFollowingAccount,
    AccountFollowingAddByRssChannel,
    AccountFollowingChannel,
    AccountFollowingPlaylist,
    AccountGooglePlayPurchase,
    AccountMembership,
    AccountMembershipStatus,
    AccountNotification,
    AccountPaypalOrder,
    AccountProfile,
    AccountResetPassword,
    AccountUpDevice,
    AccountVerification,
    Category,
    Channel,
    ChannelAbout,
    ChannelCategory,
    ChannelChat,
    ChannelDescription,
    ChannelFunding,
    ChannelImage,
    ChannelInternalSettings,
    ChannelItunesType,
    ChannelLicense,
    ChannelLocation,
    ChannelPerson,
    ChannelPodroll,
    ChannelPodrollRemoteItem,
    ChannelPublisher,
    ChannelPublisherRemoteItem,
    ChannelRemoteItem,
    ChannelSeason,
    ChannelSocialInteract,
    ChannelTrailer,
    ChannelTxtTag,
    ChannelValueTag,
    ChannelValueTagReceipient,
    ChannelValueTagTimeSplit,
    ChannelValueTagTimeSplitReceipient,
    ChannelValueTagTimeSplitRemoteItem,
    Clip,
    Feed,
    FeedFlagStatus,
    FeedLog,
    Item,
    ItemAbout,
    ItemChapter,
    ItemChapterImage,
    ItemChapterLocation,
    ItemChapters,
    ItemChat,
    ItemContentLink,
    ItemDescription,
    ItemEnclosure,
    ItemEnclosureIntegrity,
    ItemEnclosureSource,
    ItemFunding,
    ItemImage,
    ItemItunesEpisodeType,
    ItemLicense,
    ItemLocation,
    ItemPerson,
    ItemSeason,
    ItemSeasonEpisode,
    ItemSocialInteract,
    ItemSoundbite,
    ItemTranscript,
    ItemTxtTag,
    ItemValueTag,
    ItemValueTagRecipient,
    ItemValueTagTimeSplit,
    ItemValueTagTimeSplitRecipient,
    ItemValueTagTimeSplitRemoteItem,
    LiveItem,
    LiveItemStatus,
    MembershipClaimToken,
    MediumValue,
    Playlist,
    PlaylistResourceBase,
    PlaylistResourceClip,
    PlaylistResourceItem,
    PlaylistResourceItemAddByRss,
    PlaylistResourceItemChapter,
    PlaylistResourceItemSoundbite,
    Queue,
    QueueResourceBase,
    QueueResourceClip,
    QueueResourceItem,
    QueueResourceItemAddByRss,
    QueueResourceItemChapter,
    QueueResourceItemSoundbite,
    SharableStatus
  ],
  migrations: [],
  subscribers: [],
});

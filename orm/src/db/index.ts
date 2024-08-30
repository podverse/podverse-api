import { DataSource } from "typeorm";
import { config } from "@orm/config";
import { Account } from "@orm/entities/account/account";
import { AccountAdminRoles } from "@orm/entities/account/accountAdminRoles";
import { AccountAppStorePurchase } from "@orm/entities/account/accountAppStorePurchase";
import { AccountCredentials } from "@orm/entities/account/accountCredentials";
import { AccountFCMDevice } from "@orm/entities/account/accountFCMDevice";
import { AccountFollowingAccount } from "@orm/entities/account/accountFollowingAccount";
import { AccountFollowingAddByRssChannel } from "@orm/entities/account/accountFollowingAddByRSSChannel";
import { AccountFollowingChannel } from "@orm/entities/account/accountFollowingChannel";
import { AccountFollowingPlaylist } from "@orm/entities/account/accountFollowingPlaylist";
import { AccountGooglePlayPurchase } from "@orm/entities/account/accountGooglePlayPurchase";
import { AccountMembership } from "@orm/entities/account/accountMembership";
import { AccountMembershipStatus } from "@orm/entities/account/accountMembershipStatus";
import { AccountNotification } from "@orm/entities/account/accountNotification";
import { AccountPaypalOrder } from "@orm/entities/account/accountPayPalOrder";
import { AccountProfile } from "@orm/entities/account/accountProfile";
import { AccountResetPassword } from "@orm/entities/account/accountResetPassword";
import { AccountUpDevice } from "@orm/entities/account/accountUPDevice";
import { AccountVerification } from "@orm/entities/account/accountVerification";
import { Category } from "@orm/entities/category";
import { Feed } from "@orm/entities/feed/feed";
import { FeedFlagStatus } from "@orm/entities/feed/feedFlagStatus";
import { FeedLog } from "@orm/entities/feed/feedLog";
import { Medium } from "@orm/entities/medium";
import { Channel } from "@orm/entities/channel/channel";
import { ChannelAbout } from "@orm/entities/channel/channelAbout";
import { ChannelCategory } from "@orm/entities/channel/channelCategory";
import { ChannelChat } from "@orm/entities/channel/channelChat";
import { ChannelDescription } from "@orm/entities/channel/channelDescription";
import { ChannelFunding } from "@orm/entities/channel/channelFunding";
import { ChannelImage } from "@orm/entities/channel/channelImage";
import { ChannelInternalSettings } from "@orm/entities/channel/channelInternalSettings";
import { ChannelItunesType } from "@orm/entities/channel/channelItunesType";
import { ChannelLicense } from "@orm/entities/channel/channelLicense";
import { ChannelLocation } from "@orm/entities/channel/channelLocation";
import { ChannelPerson } from "@orm/entities/channel/channelPerson";
import { ChannelPodroll } from "@orm/entities/channel/channelPodroll";
import { ChannelPodrollRemoteItem } from "@orm/entities/channel/channelPodrollRemoteItem";
import { ChannelPublisher } from "@orm/entities/channel/channelPublisher";
import { ChannelPublisherRemoteItem } from "@orm/entities/channel/channelPublisherRemoteItem";
import { ChannelRemoteItem } from "@orm/entities/channel/channelRemoteItem";
import { ChannelSeason } from "@orm/entities/channel/channelSeason";
import { ChannelSocialInteract } from "@orm/entities/channel/channelSocialInteract";
import { ChannelTrailer } from "@orm/entities/channel/channelTrailer";
import { ChannelTxt } from "@orm/entities/channel/channelTxt";
import { ChannelValue } from "@orm/entities/channel/channelValue";
import { ChannelValueReceipient } from "@orm/entities/channel/channelValueRecipient";
import { Item } from "@orm/entities/item/item";
import { ItemAbout } from "@orm/entities/item/itemAbout";
import { ItemChapter } from "@orm/entities/item/itemChapter";
import { ItemChapterImage } from "@orm/entities/item/itemChapterImage";
import { ItemChapterLocation } from "@orm/entities/item/itemChapterLocation";
import { ItemChaptersFeed } from "@orm/entities/item/itemChaptersFeed";
import { ItemChaptersFeedLog } from "@orm/entities/item/itemChaptersFeedLog";
import { ItemChat } from "@orm/entities/item/itemChat";
import { ItemContentLink } from "@orm/entities/item/itemContentLink";
import { ItemDescription } from "@orm/entities/item/itemDescription";
import { ItemEnclosure } from "@orm/entities/item/itemEnclosure";
import { ItemEnclosureIntegrity } from "@orm/entities/item/itemEnclosureIntegrity";
import { ItemEnclosureSource } from "@orm/entities/item/itemEnclosureSource";
import { ItemFunding } from "@orm/entities/item/ItemFunding";
import { ItemImage } from "@orm/entities/item/itemImage";
import { ItemItunesEpisodeType } from "@orm/entities/item/itemItunesEpisodeType";
import { ItemLicense } from "@orm/entities/item/itemLicense";
import { ItemLocation } from "@orm/entities/item/itemLocation";
import { ItemPerson } from "@orm/entities/item/itemPerson";
import { ItemSeason } from "@orm/entities/item/itemSeason";
import { ItemSeasonEpisode } from "@orm/entities/item/itemSeasonEpisode";
import { ItemSocialInteract } from "@orm/entities/item/itemSocialInteract";
import { ItemSoundbite } from "@orm/entities/item/itemSoundbite";
import { ItemTranscript } from "@orm/entities/item/itemTranscript";
import { ItemTxt } from "@orm/entities/item/itemTxt";
import { ItemValue } from "@orm/entities/item/itemValue";
import { ItemValueRecipient } from "@orm/entities/item/itemValueRecipient";
import { ItemValueTimeSplit } from "@orm/entities/item/itemValueTimeSplit";
import { ItemValueTimeSplitRecipient } from "@orm/entities/item/itemValueTimeSplitRecipient";
import { ItemValueTimeSplitRemoteItem } from "@orm/entities/item/itemValueTimeSplitRemoteItem";
import { LiveItem } from "@orm/entities/liveItem/liveItem";
import { LiveItemStatus } from "@orm/entities/liveItem/liveItemStatus";
import { Playlist } from "@orm/entities/playlist/playlist";
import { PlaylistResourceBase } from "@orm/entities/playlist/playlistResourceBase";
import { PlaylistResourceClip } from "@orm/entities/playlist/playlistResourceClip";
import { PlaylistResourceItem } from "@orm/entities/playlist/playlistResourceItem";
import { PlaylistResourceItemAddByRss } from "@orm/entities/playlist/playlistResourceItemAddByRSS";
import { PlaylistResourceItemChapter } from "@orm/entities/playlist/playlistResourceItemChapter";
import { PlaylistResourceItemSoundbite } from "@orm/entities/playlist/playlistResourceItemSoundbite";
import { Queue } from "@orm/entities/queue/queue";
import { QueueResourceBase } from "@orm/entities/queue/queueResourceBase";
import { QueueResourceClip } from "@orm/entities/queue/queueResourceItemClip";
import { QueueResourceItem } from "@orm/entities/queue/queueResourceItem";
import { QueueResourceItemAddByRss } from "@orm/entities/queue/queueResourceItemAddByRSS";
import { QueueResourceItemChapter } from "@orm/entities/queue/queueResourceItemChapter";
import { QueueResourceItemSoundbite } from "@orm/entities/queue/queueResourceItemSoundbite";
import { Clip } from "@orm/entities/clip";
import { MembershipClaimToken } from "@orm/entities/membershipClaimToken";
import { SharableStatus } from "@orm/entities/sharableStatus";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";

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
    ChannelTxt,
    ChannelValue,
    ChannelValueReceipient,
    Clip,
    Feed,
    FeedFlagStatus,
    FeedLog,
    Item,
    ItemAbout,
    ItemChapter,
    ItemChapterImage,
    ItemChapterLocation,
    ItemChaptersFeed,
    ItemChaptersFeedLog,
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
    ItemTxt,
    ItemValue,
    ItemValueRecipient,
    ItemValueTimeSplit,
    ItemValueTimeSplitRecipient,
    ItemValueTimeSplitRemoteItem,
    LiveItem,
    LiveItemStatus,
    MembershipClaimToken,
    Medium,
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
  namingStrategy: new SnakeNamingStrategy()
});

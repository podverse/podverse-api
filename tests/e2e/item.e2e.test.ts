import request from 'supertest';
import { config } from '../../src/config';

describe('Item Endpoints', () => {
  describe('GET /channel/:channelIdOrIdText/live-items', () => {
    it('should return a list of live items with the correct structure and values for the first, second, and third items', async () => {
      const channelIdOrIdText = 'sample123'; // Replace with a valid channel ID or ID text from your test database

      const response = await request(globalThis.__API_SERVER__)
        .get(`${config.api.prefix}${config.api.version}/item/channel/${channelIdOrIdText}/live-items`)
        .expect(200);

      const { data, meta } = response.body;

      // Validate meta structure and values
      expect(meta).toHaveProperty('page', 1);

      // Validate data structure and values
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Sort the data by `id` to ensure consistent order
      const sortedData = data.sort((a, b) => a.id - b.id);

      // Validate the first item
      const firstItem = sortedData[0];
      expect(firstItem).toHaveProperty('id', 3);
      expect(firstItem).toHaveProperty('id_text', 'liveitem1');
      expect(firstItem).toHaveProperty('slug', 'live-item-1');
      expect(firstItem).toHaveProperty('guid', 'live-item-guid-1');
      expect(firstItem).toHaveProperty('guid_enclosure_url', 'https://samplechannel.com/live-item1.mp3');
      expect(firstItem).toHaveProperty('pub_date', '2025-01-01T13:00:00.000Z');
      expect(firstItem).toHaveProperty('title', 'Live Item 1');

      // Validate `item_about` for the first item
      expect(firstItem).toHaveProperty('item_about');
      expect(firstItem.item_about).toMatchObject({
        id: 3,
        duration: '10000.00',
        explicit: false,
        website_link_url: 'https://samplechannel.com/live-item1',
        item_itunes_episode_type: {
          id: 1,
          itunes_episode_type: 'full',
        },
      });

      // Validate `item_description`
      expect(firstItem).toHaveProperty('item_description');
      expect(firstItem.item_description).toMatchObject({
        id: 3,
        value: 'This is a sample description for item live 1.',
      });

      // Validate `item_enclosures`
      expect(Array.isArray(firstItem.item_enclosures)).toBe(true);
      const sortedEnclosures1 = firstItem.item_enclosures.sort((a, b) => a.id - b.id);
      expect(sortedEnclosures1).toHaveLength(2);
      expect(sortedEnclosures1[0]).toMatchObject({
        id: 5,
        type: 'audio/mpeg',
        length: 12345678,
        bitrate: 128,
        height: null,
        language: 'en',
        title: 'Sample Enclosure',
        rel: 'alternate',
        codecs: 'mp3',
        item_enclosure_default: true,
        item_enclosure_integrity: null,
        item_enclosure_sources: [
          {
            id: 9,
            uri: 'https://samplechannel.com/live-audio-source1.mp3',
            content_type: 'audio/mpeg',
          },
          {
            id: 10,
            uri: 'https://samplechannel.com/live-audio-source2.mp3',
            content_type: 'audio/mpeg',
          },
        ],
      });
      expect(sortedEnclosures1[1]).toMatchObject({
        id: 6,
        type: 'video/mp4',
        length: 98765432,
        bitrate: 256,
        height: 720,
        language: 'en',
        title: 'Sample Video Enclosure',
        rel: 'alternate',
        codecs: 'mp4',
        item_enclosure_default: false,
        item_enclosure_integrity: null,
        item_enclosure_sources: [
          {
            id: 11,
            uri: 'https://samplechannel.com/live-video-source3.mp4',
            content_type: 'video/mp4',
          },
          {
            id: 12,
            uri: 'https://samplechannel.com/live-video-source4.mp4',
            content_type: 'video/mp4',
          },
        ],
      });

      // Validate `item_images`
      expect(Array.isArray(firstItem.item_images)).toBe(true);
      const sortedImages1 = firstItem.item_images.sort((a, b) => a.id - b.id);
      expect(sortedImages1).toHaveLength(2);
      expect(sortedImages1[0]).toMatchObject({
        id: 5,
        url: 'https://samplechannel.com/live-item-image1.jpg',
        image_width_size: 300,
        is_resized: false,
      });
      expect(sortedImages1[1]).toMatchObject({
        id: 6,
        url: 'https://samplechannel.com/live-item-image2.jpg',
        image_width_size: 500,
        is_resized: true,
      });

      // Validate `item_persons`
      expect(Array.isArray(firstItem.item_persons)).toBe(true);
      expect(firstItem.item_persons).toHaveLength(0);

      // Validate `item_season`
      expect(firstItem).toHaveProperty('item_season', null);

      // Validate `live_item`
      expect(firstItem).toHaveProperty('live_item');
      expect(firstItem.live_item).toMatchObject({
        id: 1,
        start_time: '2025-01-01T13:00:00.000Z',
        end_time: '2025-01-01T14:00:00.000Z',
        chat_web_url: 'https://chat.samplechannel.com/live-item1',
      });

      // Validate the second item
      const secondItem = sortedData[1];
      expect(secondItem).toHaveProperty('id', 4);
      expect(secondItem).toHaveProperty('id_text', 'liveitem2');
      expect(secondItem).toHaveProperty('slug', 'live-item-2');
      expect(secondItem).toHaveProperty('guid', 'live-item-guid-2');
      expect(secondItem).toHaveProperty('guid_enclosure_url', 'https://samplechannel.com/live-item2.mp3');
      expect(secondItem).toHaveProperty('pub_date', '2025-01-01T13:00:00.000Z');
      expect(secondItem).toHaveProperty('title', 'Live Item 2');

      // Validate `item_about` for the second item
      expect(secondItem).toHaveProperty('item_about');
      expect(secondItem.item_about).toMatchObject({
        id: 4,
        duration: '10000.00',
        explicit: false,
        website_link_url: 'https://samplechannel.com/live-item2',
        item_itunes_episode_type: {
          id: 1,
          itunes_episode_type: 'full',
        },
      });

      // Validate `item_description` for the second item
      expect(secondItem).toHaveProperty('item_description');
      expect(secondItem.item_description).toMatchObject({
        id: 4,
        value: 'This is a sample description for item live 2.',
      });

      // Validate `item_enclosures` for the second item
      expect(Array.isArray(secondItem.item_enclosures)).toBe(true);
      const sortedEnclosures2 = secondItem.item_enclosures.sort((a, b) => a.id - b.id);
      expect(sortedEnclosures2).toHaveLength(2);
      expect(sortedEnclosures2[0]).toMatchObject({
        id: 7,
        type: 'audio/mpeg',
        length: 12345678,
        bitrate: 128,
        height: null,
        language: 'en',
        title: 'Sample Enclosure',
        rel: 'alternate',
        codecs: 'mp3',
        item_enclosure_default: true,
        item_enclosure_integrity: null,
        item_enclosure_sources: [
          {
            id: 13,
            uri: 'https://samplechannel.com/live-audio-source3.mp3',
            content_type: 'audio/mpeg',
          },
          {
            id: 14,
            uri: 'https://samplechannel.com/live-audio-source4.mp3',
            content_type: 'audio/mpeg',
          },
        ],
      });
      expect(sortedEnclosures2[1]).toMatchObject({
        id: 8,
        type: 'video/mp4',
        length: 98765432,
        bitrate: 256,
        height: 720,
        language: 'en',
        title: 'Sample Video Enclosure',
        rel: 'alternate',
        codecs: 'mp4',
        item_enclosure_default: false,
        item_enclosure_integrity: null,
        item_enclosure_sources: [
          {
            id: 15,
            uri: 'https://samplechannel.com/live-video-source3.mp4',
            content_type: 'video/mp4',
          },
          {
            id: 16,
            uri: 'https://samplechannel.com/live-video-source4.mp4',
            content_type: 'video/mp4',
          },
        ],
      });

      // Validate `item_images` for the second item
      expect(Array.isArray(secondItem.item_images)).toBe(true);
      const sortedImages2 = secondItem.item_images.sort((a, b) => a.id - b.id);
      expect(sortedImages2).toHaveLength(2);
      expect(sortedImages2[0]).toMatchObject({
        id: 7,
        url: 'https://samplechannel.com/live-item-image3.jpg',
        image_width_size: 300,
        is_resized: false,
      });
      expect(sortedImages2[1]).toMatchObject({
        id: 8,
        url: 'https://samplechannel.com/live-item-image4.jpg',
        image_width_size: 500,
        is_resized: true,
      });

      // Validate `item_persons` for the second item
      expect(Array.isArray(secondItem.item_persons)).toBe(true);
      expect(secondItem.item_persons).toHaveLength(0);

      // Validate `item_season` for the second item
      expect(secondItem).toHaveProperty('item_season', null);

      // Validate `live_item` for the second item
      expect(secondItem).toHaveProperty('live_item');
      expect(secondItem.live_item).toMatchObject({
        id: 2,
        start_time: '2025-01-01T13:00:00.000Z',
        end_time: '2025-01-01T14:00:00.000Z',
        chat_web_url: 'https://chat.samplechannel.com/live-item2',
      });

      // Validate the third item
      const thirdItem = sortedData[2];
      expect(thirdItem).toHaveProperty('id', 5);
      expect(thirdItem).toHaveProperty('id_text', 'liveitem3');
      expect(thirdItem).toHaveProperty('slug', 'live-item-3');
      expect(thirdItem).toHaveProperty('guid', 'live-item-guid-3');
      expect(thirdItem).toHaveProperty('guid_enclosure_url', 'https://samplechannel.com/live-item3.mp3');
      expect(thirdItem).toHaveProperty('pub_date', '2025-01-01T13:00:00.000Z');
      expect(thirdItem).toHaveProperty('title', 'Live Item 3');

      // Validate `item_about` for the third item
      expect(thirdItem).toHaveProperty('item_about');
      expect(thirdItem.item_about).toMatchObject({
        id: 5,
        duration: '10000.00',
        explicit: false,
        website_link_url: 'https://samplechannel.com/live-item3',
        item_itunes_episode_type: {
          id: 1,
          itunes_episode_type: 'full',
        },
      });

      // Validate `item_description` for the third item
      expect(thirdItem).toHaveProperty('item_description');
      expect(thirdItem.item_description).toMatchObject({
        id: 5,
        value: 'This is a sample description for item live 3.',
      });

      // Validate `item_enclosures` for the third item
      expect(Array.isArray(thirdItem.item_enclosures)).toBe(true);
      const sortedEnclosures3 = thirdItem.item_enclosures.sort((a, b) => a.id - b.id);
      expect(sortedEnclosures3).toHaveLength(2);
      expect(sortedEnclosures3[0]).toMatchObject({
        id: 9,
        type: 'audio/mpeg',
        length: 12345678,
        bitrate: 128,
        height: null,
        language: 'en',
        title: 'Sample Enclosure',
        rel: 'alternate',
        codecs: 'mp3',
        item_enclosure_default: true,
        item_enclosure_integrity: null,
        item_enclosure_sources: [
          {
            id: 17,
            uri: 'https://samplechannel.com/live-audio-source5.mp3',
            content_type: 'audio/mpeg',
          },
          {
            id: 18,
            uri: 'https://samplechannel.com/live-audio-source6.mp3',
            content_type: 'audio/mpeg',
          },
        ],
      });
      expect(sortedEnclosures3[1]).toMatchObject({
        id: 10,
        type: 'video/mp4',
        length: 98765432,
        bitrate: 256,
        height: 720,
        language: 'en',
        title: 'Sample Video Enclosure',
        rel: 'alternate',
        codecs: 'mp4',
        item_enclosure_default: false,
        item_enclosure_integrity: null,
        item_enclosure_sources: [
          {
            id: 19,
            uri: 'https://samplechannel.com/live-video-source5.mp4',
            content_type: 'video/mp4',
          },
          {
            id: 20,
            uri: 'https://samplechannel.com/live-video-source6.mp4',
            content_type: 'video/mp4',
          },
        ],
      });

      // Validate `item_images` for the third item
      expect(Array.isArray(thirdItem.item_images)).toBe(true);
      const sortedImages3 = thirdItem.item_images.sort((a, b) => a.id - b.id);
      expect(sortedImages3).toHaveLength(2);
      expect(sortedImages3[0]).toMatchObject({
        id: 9,
        url: 'https://samplechannel.com/live-item-image5.jpg',
        image_width_size: 300,
        is_resized: false,
      });
      expect(sortedImages3[1]).toMatchObject({
        id: 10,
        url: 'https://samplechannel.com/live-item-image6.jpg',
        image_width_size: 500,
        is_resized: true,
      });

      // Validate `item_persons` for the third item
      expect(Array.isArray(thirdItem.item_persons)).toBe(true);
      expect(thirdItem.item_persons).toHaveLength(0);

      // Validate `item_season` for the third item
      expect(thirdItem).toHaveProperty('item_season', null);

      // Validate `live_item` for the third item
      expect(thirdItem).toHaveProperty('live_item');
      expect(thirdItem.live_item).toMatchObject({
        id: 3,
        start_time: '2025-01-01T13:00:00.000Z',
        end_time: '2025-01-01T14:00:00.000Z',
        chat_web_url: 'https://chat.samplechannel.com/live-item3',
      });
    });
  });

  describe('GET /channel/:channelIdOrIdText', () => {
    it('should return a successful response and validate the exact values of the first item', async () => {
      const channelIdOrIdText = 'sample123'; // Replace with a valid channel ID or ID text from your test database

      const response = await request(globalThis.__API_SERVER__)
        .get(`${config.api.prefix}${config.api.version}/item/channel/${channelIdOrIdText}`)
        .expect(200);

      const { data, meta } = response.body;

      // Validate meta structure and values
      expect(meta).toHaveProperty('page', 1);

      // Validate data structure and values
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      // Sort arrays in the first item for consistent validation
      const firstItem = data[0];
      firstItem.item_enclosures.sort((a, b) => a.id - b.id);
      firstItem.item_enclosures.forEach((enclosure) =>
        enclosure.item_enclosure_sources.sort((a, b) => a.id - b.id)
      );
      firstItem.item_images.sort((a, b) => a.id - b.id);
      firstItem.item_persons.sort((a, b) => a.id - b.id);

      // Validate the first item
      expect(firstItem).toHaveProperty('id', 1);
      expect(firstItem).toHaveProperty('id_text', 'item123');
      expect(firstItem).toHaveProperty('slug', 'sample-item');
      expect(firstItem).toHaveProperty('guid', 'item-guid-123');
      expect(firstItem).toHaveProperty('guid_enclosure_url', 'https://samplechannel.com/item.mp3');
      expect(firstItem).toHaveProperty('pub_date', '2025-01-01T13:00:00.000Z');
      expect(firstItem).toHaveProperty('title', 'Sample Item');

      // Validate `item_about`
      expect(firstItem).toHaveProperty('item_about');
      expect(firstItem.item_about).toHaveProperty('id', 1);
      expect(firstItem.item_about).toHaveProperty('duration', '3600.00');
      expect(firstItem.item_about).toHaveProperty('explicit', false);
      expect(firstItem.item_about).toHaveProperty('website_link_url', 'https://samplechannel.com/item');
      expect(firstItem.item_about.item_itunes_episode_type).toHaveProperty('id', 1);
      expect(firstItem.item_about.item_itunes_episode_type).toHaveProperty('itunes_episode_type', 'full');

      // Validate `item_chat`
      expect(firstItem).toHaveProperty('item_chat');
      expect(firstItem.item_chat).toHaveProperty('id', 1);
      expect(firstItem.item_chat).toHaveProperty('server', 'chat.samplechannel.com');
      expect(firstItem.item_chat).toHaveProperty('protocol', 'irc');
      expect(firstItem.item_chat).toHaveProperty('account_id', 'sample_account');
      expect(firstItem.item_chat).toHaveProperty('space', 'sample_space');

      // Validate `item_description`
      expect(firstItem).toHaveProperty('item_description');
      expect(firstItem.item_description).toHaveProperty('id', 1);
      expect(firstItem.item_description).toHaveProperty('value', 'This is a sample description for the item.');

      // Validate `item_enclosures`
      expect(Array.isArray(firstItem.item_enclosures)).toBe(true);
      expect(firstItem.item_enclosures).toHaveLength(2);

      const firstEnclosure = firstItem.item_enclosures[0];
      expect(firstEnclosure).toHaveProperty('id', 1);
      expect(firstEnclosure).toHaveProperty('type', 'audio/mpeg');
      expect(firstEnclosure).toHaveProperty('length', 12345678);
      expect(firstEnclosure).toHaveProperty('bitrate', 128);
      expect(firstEnclosure).toHaveProperty('height', null);
      expect(firstEnclosure).toHaveProperty('language', 'en');
      expect(firstEnclosure).toHaveProperty('title', 'Sample Enclosure');
      expect(firstEnclosure).toHaveProperty('rel', 'alternate');
      expect(firstEnclosure).toHaveProperty('codecs', 'mp3');
      expect(firstEnclosure).toHaveProperty('item_enclosure_default', true);
      expect(firstEnclosure.item_enclosure_integrity).toHaveProperty('id', 1);
      expect(firstEnclosure.item_enclosure_integrity).toHaveProperty('type', 'sri');
      expect(firstEnclosure.item_enclosure_integrity).toHaveProperty(
        'value',
        'sha256-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567'
      );

      const firstEnclosureSource = firstEnclosure.item_enclosure_sources[0];
      expect(firstEnclosureSource).toHaveProperty('id', 1);
      expect(firstEnclosureSource).toHaveProperty('uri', 'https://samplechannel.com/audio-source1.mp3');
      expect(firstEnclosureSource).toHaveProperty('content_type', 'audio/mpeg');

      const secondEnclosureSource = firstEnclosure.item_enclosure_sources[1];
      expect(secondEnclosureSource).toHaveProperty('id', 2);
      expect(secondEnclosureSource).toHaveProperty('uri', 'https://samplechannel.com/audio-source2.mp3');
      expect(secondEnclosureSource).toHaveProperty('content_type', 'audio/mpeg');

      // Validate `item_images`
      expect(Array.isArray(firstItem.item_images)).toBe(true);
      expect(firstItem.item_images).toHaveLength(2);

      const firstImage = firstItem.item_images[0];
      expect(firstImage).toHaveProperty('id', 1);
      expect(firstImage).toHaveProperty('url', 'https://samplechannel.com/item-image1.jpg');
      expect(firstImage).toHaveProperty('image_width_size', 300);
      expect(firstImage).toHaveProperty('is_resized', false);

      const secondImage = firstItem.item_images[1];
      expect(secondImage).toHaveProperty('id', 2);
      expect(secondImage).toHaveProperty('url', 'https://samplechannel.com/item-image2.jpg');
      expect(secondImage).toHaveProperty('image_width_size', 500);
      expect(secondImage).toHaveProperty('is_resized', true);

      // Validate `item_persons`
      expect(Array.isArray(firstItem.item_persons)).toBe(true);
      expect(firstItem.item_persons).toHaveLength(2);

      const firstPerson = firstItem.item_persons[0];
      expect(firstPerson).toHaveProperty('id', 1);
      expect(firstPerson).toHaveProperty('name', 'John Doe');
      expect(firstPerson).toHaveProperty('role', 'Host');
      expect(firstPerson).toHaveProperty('person_group', 'cast');
      expect(firstPerson).toHaveProperty('img', 'https://samplechannel.com/johndoe.jpg');
      expect(firstPerson).toHaveProperty('href', 'https://samplechannel.com/johndoe');

      const secondPerson = firstItem.item_persons[1];
      expect(secondPerson).toHaveProperty('id', 2);
      expect(secondPerson).toHaveProperty('name', 'Jane Smith');
      expect(secondPerson).toHaveProperty('role', 'Guest');
      expect(secondPerson).toHaveProperty('person_group', 'guest');
      expect(secondPerson).toHaveProperty('img', 'https://samplechannel.com/janesmith.jpg');
      expect(secondPerson).toHaveProperty('href', 'https://samplechannel.com/janesmith');

      // Validate `item_season`
      expect(firstItem).toHaveProperty('item_season');
      expect(firstItem.item_season).toHaveProperty('id', 1);
      expect(firstItem.item_season).toHaveProperty('channel_season_id', 1);
      expect(firstItem.item_season).toHaveProperty('title', 'Season 1 Title');
      expect(firstItem.item_season.channel_season).toHaveProperty('id', 1);
      expect(firstItem.item_season.channel_season).toHaveProperty('channel_id', 1);
      expect(firstItem.item_season.channel_season).toHaveProperty('number', 1);
      expect(firstItem.item_season.channel_season).toHaveProperty('name', 'Season 1');

      // Validate `live_item`
      expect(firstItem).toHaveProperty('live_item', null);

      // Now validate the second item
      const secondItem = data[1];
      secondItem.item_enclosures.sort((a, b) => a.id - b.id);
      secondItem.item_enclosures.forEach((enclosure) =>
        enclosure.item_enclosure_sources.sort((a, b) => a.id - b.id)
      );
      secondItem.item_images.sort((a, b) => a.id - b.id);
      secondItem.item_persons.sort((a, b) => a.id - b.id);

      // Validate the second item
      expect(secondItem).toHaveProperty('id', 2);
      expect(secondItem).toHaveProperty('id_text', 'item124');
      expect(secondItem).toHaveProperty('slug', 'sample-item-2');
      expect(secondItem).toHaveProperty('guid', 'item-guid-124');
      expect(secondItem).toHaveProperty('guid_enclosure_url', 'https://samplechannel.com/item2.mp3');
      expect(secondItem).toHaveProperty('pub_date', '2025-01-01T13:00:00.000Z');
      expect(secondItem).toHaveProperty('title', 'Sample Item 2');

      // Validate `item_about`
      expect(secondItem).toHaveProperty('item_about');
      expect(secondItem.item_about).toHaveProperty('id', 2);
      expect(secondItem.item_about).toHaveProperty('duration', '20000.00');
      expect(secondItem.item_about).toHaveProperty('explicit', false);
      expect(secondItem.item_about).toHaveProperty('website_link_url', 'https://samplechannel.com/item2');
      expect(secondItem.item_about.item_itunes_episode_type).toHaveProperty('id', 1);
      expect(secondItem.item_about.item_itunes_episode_type).toHaveProperty('itunes_episode_type', 'full');

      // Validate `item_chat`
      expect(secondItem).toHaveProperty('item_chat');
      expect(secondItem.item_chat).toHaveProperty('id', 2);
      expect(secondItem.item_chat).toHaveProperty('server', 'chat.samplechannel.com');
      expect(secondItem.item_chat).toHaveProperty('protocol', 'irc');
      expect(secondItem.item_chat).toHaveProperty('account_id', 'sample_account');
      expect(secondItem.item_chat).toHaveProperty('space', 'sample_space');

      // Validate `item_description`
      expect(secondItem).toHaveProperty('item_description');
      expect(secondItem.item_description).toHaveProperty('id', 2);
      expect(secondItem.item_description).toHaveProperty('value', 'This is a sample description for item 2.');

      // Validate `item_enclosures`
      expect(Array.isArray(secondItem.item_enclosures)).toBe(true);
      expect(secondItem.item_enclosures).toHaveLength(2);

      const secondFirstEnclosure = secondItem.item_enclosures[0];
      expect(secondFirstEnclosure).toHaveProperty('id', 3);
      expect(secondFirstEnclosure).toHaveProperty('type', 'audio/mpeg');
      expect(secondFirstEnclosure).toHaveProperty('length', 12345678);
      expect(secondFirstEnclosure).toHaveProperty('bitrate', 128);
      expect(secondFirstEnclosure).toHaveProperty('height', null);
      expect(secondFirstEnclosure).toHaveProperty('language', 'en');
      expect(secondFirstEnclosure).toHaveProperty('title', 'Sample Enclosure');
      expect(secondFirstEnclosure).toHaveProperty('rel', 'alternate');
      expect(secondFirstEnclosure).toHaveProperty('codecs', 'mp3');
      expect(secondFirstEnclosure).toHaveProperty('item_enclosure_default', true);
      expect(secondFirstEnclosure.item_enclosure_integrity).toHaveProperty('id', 2);
      expect(secondFirstEnclosure.item_enclosure_integrity).toHaveProperty('type', 'sri');
      expect(secondFirstEnclosure.item_enclosure_integrity).toHaveProperty(
        'value',
        'sha256-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz789'
      );

      const secondFirstEnclosureSource = secondFirstEnclosure.item_enclosure_sources[0];
      expect(secondFirstEnclosureSource).toHaveProperty('id', 5);
      expect(secondFirstEnclosureSource).toHaveProperty('uri', 'https://samplechannel.com/audio-source3.mp3');
      expect(secondFirstEnclosureSource).toHaveProperty('content_type', 'audio/mpeg');

      const secondSecondEnclosureSource = secondFirstEnclosure.item_enclosure_sources[1];
      expect(secondSecondEnclosureSource).toHaveProperty('id', 6);
      expect(secondSecondEnclosureSource).toHaveProperty('uri', 'https://samplechannel.com/audio-source4.mp3');
      expect(secondSecondEnclosureSource).toHaveProperty('content_type', 'audio/mpeg');

      const secondSecondEnclosure = secondItem.item_enclosures[1];
      expect(secondSecondEnclosure).toHaveProperty('id', 4);
      expect(secondSecondEnclosure).toHaveProperty('type', 'video/mp4');
      expect(secondSecondEnclosure).toHaveProperty('length', 98765432);
      expect(secondSecondEnclosure).toHaveProperty('bitrate', 256);
      expect(secondSecondEnclosure).toHaveProperty('height', 720);
      expect(secondSecondEnclosure).toHaveProperty('language', 'en');
      expect(secondSecondEnclosure).toHaveProperty('title', 'Sample Video Enclosure');
      expect(secondSecondEnclosure).toHaveProperty('rel', 'alternate');
      expect(secondSecondEnclosure).toHaveProperty('codecs', 'mp4');
      expect(secondSecondEnclosure).toHaveProperty('item_enclosure_default', false);
      expect(secondSecondEnclosure.item_enclosure_integrity).toBeNull();

      const secondThirdEnclosureSource = secondSecondEnclosure.item_enclosure_sources[0];
      expect(secondThirdEnclosureSource).toHaveProperty('id', 7);
      expect(secondThirdEnclosureSource).toHaveProperty('uri', 'https://samplechannel.com/video-source3.mp4');
      expect(secondThirdEnclosureSource).toHaveProperty('content_type', 'video/mp4');

      const secondFourthEnclosureSource = secondSecondEnclosure.item_enclosure_sources[1];
      expect(secondFourthEnclosureSource).toHaveProperty('id', 8);
      expect(secondFourthEnclosureSource).toHaveProperty('uri', 'https://samplechannel.com/video-source4.mp4');
      expect(secondFourthEnclosureSource).toHaveProperty('content_type', 'video/mp4');

      // Validate `item_images`
      expect(Array.isArray(secondItem.item_images)).toBe(true);
      expect(secondItem.item_images).toHaveLength(2);

      const secondFirstImage = secondItem.item_images[0];
      expect(secondFirstImage).toHaveProperty('id', 3);
      expect(secondFirstImage).toHaveProperty('url', 'https://samplechannel.com/item-image3.jpg');
      expect(secondFirstImage).toHaveProperty('image_width_size', 300);
      expect(secondFirstImage).toHaveProperty('is_resized', false);

      const secondSecondImage = secondItem.item_images[1];
      expect(secondSecondImage).toHaveProperty('id', 4);
      expect(secondSecondImage).toHaveProperty('url', 'https://samplechannel.com/item-image4.jpg');
      expect(secondSecondImage).toHaveProperty('image_width_size', 500);
      expect(secondSecondImage).toHaveProperty('is_resized', true);

      // Validate `item_persons`
      expect(Array.isArray(secondItem.item_persons)).toBe(true);
      expect(secondItem.item_persons).toHaveLength(2);

      const secondFirstPerson = secondItem.item_persons[0];
      expect(secondFirstPerson).toHaveProperty('id', 3);
      expect(secondFirstPerson).toHaveProperty('name', 'John Doe');
      expect(secondFirstPerson).toHaveProperty('role', 'Host');
      expect(secondFirstPerson).toHaveProperty('person_group', 'cast');
      expect(secondFirstPerson).toHaveProperty('img', 'https://samplechannel.com/johndoe.jpg');
      expect(secondFirstPerson).toHaveProperty('href', 'https://samplechannel.com/johndoe');

      const secondSecondPerson = secondItem.item_persons[1];
      expect(secondSecondPerson).toHaveProperty('id', 4);
      expect(secondSecondPerson).toHaveProperty('name', 'Jane Smith');
      expect(secondSecondPerson).toHaveProperty('role', 'Guest');
      expect(secondSecondPerson).toHaveProperty('person_group', 'guest');
      expect(secondSecondPerson).toHaveProperty('img', 'https://samplechannel.com/janesmith.jpg');
      expect(secondSecondPerson).toHaveProperty('href', 'https://samplechannel.com/janesmith');

      // Validate `item_season`
      expect(secondItem).toHaveProperty('item_season');
      expect(secondItem.item_season).toHaveProperty('id', 2);
      expect(secondItem.item_season).toHaveProperty('channel_season_id', 1);
      expect(secondItem.item_season).toHaveProperty('title', 'Season 1 Title');
      expect(secondItem.item_season.channel_season).toHaveProperty('id', 1);
      expect(secondItem.item_season.channel_season).toHaveProperty('channel_id', 1);
      expect(secondItem.item_season.channel_season).toHaveProperty('number', 1);
      expect(secondItem.item_season.channel_season).toHaveProperty('name', 'Season 1');

      // Validate `live_item`
      expect(secondItem).toHaveProperty('live_item', null);
    });
  });
});

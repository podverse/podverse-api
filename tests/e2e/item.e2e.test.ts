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

  describe('GET /item/:idOrIdText', () => {
    it('should return a successful response and validate the exact values of the first item', async () => {
      const idOrIdText = 'item123'; // Replace with a valid item ID or ID text from your test database
  
      const response = await request(globalThis.__API_SERVER__)
        .get(`${config.api.prefix}${config.api.version}/item/${idOrIdText}`)
        .expect(200);
  
      const item = response.body;
  
      // Validate top-level properties
      expect(item).toHaveProperty('id', 1);
      expect(item).toHaveProperty('id_text', 'item123');
      expect(item).toHaveProperty('slug', 'sample-item');
      expect(item).toHaveProperty('guid', 'item-guid-123');
      expect(item).toHaveProperty('guid_enclosure_url', 'https://samplechannel.com/item.mp3');
      expect(item).toHaveProperty('pub_date', '2025-01-01T13:00:00.000Z');
      expect(item).toHaveProperty('title', 'Sample Item');
  
      // Validate `item_about`
      expect(item).toHaveProperty('item_about');
      expect(item.item_about).toHaveProperty('id', 1);
      expect(item.item_about).toHaveProperty('duration', '3600.00');
      expect(item.item_about).toHaveProperty('explicit', false);
      expect(item.item_about).toHaveProperty('website_link_url', 'https://samplechannel.com/item');
      expect(item.item_about.item_itunes_episode_type).toHaveProperty('id', 1);
      expect(item.item_about.item_itunes_episode_type).toHaveProperty('itunes_episode_type', 'full');
  
      // Validate `item_chat`
      expect(item).toHaveProperty('item_chat');
      expect(item.item_chat).toHaveProperty('id', 1);
      expect(item.item_chat).toHaveProperty('server', 'chat.samplechannel.com');
      expect(item.item_chat).toHaveProperty('protocol', 'irc');
      expect(item.item_chat).toHaveProperty('account_id', 'sample_account');
      expect(item.item_chat).toHaveProperty('space', 'sample_space');
  
      // Validate `item_description`
      expect(item).toHaveProperty('item_description');
      expect(item.item_description).toHaveProperty('id', 1);
      expect(item.item_description).toHaveProperty('value', 'This is a sample description for the item.');
  
      // Validate `item_license`
      expect(item).toHaveProperty('item_license');
      expect(item.item_license).toHaveProperty('id', 1);
      expect(item.item_license).toHaveProperty('identifier', 'CC-BY-4.0');
      expect(item.item_license).toHaveProperty('url', 'https://creativecommons.org/licenses/by/4.0/');
  
      // Validate `item_location`
      expect(item).toHaveProperty('item_location');
      expect(item.item_location).toHaveProperty('id', 1);
      expect(item.item_location).toHaveProperty('geo', '37.7749,-122.4194');
      expect(item.item_location).toHaveProperty('osm', null);
      expect(item.item_location).toHaveProperty('name', 'San Francisco, CA');
  
      // Validate `item_season`
      expect(item).toHaveProperty('item_season');
      expect(item.item_season).toHaveProperty('id', 1);
      expect(item.item_season).toHaveProperty('channel_season_id', 1);
      expect(item.item_season).toHaveProperty('title', 'Season 1 Title');
      expect(item.item_season.channel_season).toHaveProperty('id', 1);
      expect(item.item_season.channel_season).toHaveProperty('channel_id', 1);
      expect(item.item_season.channel_season).toHaveProperty('number', 1);
      expect(item.item_season.channel_season).toHaveProperty('name', 'Season 1');
  
      // Validate `live_item`
      expect(item).toHaveProperty('live_item', null);
  
      // Validate `item_chapters_feed`
      expect(item).toHaveProperty('item_chapters_feed');
      expect(item.item_chapters_feed).toHaveProperty('id', 1);
      expect(item.item_chapters_feed).toHaveProperty('url', 'https://samplechannel.com/chapters.json');
      expect(item.item_chapters_feed).toHaveProperty('type', 'application/json');
  
      // Sort and validate `item_chapters`
      const sortedChapters = item.item_chapters_feed.item_chapters.sort((a, b) => a.id - b.id);
      expect(sortedChapters).toHaveLength(3);
      expect(sortedChapters[0]).toHaveProperty('id', 1);
      expect(sortedChapters[0]).toHaveProperty('id_text', 'chapter1');
      expect(sortedChapters[0]).toHaveProperty('start_time', '0.00');
      expect(sortedChapters[0]).toHaveProperty('end_time', '300.00');
      expect(sortedChapters[0]).toHaveProperty('title', 'Introduction');
      expect(sortedChapters[0]).toHaveProperty('img', 'https://samplechannel.com/chapter1.jpg');
      expect(sortedChapters[0]).toHaveProperty('web_url', 'https://samplechannel.com/chapter1');
      expect(sortedChapters[0]).toHaveProperty('table_of_contents', true);
  
      // Validate `item_chapters_feed_log`
      expect(item.item_chapters_feed).toHaveProperty('item_chapters_feed_log');
      expect(item.item_chapters_feed.item_chapters_feed_log).toHaveProperty('id', 1);
      expect(item.item_chapters_feed.item_chapters_feed_log).toHaveProperty('last_http_status', 200);
      expect(item.item_chapters_feed.item_chapters_feed_log).toHaveProperty('last_good_http_status_time', '2025-01-01T19:00:00.000Z');
      expect(item.item_chapters_feed.item_chapters_feed_log).toHaveProperty('last_finished_parse_time', '2025-01-01T19:00:00.000Z');
      expect(item.item_chapters_feed.item_chapters_feed_log).toHaveProperty('parse_errors', 0);
  
      // Sort and validate `item_content_links`
      const sortedContentLinks = item.item_content_links.sort((a, b) => a.id - b.id);
      expect(sortedContentLinks).toHaveLength(2);
      expect(sortedContentLinks[0]).toHaveProperty('id', 1);
      expect(sortedContentLinks[0]).toHaveProperty('href', 'https://samplechannel.com/content1');
      expect(sortedContentLinks[0]).toHaveProperty('title', 'Content Link 1');
  
      // Sort and validate `item_enclosures`
      const sortedEnclosures = item.item_enclosures.sort((a, b) => a.id - b.id);
      expect(sortedEnclosures).toHaveLength(2);
      expect(sortedEnclosures[0]).toHaveProperty('id', 1);
      expect(sortedEnclosures[0]).toHaveProperty('type', 'audio/mpeg');
      expect(sortedEnclosures[0]).toHaveProperty('length', 12345678);
      expect(sortedEnclosures[0]).toHaveProperty('bitrate', 128);
      expect(sortedEnclosures[0]).toHaveProperty('height', null);
      expect(sortedEnclosures[0]).toHaveProperty('language', 'en');
      expect(sortedEnclosures[0]).toHaveProperty('title', 'Sample Enclosure');
      expect(sortedEnclosures[0]).toHaveProperty('rel', 'alternate');
      expect(sortedEnclosures[0]).toHaveProperty('codecs', 'mp3');
      expect(sortedEnclosures[0]).toHaveProperty('item_enclosure_default', true);
      expect(sortedEnclosures[0].item_enclosure_integrity).toHaveProperty('id', 1);
      expect(sortedEnclosures[0].item_enclosure_integrity).toHaveProperty('type', 'sri');
      expect(sortedEnclosures[0].item_enclosure_integrity).toHaveProperty('value', 'sha256-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567');
  
      // Sort and validate `item_images`
      const sortedImages = item.item_images.sort((a, b) => a.id - b.id);
      expect(sortedImages).toHaveLength(2);
      expect(sortedImages[0]).toHaveProperty('id', 1);
      expect(sortedImages[0]).toHaveProperty('url', 'https://samplechannel.com/item-image1.jpg');
      expect(sortedImages[0]).toHaveProperty('image_width_size', 300);
      expect(sortedImages[0]).toHaveProperty('is_resized', false);
  
      // Sort and validate `item_persons`
      const sortedPersons = item.item_persons.sort((a, b) => a.id - b.id);
      expect(sortedPersons).toHaveLength(2);
      expect(sortedPersons[0]).toHaveProperty('id', 1);
      expect(sortedPersons[0]).toHaveProperty('name', 'John Doe');
      expect(sortedPersons[0]).toHaveProperty('role', 'Host');
      expect(sortedPersons[0]).toHaveProperty('person_group', 'cast');
      expect(sortedPersons[0]).toHaveProperty('img', 'https://samplechannel.com/johndoe.jpg');
      expect(sortedPersons[0]).toHaveProperty('href', 'https://samplechannel.com/johndoe');

      expect(sortedPersons[1]).toHaveProperty('id', 2);
      expect(sortedPersons[1]).toHaveProperty('name', 'Jane Smith');
      expect(sortedPersons[1]).toHaveProperty('role', 'Guest');
      expect(sortedPersons[1]).toHaveProperty('person_group', 'guest');
      expect(sortedPersons[1]).toHaveProperty('img', 'https://samplechannel.com/janesmith.jpg');
      expect(sortedPersons[1]).toHaveProperty('href', 'https://samplechannel.com/janesmith');

      // Sort and validate `item_social_interacts`
      const sortedSocialInteracts = item.item_social_interacts.sort((a, b) => a.id - b.id);
      expect(sortedSocialInteracts).toHaveLength(2);
      expect(sortedSocialInteracts[0]).toHaveProperty('id', 1);
      expect(sortedSocialInteracts[0]).toHaveProperty('protocol', 'twitter');
      expect(sortedSocialInteracts[0]).toHaveProperty('uri', 'https://twitter.com/sampleuri');
      expect(sortedSocialInteracts[0]).toHaveProperty('account_id', 'sample_twitter');
      expect(sortedSocialInteracts[0]).toHaveProperty('account_url', 'https://twitter.com/sampleaccount');
      expect(sortedSocialInteracts[0]).toHaveProperty('priority', 1);

      expect(sortedSocialInteracts[1]).toHaveProperty('id', 2);
      expect(sortedSocialInteracts[1]).toHaveProperty('protocol', 'mastodon');
      expect(sortedSocialInteracts[1]).toHaveProperty('uri', 'https://mastodon.social/@sampleuri');
      expect(sortedSocialInteracts[1]).toHaveProperty('account_id', 'sample_mastodon');
      expect(sortedSocialInteracts[1]).toHaveProperty('account_url', 'https://mastodon.social/@sampleaccount');
      expect(sortedSocialInteracts[1]).toHaveProperty('priority', 2);

      // Sort and validate `item_soundbites`
      const sortedSoundbites = item.item_soundbites.sort((a, b) => a.id - b.id);
      expect(sortedSoundbites).toHaveLength(2);
      expect(sortedSoundbites[0]).toHaveProperty('id', 1);
      expect(sortedSoundbites[0]).toHaveProperty('id_text', 'soundbite1');
      expect(sortedSoundbites[0]).toHaveProperty('start_time', '0.00');
      expect(sortedSoundbites[0]).toHaveProperty('duration', '30.00');
      expect(sortedSoundbites[0]).toHaveProperty('title', 'Intro Soundbite');

      expect(sortedSoundbites[1]).toHaveProperty('id', 2);
      expect(sortedSoundbites[1]).toHaveProperty('id_text', 'soundbite2');
      expect(sortedSoundbites[1]).toHaveProperty('start_time', '60.00');
      expect(sortedSoundbites[1]).toHaveProperty('duration', '15.00');
      expect(sortedSoundbites[1]).toHaveProperty('title', 'Highlight Soundbite');

      // Sort and validate `item_transcripts`
      const sortedTranscripts = item.item_transcripts.sort((a, b) => a.id - b.id);
      expect(sortedTranscripts).toHaveLength(2);
      expect(sortedTranscripts[0]).toHaveProperty('id', 1);
      expect(sortedTranscripts[0]).toHaveProperty('url', 'https://samplechannel.com/transcript1.vtt');
      expect(sortedTranscripts[0]).toHaveProperty('type', 'text/vtt');
      expect(sortedTranscripts[0]).toHaveProperty('language', 'en');
      expect(sortedTranscripts[0]).toHaveProperty('rel', 'captions');

      expect(sortedTranscripts[1]).toHaveProperty('id', 2);
      expect(sortedTranscripts[1]).toHaveProperty('url', 'https://samplechannel.com/transcript2.srt');
      expect(sortedTranscripts[1]).toHaveProperty('type', 'text/srt');
      expect(sortedTranscripts[1]).toHaveProperty('language', 'en');
      expect(sortedTranscripts[1]).toHaveProperty('rel', null);

      // Sort and validate `item_txts`
      const sortedTxts = item.item_txts.sort((a, b) => a.id - b.id);
      expect(sortedTxts).toHaveLength(3);
      expect(sortedTxts[0]).toHaveProperty('id', 1);
      expect(sortedTxts[0]).toHaveProperty('purpose', 'summary');
      expect(sortedTxts[0]).toHaveProperty('value', 'This is a summary for the item.');

      expect(sortedTxts[1]).toHaveProperty('id', 2);
      expect(sortedTxts[1]).toHaveProperty('purpose', 'note');
      expect(sortedTxts[1]).toHaveProperty('value', 'This is a note for the item.');

      expect(sortedTxts[2]).toHaveProperty('id', 3);
      expect(sortedTxts[2]).toHaveProperty('purpose', 'tagline');
      expect(sortedTxts[2]).toHaveProperty('value', 'This is a tagline for the item.');

      // Sort and validate `item_values`
      const sortedValues = item.item_values.sort((a, b) => a.id - b.id);
      expect(sortedValues).toHaveLength(2);
      expect(sortedValues[0]).toHaveProperty('id', 1);
      expect(sortedValues[0]).toHaveProperty('type', 'lightning');
      expect(sortedValues[0]).toHaveProperty('method', 'keysend');
      expect(sortedValues[0]).toHaveProperty('suggested', 0.01);

      // Sort and validate `item_value_recipients` for the first value
      const sortedRecipients = sortedValues[0].item_value_recipients.sort((a, b) => a.id - b.id);
      expect(sortedRecipients).toHaveLength(4);
      expect(sortedRecipients[0]).toHaveProperty('id', 1);
      expect(sortedRecipients[0]).toHaveProperty('type', 'node');
      expect(sortedRecipients[0]).toHaveProperty('address', 'recipient1@lightning.com');
      expect(sortedRecipients[0]).toHaveProperty('split', 50);
      expect(sortedRecipients[0]).toHaveProperty('name', 'Recipient 1');
      expect(sortedRecipients[0]).toHaveProperty('custom_key', 'key1');
      expect(sortedRecipients[0]).toHaveProperty('custom_value', 'value1');
      expect(sortedRecipients[0]).toHaveProperty('fee', false);

      // Validate the second recipient
      expect(sortedRecipients[1]).toHaveProperty('id', 2);
      expect(sortedRecipients[1]).toHaveProperty('type', 'node');
      expect(sortedRecipients[1]).toHaveProperty('address', 'recipient2@lightning.com');
      expect(sortedRecipients[1]).toHaveProperty('split', 30);
      expect(sortedRecipients[1]).toHaveProperty('name', 'Recipient 2');
      expect(sortedRecipients[1]).toHaveProperty('custom_key', 'key2');
      expect(sortedRecipients[1]).toHaveProperty('custom_value', 'value2');
      expect(sortedRecipients[1]).toHaveProperty('fee', true);

      // Validate the third recipient
      expect(sortedRecipients[2]).toHaveProperty('id', 3);
      expect(sortedRecipients[2]).toHaveProperty('type', 'node');
      expect(sortedRecipients[2]).toHaveProperty('address', 'recipient3@lightning.com');
      expect(sortedRecipients[2]).toHaveProperty('split', 20);
      expect(sortedRecipients[2]).toHaveProperty('name', 'Recipient 3');
      expect(sortedRecipients[2]).toHaveProperty('custom_key', null);
      expect(sortedRecipients[2]).toHaveProperty('custom_value', null);
      expect(sortedRecipients[2]).toHaveProperty('fee', false);

      // Validate the fourth recipient
      expect(sortedRecipients[3]).toHaveProperty('id', 4);
      expect(sortedRecipients[3]).toHaveProperty('type', 'node');
      expect(sortedRecipients[3]).toHaveProperty('address', 'recipient4@bitcoin.com');
      expect(sortedRecipients[3]).toHaveProperty('split', 40);
      expect(sortedRecipients[3]).toHaveProperty('name', 'Recipient 4');
      expect(sortedRecipients[3]).toHaveProperty('custom_key', 'key3');
      expect(sortedRecipients[3]).toHaveProperty('custom_value', 'value3');
      expect(sortedRecipients[3]).toHaveProperty('fee', true);

      // Sort and validate `item_value_time_splits` for the first value
      const sortedTimeSplits = sortedValues[0].item_value_time_splits.sort((a, b) => a.id - b.id);
      expect(sortedTimeSplits).toHaveLength(3);

      // Validate the first time split
      expect(sortedTimeSplits[0]).toHaveProperty('id', 1);
      expect(sortedTimeSplits[0]).toHaveProperty('start_time', '0.00');
      expect(sortedTimeSplits[0]).toHaveProperty('duration', '300.00');
      expect(sortedTimeSplits[0]).toHaveProperty('remote_start_time', '0.00');
      expect(sortedTimeSplits[0]).toHaveProperty('remote_percentage', '100.00');
      expect(sortedTimeSplits[0]).toHaveProperty('item_value_time_split_recipients', []);
      expect(sortedTimeSplits[0].item_value_time_split_remote_item).toHaveProperty('id', 1);
      expect(sortedTimeSplits[0].item_value_time_split_remote_item).toHaveProperty('feed_guid', '123e4567-e89b-12d3-a456-426614174000');
      expect(sortedTimeSplits[0].item_value_time_split_remote_item).toHaveProperty('feed_url', 'https://example.com/feed1');
      expect(sortedTimeSplits[0].item_value_time_split_remote_item).toHaveProperty('item_guid', 'item-guid-123');
      expect(sortedTimeSplits[0].item_value_time_split_remote_item).toHaveProperty('title', 'Remote Item Title 1');

      // Validate the second time split
      expect(sortedTimeSplits[1]).toHaveProperty('id', 2);
      expect(sortedTimeSplits[1]).toHaveProperty('start_time', '300.00');
      expect(sortedTimeSplits[1]).toHaveProperty('duration', '600.00');
      expect(sortedTimeSplits[1]).toHaveProperty('remote_start_time', '0.00');
      expect(sortedTimeSplits[1]).toHaveProperty('remote_percentage', '50.00');
      expect(sortedTimeSplits[1]).toHaveProperty('item_value_time_split_recipients', []);
      expect(sortedTimeSplits[1].item_value_time_split_remote_item).toHaveProperty('id', 2);
      expect(sortedTimeSplits[1].item_value_time_split_remote_item).toHaveProperty('feed_guid', '123e4567-e89b-12d3-a456-426614174003');
      expect(sortedTimeSplits[1].item_value_time_split_remote_item).toHaveProperty('feed_url', 'https://example.com/feed2');
      expect(sortedTimeSplits[1].item_value_time_split_remote_item).toHaveProperty('item_guid', 'item-guid-133');
      expect(sortedTimeSplits[1].item_value_time_split_remote_item).toHaveProperty('title', 'Remote Item Title 2');

      // Validate the third time split
      expect(sortedTimeSplits[2]).toHaveProperty('id', 3);
      expect(sortedTimeSplits[2]).toHaveProperty('start_time', '600.00');
      expect(sortedTimeSplits[2]).toHaveProperty('duration', '900.00');
      expect(sortedTimeSplits[2]).toHaveProperty('remote_start_time', '0.00');
      expect(sortedTimeSplits[2]).toHaveProperty('remote_percentage', '25.00');

      // Sort and validate `item_value_time_split_recipients` for the third time split
      const sortedTimeSplitRecipients = sortedTimeSplits[2].item_value_time_split_recipients.sort((a, b) => a.id - b.id);
      expect(sortedTimeSplitRecipients).toHaveLength(4);

      // Validate the first recipient in the third time split
      expect(sortedTimeSplitRecipients[0]).toHaveProperty('id', 1);
      expect(sortedTimeSplitRecipients[0]).toHaveProperty('type', 'lightning');
      expect(sortedTimeSplitRecipients[0]).toHaveProperty('address', 'recipient1@lightning.com');
      expect(sortedTimeSplitRecipients[0]).toHaveProperty('split', 50);
      expect(sortedTimeSplitRecipients[0]).toHaveProperty('name', 'Recipient 1');
      expect(sortedTimeSplitRecipients[0]).toHaveProperty('custom_key', 'key1');
      expect(sortedTimeSplitRecipients[0]).toHaveProperty('custom_value', 'value1');
      expect(sortedTimeSplitRecipients[0]).toHaveProperty('fee', false);

      // Validate the second recipient in the third time split
      expect(sortedTimeSplitRecipients[1]).toHaveProperty('id', 2);
      expect(sortedTimeSplitRecipients[1]).toHaveProperty('type', 'lightning');
      expect(sortedTimeSplitRecipients[1]).toHaveProperty('address', 'recipient2@lightning.com');
      expect(sortedTimeSplitRecipients[1]).toHaveProperty('split', 30);
      expect(sortedTimeSplitRecipients[1]).toHaveProperty('name', 'Recipient 2');
      expect(sortedTimeSplitRecipients[1]).toHaveProperty('custom_key', 'key2');
      expect(sortedTimeSplitRecipients[1]).toHaveProperty('custom_value', 'value2');
      expect(sortedTimeSplitRecipients[1]).toHaveProperty('fee', true);

      // Validate the third recipient in the third time split
      expect(sortedTimeSplitRecipients[2]).toHaveProperty('id', 3);
      expect(sortedTimeSplitRecipients[2]).toHaveProperty('type', 'lightning');
      expect(sortedTimeSplitRecipients[2]).toHaveProperty('address', 'recipient3@lightning.com');
      expect(sortedTimeSplitRecipients[2]).toHaveProperty('split', 20);
      expect(sortedTimeSplitRecipients[2]).toHaveProperty('name', 'Recipient 3');
      expect(sortedTimeSplitRecipients[2]).toHaveProperty('custom_key', null);
      expect(sortedTimeSplitRecipients[2]).toHaveProperty('custom_value', null);
      expect(sortedTimeSplitRecipients[2]).toHaveProperty('fee', false);

      // Validate the fourth recipient in the third time split
      expect(sortedTimeSplitRecipients[3]).toHaveProperty('id', 4);
      expect(sortedTimeSplitRecipients[3]).toHaveProperty('type', 'bitcoin');
      expect(sortedTimeSplitRecipients[3]).toHaveProperty('address', 'recipient4@bitcoin.com');
      expect(sortedTimeSplitRecipients[3]).toHaveProperty('split', 40);
      expect(sortedTimeSplitRecipients[3]).toHaveProperty('name', 'Recipient 4');
      expect(sortedTimeSplitRecipients[3]).toHaveProperty('custom_key', 'key3');
      expect(sortedTimeSplitRecipients[3]).toHaveProperty('custom_value', 'value3');
      expect(sortedTimeSplitRecipients[3]).toHaveProperty('fee', true);

      // Validate the second `item_value`
      expect(sortedValues[1]).toHaveProperty('id', 2);
      expect(sortedValues[1]).toHaveProperty('type', 'ethereum');
      expect(sortedValues[1]).toHaveProperty('method', 'keysend');
      expect(sortedValues[1]).toHaveProperty('suggested', 0.02);

      // Sort and validate `item_value_recipients` for the second value
      const sortedRecipientsSecondValue = sortedValues[1].item_value_recipients.sort((a, b) => a.id - b.id);
      expect(sortedRecipientsSecondValue).toHaveLength(4);

      // Validate the first recipient in the second value
      expect(sortedRecipientsSecondValue[0]).toHaveProperty('id', 5);
      expect(sortedRecipientsSecondValue[0]).toHaveProperty('type', 'node-eth');
      expect(sortedRecipientsSecondValue[0]).toHaveProperty('address', 'recipient1@lightningethereum.com');
      expect(sortedRecipientsSecondValue[0]).toHaveProperty('split', 10);
      expect(sortedRecipientsSecondValue[0]).toHaveProperty('name', 'Recipient 1');
      expect(sortedRecipientsSecondValue[0]).toHaveProperty('custom_key', 'key1');
      expect(sortedRecipientsSecondValue[0]).toHaveProperty('custom_value', 'value1');
      expect(sortedRecipientsSecondValue[0]).toHaveProperty('fee', false);

      // Validate the second recipient in the second value
      expect(sortedRecipientsSecondValue[1]).toHaveProperty('id', 6);
      expect(sortedRecipientsSecondValue[1]).toHaveProperty('type', 'node-eth');
      expect(sortedRecipientsSecondValue[1]).toHaveProperty('address', 'recipient2@lightningethereum.com');
      expect(sortedRecipientsSecondValue[1]).toHaveProperty('split', 20);
      expect(sortedRecipientsSecondValue[1]).toHaveProperty('name', 'Recipient 2');
      expect(sortedRecipientsSecondValue[1]).toHaveProperty('custom_key', 'key2');
      expect(sortedRecipientsSecondValue[1]).toHaveProperty('custom_value', 'value2');
      expect(sortedRecipientsSecondValue[1]).toHaveProperty('fee', true);

      // Validate the third recipient in the second value
      expect(sortedRecipientsSecondValue[2]).toHaveProperty('id', 7);
      expect(sortedRecipientsSecondValue[2]).toHaveProperty('type', 'node-eth');
      expect(sortedRecipientsSecondValue[2]).toHaveProperty('address', 'recipient3@lightningethereum.com');
      expect(sortedRecipientsSecondValue[2]).toHaveProperty('split', 50);
      expect(sortedRecipientsSecondValue[2]).toHaveProperty('name', 'Recipient 3');
      expect(sortedRecipientsSecondValue[2]).toHaveProperty('custom_key', null);
      expect(sortedRecipientsSecondValue[2]).toHaveProperty('custom_value', null);
      expect(sortedRecipientsSecondValue[2]).toHaveProperty('fee', false);

      // Validate the fourth recipient in the second value
      expect(sortedRecipientsSecondValue[3]).toHaveProperty('id', 8);
      expect(sortedRecipientsSecondValue[3]).toHaveProperty('type', 'node-eth');
      expect(sortedRecipientsSecondValue[3]).toHaveProperty('address', 'recipient4@ethereum.com');
      expect(sortedRecipientsSecondValue[3]).toHaveProperty('split', 30);
      expect(sortedRecipientsSecondValue[3]).toHaveProperty('name', 'Recipient 4');
      expect(sortedRecipientsSecondValue[3]).toHaveProperty('custom_key', 'key3');
      expect(sortedRecipientsSecondValue[3]).toHaveProperty('custom_value', 'value3');
      expect(sortedRecipientsSecondValue[3]).toHaveProperty('fee', true);

      // Validate `item_value_time_splits` for the second value
      expect(sortedValues[1].item_value_time_splits).toHaveLength(0);
    });
  });
  
});

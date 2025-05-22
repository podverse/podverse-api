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
});

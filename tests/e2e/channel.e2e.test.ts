import request from 'supertest';
import { config } from '../../src/config';

describe('Channel Endpoints', () => {
  describe('GET /channel', () => {
    it('should return a list of channels with the correct structure and values', async () => {
      const response = await request(globalThis.__API_SERVER__)
        .get(`${config.api.prefix}${config.api.version}/channel`)
        .expect(200);

      const { data, meta } = response.body;

      // Validate meta structure and values
      expect(meta).toHaveProperty('page', 1);
      expect(typeof meta.page).toBe('number');

      // Validate data structure and values
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      data.forEach((channel) => {
        expect(channel).toHaveProperty('id', 1);
        expect(channel).toHaveProperty('id_text', 'sample123');
        expect(channel).toHaveProperty('slug', 'sample-channel');
        expect(channel).toHaveProperty('feed_id', 1);
        expect(channel).toHaveProperty('podcast_index_id', 1001);
        expect(channel).toHaveProperty('podcast_guid', '550e8400-e29b-41d4-a716-446655440000');
        expect(channel).toHaveProperty('title', 'Sample Channel');
        expect(channel).toHaveProperty('sortable_title', 'sample channel');
        expect(channel).toHaveProperty('has_podcast_index_value', false);
        expect(channel).toHaveProperty('has_value_time_splits', false);

        // Validate nested objects
        expect(channel).toHaveProperty('channel_about');
        expect(channel.channel_about).toHaveProperty('id', 1);
        expect(channel.channel_about).toHaveProperty('author', 'Sample Author');
        expect(channel.channel_about).toHaveProperty('episode_count', 10);
        expect(channel.channel_about).toHaveProperty('explicit', false);
        expect(channel.channel_about).toHaveProperty('language', 'en');
        expect(channel.channel_about).toHaveProperty('last_pub_date', '2025-01-01T19:00:00.000Z');
        expect(channel.channel_about).toHaveProperty('website_link_url', 'https://samplechannel.com');
        expect(channel.channel_about).toHaveProperty('itunes_type');
        expect(channel.channel_about.itunes_type).toHaveProperty('id', 1);
        expect(channel.channel_about.itunes_type).toHaveProperty('itunes_type', 'episodic');

        expect(channel).toHaveProperty('channel_chat');
        expect(channel.channel_chat).toHaveProperty('id', 1);
        expect(channel.channel_chat).toHaveProperty('server', 'chat1.samplechannel.com');
        expect(channel.channel_chat).toHaveProperty('protocol', 'irc');
        expect(channel.channel_chat).toHaveProperty('account_id', 'sample_account1');
        expect(channel.channel_chat).toHaveProperty('space', 'sample_space1');

        expect(channel).toHaveProperty('channel_description');
        expect(channel.channel_description).toHaveProperty('id', 1);
        expect(channel.channel_description).toHaveProperty('value', 'This is a sample description for the Sample Channel.');

        expect(channel).toHaveProperty('channel_images');
        expect(Array.isArray(channel.channel_images)).toBe(true);
        expect(channel.channel_images.length).toBe(1);
        channel.channel_images.forEach((image) => {
          expect(image).toHaveProperty('id', 1);
          expect(image).toHaveProperty('url', 'https://samplechannel.com/image.jpg');
          expect(image).toHaveProperty('image_width_size', 300);
          expect(image).toHaveProperty('is_resized', false);
        });

        expect(channel).toHaveProperty('channel_internal_settings');
        expect(channel.channel_internal_settings).toHaveProperty('id', 1);
        expect(channel.channel_internal_settings).toHaveProperty(
          'embed_approved_media_url_paths',
          '[\"https://samplechannel.com/embed\"]'
        );

        expect(channel).toHaveProperty('channel_license');
        expect(channel.channel_license).toHaveProperty('id', 1);
        expect(channel.channel_license).toHaveProperty('identifier', 'CC-BY-4.0');
        expect(channel.channel_license).toHaveProperty('url', 'https://creativecommons.org/licenses/by/4.0/');

        expect(channel).toHaveProperty('channel_location');
        expect(channel.channel_location).toHaveProperty('id', 1);
        expect(channel.channel_location).toHaveProperty('geo', '37.7749,-122.4194');
        expect(channel.channel_location).toHaveProperty('name', 'San Francisco, CA');
        expect(channel.channel_location).toHaveProperty('osm', null);

        expect(channel).toHaveProperty('channel_persons');
        expect(Array.isArray(channel.channel_persons)).toBe(true);
        expect(channel.channel_persons.length).toBe(3);
        expect(channel.channel_persons[0]).toHaveProperty('id', 1);
        expect(channel.channel_persons[0]).toHaveProperty('name', 'John Doe');
        expect(channel.channel_persons[0]).toHaveProperty('role', 'Host');
        expect(channel.channel_persons[0]).toHaveProperty('person_group', 'cast');
        expect(channel.channel_persons[0]).toHaveProperty('img', 'https://samplechannel.com/johndoe.jpg');
        expect(channel.channel_persons[0]).toHaveProperty('href', 'https://samplechannel.com/johndoe');

        expect(channel.channel_persons[1]).toHaveProperty('id', 2);
        expect(channel.channel_persons[1]).toHaveProperty('name', 'Jane Smith');
        expect(channel.channel_persons[1]).toHaveProperty('role', 'Co-Host');
        expect(channel.channel_persons[1]).toHaveProperty('person_group', 'cast');
        expect(channel.channel_persons[1]).toHaveProperty('img', 'https://samplechannel.com/janesmith.jpg');
        expect(channel.channel_persons[1]).toHaveProperty('href', 'https://samplechannel.com/janesmith');

        expect(channel.channel_persons[2]).toHaveProperty('id', 3);
        expect(channel.channel_persons[2]).toHaveProperty('name', 'Sam Wilson');
        expect(channel.channel_persons[2]).toHaveProperty('role', 'Guest');
        expect(channel.channel_persons[2]).toHaveProperty('person_group', 'guest');
        expect(channel.channel_persons[2]).toHaveProperty('img', 'https://samplechannel.com/samwilson.jpg');
        expect(channel.channel_persons[2]).toHaveProperty('href', 'https://samplechannel.com/samwilson');
      });
    });
  });

  describe('GET /channel/:idOrIdText', () => {
    it('should return a single channel with the correct structure and values', async () => {
      const channelIdOrText = 'sample123';
      const response = await request(globalThis.__API_SERVER__)
        .get(`${config.api.prefix}${config.api.version}/channel/${channelIdOrText}`)
        .expect(200);
  
      const { body } = response; // Use 'body' instead of 'data'
  
      // Validate top-level properties
      expect(body).toHaveProperty('id', 1);
      expect(body).toHaveProperty('id_text', 'sample123');
      expect(body).toHaveProperty('slug', 'sample-channel');
      expect(body).toHaveProperty('feed_id', 1);
      expect(body).toHaveProperty('podcast_index_id', 1001);
      expect(body).toHaveProperty('podcast_guid', '550e8400-e29b-41d4-a716-446655440000');
      expect(body).toHaveProperty('title', 'Sample Channel');
      expect(body).toHaveProperty('sortable_title', 'sample channel');
      expect(body).toHaveProperty('has_podcast_index_value', false);
      expect(body).toHaveProperty('has_value_time_splits', false);
  
      // Validate nested objects
      expect(body).toHaveProperty('channel_about');
      expect(body.channel_about).toMatchObject({
        id: 1,
        author: 'Sample Author',
        episode_count: 10,
        explicit: false,
        language: 'en',
        last_pub_date: '2025-01-01T19:00:00.000Z',
        website_link_url: 'https://samplechannel.com',
        itunes_type: { id: 1, itunes_type: 'episodic' },
      });
  
      expect(body).toHaveProperty('channel_chat');
      expect(body.channel_chat).toMatchObject({
        id: 1,
        server: 'chat1.samplechannel.com',
        protocol: 'irc',
        account_id: 'sample_account1',
        space: 'sample_space1',
      });
  
      expect(body).toHaveProperty('channel_description');
      expect(body.channel_description).toMatchObject({
        id: 1,
        value: 'This is a sample description for the Sample Channel.',
      });
  
      expect(body).toHaveProperty('channel_internal_settings');
      expect(body.channel_internal_settings).toMatchObject({
        id: 1,
        embed_approved_media_url_paths: '[\"https://samplechannel.com/embed\"]',
      });
  
      expect(body).toHaveProperty('channel_license');
      expect(body.channel_license).toMatchObject({
        id: 1,
        identifier: 'CC-BY-4.0',
        url: 'https://creativecommons.org/licenses/by/4.0/',
      });
  
      expect(body).toHaveProperty('channel_location');
      expect(body.channel_location).toMatchObject({
        id: 1,
        geo: '37.7749,-122.4194',
        osm: null,
        name: 'San Francisco, CA',
      });
  
      expect(body).toHaveProperty('channel_podroll');
      expect(body.channel_podroll.channel_podroll_remote_items).toHaveLength(3);
      expect(body.channel_podroll.channel_podroll_remote_items[0]).toMatchObject({
        id: 1,
        feed_guid: '123e4567-e89b-12d3-a456-426614174000',
        feed_url: 'https://example.com/feed1',
        item_guid: 'item-guid-1',
        title: 'Sample Item 1',
      });
  
      expect(body).toHaveProperty('channel_publisher');
      expect(body.channel_publisher.channel_publisher_remote_items).toHaveLength(1);
      expect(body.channel_publisher.channel_publisher_remote_items[0]).toMatchObject({
        id: 1,
        feed_guid: '123e4567-e89b-12d3-a456-426614174100',
        feed_url: 'https://example.com/publisher_feed1',
        item_guid: 'item-guid-101',
        title: 'Publisher Item 1',
      });
  
      expect(body).toHaveProperty('channel_categories');
      expect(body.channel_categories).toHaveLength(3);

      // Sort the categories by 'id' before validating
      const sortedCategories = body.channel_categories.sort((a, b) => a.id - b.id);

      expect(sortedCategories[0]).toMatchObject({
        id: 1,
        category_id: 17,
        category: {
          id: 17,
          display_name: 'Technology',
          slug: 'technology',
          mapping_key: 'technology',
        },
      });
      expect(sortedCategories[1]).toMatchObject({
        id: 2,
        category_id: 4,
        category: {
          id: 4,
          display_name: 'Education',
          slug: 'education',
          mapping_key: 'education',
        },
      });
      expect(sortedCategories[2]).toMatchObject({
        id: 3,
        category_id: 14,
        category: {
          id: 14,
          display_name: 'Science',
          slug: 'science',
          mapping_key: 'science',
        },
      });
  
      expect(body).toHaveProperty('channel_fundings');
      expect(body.channel_fundings).toHaveLength(3);
      expect(body.channel_fundings[0]).toMatchObject({
        id: 1,
        url: 'https://funding1.samplechannel.com',
        title: 'Support Sample Channel 1',
      });
  
      expect(body).toHaveProperty('channel_images');
      expect(body.channel_images).toHaveLength(1);
      expect(body.channel_images[0]).toMatchObject({
        id: 1,
        url: 'https://samplechannel.com/image.jpg',
        image_width_size: 300,
        is_resized: false,
      });
  
      expect(body).toHaveProperty('channel_persons');
      expect(body.channel_persons).toHaveLength(3);
      expect(body.channel_persons[0]).toMatchObject({
        id: 1,
        name: 'John Doe',
        role: 'Host',
        person_group: 'cast',
        img: 'https://samplechannel.com/johndoe.jpg',
        href: 'https://samplechannel.com/johndoe',
      });
  
      expect(body).toHaveProperty('channel_remote_items');
      expect(body.channel_remote_items).toHaveLength(3);
      expect(body.channel_remote_items[0]).toMatchObject({
        id: 1,
        feed_guid: '123e4567-e89b-12d3-a456-426614174200',
        feed_url: 'https://example.com/remote_feed1',
        item_guid: 'remote-item-guid-1',
        title: 'Remote Item 1',
      });
  
      expect(body).toHaveProperty('channel_seasons');
      expect(body.channel_seasons).toHaveLength(3);
      expect(body.channel_seasons[0]).toMatchObject({
        id: 1,
        channel_id: 1,
        number: 1,
        name: 'Season 1',
      });
  
      expect(body).toHaveProperty('channel_social_interacts');
      expect(body.channel_social_interacts).toHaveLength(3);
      expect(body.channel_social_interacts[0]).toMatchObject({
        id: 1,
        protocol: 'twitter',
        uri: 'https://twitter.com/samplechannel1',
        account_id: 'sample_twitter1',
        account_url: 'https://twitter.com/samplechannel1',
        priority: 1,
      });
  
      expect(body).toHaveProperty('channel_trailers');
      expect(body.channel_trailers).toHaveLength(1);
      expect(body.channel_trailers[0]).toMatchObject({
        id: 1,
        title: 'Sample Trailer',
        url: 'https://samplechannel.com/trailer.mp4',
        pub_date: '2025-01-01T13:00:00.000Z',
        length: 120,
        type: 'video/mp4',
      });
  
      expect(body).toHaveProperty('channel_txts');
      expect(body.channel_txts).toHaveLength(3);
      expect(body.channel_txts[0]).toMatchObject({
        id: 1,
        purpose: 'summary',
        value: 'This is a sample summary for the Sample Channel.',
      });
  
      expect(body).toHaveProperty('channel_values');
      expect(body.channel_values).toHaveLength(1);
      expect(body.channel_values[0]).toMatchObject({
        id: 1,
        type: 'lightning',
        method: 'keysend',
        suggested: 0.01,
      });
      expect(body.channel_values[0].channel_value_recipients).toHaveLength(3);
      expect(body.channel_values[0].channel_value_recipients[0]).toMatchObject({
        id: 1,
        type: 'lightning',
        address: 'sample1@lightning.com',
        split: 50,
        name: 'Sample Recipient 1',
        custom_key: null,
        custom_value: null,
        fee: false,
      });
    });
  });
});

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
        expect(channel).toHaveProperty('hidden', false);
        expect(channel).toHaveProperty('marked_for_deletion', false);

        // Validate nested objects
        expect(channel).toHaveProperty('channel_about');
        expect(channel.channel_about).toHaveProperty('author', 'Sample Author');
        expect(channel.channel_about).toHaveProperty('episode_count', 10);
        expect(channel.channel_about).toHaveProperty('explicit', false);
        expect(channel.channel_about).toHaveProperty('language', 'en');
        expect(channel.channel_about).toHaveProperty('last_pub_date', '2025-01-01T19:00:00.000Z');
        expect(channel.channel_about).toHaveProperty('website_link_url', 'https://samplechannel.com');
        expect(channel.channel_about).toHaveProperty('itunes_type');
        expect(channel.channel_about.itunes_type).toHaveProperty('itunes_type', 'episodic');

        expect(channel).toHaveProperty('channel_chat');
        expect(channel.channel_chat).toHaveProperty('server', 'chat1.samplechannel.com');
        expect(channel.channel_chat).toHaveProperty('protocol', 'irc');
        expect(channel.channel_chat).toHaveProperty('account_id', 'sample_account1');
        expect(channel.channel_chat).toHaveProperty('space', 'sample_space1');

        expect(channel).toHaveProperty('channel_description');
        expect(channel.channel_description).toHaveProperty('value', 'This is a sample description for the Sample Channel.');

        expect(channel).toHaveProperty('channel_images');
        expect(Array.isArray(channel.channel_images)).toBe(true);
        expect(channel.channel_images.length).toBe(1);
        channel.channel_images.forEach((image) => {
          expect(image).toHaveProperty('url', 'https://samplechannel.com/image.jpg');
          expect(image).toHaveProperty('image_width_size', 300);
          expect(image).toHaveProperty('is_resized', false);
        });

        expect(channel).toHaveProperty('channel_internal_settings');
        expect(channel.channel_internal_settings).toHaveProperty(
          'embed_approved_media_url_paths',
          '[\"https://samplechannel.com/embed\"]'
        );

        expect(channel).toHaveProperty('channel_license');
        expect(channel.channel_license).toHaveProperty('identifier', 'CC-BY-4.0');
        expect(channel.channel_license).toHaveProperty('url', 'https://creativecommons.org/licenses/by/4.0/');

        expect(channel).toHaveProperty('channel_location');
        expect(channel.channel_location).toHaveProperty('geo', '37.7749,-122.4194');
        expect(channel.channel_location).toHaveProperty('name', 'San Francisco, CA');

        expect(channel).toHaveProperty('channel_persons');
        expect(Array.isArray(channel.channel_persons)).toBe(true);
        expect(channel.channel_persons.length).toBe(3);
        expect(channel.channel_persons[0]).toHaveProperty('name', 'John Doe');
        expect(channel.channel_persons[0]).toHaveProperty('role', 'Host');
        expect(channel.channel_persons[0]).toHaveProperty('person_group', 'cast');
        expect(channel.channel_persons[0]).toHaveProperty('img', 'https://samplechannel.com/johndoe.jpg');
        expect(channel.channel_persons[0]).toHaveProperty('href', 'https://samplechannel.com/johndoe');
      });
    });
  });
});

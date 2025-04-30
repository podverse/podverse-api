-- Declare variables to store the IDs
DO $$
DECLARE
    feed_id BIGINT;
    channel_id BIGINT;
    channel_value_id BIGINT;
    channel_podroll_id BIGINT;
    channel_publisher_id BIGINT;
    channel_season_id BIGINT;
    item_id_1 BIGINT;
    item_chapters_feed_id_1 BIGINT;
    item_chapter_id_1 BIGINT;
    item_chapter_id_2 BIGINT;
    item_enclosure_id_1 BIGINT;
    item_enclosure_id_2 BIGINT;
    item_value_id_1 BIGINT;
    item_value_id_2 BIGINT;
    item_value_id_3 BIGINT;
    item_value_time_split_id_1 BIGINT;
    item_value_time_split_id_2 BIGINT;
    item_value_time_split_id_3 BIGINT;
    item_id_2 BIGINT;
    item_chapters_feed_id_2 BIGINT;
    item_chapter_id_3 BIGINT;
    item_chapter_id_4 BIGINT;
    item_enclosure_id_3 BIGINT;
    item_enclosure_id_4 BIGINT;
    item_value_id_4 BIGINT;
    item_value_id_5 BIGINT;
    item_value_id_6 BIGINT;
    item_value_time_split_id_4 BIGINT;
    item_value_time_split_id_5 BIGINT;
    item_value_time_split_id_6 BIGINT;
    item_id_live_1 BIGINT;
    item_live_enclosure_id_1 BIGINT;
    item_live_enclosure_id_2 BIGINT;
    item_live_value_id_1 BIGINT;
    item_live_value_id_2 BIGINT;
    item_id_live_2 BIGINT;
    item_live_enclosure_id_3 BIGINT;
    item_live_enclosure_id_4 BIGINT;
    item_live_value_id_3 BIGINT;
    item_live_value_id_4 BIGINT;
    item_id_live_3 BIGINT;
    item_live_enclosure_id_5 BIGINT;
    item_live_enclosure_id_6 BIGINT;
    item_live_value_id_5 BIGINT;
    item_live_value_id_6 BIGINT;
BEGIN
    -- Insert a sample row into the feed table and capture the id
    INSERT INTO feed (
        url, feed_flag_status_id, parsing_priority, created_at, updated_at
    ) VALUES (
        'https://samplechannel.com/feed', 
        (SELECT id FROM feed_flag_status WHERE status = 'active'),
        0, 
        TIMESTAMP '2025-01-01 13:00:00+00',
        TIMESTAMP '2025-01-01 13:00:00+00'
    ) RETURNING id INTO feed_id;

    -- Insert a corresponding row into the feed_log table
    INSERT INTO feed_log (
        feed_id, last_http_status, last_good_http_status_time, last_finished_parse_time, parse_errors
    ) VALUES (
        feed_id, 200, TIMESTAMP '2025-01-01 13:00:00+00', TIMESTAMP '2025-01-01 13:00:00+00', 0
    );

    -- Insert a sample row into the channel table and capture the id
    INSERT INTO channel (
        id_text, slug, feed_id, podcast_index_id, podcast_guid, title, sortable_title, medium_id, 
        has_podcast_index_value, has_value_time_splits
    ) VALUES (
        'sample123', 'sample-channel', 
        feed_id, 
        1001, '550e8400-e29b-41d4-a716-446655440000', 
        'Sample Channel', 'sample channel', 1, FALSE, FALSE
    ) RETURNING id INTO channel_id;

    -- Use the captured channel_id for subsequent inserts
    INSERT INTO channel_about (
        channel_id, author, episode_count, explicit, itunes_type_id, language, last_pub_date, website_link_url
    ) VALUES (
        channel_id, 'Sample Author', 10, FALSE, 
        (SELECT id FROM channel_itunes_type WHERE itunes_type = 'episodic'), -- Add itunes_type_id
        'en', TIMESTAMP '2025-01-01 13:00:00+00', 'https://samplechannel.com'
    );

    -- Insert three rows into channel_category (one-to-many)
    INSERT INTO channel_category (
        channel_id, category_id
    ) VALUES
        (channel_id, (SELECT id FROM category WHERE display_name = 'Technology')),
        (channel_id, (SELECT id FROM category WHERE display_name = 'Education')),
        (channel_id, (SELECT id FROM category WHERE display_name = 'Science'));

    -- Insert three rows into channel_chat (one-to-many)
    INSERT INTO channel_chat (
        channel_id, server, protocol, account_id, space
    ) VALUES
        (channel_id, 'chat1.samplechannel.com', 'irc', 'sample_account1', 'sample_space1');

    -- Insert a corresponding row into channel_description (one-to-one)
    INSERT INTO channel_description (
        channel_id, value
    ) VALUES (
        channel_id, 'This is a sample description for the Sample Channel.'
    );

    -- Insert three rows into channel_funding (one-to-many)
    INSERT INTO channel_funding (
        channel_id, url, title
    ) VALUES
        (channel_id, 'https://funding1.samplechannel.com', 'Support Sample Channel 1'),
        (channel_id, 'https://funding2.samplechannel.com', 'Support Sample Channel 2'),
        (channel_id, 'https://funding3.samplechannel.com', 'Support Sample Channel 3');

    -- Insert a corresponding row into channel_image (one-to-one)
    INSERT INTO channel_image (
        channel_id, url, image_width_size, is_resized
    ) VALUES (
        channel_id, 'https://samplechannel.com/image.jpg', 300, FALSE
    );

    -- Insert a corresponding row into channel_internal_settings (one-to-one)
    INSERT INTO channel_internal_settings (
        channel_id, embed_approved_media_url_paths
    ) VALUES (
        channel_id, '["https://samplechannel.com/embed"]'
    );

    -- Insert a corresponding row into channel_license (one-to-one)
    INSERT INTO channel_license (
        channel_id, identifier, url
    ) VALUES (
        channel_id, 'CC-BY-4.0', 'https://creativecommons.org/licenses/by/4.0/'
    );

    -- Insert a corresponding row into channel_location (one-to-one)
    INSERT INTO channel_location (
        channel_id, geo, osm, name
    ) VALUES (
        channel_id, '37.7749,-122.4194', NULL, 'San Francisco, CA'
    );

    -- Insert three rows into channel_person (one-to-many)
    INSERT INTO channel_person (
        channel_id, name, role, person_group, img, href
    ) VALUES
        (channel_id, 'John Doe', 'Host', 'cast', 'https://samplechannel.com/johndoe.jpg', 'https://samplechannel.com/johndoe'),
        (channel_id, 'Jane Smith', 'Co-Host', 'cast', 'https://samplechannel.com/janesmith.jpg', 'https://samplechannel.com/janesmith'),
        (channel_id, 'Sam Wilson', 'Guest', 'guest', 'https://samplechannel.com/samwilson.jpg', 'https://samplechannel.com/samwilson');

    -- Insert a row into channel_podroll
    INSERT INTO channel_podroll (
        channel_id
    ) VALUES (
        channel_id -- Use the variable or a specific channel_id value
    ) RETURNING id INTO channel_podroll_id;

    -- Insert rows into channel_podroll_remote_item
    INSERT INTO channel_podroll_remote_item (
        channel_podroll_id, feed_guid, feed_url, item_guid, title, medium_id
    ) VALUES
        (channel_podroll_id, '123e4567-e89b-12d3-a456-426614174000', 'https://example.com/feed1', 'item-guid-1', 'Sample Item 1', 1),
        (channel_podroll_id, '123e4567-e89b-12d3-a456-426614174001', 'https://example.com/feed2', 'item-guid-2', 'Sample Item 2', 2),
        (channel_podroll_id, '123e4567-e89b-12d3-a456-426614174002', 'https://example.com/feed3', 'item-guid-3', 'Sample Item 3', 3);

    -- Insert a row into channel_publisher
    INSERT INTO channel_publisher (
        channel_id
    ) VALUES (
        channel_id -- Use the variable or a specific channel_id value
    ) RETURNING id INTO channel_publisher_id;

    -- Insert rows into channel_publisher_remote_item
    INSERT INTO channel_publisher_remote_item (
        channel_publisher_id, feed_guid, feed_url, item_guid, title, medium_id
    ) VALUES
        (channel_publisher_id, '123e4567-e89b-12d3-a456-426614174100', 'https://example.com/publisher_feed1', 'item-guid-101', 'Publisher Item 1', 1);

    -- Insert rows into channel_remote_item
    INSERT INTO channel_remote_item (
        channel_id, feed_guid, feed_url, item_guid, title, medium_id
    ) VALUES
        (channel_id, '123e4567-e89b-12d3-a456-426614174200', 'https://example.com/remote_feed1', 'remote-item-guid-1', 'Remote Item 1', 1),
        (channel_id, '123e4567-e89b-12d3-a456-426614174201', 'https://example.com/remote_feed2', 'remote-item-guid-2', 'Remote Item 2', 2),
        (channel_id, '123e4567-e89b-12d3-a456-426614174202', 'https://example.com/remote_feed3', 'remote-item-guid-3', 'Remote Item 3', 3);

    -- Insert a row into channel_season
    INSERT INTO channel_season (
        channel_id, number, name
    ) VALUES (
        channel_id, 1, 'Season 1'
    ) RETURNING id INTO channel_season_id;

    -- Insert a row into channel_season
    INSERT INTO channel_season (
        channel_id, number, name
    ) VALUES 
        (channel_id, 2, 'Season 2'),
        (channel_id, 3, 'Season 3');    

    -- Insert three rows into channel_social_interact (one-to-many)
    INSERT INTO channel_social_interact (
        channel_id, protocol, uri, account_id, account_url, priority
    ) VALUES
        (channel_id, 'twitter', 'https://twitter.com/samplechannel1', 'sample_twitter1', 'https://twitter.com/samplechannel1', 1),
        (channel_id, 'mastodon', 'https://mastodon.social/@samplechannel', 'sample_mastodon', 'https://mastodon.social/@samplechannel', 2),
        (channel_id, 'facebook', 'https://facebook.com/samplechannel', 'sample_facebook', 'https://facebook.com/samplechannel', 3);

    -- Insert a corresponding row into channel_trailer (one-to-one)
    INSERT INTO channel_trailer (
        channel_id, url, title, pub_date, length, type, channel_season_id
    ) VALUES (
        channel_id, 'https://samplechannel.com/trailer.mp4', 'Sample Trailer', TIMESTAMP '2025-01-01 13:00:00+00', 120, 'video/mp4', 
        channel_season_id
    );
    
    -- Insert three rows into channel_txt (one-to-many)
    INSERT INTO channel_txt (
        channel_id, purpose, value
    ) VALUES
        (channel_id, 'summary', 'This is a sample summary for the Sample Channel.'),
        (channel_id, 'note', 'This is a sample note for the Sample Channel.'),
        (channel_id, 'tagline', 'This is a sample tagline for the Sample Channel.');

    -- Insert a corresponding row into channel_value (one-to-one)
    INSERT INTO channel_value (
        channel_id, type, method, suggested
    ) VALUES (
        channel_id, 'lightning', 'keysend', 0.01
    ) RETURNING id INTO channel_value_id;

    -- Insert three rows into channel_value_recipient (one-to-many)
    INSERT INTO channel_value_recipient (
        channel_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (channel_value_id, 'lightning', 'sample1@lightning.com', 50, 'Sample Recipient 1', NULL, NULL, FALSE),
        (channel_value_id, 'lightning', 'sample2@lightning.com', 30, 'Sample Recipient 2', NULL, NULL, TRUE),
        (channel_value_id, 'lightning', 'sample3@lightning.com', 20, 'Sample Recipient 3', 'some-key', 'some-value', FALSE);

    -- ITEM #1

    -- Insert a row into item
    INSERT INTO item (
        id_text, slug, channel_id, guid, guid_enclosure_url, pub_date, title, item_flag_status_id
    ) VALUES (
        'item123', 'sample-item', channel_id, 'item-guid-123', 'https://samplechannel.com/item.mp3', TIMESTAMP '2025-01-01 13:00:00+00', 
        'Sample Item', (SELECT id FROM item_flag_status WHERE status = 'active')
    ) RETURNING id INTO item_id_1;

    -- Insert a row into item_about
    INSERT INTO item_about (
        item_id, duration, explicit, website_link_url, item_itunes_episode_type_id
    ) VALUES (
        item_id_1, 3600, FALSE, 'https://samplechannel.com/item', 
        (SELECT id FROM item_itunes_episode_type WHERE itunes_episode_type = 'full')
    );

    -- Insert a row into item_chapters_feed
    INSERT INTO item_chapters_feed (
        item_id, url, type
    ) VALUES (
        item_id_1, 'https://samplechannel.com/chapters.json', 'application/json'
    ) RETURNING id INTO item_chapters_feed_id_1;

    -- Insert a row into item_chapters_feed_log
    INSERT INTO item_chapters_feed_log (
        item_chapters_feed_id, last_http_status, last_good_http_status_time, last_finished_parse_time, parse_errors
    ) VALUES (
        item_chapters_feed_id_1, 200, TIMESTAMP '2025-01-01 13:00:00+00', TIMESTAMP '2025-01-01 13:00:00+00', 0
    );

    -- Insert multiple rows into item_chapter
    INSERT INTO item_chapter (
        id_text, item_chapters_feed_id, start_time, end_time, title, img, web_url, table_of_contents
    ) VALUES (
        'chapter1', item_chapters_feed_id_1, 0, 300, 'Introduction', 'https://samplechannel.com/chapter1.jpg', 'https://samplechannel.com/chapter1', TRUE
    ) RETURNING id INTO item_chapter_id_1;

    -- Insert multiple rows into item_chapter
    INSERT INTO item_chapter (
        id_text, item_chapters_feed_id, start_time, end_time, title, img, web_url, table_of_contents
    ) VALUES (
        'chapter2', item_chapters_feed_id_1, 300, 600, 'Main Content', 'https://samplechannel.com/chapter2.jpg', 'https://samplechannel.com/chapter2', TRUE
    ) RETURNING id INTO item_chapter_id_2;

    -- Insert multiple rows into item_chapter
    INSERT INTO item_chapter (
        id_text, item_chapters_feed_id, start_time, end_time, title, img, web_url, table_of_contents
    ) VALUES (
        'chapter3', item_chapters_feed_id_1, 600, 900, 'Conclusion', 'https://samplechannel.com/chapter3.jpg', 'https://samplechannel.com/chapter3', TRUE
    );

    -- Insert multiple rows into item_chapter_location
    INSERT INTO item_chapter_location (
        item_chapter_id, geo, osm, name
    ) VALUES
        (item_chapter_id_1, '37.7749,-122.4194', NULL, 'San Francisco, CA'),
        (item_chapter_id_2, NULL, 'osm12345', 'Golden Gate Bridge');

    -- Insert a row into item_chat
    INSERT INTO item_chat (
        item_id, server, protocol, account_id, space
    ) VALUES (
        item_id_1, 'chat.samplechannel.com', 'irc', 'sample_account', 'sample_space'
    );

    -- Insert multiple rows into item_content_link
    INSERT INTO item_content_link (
        item_id, href, title
    ) VALUES
        (item_id_1, 'https://samplechannel.com/content1', 'Content Link 1'),
        (item_id_1, 'https://samplechannel.com/content2', 'Content Link 2');

    -- Insert a row into item_description
    INSERT INTO item_description (
        item_id, value
    ) VALUES (
        item_id_1, 'This is a sample description for the item.'
    );

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_1, 'audio/mpeg', 12345678, 128, NULL, 'en', 'Sample Enclosure', 'alternate', 'mp3', TRUE
    ) RETURNING id INTO item_enclosure_id_1;

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_1, 'video/mp4', 98765432, 256, 720, 'en', 'Sample Video Enclosure', 'alternate', 'mp4', FALSE
    ) RETURNING id INTO item_enclosure_id_2;

    -- Insert a row into item_enclosure_integrity for item_enclosure_id_1
    INSERT INTO item_enclosure_integrity (
        item_enclosure_id, type, value
    ) VALUES (
        item_enclosure_id_1, 'sri', 'sha256-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567'
    );

    -- Insert multiple rows into item_enclosure_source for item_enclosure_id_1
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_enclosure_id_1, 'https://samplechannel.com/audio-source1.mp3', 'audio/mpeg'),
        (item_enclosure_id_1, 'https://samplechannel.com/audio-source2.mp3', 'audio/mpeg');

    -- Insert multiple rows into item_enclosure_source for item_enclosure_id_2
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_enclosure_id_2, 'https://samplechannel.com/video-source1.mp4', 'video/mp4'),
        (item_enclosure_id_2, 'https://samplechannel.com/video-source2.mp4', 'video/mp4');

    -- Insert multiple rows into item_funding
    INSERT INTO item_funding (
        item_id, url, title
    ) VALUES
        (item_id_1, 'https://funding1.samplechannel.com', 'Support Item 1'),
        (item_id_1, 'https://funding2.samplechannel.com', 'Support Item 2');

    -- Insert multiple rows into item_image
    INSERT INTO item_image (
        item_id, url, image_width_size, is_resized
    ) VALUES
        (item_id_1, 'https://samplechannel.com/item-image1.jpg', 300, FALSE),
        (item_id_1, 'https://samplechannel.com/item-image2.jpg', 500, TRUE);

    -- Insert a row into item_license
    INSERT INTO item_license (
        item_id, identifier, url
    ) VALUES (
        item_id_1, 'CC-BY-4.0', 'https://creativecommons.org/licenses/by/4.0/'
    );

    -- Insert a row into item_location
    INSERT INTO item_location (
        item_id, geo, osm, name
    ) VALUES (
        item_id_1, '37.7749,-122.4194', NULL, 'San Francisco, CA'
    );

    -- Insert multiple rows into item_person
    INSERT INTO item_person (
        item_id, name, role, person_group, img, href
    ) VALUES
        (item_id_1, 'John Doe', 'Host', 'cast', 'https://samplechannel.com/johndoe.jpg', 'https://samplechannel.com/johndoe'),
        (item_id_1, 'Jane Smith', 'Guest', 'guest', 'https://samplechannel.com/janesmith.jpg', 'https://samplechannel.com/janesmith');

    -- Insert a row into item_season
    INSERT INTO item_season (
        channel_season_id, item_id, title
    ) VALUES (
        channel_season_id, item_id_1, 'Season 1 Title'
    );

    -- Insert a row into item_season_episode
    INSERT INTO item_season_episode (
        item_id, display, number
    ) VALUES (
        item_id_1, 'Episode 1', 1
    );

    -- Insert multiple rows into item_social_interact
    INSERT INTO item_social_interact (
        item_id, protocol, uri, account_id, account_url, priority
    ) VALUES
        (item_id_1, 'twitter', 'https://twitter.com/sampleuri', 'sample_twitter', 'https://twitter.com/sampleaccount', 1),
        (item_id_1, 'mastodon', 'https://mastodon.social/@sampleuri', 'sample_mastodon', 'https://mastodon.social/@sampleaccount', 2);

    -- Insert multiple rows into item_soundbite
    INSERT INTO item_soundbite (
        id_text, item_id, start_time, duration, title
    ) VALUES
        ('soundbite1', item_id_1, 0, 30, 'Intro Soundbite'),
        ('soundbite2', item_id_1, 60, 15, 'Highlight Soundbite');

    -- Insert multiple rows into item_transcript
    INSERT INTO item_transcript (
        item_id, url, type, language, rel
    ) VALUES
        (item_id_1, 'https://samplechannel.com/transcript1.vtt', 'text/vtt', 'en', 'captions'),
        (item_id_1, 'https://samplechannel.com/transcript2.srt', 'text/srt', 'en', NULL);

    -- Insert multiple rows into item_txt
    INSERT INTO item_txt (
        item_id, purpose, value
    ) VALUES
        (item_id_1, 'summary', 'This is a summary for the item.'),
        (item_id_1, 'note', 'This is a note for the item.'),
        (item_id_1, 'tagline', 'This is a tagline for the item.');

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_1, 'lightning', 'keysend', 0.01
    ) RETURNING id INTO item_value_id_1;

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_1, 'ethereum', 'keysend', 0.02
    ) RETURNING id INTO item_value_id_2;

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_value_id_1, 'node', 'recipient1@lightning.com', 50, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_value_id_1, 'node', 'recipient2@lightning.com', 30, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_value_id_1, 'node', 'recipient3@lightning.com', 20, 'Recipient 3', NULL, NULL, FALSE),
        (item_value_id_1, 'node', 'recipient4@bitcoin.com', 40, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_value_id_2, 'node-eth', 'recipient1@lightningethereum.com', 10, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_value_id_2, 'node-eth', 'recipient2@lightningethereum.com', 20, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_value_id_2, 'node-eth', 'recipient3@lightningethereum.com', 50, 'Recipient 3', NULL, NULL, FALSE),
        (item_value_id_2, 'node-eth', 'recipient4@ethereum.com', 30, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert multiple rows into item_value_time_split
    INSERT INTO item_value_time_split (
        item_value_id, start_time, duration, remote_start_time, remote_percentage
    ) VALUES (
        item_value_id_1, '0.00', '300.00', '0.00', '100.00'
    ) RETURNING id INTO item_value_time_split_id_1;

    -- Insert multiple rows into item_value_time_split
    INSERT INTO item_value_time_split (
        item_value_id, start_time, duration, remote_start_time, remote_percentage
    ) VALUES (
        item_value_id_1, '300.00', '600.00', '0.00', '50.00'
    ) RETURNING id INTO item_value_time_split_id_2;

    -- Insert multiple rows into item_value_time_split
    INSERT INTO item_value_time_split (
        item_value_id, start_time, duration, remote_start_time, remote_percentage
    ) VALUES (
        item_value_id_1, '600.00', '900.00', '0.00', '25.00'
    ) RETURNING id INTO item_value_time_split_id_3;

    -- Insert multiple rows into item_value_time_split_remote_item
    INSERT INTO item_value_time_split_remote_item (
        item_value_time_split_id, feed_guid, feed_url, item_guid, title
    ) VALUES (
        item_value_time_split_id_1, '123e4567-e89b-12d3-a456-426614174000', 'https://example.com/feed1', 'item-guid-123', 'Remote Item Title 1'
    );

    -- Insert multiple rows into item_value_time_split_remote_item
    INSERT INTO item_value_time_split_remote_item (
        item_value_time_split_id, feed_guid, feed_url, item_guid, title
    ) VALUES (
        item_value_time_split_id_2, '123e4567-e89b-12d3-a456-426614174003', 'https://example.com/feed2', 'item-guid-133', 'Remote Item Title 2'
    );

    -- Insert multiple rows into item_value_time_split_recipient
    INSERT INTO item_value_time_split_recipient (
        item_value_time_split_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_value_time_split_id_3, 'lightning', 'recipient1@lightning.com', 50, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_value_time_split_id_3, 'lightning', 'recipient2@lightning.com', 30, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_value_time_split_id_3, 'lightning', 'recipient3@lightning.com', 20, 'Recipient 3', NULL, NULL, FALSE),
        (item_value_time_split_id_3, 'bitcoin', 'recipient4@bitcoin.com', 40, 'Recipient 4', 'key3', 'value3', TRUE);

    -- ITEM #2

    -- Insert a row into item
    INSERT INTO item (
        id_text, slug, channel_id, guid, guid_enclosure_url, pub_date, title, item_flag_status_id
    ) VALUES (
        'item124', 'sample-item-2', channel_id, 'item-guid-124', 'https://samplechannel.com/item2.mp3', TIMESTAMP '2025-01-01 13:00:00+00',
        'Sample Item 2', (SELECT id FROM item_flag_status WHERE status = 'active')
    ) RETURNING id INTO item_id_2;

    -- Insert a row into item_about
    INSERT INTO item_about (
        item_id, duration, explicit, website_link_url, item_itunes_episode_type_id
    ) VALUES (
        item_id_2, 20000, FALSE, 'https://samplechannel.com/item2',
        (SELECT id FROM item_itunes_episode_type WHERE itunes_episode_type = 'full')
    );

    -- Insert a row into item_chapters_feed
    INSERT INTO item_chapters_feed (
        item_id, url, type
    ) VALUES (
        item_id_2, 'https://samplechannel.com/chapters2.json', 'application/json'
    ) RETURNING id INTO item_chapters_feed_id_2;

    -- Insert a row into item_chapters_feed_log
    INSERT INTO item_chapters_feed_log (
        item_chapters_feed_id, last_http_status, last_good_http_status_time, last_finished_parse_time, parse_errors
    ) VALUES (
        item_chapters_feed_id_2, 345, TIMESTAMP '2025-01-01 13:00:00+00', TIMESTAMP '2025-01-01 13:00:00+00', 0
    );

    -- Insert multiple rows into item_chapter
    INSERT INTO item_chapter (
        id_text, item_chapters_feed_id, start_time, end_time, title, img, web_url, table_of_contents
    ) VALUES (
        'chapter4', item_chapters_feed_id_2, 0, 444, 'Introduction 4', 'https://samplechannel.com/chapter4.jpg', 'https://samplechannel.com/chapter4', TRUE
    ) RETURNING id INTO item_chapter_id_3;

    -- Insert multiple rows into item_chapter
    INSERT INTO item_chapter (
        id_text, item_chapters_feed_id, start_time, end_time, title, img, web_url, table_of_contents
    ) VALUES (
        'chapter5', item_chapters_feed_id_2, 444, 555, 'Main Content 5', 'https://samplechannel.com/chapter5.jpg', 'https://samplechannel.com/chapter5', TRUE
    ) RETURNING id INTO item_chapter_id_4;

    -- Insert multiple rows into item_chapter
    INSERT INTO item_chapter (
        id_text, item_chapters_feed_id, start_time, end_time, title, img, web_url, table_of_contents
    ) VALUES (
        'chapter6', item_chapters_feed_id_2, 555, 678, 'Conclusion 6', 'https://samplechannel.com/chapter6.jpg', 'https://samplechannel.com/chapter6', TRUE
    );

    -- Insert multiple rows into item_chapter_location
    INSERT INTO item_chapter_location (
        item_chapter_id, geo, osm, name
    ) VALUES
        (item_chapter_id_3, '37.7749,-122.4194', NULL, 'San Francisco, CA'),
        (item_chapter_id_4, NULL, 'osm12345', 'Golden Gate Bridge');

    -- Insert a row into item_chat
    INSERT INTO item_chat (
        item_id, server, protocol, account_id, space
    ) VALUES (
        item_id_2, 'chat.samplechannel.com', 'irc', 'sample_account', 'sample_space'
    );

    -- Insert multiple rows into item_content_link
    INSERT INTO item_content_link (
        item_id, href, title
    ) VALUES
        (item_id_2, 'https://samplechannel.com/content3', 'Content Link 3'),
        (item_id_2, 'https://samplechannel.com/content4', 'Content Link 4');

    -- Insert a row into item_description
    INSERT INTO item_description (
        item_id, value
    ) VALUES (
        item_id_2, 'This is a sample description for item 2.'
    );

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_2, 'audio/mpeg', 12345678, 128, NULL, 'en', 'Sample Enclosure', 'alternate', 'mp3', TRUE
    ) RETURNING id INTO item_enclosure_id_3;

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_2, 'video/mp4', 98765432, 256, 720, 'en', 'Sample Video Enclosure', 'alternate', 'mp4', FALSE
    ) RETURNING id INTO item_enclosure_id_4;

    -- Insert a row into item_enclosure_integrity for item_enclosure_id_1
    INSERT INTO item_enclosure_integrity (
        item_enclosure_id, type, value
    ) VALUES (
        item_enclosure_id_3, 'sri', 'sha256-abc123def456ghi789jkl012mno345pqr678stu901vwx234yz789'
    );

    -- Insert multiple rows into item_enclosure_source for item_enclosure_id_1
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_enclosure_id_3, 'https://samplechannel.com/audio-source3.mp3', 'audio/mpeg'),
        (item_enclosure_id_3, 'https://samplechannel.com/audio-source4.mp3', 'audio/mpeg');

    -- Insert multiple rows into item_enclosure_source for item_enclosure_id_2
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_enclosure_id_4, 'https://samplechannel.com/video-source3.mp4', 'video/mp4'),
        (item_enclosure_id_4, 'https://samplechannel.com/video-source4.mp4', 'video/mp4');

    -- Insert multiple rows into item_funding
    INSERT INTO item_funding (
        item_id, url, title
    ) VALUES
        (item_id_2, 'https://funding3.samplechannel.com/3', 'Support Item 3'),
        (item_id_2, 'https://funding4.samplechannel.com/4', 'Support Item 4');

    -- Insert multiple rows into item_image
    INSERT INTO item_image (
        item_id, url, image_width_size, is_resized
    ) VALUES
        (item_id_2, 'https://samplechannel.com/item-image3.jpg', 300, FALSE),
        (item_id_2, 'https://samplechannel.com/item-image4.jpg', 500, TRUE);

    -- Insert a row into item_license
    INSERT INTO item_license (
        item_id, identifier, url
    ) VALUES (
        item_id_2, 'CC-BY-4.0', 'https://creativecommons.org/licenses/by/4.0/'
    );

    -- Insert a row into item_location
    INSERT INTO item_location (
        item_id, geo, osm, name
    ) VALUES (
        item_id_2, '37.7749,-122.4194', NULL, 'San Francisco, CA'
    );

    -- Insert multiple rows into item_person
    INSERT INTO item_person (
        item_id, name, role, person_group, img, href
    ) VALUES
        (item_id_2, 'John Doe', 'Host', 'cast', 'https://samplechannel.com/johndoe.jpg', 'https://samplechannel.com/johndoe'),
        (item_id_2, 'Jane Smith', 'Guest', 'guest', 'https://samplechannel.com/janesmith.jpg', 'https://samplechannel.com/janesmith');

    -- Insert a row into item_season
    INSERT INTO item_season (
        channel_season_id, item_id, title
    ) VALUES (
        channel_season_id, item_id_2, 'Season 1 Title'
    );

    -- Insert a row into item_season_episode
    INSERT INTO item_season_episode (
        item_id, display, number
    ) VALUES (
        item_id_2, 'Episode 2', 2
    );

    -- Insert multiple rows into item_social_interact
    INSERT INTO item_social_interact (
        item_id, protocol, uri, account_id, account_url, priority
    ) VALUES
        (item_id_2, 'twitter', 'https://twitter.com/sampleuri2', 'sample_twitter', 'https://twitter.com/sampleaccount2', 1),
        (item_id_2, 'mastodon', 'https://mastodon.social/@sampleuri2', 'sample_mastodon', 'https://mastodon.social/@sampleaccount2', 2);

    -- Insert multiple rows into item_soundbite
    INSERT INTO item_soundbite (
        id_text, item_id, start_time, duration, title
    ) VALUES
        ('soundbite3', item_id_2, 0, 45, 'Intro Soundbite 3'),
        ('soundbite4', item_id_2, 90, 20, 'Highlight Soundbite 4');

    -- Insert multiple rows into item_transcript
    INSERT INTO item_transcript (
        item_id, url, type, language, rel
    ) VALUES
        (item_id_2, 'https://samplechannel.com/transcript3.vtt', 'text/vtt', 'en', 'captions'),
        (item_id_2, 'https://samplechannel.com/transcript4.srt', 'text/srt', 'en', NULL);

    -- Insert multiple rows into item_txt
    INSERT INTO item_txt (
        item_id, purpose, value
    ) VALUES
        (item_id_2, 'summary', 'This is a summary for the item 2.'),
        (item_id_2, 'note', 'This is a note for the item 2.'),
        (item_id_2, 'tagline', 'This is a tagline for the item 2.');

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_2, 'lightning', 'keysend', 0.01
    ) RETURNING id INTO item_value_id_4;

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_2, 'ethereum', 'keysend', 0.02
    ) RETURNING id INTO item_value_id_5;

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_value_id_4, 'node', 'recipient1@lightning.com', 50, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_value_id_4, 'node', 'recipient2@lightning.com', 30, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_value_id_4, 'node', 'recipient3@lightning.com', 20, 'Recipient 3', NULL, NULL, FALSE),
        (item_value_id_4, 'node', 'recipient4@bitcoin.com', 40, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_value_id_5, 'node-eth', 'recipient1@lightningethereum.com', 10, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_value_id_5, 'node-eth', 'recipient2@lightningethereum.com', 20, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_value_id_5, 'node-eth', 'recipient3@lightningethereum.com', 50, 'Recipient 3', NULL, NULL, FALSE),
        (item_value_id_5, 'node-eth', 'recipient4@ethereum.com', 30, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert multiple rows into item_value_time_split
    INSERT INTO item_value_time_split (
        item_value_id, start_time, duration, remote_start_time, remote_percentage
    ) VALUES (
        item_value_id_4, '0.00', '300.00', '0.00', '100.00'
    ) RETURNING id INTO item_value_time_split_id_4;

    -- Insert multiple rows into item_value_time_split
    INSERT INTO item_value_time_split (
        item_value_id, start_time, duration, remote_start_time, remote_percentage
    ) VALUES (
        item_value_id_4, '300.00', '600.00', '0.00', '50.00'
    ) RETURNING id INTO item_value_time_split_id_5;

    -- Insert multiple rows into item_value_time_split
    INSERT INTO item_value_time_split (
        item_value_id, start_time, duration, remote_start_time, remote_percentage
    ) VALUES (
        item_value_id_4, '600.00', '900.00', '0.00', '25.00'
    ) RETURNING id INTO item_value_time_split_id_6;

    -- Insert multiple rows into item_value_time_split_remote_item
    INSERT INTO item_value_time_split_remote_item (
        item_value_time_split_id, feed_guid, feed_url, item_guid, title
    ) VALUES (
        item_value_time_split_id_4, '123e4567-e89b-12d3-a456-426614174000', 'https://example.com/feed1', 'item-guid-123', 'Remote Item Title 1'
    );

    -- Insert multiple rows into item_value_time_split_remote_item
    INSERT INTO item_value_time_split_remote_item (
        item_value_time_split_id, feed_guid, feed_url, item_guid, title
    ) VALUES (
        item_value_time_split_id_5, '123e4567-e89b-12d3-a456-426614174003', 'https://example.com/feed2', 'item-guid-133', 'Remote Item Title 2'
    );

    -- Insert multiple rows into item_value_time_split_recipient
    INSERT INTO item_value_time_split_recipient (
        item_value_time_split_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_value_time_split_id_6, 'lightning', 'recipient1@lightning.com', 20, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_value_time_split_id_6, 'lightning', 'recipient2@lightning.com', 40, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_value_time_split_id_6, 'lightning', 'recipient3@lightning.com', 50, 'Recipient 3', NULL, NULL, FALSE),
        (item_value_time_split_id_6, 'bitcoin', 'recipient4@bitcoin.com', 30, 'Recipient 4', 'key3', 'value3', TRUE);

    -- LIVE ITEM #1

    -- Insert a row into item
    INSERT INTO item (
        id_text, slug, channel_id, guid, guid_enclosure_url, pub_date, title, item_flag_status_id
    ) VALUES (
        'liveitem1', 'live-item-1', channel_id, 'live-item-guid-1', 'https://samplechannel.com/live-item1.mp3', TIMESTAMP '2025-01-01 13:00:00+00',
        'Live Item 1', (SELECT id FROM item_flag_status WHERE status = 'active')
    ) RETURNING id INTO item_id_live_1;

    -- Insert a row into item_about
    INSERT INTO item_about (
        item_id, duration, explicit, website_link_url, item_itunes_episode_type_id
    ) VALUES (
        item_id_live_1, 10000, FALSE, 'https://samplechannel.com/live-item1',
        (SELECT id FROM item_itunes_episode_type WHERE itunes_episode_type = 'full')
    );
    
    -- Insert a row into item_description
    INSERT INTO item_description (
        item_id, value
    ) VALUES (
        item_id_live_1, 'This is a sample description for item live 1.'
    );

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_live_1, 'audio/mpeg', 12345678, 128, NULL, 'en', 'Sample Enclosure', 'alternate', 'mp3', TRUE
    ) RETURNING id INTO item_live_enclosure_id_1;

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_live_1, 'video/mp4', 98765432, 256, 720, 'en', 'Sample Video Enclosure', 'alternate', 'mp4', FALSE
    ) RETURNING id INTO item_live_enclosure_id_2;

    -- Insert multiple rows into item_enclosure_source for item_live_enclosure_id_1
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_live_enclosure_id_1, 'https://samplechannel.com/live-audio-source1.mp3', 'audio/mpeg'),
        (item_live_enclosure_id_1, 'https://samplechannel.com/live-audio-source2.mp3', 'audio/mpeg');

    -- Insert multiple rows into item_enclosure_source for item_live_enclosure_id_2
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_live_enclosure_id_2, 'https://samplechannel.com/live-video-source3.mp4', 'video/mp4'),
        (item_live_enclosure_id_2, 'https://samplechannel.com/live-video-source4.mp4', 'video/mp4');

    -- Insert multiple rows into item_image
    INSERT INTO item_image (
        item_id, url, image_width_size, is_resized
    ) VALUES
        (item_id_live_1, 'https://samplechannel.com/live-item-image1.jpg', 300, FALSE),
        (item_id_live_1, 'https://samplechannel.com/live-item-image2.jpg', 500, TRUE);

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_live_1, 'lightning', 'keysend', 0.01
    ) RETURNING id INTO item_live_value_id_1;

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_live_1, 'ethereum', 'keysend', 0.02
    ) RETURNING id INTO item_live_value_id_2;

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_live_value_id_1, 'node', 'recipient1@lightning.com', 50, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_live_value_id_1, 'node', 'recipient2@lightning.com', 30, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_live_value_id_1, 'node', 'recipient3@lightning.com', 20, 'Recipient 3', NULL, NULL, FALSE),
        (item_live_value_id_1, 'node', 'recipient4@bitcoin.com', 40, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_live_value_id_2, 'node-eth', 'recipient1@lightningethereum.com', 10, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_live_value_id_2, 'node-eth', 'recipient2@lightningethereum.com', 20, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_live_value_id_2, 'node-eth', 'recipient3@lightningethereum.com', 50, 'Recipient 3', NULL, NULL, FALSE),
        (item_live_value_id_2, 'node-eth', 'recipient4@ethereum.com', 30, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert a row into live_item for item_id_live_1
    INSERT INTO live_item (
        item_id, live_item_status_id, start_time, end_time, chat_web_url
    ) VALUES (
        item_id_live_1, 
        (SELECT id FROM live_item_status WHERE status = 'live'),
        TIMESTAMP '2025-01-01 13:00:00+00', 
        TIMESTAMP '2025-01-01 14:00:00+00', 
        'https://chat.samplechannel.com/live-item1'
    );

    -- LIVE ITEM #2

    -- Insert a row into item
    INSERT INTO item (
        id_text, slug, channel_id, guid, guid_enclosure_url, pub_date, title, item_flag_status_id
    ) VALUES (
        'liveitem2', 'live-item-2', channel_id, 'live-item-guid-2', 'https://samplechannel.com/live-item2.mp3', TIMESTAMP '2025-01-01 13:00:00+00',
        'Live Item 2', (SELECT id FROM item_flag_status WHERE status = 'active')
    ) RETURNING id INTO item_id_live_2;

    -- Insert a row into item_about
    INSERT INTO item_about (
        item_id, duration, explicit, website_link_url, item_itunes_episode_type_id
    ) VALUES (
        item_id_live_2, 10000, FALSE, 'https://samplechannel.com/live-item2',
        (SELECT id FROM item_itunes_episode_type WHERE itunes_episode_type = 'full')
    );
    
    -- Insert a row into item_description
    INSERT INTO item_description (
        item_id, value
    ) VALUES (
        item_id_live_2, 'This is a sample description for item live 2.'
    );

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_live_2, 'audio/mpeg', 12345678, 128, NULL, 'en', 'Sample Enclosure', 'alternate', 'mp3', TRUE
    ) RETURNING id INTO item_live_enclosure_id_3;

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_live_2, 'video/mp4', 98765432, 256, 720, 'en', 'Sample Video Enclosure', 'alternate', 'mp4', FALSE
    ) RETURNING id INTO item_live_enclosure_id_4;

    -- Insert multiple rows into item_enclosure_source for item_live_enclosure_id_1
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_live_enclosure_id_3, 'https://samplechannel.com/live-audio-source3.mp3', 'audio/mpeg'),
        (item_live_enclosure_id_3, 'https://samplechannel.com/live-audio-source4.mp3', 'audio/mpeg');

    -- Insert multiple rows into item_enclosure_source for item_live_enclosure_id_2
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_live_enclosure_id_4, 'https://samplechannel.com/live-video-source3.mp4', 'video/mp4'),
        (item_live_enclosure_id_4, 'https://samplechannel.com/live-video-source4.mp4', 'video/mp4');

    -- Insert multiple rows into item_image
    INSERT INTO item_image (
        item_id, url, image_width_size, is_resized
    ) VALUES
        (item_id_live_2, 'https://samplechannel.com/live-item-image3.jpg', 300, FALSE),
        (item_id_live_2, 'https://samplechannel.com/live-item-image4.jpg', 500, TRUE);

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_live_1, 'lightning', 'keysend', 0.01
    ) RETURNING id INTO item_live_value_id_3;

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_live_1, 'ethereum', 'keysend', 0.02
    ) RETURNING id INTO item_live_value_id_4;

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_live_value_id_3, 'node', 'recipient1@lightning.com', 50, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_live_value_id_3, 'node', 'recipient2@lightning.com', 30, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_live_value_id_3, 'node', 'recipient3@lightning.com', 20, 'Recipient 3', NULL, NULL, FALSE),
        (item_live_value_id_3, 'node', 'recipient4@bitcoin.com', 40, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_live_value_id_4, 'node-eth', 'recipient1@lightningethereum.com', 10, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_live_value_id_4, 'node-eth', 'recipient2@lightningethereum.com', 20, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_live_value_id_4, 'node-eth', 'recipient3@lightningethereum.com', 50, 'Recipient 3', NULL, NULL, FALSE),
        (item_live_value_id_4, 'node-eth', 'recipient4@ethereum.com', 30, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert a row into live_item for item_id_live_2
    INSERT INTO live_item (
        item_id, live_item_status_id, start_time, end_time, chat_web_url
    ) VALUES (
        item_id_live_2,
        (SELECT id FROM live_item_status WHERE status = 'pending'),
        TIMESTAMP '2025-01-01 13:00:00+00', 
        TIMESTAMP '2025-01-01 14:00:00+00', 
        'https://chat.samplechannel.com/live-item2'
    );

    -- LIVE ITEM #3

    -- Insert a row into item
    INSERT INTO item (
        id_text, slug, channel_id, guid, guid_enclosure_url, pub_date, title, item_flag_status_id
    ) VALUES (
        'liveitem3', 'live-item-3', channel_id, 'live-item-guid-3', 'https://samplechannel.com/live-item3.mp3', TIMESTAMP '2025-01-01 13:00:00+00',
        'Live Item 3', (SELECT id FROM item_flag_status WHERE status = 'active')
    ) RETURNING id INTO item_id_live_3;

    -- Insert a row into item_about
    INSERT INTO item_about (
        item_id, duration, explicit, website_link_url, item_itunes_episode_type_id
    ) VALUES (
        item_id_live_3, 10000, FALSE, 'https://samplechannel.com/live-item3',
        (SELECT id FROM item_itunes_episode_type WHERE itunes_episode_type = 'full')
    );
    
    -- Insert a row into item_description
    INSERT INTO item_description (
        item_id, value
    ) VALUES (
        item_id_live_3, 'This is a sample description for item live 3.'
    );

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_live_3, 'audio/mpeg', 12345678, 128, NULL, 'en', 'Sample Enclosure', 'alternate', 'mp3', TRUE
    ) RETURNING id INTO item_live_enclosure_id_5;

    -- Insert a row into item_enclosure
    INSERT INTO item_enclosure (
        item_id, type, length, bitrate, height, language, title, rel, codecs, item_enclosure_default
    ) VALUES (
        item_id_live_3, 'video/mp4', 98765432, 256, 720, 'en', 'Sample Video Enclosure', 'alternate', 'mp4', FALSE
    ) RETURNING id INTO item_live_enclosure_id_6;

    -- Insert multiple rows into item_enclosure_source for item_live_enclosure_id_1
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_live_enclosure_id_5, 'https://samplechannel.com/live-audio-source5.mp3', 'audio/mpeg'),
        (item_live_enclosure_id_5, 'https://samplechannel.com/live-audio-source6.mp3', 'audio/mpeg');

    -- Insert multiple rows into item_enclosure_source for item_live_enclosure_id_2
    INSERT INTO item_enclosure_source (
        item_enclosure_id, uri, content_type
    ) VALUES
        (item_live_enclosure_id_6, 'https://samplechannel.com/live-video-source5.mp4', 'video/mp4'),
        (item_live_enclosure_id_6, 'https://samplechannel.com/live-video-source6.mp4', 'video/mp4');

    -- Insert multiple rows into item_image
    INSERT INTO item_image (
        item_id, url, image_width_size, is_resized
    ) VALUES
        (item_id_live_3, 'https://samplechannel.com/live-item-image5.jpg', 300, FALSE),
        (item_id_live_3, 'https://samplechannel.com/live-item-image6.jpg', 500, TRUE);

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_live_3, 'lightning', 'keysend', 0.01
    ) RETURNING id INTO item_live_value_id_5;

    -- Insert multiple rows into item_value
    INSERT INTO item_value (
        item_id, type, method, suggested
    ) VALUES (
        item_id_live_3, 'ethereum', 'keysend', 0.02
    ) RETURNING id INTO item_live_value_id_6;

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_live_value_id_5, 'node', 'recipient1@lightning.com', 50, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_live_value_id_5, 'node', 'recipient2@lightning.com', 30, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_live_value_id_5, 'node', 'recipient3@lightning.com', 20, 'Recipient 3', NULL, NULL, FALSE),
        (item_live_value_id_5, 'node', 'recipient4@bitcoin.com', 40, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert multiple rows into item_value_recipient
    INSERT INTO item_value_recipient (
        item_value_id, type, address, split, name, custom_key, custom_value, fee
    ) VALUES
        (item_live_value_id_6, 'node-eth', 'recipient1@lightningethereum.com', 10, 'Recipient 1', 'key1', 'value1', FALSE),
        (item_live_value_id_6, 'node-eth', 'recipient2@lightningethereum.com', 20, 'Recipient 2', 'key2', 'value2', TRUE),
        (item_live_value_id_6, 'node-eth', 'recipient3@lightningethereum.com', 50, 'Recipient 3', NULL, NULL, FALSE),
        (item_live_value_id_6, 'node-eth', 'recipient4@ethereum.com', 30, 'Recipient 4', 'key3', 'value3', TRUE);

    -- Insert a row into live_item for item_id_live_3
    INSERT INTO live_item (
        item_id, live_item_status_id, start_time, end_time, chat_web_url
    ) VALUES (
        item_id_live_3,
        (SELECT id FROM live_item_status WHERE status = 'ended'),
        TIMESTAMP '2025-01-01 13:00:00+00', 
        TIMESTAMP '2025-01-01 14:00:00+00', 
        'https://chat.samplechannel.com/live-item3'
    );

END $$;
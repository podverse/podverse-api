-- basic-valid@example.com

-- Insert into account table
INSERT INTO account (id, id_text, verified, sharable_status_id)
VALUES (1, 'basic-valid', TRUE, 1);

-- Insert into account_app_store_purchase table
INSERT INTO account_app_store_purchase (
    account_id, 
    transaction_id, 
    product_id, 
    purchase_date, 
    expires_date, 
    is_trial_period
)
VALUES (
    1, 
    'sample-transaction-id', 
    'sample-product-id', 
    TIMESTAMP '2023-01-01 12:00:00+00', 
    TIMESTAMP '2024-01-01 12:00:00+00', 
    TRUE
);

-- Insert into account_credentials table
INSERT INTO account_credentials (account_id, email, password)
VALUES (1, 'basic-valid@example.com', '$2b$10$XmjWYlUZ7bC75XofkIgmsuFG.o5fGbfeIMMzwmsto5wvQdd8CZjLS');

-- Insert into account_email_change_verification table
INSERT INTO account_email_change_verification (account_id, verification_token, verification_token_expires_at, pending_email_address)
VALUES (1, 'sample-verification-token', TIMESTAMP '2030-01-01 13:00:00+00', 'basic-valid-new@example.com');

-- Insert into account_fcm_device table
INSERT INTO account_fcm_device (fcm_token, account_id)
VALUES ('sample-fcm-token', 1);

-- Insert into account_google_play_purchase table
INSERT INTO account_google_play_purchase (account_id, transaction_id, product_id, purchase_token)
VALUES (1, 'sample-transaction-id', 'sample-product-id', 'sample-purchase-token');

-- Insert into account_membership_status table
INSERT INTO account_membership_status (account_id, account_membership_id, membership_expires_at)
VALUES (1, 2, TIMESTAMP '2030-01-01 13:00:00+00');

-- Insert into account_paypal_order table
INSERT INTO account_paypal_order (account_id, payment_id, state)
VALUES (1, 'sample-payment-id', 'completed');

-- Insert into account_profile table
INSERT INTO account_profile (account_id, display_name, bio)
VALUES (1, 'Premium User', 'This is a premium user.');

-- Insert into account_reset_password table
INSERT INTO account_reset_password (account_id, reset_token, reset_token_expires_at)
VALUES (1, 'sample-reset-token', TIMESTAMP '2030-01-01 13:00:00+00');

-- Insert into account_up_device table
INSERT INTO account_up_device (account_id, up_endpoint, up_public_key, up_auth_key)
VALUES (1, 'https://example.com/endpoint', 'sample-public-key', 'sample-auth-key');

-- Insert into account_verification table
INSERT INTO account_verification (account_id, verification_token, verification_token_expires_at)
VALUES (1, 'sample-verification-token', TIMESTAMP '2030-01-01 13:00:00+00');

-- trial-valid@example.com

-- Insert into account table
INSERT INTO account (id, id_text, verified, sharable_status_id)
VALUES (2, 'trial-valid', TRUE, 1);

-- Insert into account_app_store_purchase table
INSERT INTO account_app_store_purchase (
    account_id, 
    transaction_id, 
    product_id, 
    purchase_date, 
    expires_date, 
    is_trial_period
)
VALUES (
    2, 
    'trial-transaction-id', 
    'trial-product-id', 
    TIMESTAMP '2023-01-01 12:00:00+00', 
    TIMESTAMP '2023-02-01 12:00:00+00', 
    TRUE
);

-- Insert into account_credentials table
INSERT INTO account_credentials (account_id, email, password)
VALUES (2, 'trial-valid@example.com', '$2b$10$XmjWYlUZ7bC75XofkIgmsuFG.o5fGbfeIMMzwmsto5wvQdd8CZjLS');

-- Insert into account_email_change_verification table
INSERT INTO account_email_change_verification (account_id, verification_token, verification_token_expires_at, pending_email_address)
VALUES (2, 'trial-verification-token', TIMESTAMP '2030-01-01 13:00:00+00', 'trial-new@example.com');

-- Insert into account_fcm_device table
INSERT INTO account_fcm_device (fcm_token, account_id)
VALUES ('trial-fcm-token', 2);

-- Insert into account_google_play_purchase table
INSERT INTO account_google_play_purchase (account_id, transaction_id, product_id, purchase_token)
VALUES (2, 'trial-transaction-id', 'trial-product-id', 'trial-purchase-token');

-- Insert into account_membership_status table
INSERT INTO account_membership_status (account_id, account_membership_id, membership_expires_at)
VALUES (2, 1, TIMESTAMP '2023-02-01 12:00:00+00');

-- Insert into account_paypal_order table
INSERT INTO account_paypal_order (account_id, payment_id, state)
VALUES (2, 'trial-payment-id', 'completed');

-- Insert into account_profile table
INSERT INTO account_profile (account_id, display_name, bio)
VALUES (2, 'Trial User', 'This is a trial user.');

-- Insert into account_reset_password table
INSERT INTO account_reset_password (account_id, reset_token, reset_token_expires_at)
VALUES (2, 'trial-reset-token', TIMESTAMP '2030-01-01 13:00:00+00');

-- Insert into account_up_device table
INSERT INTO account_up_device (account_id, up_endpoint, up_public_key, up_auth_key)
VALUES (2, 'https://example.com/trial-endpoint', 'trial-public-key', 'trial-auth-key');

-- Insert into account_verification table
INSERT INTO account_verification (account_id, verification_token, verification_token_expires_at)
VALUES (2, 'trial-verification-token', TIMESTAMP '2030-01-01 13:00:00+00');

-- trial-expired@example.com

-- Insert into account table
INSERT INTO account (id, id_text, verified, sharable_status_id)
VALUES (3, 'trial-expired', TRUE, 1);

-- Insert into account_app_store_purchase table
INSERT INTO account_app_store_purchase (
    account_id, 
    transaction_id, 
    product_id, 
    purchase_date, 
    expires_date, 
    is_trial_period
)
VALUES (
    3, 
    'expired-transaction-id', 
    'expired-product-id', 
    TIMESTAMP '2022-01-01 12:00:00+00', 
    TIMESTAMP '2022-02-01 12:00:00+00', 
    TRUE
);

-- Insert into account_credentials table
INSERT INTO account_credentials (account_id, email, password)
VALUES (3, 'trial-expired@example.com', '$2b$10$XmjWYlUZ7bC75XofkIgmsuFG.o5fGbfeIMMzwmsto5wvQdd8CZjLS');

-- Insert into account_email_change_verification table
INSERT INTO account_email_change_verification (account_id, verification_token, verification_token_expires_at, pending_email_address)
VALUES (3, 'expired-verification-token', TIMESTAMP '2030-01-01 13:00:00+00', 'expired-new@example.com');

-- Insert into account_fcm_device table
INSERT INTO account_fcm_device (fcm_token, account_id)
VALUES ('expired-fcm-token', 3);

-- Insert into account_google_play_purchase table
INSERT INTO account_google_play_purchase (account_id, transaction_id, product_id, purchase_token)
VALUES (3, 'expired-transaction-id', 'expired-product-id', 'expired-purchase-token');

-- Insert into account_membership_status table
INSERT INTO account_membership_status (account_id, account_membership_id, membership_expires_at)
VALUES (3, 1, TIMESTAMP '2022-02-01 12:00:00+00');

-- Insert into account_paypal_order table
INSERT INTO account_paypal_order (account_id, payment_id, state)
VALUES (3, 'expired-payment-id', 'completed');

-- Insert into account_profile table
INSERT INTO account_profile (account_id, display_name, bio)
VALUES (3, 'Expired Trial User', 'This is an expired trial user.');

-- Insert into account_reset_password table
INSERT INTO account_reset_password (account_id, reset_token, reset_token_expires_at)
VALUES (3, 'expired-reset-token', TIMESTAMP '2030-01-01 13:00:00+00');

-- Insert into account_up_device table
INSERT INTO account_up_device (account_id, up_endpoint, up_public_key, up_auth_key)
VALUES (3, 'https://example.com/expired-endpoint', 'expired-public-key', 'expired-auth-key');

-- Insert into account_verification table
INSERT INTO account_verification (account_id, verification_token, verification_token_expires_at)
VALUES (3, 'expired-verification-token', TIMESTAMP '2030-01-01 13:00:00+00');

-- basic-expired@example.com

-- Insert into account table
INSERT INTO account (id, id_text, verified, sharable_status_id)
VALUES (4, 'basic-expired', TRUE, 1);

-- Insert into account_app_store_purchase table
INSERT INTO account_app_store_purchase (
    account_id, 
    transaction_id, 
    product_id, 
    purchase_date, 
    expires_date, 
    is_trial_period
)
VALUES (
    4, 
    'expired-premium-transaction-id', 
    'expired-premium-product-id', 
    TIMESTAMP '2022-01-01 12:00:00+00', 
    TIMESTAMP '2022-12-31 12:00:00+00', 
    FALSE
);

-- Insert into account_credentials table
INSERT INTO account_credentials (account_id, email, password)
VALUES (4, 'basic-expired@example.com', '$2b$10$XmjWYlUZ7bC75XofkIgmsuFG.o5fGbfeIMMzwmsto5wvQdd8CZjLS');

-- Insert into account_email_change_verification table
INSERT INTO account_email_change_verification (account_id, verification_token, verification_token_expires_at, pending_email_address)
VALUES (4, 'expired-premium-verification-token', TIMESTAMP '2030-01-01 13:00:00+00', 'basic-expired-new@example.com');

-- Insert into account_fcm_device table
INSERT INTO account_fcm_device (fcm_token, account_id)
VALUES ('expired-premium-fcm-token', 4);

-- Insert into account_google_play_purchase table
INSERT INTO account_google_play_purchase (account_id, transaction_id, product_id, purchase_token)
VALUES (4, 'expired-premium-transaction-id', 'expired-premium-product-id', 'expired-premium-purchase-token');

-- Insert into account_membership_status table
INSERT INTO account_membership_status (account_id, account_membership_id, membership_expires_at)
VALUES (4, 2, TIMESTAMP '2022-12-31 12:00:00+00');

-- Insert into account_paypal_order table
INSERT INTO account_paypal_order (account_id, payment_id, state)
VALUES (4, 'expired-premium-payment-id', 'completed');

-- Insert into account_profile table
INSERT INTO account_profile (account_id, display_name, bio)
VALUES (4, 'Expired Premium User', 'This is an expired premium user.');

-- Insert into account_reset_password table
INSERT INTO account_reset_password (account_id, reset_token, reset_token_expires_at)
VALUES (4, 'expired-premium-reset-token', TIMESTAMP '2030-01-01 13:00:00+00');

-- Insert into account_up_device table
INSERT INTO account_up_device (account_id, up_endpoint, up_public_key, up_auth_key)
VALUES (4, 'https://example.com/expired-premium-endpoint', 'expired-premium-public-key', 'expired-premium-auth-key');

-- Insert into account_verification table
INSERT INTO account_verification (account_id, verification_token, verification_token_expires_at)
VALUES (4, 'expired-premium-verification-token', TIMESTAMP '2030-01-01 13:00:00+00');

<?php
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/app.php';

$google_client = new Google_Client();

$google_client->setClientId(getenv('FC_GOOGLE_CLIENT_ID'));
$google_client->setClientSecret(getenv('FC_GOOGLE_CLIENT_SECRET'));

$redirect_uri = getenv('FC_GOOGLE_REDIRECT_URI') ?: APP_BASE . '/auth.php';
$google_client->setRedirectUri($redirect_uri);

$google_client->addScope('email');
$google_client->addScope('profile');
$google_client->setAccessType('offline');
$google_client->setPrompt('select_account');

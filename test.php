<?php

$redirectUri = $_GET['redirect_uri'];
$separator = !str_contains($redirectUri, '?') ? '?' : '&';
header('Location: ' . $redirectUri . $separator . 'sso=ok');

<?php

/**
 * One-off fix for internal menu link URIs with raw (non-percent-encoded)
 * accented characters, which crash Drupal core's Url::fromInternalUri()
 * via a PHP parse_url() quirk (bytes like the "í" in "Economía" get
 * corrupted, and the path is misclassified as external).
 *
 * Run with: vendor/bin/drush scr scripts/fix-menu-link-encoding.php
 *
 * Safe to run more than once: already-encoded URIs are left untouched.
 */

$storage = \Drupal::entityTypeManager()->getStorage('menu_link_content');
$ids = $storage->getQuery()->accessCheck(FALSE)
  ->condition('link.uri', 'internal:%', 'LIKE')
  ->execute();

$fixed = 0;
foreach ($ids as $id) {
  $link = $storage->load($id);
  $uri = $link->get('link')->uri;

  if (strpos($uri, 'internal:/') !== 0) {
    continue;
  }

  $path = substr($uri, strlen('internal:/'));
  if (!preg_match('/[\x80-\xFF]/', $path)) {
    // No raw non-ASCII bytes, nothing to fix.
    continue;
  }

  $segments = explode('/', $path);
  $encoded = implode('/', array_map('rawurlencode', $segments));
  $new_uri = 'internal:/' . $encoded;

  if ($new_uri === $uri) {
    continue;
  }

  $link->set('link', [
    'uri' => $new_uri,
    'title' => $link->get('link')->title,
    'options' => $link->get('link')->options,
  ]);
  $link->save();
  $fixed++;
  echo "Fixed [$id]: $uri => $new_uri\n";
}

echo "Total fixed: $fixed\n";

// Verify none are left broken.
$broken = [];
foreach ($ids as $id) {
  $link = $storage->load($id);
  try {
    $link->getUrlObject();
  }
  catch (\Exception $e) {
    $broken[] = $id;
  }
}
echo 'Remaining broken: ' . count($broken) . "\n";

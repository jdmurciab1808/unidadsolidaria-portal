<?php

/**
 * One-off fix for internal menu link URIs with raw (non-percent-encoded)
 * accented characters.
 *
 * Two problems, two steps:
 *
 * 1. Raw non-ASCII bytes in an `internal:` URI crash Drupal core's
 *    Url::fromInternalUri() via a PHP parse_url() quirk (e.g. the "í" in
 *    "Economía" gets corrupted, and the path is misclassified as
 *    external). Percent-encoding the path avoids the crash.
 *
 * 2. Percent-encoding alone is NOT enough: Drupal's menu link plugin
 *    system round-trips the URI through Url::toUri()/Url::fromUri() when
 *    building the cached plugin definition (see
 *    MenuLinkBase::getUrlObject() and core's `base:` URI representation).
 *    For an alias-text path (not a real route), that round-trip
 *    re-encodes an already-encoded path, producing a double-encoded
 *    (%25C3%25...) href that 404s. The fix is to point the link at the
 *    underlying entity route (`internal:/node/NN`) instead of the alias
 *    text whenever the alias still resolves to real content — route-based
 *    links are regenerated fresh on every render, so they can't go stale
 *    or double-encode.
 *
 * For links whose alias no longer resolves to anything (dead links,
 * unrelated to encoding — the content was renamed/removed), this script
 * leaves them as a single percent-encoded `internal:/<path>` URI: safe
 * (no crash), but still a 404 until someone decides the correct
 * destination. Those need a manual content decision, not an automated
 * guess.
 *
 * Run with: vendor/bin/drush scr scripts/fix-menu-link-encoding.php
 *
 * Safe to run more than once: already-fixed URIs are left untouched.
 */

$storage = \Drupal::entityTypeManager()->getStorage('menu_link_content');
$alias_manager = \Drupal::service('path_alias.manager');
$ids = $storage->getQuery()->accessCheck(FALSE)
  ->condition('link.uri', 'internal:%', 'LIKE')
  ->execute();

$routed = 0;
$encoded_only = 0;
foreach ($ids as $id) {
  $link = $storage->load($id);
  $uri = $link->get('link')->uri;

  if (strpos($uri, 'internal:/') !== 0) {
    continue;
  }

  $raw_path = substr($uri, strlen('internal:/'));
  // Decode first so this is safe to re-run against already-encoded URIs
  // (e.g. ones only fixed by an earlier, encoding-only version of this
  // script), not just against the original raw-UTF8 ones.
  $decoded_path = rawurldecode($raw_path);

  if (!preg_match('/[\x80-\xFF]/', $decoded_path)) {
    // Plain ASCII path, nothing to do.
    continue;
  }

  // Prefer routing straight to the entity: resolves the alias once, here,
  // and every future render regenerates the href fresh (no stale/ double
  // encoding possible).
  $system_path = $alias_manager->getPathByAlias('/' . $decoded_path);
  if ($system_path !== '/' . $decoded_path) {
    $new_uri = 'internal:' . $system_path;
    if ($new_uri !== $uri) {
      $link->set('link', [
        'uri' => $new_uri,
        'title' => $link->get('link')->title,
        'options' => $link->get('link')->options,
      ]);
      $link->save();
      $routed++;
      echo "Routed [$id]: $uri => $new_uri\n";
    }
    continue;
  }

  // No matching alias (dead link, separate content problem). Just make
  // sure it's at least safely single-encoded so it 404s cleanly instead
  // of crashing or double-encoding.
  $segments = explode('/', $decoded_path);
  $new_uri = 'internal:/' . implode('/', array_map('rawurlencode', $segments));
  if ($new_uri !== $uri) {
    $link->set('link', [
      'uri' => $new_uri,
      'title' => $link->get('link')->title,
      'options' => $link->get('link')->options,
    ]);
    $link->save();
    $encoded_only++;
    echo "Encoded only (dead link, needs manual fix) [$id]: $uri => $new_uri\n";
  }
}

echo "Routed to entity: $routed\n";
echo "Encoded only (still dead, needs manual review): $encoded_only\n";

// Verify none are left crashing.
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
echo 'Remaining crashing: ' . count($broken) . "\n";

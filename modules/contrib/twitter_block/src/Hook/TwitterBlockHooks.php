<?php

namespace Drupal\twitter_block\Hook;

use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Hook implementations for twitter_block.
 */
class TwitterBlockHooks {
  use StringTranslationTrait;

  /**
   * Implements hook_help().
   */
  #[Hook('help')]
  public function help($route_name, RouteMatchInterface $route_match) {
    if ($route_name == 'help.page.twitter_block') {
      return '<p>' . $this->t('This module provides configurable blocks for a Twitter feed.') . '</p>';
    }
  }

}

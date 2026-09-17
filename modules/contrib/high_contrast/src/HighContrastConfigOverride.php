<?php

namespace Drupal\high_contrast;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ConfigFactoryOverrideInterface;
use Drupal\Core\Config\StorageInterface;
use Drupal\Core\Extension\ThemeExtensionList;
use Drupal\Core\File\Exception\FileException;
use Drupal\Core\File\FileSystemInterface;

/**
 * Configuration override class for high contrast.
 *
 * Overrides the site logo if high contrast is enabled.
 */
class HighContrastConfigOverride implements ConfigFactoryOverrideInterface {

  use HighContrastTrait;

  /**
   * Config factory interface.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  private $configFactory;

  /**
   * The file system interface.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  private $fileSystem;

  /**
   * The theme extension list.
   *
   * @var \Drupal\Core\Extension\ThemeExtensionList
   */
  private $themeExtensionList;

  /**
   * Construct a new HighContrastConfigOverride object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\File\FileSystemInterface $file_system
   *   The file system.
   * @param \Drupal\Core\Extension\ThemeExtensionList $theme_extension_list
   *   The theme extension list.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    FileSystemInterface $file_system,
    ThemeExtensionList $theme_extension_list) {
    $this->configFactory = $config_factory;
    $this->fileSystem = $file_system;
    $this->themeExtensionList = $theme_extension_list;
  }

  /**
   * {@inheritdoc}
   *
   * @todo Override the right logo. See https://www.drupal.org/node/2866194
   */
  public function loadOverrides($names) {
    $overrides = [];

    if (in_array('system.theme.global', $names) && $this->highContrastEnabled() && $logo = $this->getHighContrastLogo()) {
      $overrides['system.theme.global']['logo']['path'] = $logo;
      $overrides['system.theme.global']['logo']['url'] = '';
      $overrides['system.theme.global']['logo']['use_default'] = FALSE;
    }

    return $overrides;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheSuffix() {
    return 'HighContrastConfigOverride';
  }

  /**
   * {@inheritdoc}
   *
   * @todo Check the right $name. See https://www.drupal.org/node/2866194 and https://www.drupal.org/project/high_contrast/issues/3342906
   */
  public function getCacheableMetadata($name) {
    $metadata = new CacheableMetadata();

    if ($name === 'system.theme.global') {
      $config = $this->configFactory->get('high_contrast.settings');

      // Cache depends on enabled state and configuration.
      $metadata->addCacheContexts(['high_contrast']);
      $metadata->addCacheableDependency($config);
    }

    return $metadata;
  }

  /**
   * {@inheritdoc}
   */
  public function createConfigObject($name, $collection = StorageInterface::DEFAULT_COLLECTION) {
    return NULL;
  }

  /**
   * Returns the configured logo, either from theme dir of configured path.
   */
  private function getHighContrastLogo() {
    $logo = NULL;

    $config = $this->configFactory->get('high_contrast.settings');

    if ($config->get('default_logo')) {
      // If the default logo is desired, scan the theme dir for a logo_hg file.
      // Not using dependency injection to prevent circular references.
      $theme = \Drupal::theme()->getActiveTheme()->getName();
      $theme_path = $this->themeExtensionList->getPath($theme);

      $candidates = [];
      try {
        if (is_dir($theme_path)) {
          $candidates = $this->fileSystem->scanDirectory($theme_path, "/logo_hg\.(svg|png|jpg|gif)$/");
        }
        if (!empty($candidates)) {
          $logo = reset($candidates)->uri;
        }
      }
      catch (FileException $e) {
        // Ignore and return empty array for BC.
      }
    }
    elseif ($config->get('logo_path')) {
      // No default logo, return the custom logo instead.
      $logo = $config->get('logo_path');
    }

    return $logo;
  }

}

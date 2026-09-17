<?php

namespace Drupal\social_media_platforms\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Extension\ExtensionPathResolver;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Template\Attribute;
use Drupal\Core\Theme\ThemeManager;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a Social Media Links block.
 *
 * @Block(
 *   id = "social_media_platform_block",
 *   admin_label = @Translation("Social Media Platform Links"),
 *   category = @Translation("Social Media Platforms"),
 * )
 */
final class SocialMediaBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Constructs the Block instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Theme\ThemeManager $themeManager
   *   The theme manager.
   * @param \Drupal\Core\Extension\ExtensionPathResolver $pathResolver
   *   The path resolver.
   * @param \Drupal\Core\Config\ConfigFactory $config
   *   The config factory.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    protected ThemeManager $themeManager,
    protected ExtensionPathResolver $pathResolver,
    protected ConfigFactory $config,
  ) {
    parent::__construct($configuration,
    $plugin_id,
    $plugin_definition,
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new self(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('theme.manager'),
      $container->get('extension.path.resolver'),
      $container->get('config.factory'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

    $path = '/' . $this->pathResolver->getPath('module', 'social_media_platforms') . '/images';
    $config = $this->config->get('social_media_platforms.settings');

    $output = [
      '#theme' => 'social_media_platforms_links',
      '#cache' => [
        'tags' => $config->getCacheTags(),
        'context' => $config->getCacheContexts(),
        'max-age' => $config->getCacheMaxAge(),
      ],
    ];

    $output['#display_options'] = $config->get('display_options');

    $platforms = $config->get('platforms');
    $weights = array_combine(
      array_keys($platforms),
      array_column($platforms, 'weight')
    );
    asort($weights);

    foreach ($weights as $key => $weight) {

      if (!$platforms[$key]['url']) {
        continue;
      }

      $output['#platforms'][$key] = array_merge(
        $platforms[$key],
        [
          'image' => "$path/$key.png",
          'attributes' => new Attribute(),
        ]
      );
    }

    return $output;
  }

}

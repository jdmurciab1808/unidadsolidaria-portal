<?php

namespace Drupal\menu_bootstrap_icon\Plugin\CKEditor5Plugin;

use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableInterface;
use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableTrait;
use Drupal\ckeditor5\Plugin\CKEditor5PluginDefault;
use Drupal\ckeditor5\Plugin\CKEditor5PluginDefinition;
use Drupal\Component\Serialization\Json;
use Drupal\Core\Asset\LibraryDiscoveryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\editor\EditorInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * CKEditor 5 Bootstrap Icon plugin.
 */
class BootstrapIcons extends CKEditor5PluginDefault implements CKEditor5PluginConfigurableInterface, ContainerFactoryPluginInterface {

  use CKEditor5PluginConfigurableTrait;

  /**
   * Constructs a new BootstrapIcons instance.
   *
   * {@inheritDoc}
   */
  public function __construct(array $configuration, string $plugin_id, CKEditor5PluginDefinition $plugin_definition, protected LibraryDiscoveryInterface $libraryDiscovery) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritDoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('library.discovery'),
    );
  }

  /**
   * {@inheritDoc}
   */
  public function defaultConfiguration() {
    return [
      'cdn_bootstrap' => FALSE,
    ];
  }

  /**
   * {@inheritDoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['cdn_bootstrap'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Icon bootstrap CDN'),
      '#description' => $this->t("Enable if your admin theme does not support icons like <a href='https://www.drupal.org/project/bootstrap5_admin'>bootstrap 5 admin</a> theme"),
      '#default_value' => $this->configuration['cdn_bootstrap'] ?? FALSE,
    ];
    return $form;
  }

  /**
   * {@inheritDoc}
   */
  public function validateConfigurationForm(array &$form, FormStateInterface $form_state) {
    return FALSE;
  }

  /**
   * {@inheritDoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $this->configuration['cdn_bootstrap'] = (boolean) $form_state->getValue('cdn_bootstrap') ?? FALSE;
  }

  /**
   * {@inheritdoc}
   *
   * Get search list bootstrap icon in editor config.
   */
  public function getDynamicPluginConfig(array $static_plugin_config, EditorInterface $editor): array {

    $file_path = dirname(__FILE__) . '/../../../js/iconSearch.json';
    $data = file_get_contents($file_path);
    $searchList = Json::decode($data);
    $cdn = FALSE;
    if (!empty($this->configuration['cdn_bootstrap'])) {
      $library_info = $this->libraryDiscovery->getLibraryByName('menu_bootstrap_icon', 'icons');
      $cdn = $library_info["css"][0]["data"];
    }
    return [
      'bootstrapicons' => [
        'search_list' => $searchList,
        'cdn' => $cdn,
      ],
    ];
  }

}

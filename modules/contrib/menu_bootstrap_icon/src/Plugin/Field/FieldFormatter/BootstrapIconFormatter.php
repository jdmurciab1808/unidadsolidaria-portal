<?php

namespace Drupal\menu_bootstrap_icon\Plugin\Field\FieldFormatter;

use Drupal\Component\Utility\Unicode;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleExtensionList;
use Drupal\Core\Field\Attribute\FieldFormatter;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Path\PathValidatorInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Url;
use Drupal\link\Plugin\Field\FieldFormatter\LinkFormatter;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'bootstrap_icon_link' formatter.
 */
#[FieldFormatter(
  id: 'bootstrap_icon_link',
  label: new TranslatableMarkup('Link (with bootstrap icon)'),
  field_types: [
    'link',
  ],
)]
class BootstrapIconFormatter extends LinkFormatter {

  /**
   * Constructs a BootstrapIconFormatter object.
   *
   * @param string $plugin_id
   *   The plugin_id for the formatter.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The definition of the field to which the formatter is associated.
   * @param array $settings
   *   The formatter settings.
   * @param string $label
   *   The formatter label display setting.
   * @param string $view_mode
   *   The view mode.
   * @param array $third_party_settings
   *   Any third party settings.
   * @param \Drupal\Core\Path\PathValidatorInterface $path_validator
   *   The path validator service.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Configuration factory.
   * @param \Drupal\Core\Extension\ModuleExtensionList $extensionListModule
   *   Module list service.
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, $label, $view_mode, array $third_party_settings, PathValidatorInterface $path_validator, protected ConfigFactoryInterface $configFactory, protected ModuleExtensionList $extensionListModule) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings, $path_validator);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $plugin_id,
      $plugin_definition,
      $configuration['field_definition'],
      $configuration['settings'],
      $configuration['label'],
      $configuration['view_mode'],
      $configuration['third_party_settings'],
      $container->get('path.validator'),
      $container->get('config.factory'),
      $container->get('extension.list.module'),
    );
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'icon' => '',
      'position' => 'before',
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = parent::settingsSummary();
    $settings = $this->getSettings();
    if ($icon = $this->getSetting('icon')) {
      $defaulText = $this->t('Default icon:');
      $summary[] = [
        '#markup' => $defaulText . ' <i class="' . $icon . '"></i>',
      ];
    }

    if (!empty($settings['position'])) {
      $summary[] = $this->t('Icon position: @value', ['@value' => Unicode::ucfirst($settings['position'])]);
    }
    if (!empty($settings['target'])) {
      $summary[] = $this->t('Open link in new window');
    }
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $config = $this->configFactory->getEditable('menu_bootstrap_icon.settings');
    $elements = parent::settingsForm($form, $form_state);
    $iconDefault = $this->getSetting('icon');
    $elements['icon'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Icon default'),
      '#default_value' => $iconDefault,
      '#description' => $this->t('Example: bi bi-link @icon', ['@icon' => '<i class="icon-preview ' . $iconDefault . '"></i>']),
      '#attributes' => [
        'class' => [
          'iconpicker',
          'w-auto',
        ],
      ],
      '#wrapper_attributes' => [
        'class' => ['d-flex', 'align-items-center'],
      ],
    ];
    $elements['position'] = [
      '#type' => 'select',
      '#title' => $this->t('Icon position'),
      '#options' => [
        'before' => $this->t('Before'),
        'after' => $this->t('After'),
        'icon_only' => $this->t('Icon only'),
      ],
      '#default_value' => $this->getSetting('position'),
      '#required' => TRUE,
      '#weight' => -10,
    ];

    if ($config->get('use_cdn')) {
      $elements['#attached']['library'][] = 'menu_bootstrap_icon/cdn';
    }
    $elements['#attached']['library'][] = 'menu_bootstrap_icon/iconspicker';
    $searchList = base_path() . $this->extensionListModule->getPath('menu_bootstrap_icon') . '/js/iconSearch.json';
    $elements['#attached']['drupalSettings']['menu_bootstrap_icon']['icons'] = $searchList;
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $element = parent::viewElements($items, $langcode);
    $default_position = $this->getSetting('position');
    $default_icon = $this->getSetting('icon');
    foreach ($element as &$item) {
      $url = $item['#url'] ?? NULL;
      if (!$url instanceof Url) {
        continue;
      }
      $url_attributes = $url->getOption('attributes');
      $icon = $url_attributes['data-icon'] ?? $default_icon;
      if (!empty($icon)) {
        $item['#options']['attributes']['class'][] = 'icon-link icon-link-hover';
        $position = $url_attributes['data-icon-position'] ?? $default_position;
        $item['#title'] = match ($position) {
          'after' => [
            ['#markup' => $item['#title'] . '<i class="' . $icon . '"></i>'],
          ],
          'icon_only' => [
            '#markup' => '<i class="' . $icon . '"></i>',
          ],
          default => [
            ['#markup' => '<i class="' . $icon . '"></i>' . $item['#title']],
          ],
        };
      }
      unset($url_attributes['data-icon-position']);
      unset($url_attributes['data-icon']);
      $url->setOption('attributes', $url_attributes);
    }
    return $element;
  }

}

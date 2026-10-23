<?php

namespace Drupal\menu_bootstrap_icon\Plugin\Field\FieldWidget;

use Drupal\Component\Utility\Html;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Extension\ModuleExtensionList;
use Drupal\Core\Field\Attribute\FieldWidget;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\link\Plugin\Field\FieldWidget\LinkWidget;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'link' widget.
 */
#[FieldWidget(
  id: 'bootstrap_icon_link',
  label: new TranslatableMarkup('Link (with bootstrap icon)'),
  field_types: ['link'],
)]
class BootstrapIconWidget extends LinkWidget {

  /**
   * Constructs a new BootstrapIconWidget.
   *
   * @param string $plugin_id
   *   The plugin_id for the formatter.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Field\FieldDefinitionInterface $field_definition
   *   The definition of the field to which the formatter is associated.
   * @param array $settings
   *   The formatter settings.
   * @param array $third_party_settings
   *   The third party settings.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   Configuration factory.
   * @param \Drupal\Core\Extension\ModuleExtensionList $extensionListModule
   *   Module list service.
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, array $third_party_settings, protected ConfigFactoryInterface $configFactory, protected ModuleExtensionList $extensionListModule) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $third_party_settings);
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
      $configuration['third_party_settings'],
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
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $config = $this->configFactory->getEditable('menu_bootstrap_icon.settings');
    $element = parent::settingsForm($form, $form_state);
    $iconDefault = $this->getSetting('icon') ?? '';
    $element['icon'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Default Icon'),
      '#default_value' => $iconDefault,
      '#description' => '<i class="icon-preview ' . $iconDefault . '"></i>',
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

    if ($config->get('use_cdn')) {
      $element['#attached']['library'][] = 'menu_bootstrap_icon/cdn';
    }
    $element['#attached']['library'][] = 'menu_bootstrap_icon/iconspicker';
    $searchList = base_path() . $this->extensionListModule->getPath('menu_bootstrap_icon') . '/js/iconSearch.json';
    $element['#attached']['drupalSettings']['menu_bootstrap_icon']['icons'] = $searchList;
    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $config = $this->configFactory->getEditable('menu_bootstrap_icon.settings');
    $element = parent::formElement($items, $delta, $element, $form, $form_state);
    $id = Html::getUniqueId('bootstrap-link-' . $this->fieldDefinition->getName() . '-icon');
    $item = $items[$delta];
    $options = $item->get('options')->getValue();
    $attributes = $options['attributes'] ?? [];
    $iconDefault = $attributes['data-icon'] ?? $this->getSetting('icon');
    $element['options']['attributes']['data-icon'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Icon class'),
      '#id' => $id,
      '#default_value' => $iconDefault,
      '#description' => '<i class="icon-preview ' . $iconDefault . '"></i>',
      '#attributes' => [
        'class' => [
          'iconpicker',
          'w-auto',
        ],
        'autocomplete' => 'off',
      ],
      '#wrapper_attributes' => [
        'class' => ['d-flex', 'align-items-center'],
      ],
    ];

    if ($config->get('use_cdn')) {
      $form['#attached']['library'][] = 'menu_bootstrap_icon/cdn';
    }
    $form['#attached']['library'][] = 'menu_bootstrap_icon/iconspicker';
    $searchList = base_path() . $this->extensionListModule->getPath('menu_bootstrap_icon') . '/js/iconSearch.json';
    $form['#attached']['drupalSettings']['menu_bootstrap_icon']['icons'] = $searchList;

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = parent::settingsSummary();
    if ($icon = $this->getSetting('icon')) {
      $defaulText = $this->t('Default icon:');
      $summary[] = [
        '#markup' => $defaulText . ' <i class="' . $icon . '"></i>',
      ];
    }
    return $summary;
  }

}

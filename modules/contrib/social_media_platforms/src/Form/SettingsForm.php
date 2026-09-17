<?php

declare(strict_types=1);

namespace Drupal\social_media_platforms\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Social Media Platforms settings for this site.
 */
final class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'social_media_platforms_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames(): array {
    return ['social_media_platforms.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state): array {

    $config = $this->config('social_media_platforms.settings');
    $display_options = $config->get('display_options');

    $form['display'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Display options'),
    ];

    $form['display']['icon_source'] = [
      '#type' => 'select',
      '#options' => [
        'none' => $this->t('None'),
        'image' => $this->t('Image'),
        'font' => $this->t('Font'),
      ],
      '#config_target' => 'social_media_platforms.settings:display_options.icon_source',
      '#required' => TRUE,
      '#title' => $this->t('Icon type'),
      '#description' => $this->t("The type of icon to display:<br>
        <b>None</b>: does not show any icon<br>
        <b>Image</b>: adds an img element for the icon<br>
        <b>Font</b>: adds an i element with a custom class ( see Font Classes bellow )"),
    ];

    $form['display']['show_label'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show label'),
      '#config_target' => 'social_media_platforms.settings:display_options.show_label',
    ];

    $form['display']['target_blank'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Open link in new tab'),
      '#config_target' => 'social_media_platforms.settings:display_options.target_blank',
    ];

    $form['table'] = [
      '#type' => 'table',
      '#header' => [
        $this->t('Label (required)'),
        $this->t('URL'),
        $this->t('Font classes'),
        $this->t('Weight'),
      ],
      '#tabledrag' => [
        [
          'action' => 'order',
          'relationship' => 'sibling',
          'group' => 'table-sort-weight',
        ],
      ],
    ];

    $platforms = $config->get('platforms');

    $weights = array_combine(
      array_keys($platforms),
      array_column($platforms, 'weight')
    );
    asort($weights);

    foreach ($weights as $index => $weight) {
      $platform = $platforms[$index];
      $form['table'][$index]['#attributes']['class'][] = 'draggable';
      $form['table'][$index]['#weight'] = $weight;

      $form['table'][$index]['label'] = [
        '#type' => 'textfield',
        '#default_value' => $platform['label'],
        '#required' => TRUE,
      ];

      $form['table'][$index]['url'] = [
        '#type' => 'url',
        '#default_value' => $platform['url'],
      ];

      $form['table'][$index]['font_classes'] = [
        '#type' => 'textfield',
        '#default_value' => $platform['font_classes'] ?? '',
      ];

      $form['table'][$index]['weight'] = [
        '#type' => 'weight',
        '#default_value' => $weight,
        '#attributes' => [
          'class' => [
            'table-sort-weight',
          ],
        ],
      ];
    }

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state): void {

    $config = $this->config('social_media_platforms.settings');

    $platforms = $config->get('platforms');
    $value = $form_state->getValue('table');
    foreach ($value as $key => $platform) {

      if ($platform['url'] == '') {
        $platform['url'] = NULL;
      }

      $platforms[$key]['label'] = $platform['label'];
      $platforms[$key]['url'] = $platform['url'];
      $platforms[$key]['font_classes'] = $platform['font_classes'];
      $platforms[$key]['weight'] = intval($platform['weight']);
    }
    $config->set('platforms', $platforms);
    $config->save();

    parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $icon_type = $form_state->getValue('icon_source');

    // You must display either an icon, or the label.
    if ($form_state->isValueEmpty('show_label') && $icon_type == 'none') {
      $form_state->setErrorByName('form', $this->t('You must display at least an icon or a label for the social media platforms.'));
    }

    // Validate font_classes do not have invalid characters.
    $platforms = $form_state->getValue('table');
    foreach ($platforms as $key => $platform) {
      if (preg_match('/[^a-zA-Z0-9\-\_ ]/', $platform['font_classes'])) {
        $form_state->setError($form['table'][$key]['font_classes'], 'The value can only contain alphanumerical values, spaces, underscores or hyphens.');
      }
    }

    // Warn user about empty font classes when using that option.
    if ($icon_type == 'font') {
      foreach ($platforms as $platform) {
        if ($platform['url'] != '' && $platform['font_classes'] == '') {
          $this->messenger()->addWarning("The " . $platform['label'] . " platform has an empty value on font_classes, it will probably not be displayed.");
        }
      }
    }

    parent::validateForm($form, $form_state);
  }

}

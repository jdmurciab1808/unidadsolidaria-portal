<?php

namespace Drupal\menu_bootstrap_icon\Form;

use Drupal\Component\Serialization\Yaml;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\menu_bootstrap_icon\BootstrapIconSearch;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Defines a form that configures FPDI Print settings.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * Contructor.
   *
   * @param \Drupal\menu_bootstrap_icon\BootstrapIconSearch $icon_search
   *   Icon search service.
   */
  public function __construct(BootstrapIconSearch $icon_search) {
    $this->icon_search = $icon_search;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    // Instantiates this form class.
    return new static(
    // Load the service required to construct this class.
      $container->get('menu_bootstrap_icon.icon_search')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'menu_bootstrap_icon_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'menu_bootstrap_icon.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, Request $request = NULL) {
    $config = $this->config('menu_bootstrap_icon.settings');
    // Global settings.
    $form['search_list'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Icon define'),
      '#description' => $this->t('Yaml format. Provides term for search. You can update by download <a hre="https://github.com/twbs/icons/tree/main/docs/content/icons">folder icon</a> and generate'),
      '#default_value' => is_array($config->get('search_list')) ? Yaml::encode($config->get('search_list')) : $config->get('search_list'),
      '#prefix' => '<div id="' . $this->getFormId() . '-list">',
      '#suffix' => '</div>',
    ];
    $form['generate'] = [
      '#type' => 'button',
      '#value' => $this->t('Generate'),
      '#description' => $this->t('Scan folder icons to update search terms'),
      '#ajax' => [
        'callback' => [$this, 'ajaxCollectSearchCallback'],
        'wrapper' => $this->getFormId() . '-list',
        'event' => 'click',
        'options' => ['query' => ['ajax_form' => 1]],
        'progress' => [
          'type' => 'throbber',
          'message' => $this->t('Verifying entry...'),
        ],
      ],
    ];
    $form['use_cdn'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Use CDN'),
      '#default_value' => $config->get('use_cdn'),
      '#description' => $this->t('If your admin theme is not base on bootstrap 5 admin theme'),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function ajaxCollectSearchCallback(&$form, &$form_state) {
    $data = $this->icon_search->loadIcons();
    $list = Yaml::encode($data);
    $form['search_list']['#value'] = $list;
    return $form['search_list'];
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('menu_bootstrap_icon.settings');
    // Save the global settings.
    $values = $form_state->getValues();
    $config->set('search_list', $values['search_list'])
      ->set('use_cdn', $values['use_cdn'])
      ->save();
    $this->messenger()->addStatus($this->t('Configuration saved.'));
  }

}

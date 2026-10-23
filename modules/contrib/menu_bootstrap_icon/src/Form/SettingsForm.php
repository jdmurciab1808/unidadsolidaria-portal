<?php

namespace Drupal\menu_bootstrap_icon\Form;

use Drupal\Component\Serialization\Yaml;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\menu_bootstrap_icon\BootstrapIconSearch;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Defines a form that configures FPDI Print settings.
 */
class SettingsForm extends ConfigFormBase {

  /**
   * Contructor.
   *
   * @param \Drupal\menu_bootstrap_icon\BootstrapIconSearch $iconSearch
   *   Icon search service.
   */
  public function __construct(protected BootstrapIconSearch $iconSearch) {
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
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('menu_bootstrap_icon.settings');
    $searchList = $config->get('search_list');
    // Global settings.
    $form['search_list'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Icon define'),
      '#description' => $this->t('Yaml format. Provides search terms. You can update it manually by replacing the download <a href="@icons" class="icon-link icon-link-hover"><i class="bi bi-link"></i> folder icon</a> in /menu_bootstrap_icon/icons and click the generate button', ['@icons' => 'https://github.com/twbs/icons/tree/main/docs/content/icons']),
      '#default_value' => is_array($searchList) ? Yaml::encode($searchList) : $searchList,
      '#prefix' => '<div id="' . $this->getFormId() . '-list">',
      '#suffix' => '</div>',
      '#attributes' => [
        'class' => ['yaml-editor'],
      ],
    ];
    $form['#attached']['library'][] = 'menu_bootstrap_icon/yaml_editor';
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
    $data = $this->iconSearch->loadIcons();
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
    $config->set('use_cdn', $values['use_cdn'])->save();
    $this->messenger()->addStatus($this->t('Configuration saved.'));
    if (!empty(trim($values['search_list']))) {
      $parsedYaml = Yaml::decode($values['search_list']);
      $file_path = dirname(__FILE__) . '/../../js/iconSearch.json';
      $json_data = json_encode($parsedYaml, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
      file_put_contents($file_path, $json_data);
    }
  }

}

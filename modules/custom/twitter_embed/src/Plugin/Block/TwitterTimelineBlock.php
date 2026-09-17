<?php

namespace Drupal\twitter_embed\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a 'Twitter Timeline' Block with API support.
 *
 * @Block(
 *   id = "twitter_timeline_block",
 *   admin_label = @Translation("Twitter Timeline Block (API)"),
 *   category = @Translation("Custom"),
 * )
 */
class TwitterTimelineBlock extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'twitter_username' => 'UsolidariaCo',
      'height' => 600,
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    $form['twitter_username'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Twitter Username'),
      '#default_value' => $this->configuration['twitter_username'],
      '#required' => TRUE,
      '#description' => $this->t('Enter the Twitter username without @'),
    ];

    $form['height'] = [
      '#type' => 'number',
      '#title' => $this->t('Timeline height (px)'),
      '#default_value' => $this->configuration['height'],
      '#min' => 200,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    $this->configuration['twitter_username'] = $form_state->getValue('twitter_username');
    $this->configuration['height'] = $form_state->getValue('height');
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    $username = $this->configuration['twitter_username'];
    $height = $this->configuration['height'];

    $build = [
      '#markup' => '<div class="twitter-timeline-wrapper">
        <a class="twitter-timeline" 
           data-height="' . $height . '" 
           data-theme="light"
           data-chrome="noheader nofooter noborders"
           href="https://twitter.com/' . $username . '?ref_src=twsrc%5Etfw">
          Tweets by ' . $username . '
        </a>
      </div>',
      '#attached' => [
        'html_head' => [
          [
            [
              '#tag' => 'script',
              '#attributes' => [
                'src' => 'https://platform.twitter.com/widgets.js',
                'async' => TRUE,
                'charset' => 'utf-8',
              ],
            ],
            'twitter_widgets',
          ],
        ],
      ],
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return 300;
  }

}
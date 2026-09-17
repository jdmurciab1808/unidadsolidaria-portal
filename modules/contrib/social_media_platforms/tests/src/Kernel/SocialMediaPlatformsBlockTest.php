<?php

declare(strict_types=1);

namespace Drupal\Tests\social_media_platforms\Kernel;

use Drupal\Core\Template\Attribute;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the multiple display options for the block.
 *
 * @group social_media_platforms
 */
final class SocialMediaPlatformsBlockTest extends KernelTestBase {

  /**
   * The renderer.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * The path resolver.
   *
   * @var \Drupal\Core\Extension\ExtensionPathResolver
   */
  protected $pathResolver;

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
    'social_media_platforms',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->container->get('theme_installer')->install(['stark']);
    $this->container->get('cache.render')->deleteAll();
    $this->renderer = $this->container->get('renderer');
    $this->pathResolver = $this->container->get('extension.path.resolver');
  }

  /**
   * Helper function to get the links attribute value.
   *
   * @return array
   *   The links values array.
   */
  protected function getLinksValue(): array {
    $links = [];
    $path = $this->pathResolver->getPath('module', 'social_media_platforms');

    $links['youtube'] = [
      'url' => 'https://www.youtube.com',
      'label' => 'Youtube',
      'image' => "/$path/images/youtube.png",
      'font_classes' => 'fb-icon',
      'attributes' => new Attribute(),
    ];

    return $links;
  }

  /**
   * Test the social_media_platforms_links theme with empty variables.
   */
  public function testEmptyLinksTheme(): void {
    $content = [
      '#theme' => 'social_media_platforms_links',
    ];

    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $this->assertText('');
  }

  /**
   * Tests the social_media_platforms_links theme with image icon and no label.
   */
  public function testLinksIconsNoLabel(): void {
    $links = $this->getLinksValue();
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'image',
        'show_label' => FALSE,
        'target_blank' => FALSE,
      ],
    ];

    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $this->assertText('');
    $this->assertLinkByHref($links['youtube']['url']);
    $img = $this->cssSelect('a.social-media-platforms__link--youtube > img');
    $this->assertCount(1, $img);
    $icon = $this->cssSelect('a.social-media-platforms__link--youtube > i.fb-icon');
    $this->assertCount(0, $icon);
  }

  /**
   * Tests the social_media_platforms_links theme with font icon and no label.
   */
  public function testLinksFontIconsNoLabel(): void {
    $links = $this->getLinksValue();
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'font',
        'show_label' => FALSE,
        'target_blank' => FALSE,
      ],
    ];

    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $this->assertText('');
    $this->assertLinkByHref($links['youtube']['url']);
    $icon = $this->cssSelect('a.social-media-platforms__link--youtube > i.fb-icon');
    $this->assertCount(1, $icon);
    $img = $this->cssSelect('a.social-media-platforms__link--youtube > img');
    $this->assertCount(0, $img);
  }

  /**
   * Tests the theme with no icon and label.
   */
  public function testLinksLabelNoIcon(): void {
    $links = $this->getLinksValue();
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'none',
        'show_label' => TRUE,
        'target_blank' => FALSE,
      ],
    ];

    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $this->assertText($links['youtube']['label']);
    $this->assertLinkByHref($links['youtube']['url']);
    $img = $this->cssSelect('a.social-media-platforms__link--youtube > img');
    $this->assertCount(0, $img);
    $icon = $this->cssSelect('a.social-media-platforms__link--youtube > i');
    $this->assertCount(0, $icon);
  }

  /**
   * Tests the theme with image icon and label.
   */
  public function testLinksLabelAndIcon(): void {
    $links = $this->getLinksValue();
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'image',
        'show_label' => TRUE,
        'target_blank' => FALSE,
      ],
    ];

    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $this->assertText($links['youtube']['label']);
    $this->assertLinkByHref($links['youtube']['url']);
    $img = $this->cssSelect('a.social-media-platforms__link--youtube > img');
    $this->assertCount(1, $img);
    $icon = $this->cssSelect('a.social-media-platforms__link--youtube > i');
    $this->assertCount(0, $icon);
  }

  /**
   * Tests the theme with font icon and label.
   */
  public function testLinksLabelAndFontIcon(): void {
    $links = $this->getLinksValue();
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'font',
        'show_label' => TRUE,
        'target_blank' => FALSE,
      ],
    ];

    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $this->assertText($links['youtube']['label']);
    $this->assertLinkByHref($links['youtube']['url']);
    $img = $this->cssSelect('a.social-media-platforms__link--youtube > img');
    $this->assertCount(0, $img);
    $icon = $this->cssSelect('a.social-media-platforms__link--youtube > i.fb-icon');
    $this->assertCount(1, $icon);
  }

  /**
   * Tests the theme target blank for the links.
   */
  public function testLinksTargetBlankLabel(): void {
    $links = $this->getLinksValue();
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'none',
        'show_label' => TRUE,
        'target_blank' => TRUE,
      ],
    ];
    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $href = $this->cssSelect('a.social-media-platforms__link--youtube[target="_blank"]');
    $this->assertCount(1, $href);
  }

  /**
   * Tests the theme target blank attribute is missing when set to false.
   */
  public function testLinksTargetBlankMissingLabel(): void {
    $links = $this->getLinksValue();
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'none',
        'show_label' => TRUE,
        'target_blank' => FALSE,
      ],
    ];

    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $href = $this->cssSelect('a.social-media-platforms__link--youtube[target="_blank"]');
    $this->assertCount(0, $href);
  }

  /**
   * Tests adding global attributes to the theme container.
   */
  public function testLinksGlobalAttributes(): void {
    $links = $this->getLinksValue();
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#attributes' => [
        'class' => ['test'],
      ],
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'none',
        'show_label' => TRUE,
        'target_blank' => FALSE,
      ],
    ];

    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $container = $this->cssSelect('div.social-media-platforms__container.test');
    $this->assertCount(1, $container);
  }

  /**
   * Tests adding link attributes to the individual links.
   */
  public function testLinksAttributes(): void {
    $links = $this->getLinksValue();
    $links['youtube']['attributes']->addClass(['test']);
    $content = [
      '#theme' => 'social_media_platforms_links',
      '#platforms' => $links,
      '#display_options' => [
        'icon_source' => 'none',
        'show_label' => TRUE,
        'target_blank' => FALSE,
      ],
    ];
    $output = $this->renderer->renderRoot($content);
    $this->setRawContent($output);
    $href = $this->cssSelect('a.social-media-platforms__link.test');
    $this->assertCount(1, $href);
  }

}

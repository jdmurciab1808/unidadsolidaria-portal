<?php

declare(strict_types=1);

namespace Drupal\Tests\social_media_platforms\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Tests the placing and configuration of the block.
 *
 * @group social_media_platforms
 */
final class SocialMediaPlatformsTest extends BrowserTestBase {

  /**
   * The testing user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $adminUser;

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'claro';

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'social_media_platforms',
    'node',
    'media',
    'block',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->adminUser = $this->drupalCreateUser([
      'administer site configuration',
      'access content',
      'access administration pages',
      'administer social media platforms',
    ]);
    $this->drupalLogin($this->adminUser);
    $this->drupalGet('admin');
    $this->drupalPlaceBlock('social_media_platform_block');
  }

  /**
   * Test settings form access permissions.
   */
  public function testSettingsFormPermission(): void {
    $this->drupalLogout();

    $invalid_user = $this->drupalCreateUser([
      'administer site configuration',
      'access content',
      'access administration pages',
    ]);
    $this->drupalLogin($invalid_user);

    $this->drupalGet('/admin/config/services/social-media-platforms');
    $this->assertSession()->statusCodeEquals(403);
  }

  /**
   * Test Links order.
   */
  public function testLinksOrder(): void {
    $this->drupalGet('/admin/config/services/social-media-platforms');
    $this->assertSession()->pageTextContains('Social Media Platforms');
    $page = $this->getSession()->getPage();

    $page->checkField('edit-show-label');
    $page->fillField('edit-table-facebook-url', 'https://facebook.com/');
    $page->selectFieldOption('edit-table-facebook-weight', '10');
    $page->fillField('edit-table-youtube-url', 'https://www.youtube.com/');
    $page->selectFieldOption('edit-table-youtube-weight', '-10');
    $page->pressButton('edit-submit');

    $this->drupalGet('<front>');
    $assert_session = $this->assertSession();
    $assert_session->elementsCount('css', '.social-media-platforms__link', 2);
    $links = $page->findAll('css', 'a.social-media-platforms__link');
    $this->assertEquals('Youtube', $links[0]->getText());
    $this->assertEquals('Facebook', $links[1]->getText());
  }

  /**
   * Test empty configuration block rendering.
   */
  public function testEmptyConfiguration(): void {
    $this->drupalGet('<front>');
    $assert_session = $this->assertSession();
    $assert_session->elementsCount('css', '.social-media-platforms__link', 0);
    $assert_session->elementsCount('css', '.social-media-platforms__container', 1);
  }

}

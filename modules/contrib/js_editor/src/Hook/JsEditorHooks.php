<?php

namespace Drupal\js_editor\Hook;

use Drupal\Component\Utility\DeprecationHelper;
use Drupal\Core\File\FileExists;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\StreamWrapper\PublicStream;
use Drupal\Core\Hook\Attribute\Hook;
use Drupal\Core\StringTranslation\StringTranslationTrait;
/**
 * Hook implementations for js_editor.
 */
class JsEditorHooks
{
    use StringTranslationTrait;
    /**
     * Implements hook_help().
     */
    #[Hook('help')]
    public function help($route_name, \Drupal\Core\Routing\RouteMatchInterface $route_match)
    {
        switch ($route_name) {
            // Main module help for the JS Editor module.
            case 'help.page.js_editor':
                $output = '';
                $output .= '<h3>' . $this->t('About Javascript Editor') . '</h3>';
                $output .= '<p>' . $this->t("This module allows administrators to customize a theme's Javascript through the browser, using a rich text editor with syntax highlighting.") . '</p>';
                $output .= '<p>' . $this->t('On the settings page of each theme it will be displayed a textarea where the admin can type custom Javascript code.') . '</p>';
                $output .= '<p>' . $this->t('The feature can be enabled to multiple themes on the same site.') . '</p>';
                return $output;
            default:
        }
    }
    /**
     * Implements hook_library_info_alter().
     */
    #[Hook('library_info_alter')]
    public static function libraryInfoAlter(&$libraries, $extension)
    {
        $theme = \Drupal::theme()->getActiveTheme()->getName();
        if ($extension == $theme) {
            if ($file = _js_editor_get_javascript($theme)) {
                // Append custom style sheet to theme libraries.
                $libraries['js_editor']['js'][$file]['type'] = 'external';
            }
        }
    }
    /**
     * Implements hook_page_attachments().
     */
    #[Hook('page_attachments')]
    public static function pageAttachments(array &$page)
    {
        $theme = \Drupal::theme()->getActiveTheme()->getName();
        if (_js_editor_get_javascript($theme)) {
            $page['#attached']['library'][] = $theme . '/js_editor';
        }
    }
    /**
     * Implements hook_form_FORM_ID_alter() for `system_theme_settings`.
     */
    #[Hook('form_system_theme_settings_alter')]
    public function formSystemThemeSettingsAlter(&$form, \Drupal\Core\Form\FormStateInterface $form_state, $form_id)
    {
        $theme = _js_editor_get_edited_theme($form_state);
        if ($theme) {
            $config = \Drupal::configFactory()->getEditable('js_editor.theme.' . $theme);
            $js_editor_permission = \Drupal::currentUser()->hasPermission('execute arbitrary js_editor scripts');
            // Add JS customization fieldset.
            $form['js_editor'] = [
                '#type' => 'details',
                '#title' => $this->t('Custom Javascript'),
                '#open' => TRUE,
                '#access' => $js_editor_permission,
            ];
            // Switch to enable/disable customization.
            $form['js_editor']['js_enabled'] = [
                '#title' => $this->t('Enable or disable custom Javascript:'),
                '#type' => 'checkbox',
                '#default_value' => $config->get('enabled'),
                '#access' => $js_editor_permission,
            ];
            // Editor box.
            $form['js_editor']['js'] = [
                '#type' => 'textarea',
                '#prefix' => '<div id="js-editor-field">',
                '#description' => $this->t('Type or paste custom Javascript code for this theme.'),
                '#default_value' => $config->get('js'),
                '#attributes' => [
                    'id' => 'js-editor-textarea',
                ],
                '#suffix' => '</div>',
                '#access' => $js_editor_permission,
            ];
            // Attach submit callback.
            $form['#submit'][] = '_js_editor_theme_settings_form_submit';
        }
    }
}

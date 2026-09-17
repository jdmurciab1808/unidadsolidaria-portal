<?php

namespace Drupal\menu_bootstrap_icon;

use Drupal\Component\Serialization\Yaml;

/**
 * Load Icon for searching service.
 */
class BootstrapIconSearch {

  /**
   * {@inheritdoc}
   */
  public function loadIcons() {
    $fileList = glob(dirname(__FILE__) . '/../icons/*.md');

    $data = [];
    foreach ($fileList as $file) {
      $contents = file_get_contents($file);
      $pattern = '/---(.*?)---/s';
      preg_match($pattern, $contents, $matches);
      $yaml = $matches[1];
      $fileData = Yaml::decode($yaml);
      $fileName = pathinfo($file, PATHINFO_FILENAME);
      $data[] = [
        'title' => "bi bi-" . $fileName,
        'searchTerms' => $fileData['tags'],
      ];
    }

    return $data;
  }

}

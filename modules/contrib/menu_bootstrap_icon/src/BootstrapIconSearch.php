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
      $removeFill = str_replace('-fill', '', $fileName);
      $search = array_merge($fileData['tags'] ?? [], explode('-', $removeFill));
      $data[] = [
        'title' => "bi bi-" . $fileName,
        'searchTerms' => array_values(array_unique($search)),
      ];
    }
    $file_path = dirname(__FILE__) . '/../js/iconSearch.json';
    $json_data = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    file_put_contents($file_path, $json_data);

    return $data;
  }

}

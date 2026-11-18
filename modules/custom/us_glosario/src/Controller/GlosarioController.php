<?php

namespace Drupal\us_glosario\Controller;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Página pública del glosario.
 */
class GlosarioController extends ControllerBase {

  /**
   * Abecedario del índice (con Ñ).
   */
  const LETRAS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  ];

  /**
   * Página pública del glosario (/glosario).
   */
  public function pagina(): array {
    $puede_crear = $this->currentUser()->hasPermission('create termino_glosario content');
    $cache = (new CacheableMetadata())
      ->addCacheTags(['node_list:termino_glosario'])
      ->addCacheContexts(['user.permissions']);

    $consulta = $this->entityTypeManager()->getStorage('node')->getQuery()
      ->accessCheck(TRUE)
      ->condition('type', 'termino_glosario');
    // Quien puede crear términos también ve los que aún no están publicados,
    // para revisarlos en contexto antes de publicarlos.
    if (!$puede_crear) {
      $consulta->condition('status', 1);
    }
    $nodos = $this->entityTypeManager()->getStorage('node')->loadMultiple($consulta->execute());

    $terminos = [];
    foreach ($nodos as $nodo) {
      $cache->addCacheableDependency($nodo);
      $titulo = trim($nodo->label());
      if ($titulo === '') {
        continue;
      }
      $terminos[] = [
        'id' => 'termino-' . $nodo->id(),
        'titulo' => $titulo,
        'letra' => $this->letraInicial($titulo),
        'clave' => $this->claveOrden($titulo),
        'definicion' => $nodo->get('body')->isEmpty() ? [] : [
          '#type' => 'processed_text',
          '#text' => $nodo->get('body')->value,
          '#format' => $nodo->get('body')->format,
        ],
        'publicado' => $nodo->isPublished(),
        'url_editar' => $nodo->access('update') ? $nodo->toUrl('edit-form', ['query' => ['destination' => Url::fromRoute('us_glosario.pagina')->toString()]])->toString() : '',
      ];
    }

    usort($terminos, fn($a, $b) => strcmp($a['clave'], $b['clave']));

    $grupos = [];
    foreach ($terminos as $termino) {
      $grupos[$termino['letra']][] = $termino;
    }
    // Los términos que no empiezan por letra (números, símbolos) van al final.
    if (isset($grupos['#'])) {
      $otros = $grupos['#'];
      unset($grupos['#']);
      $grupos['#'] = $otros;
    }

    $letras = [];
    foreach (array_merge(self::LETRAS, isset($grupos['#']) ? ['#'] : []) as $letra) {
      $letras[] = ['letra' => $letra, 'activa' => isset($grupos[$letra])];
    }

    $build = [
      '#theme' => 'us_glosario',
      '#letras' => $letras,
      '#grupos' => $grupos,
      '#total' => count($terminos),
      '#url_crear' => $puede_crear ? Url::fromRoute('node.add', ['node_type' => 'termino_glosario'], ['query' => ['destination' => Url::fromRoute('us_glosario.pagina')->toString()]])->toString() : '',
      '#attached' => ['library' => ['us_glosario/glosario']],
    ];
    $cache->applyTo($build);
    return $build;
  }

  /**
   * La ruta antigua /glossary redirige (301) a /glosario.
   */
  public function redirigir(): RedirectResponse {
    return new RedirectResponse(Url::fromRoute('us_glosario.pagina')->toString(), 301);
  }

  /**
   * Letra del índice a la que pertenece un término (Á → A, Ñ se conserva).
   */
  private function letraInicial(string $titulo): string {
    $primera = mb_strtoupper(mb_substr($titulo, 0, 1));
    if ($primera === 'Ñ') {
      return 'Ñ';
    }
    $primera = strtoupper(\Drupal::transliteration()->transliterate($primera, 'es'));
    return in_array($primera, self::LETRAS, TRUE) ? $primera : '#';
  }

  /**
   * Clave de orden alfabético en español: sin tildes y con la ñ después de la n.
   */
  private function claveOrden(string $titulo): string {
    $texto = mb_strtolower($titulo);
    $partes = array_map(
      fn($parte) => \Drupal::transliteration()->transliterate($parte, 'es'),
      explode('ñ', $texto)
    );
    return strtolower(implode('n~', $partes));
  }

}

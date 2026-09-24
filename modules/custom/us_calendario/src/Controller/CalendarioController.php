<?php

namespace Drupal\us_calendario\Controller;

use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\Unicode;
use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Url;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

/**
 * Página pública del calendario y su servicio de eventos en JSON.
 */
class CalendarioController extends ControllerBase {

  /**
   * Página /calendario.
   */
  public function pagina(): array {
    $puede_crear = $this->currentUser()->hasPermission('create evento content');

    return [
      '#theme' => 'us_calendario',
      '#puede_crear' => $puede_crear,
      '#url_crear' => $puede_crear ? Url::fromRoute('node.add', ['node_type' => 'evento'])->toString() : '',
      '#attached' => [
        'library' => ['us_calendario/calendario'],
        'drupalSettings' => [
          'usCalendario' => [
            'urlEventos' => Url::fromRoute('us_calendario.eventos')->toString(),
            'puedeCrear' => $puede_crear,
            'urlCrear' => $puede_crear ? Url::fromRoute('node.add', ['node_type' => 'evento'], ['query' => ['destination' => '/calendario']])->toString() : '',
          ],
        ],
      ],
      '#cache' => ['contexts' => ['user.permissions']],
    ];
  }

  /**
   * Eventos publicados que caen dentro del rango ?desde=YYYY-MM-DD&hasta=YYYY-MM-DD.
   */
  public function eventos(Request $request): JsonResponse {
    $zona = new \DateTimeZone($this->config('system.date')->get('timezone.default') ?: 'America/Bogota');
    $utc = new \DateTimeZone('UTC');

    $desde = $this->parseFecha($request->query->get('desde'), $zona);
    $hasta = $this->parseFecha($request->query->get('hasta'), $zona);
    $cache = (new CacheableMetadata())
      ->addCacheTags(['node_list:evento'])
      ->addCacheContexts(['url.query_args', 'user.roles']);

    if (!$desde || !$hasta || $hasta < $desde) {
      $respuesta = new CacheableJsonResponse(['error' => 'Rango de fechas no válido.'], 400);
      $respuesta->addCacheableDependency($cache);
      return $respuesta;
    }

    // Límite defensivo: como máximo ~2 meses por consulta.
    if ($desde->diff($hasta)->days > 70) {
      $hasta = (clone $desde)->modify('+70 days');
    }

    $desde_utc = (clone $desde)->setTime(0, 0, 0)->setTimezone($utc)->format('Y-m-d\TH:i:s');
    $hasta_utc = (clone $hasta)->setTime(23, 59, 59)->setTimezone($utc)->format('Y-m-d\TH:i:s');

    $consulta = $this->entityTypeManager()->getStorage('node')->getQuery()
      ->accessCheck(TRUE)
      ->condition('type', 'evento')
      ->condition('status', 1)
      ->condition('field_evento_inicio', $hasta_utc, '<=');

    // Empieza dentro del rango, o bien ya empezó y termina dentro/después.
    $o = $consulta->orConditionGroup()
      ->condition('field_evento_inicio', $desde_utc, '>=')
      ->condition('field_evento_fin', $desde_utc, '>=');
    $consulta->condition($o)->sort('field_evento_inicio')->range(0, 300);

    $nodos = $this->entityTypeManager()->getStorage('node')->loadMultiple($consulta->execute());

    $eventos = [];
    foreach ($nodos as $nodo) {
      $cache->addCacheableDependency($nodo);
      $inicio = $this->aZonaLocal($nodo->get('field_evento_inicio')->value, $zona);
      if (!$inicio) {
        continue;
      }
      $fin = $this->aZonaLocal($nodo->get('field_evento_fin')->value, $zona);

      $texto = '';
      if (!$nodo->get('body')->isEmpty()) {
        $texto = trim(preg_replace('/\s+/u', ' ', Html::decodeEntities(strip_tags($nodo->get('body')->value))));
        $texto = Unicode::truncate($texto, 400, TRUE, TRUE);
      }

      $enlace = '';
      if (!$nodo->get('field_evento_enlace')->isEmpty()) {
        $enlace = $nodo->get('field_evento_enlace')->first()->getUrl()->toString();
      }

      $eventos[] = [
        'id' => (int) $nodo->id(),
        'titulo' => $nodo->label(),
        'inicio' => $inicio->format('Y-m-d\TH:i'),
        'fin' => $fin ? $fin->format('Y-m-d\TH:i') : NULL,
        'lugar' => (string) $nodo->get('field_evento_lugar')->value,
        'descripcion' => $texto,
        'enlace' => $enlace,
        'url' => $nodo->toUrl()->toString(),
        'urlEditar' => $nodo->access('update') ? $nodo->toUrl('edit-form', ['query' => ['destination' => '/calendario']])->toString() : '',
      ];
    }

    $respuesta = new CacheableJsonResponse(['eventos' => $eventos]);
    $respuesta->addCacheableDependency($cache);
    return $respuesta;
  }

  /**
   * Convierte 'YYYY-MM-DD' en fecha a las 00:00 de la zona del sitio.
   */
  private function parseFecha($valor, \DateTimeZone $zona): ?\DateTime {
    if (!is_string($valor) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $valor)) {
      return NULL;
    }
    $fecha = \DateTime::createFromFormat('!Y-m-d', $valor, $zona);
    return $fecha ?: NULL;
  }

  /**
   * Fecha guardada (UTC) → fecha en la zona del sitio.
   */
  private function aZonaLocal($valor, \DateTimeZone $zona): ?DrupalDateTime {
    if (!$valor) {
      return NULL;
    }
    $fecha = new DrupalDateTime($valor, new \DateTimeZone('UTC'));
    $fecha->setTimezone($zona);
    return $fecha;
  }

}

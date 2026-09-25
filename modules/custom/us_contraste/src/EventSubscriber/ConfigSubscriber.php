<?php

namespace Drupal\us_contraste\EventSubscriber;

use Drupal\Core\Config\ConfigCrudEvent;
use Drupal\Core\Config\ConfigEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Regenera el CSS de alto contraste al guardar los colores del módulo.
 */
class ConfigSubscriber implements EventSubscriberInterface {

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents(): array {
    return [ConfigEvents::SAVE => ['alGuardar']];
  }

  /**
   * Escribe de nuevo el archivo cuando cambian los colores.
   */
  public function alGuardar(ConfigCrudEvent $evento): void {
    if ($evento->getConfig()->getName() === 'high_contrast.settings') {
      us_contraste_generar_css();
      \Drupal::service('library.discovery')->clearCachedDefinitions();
    }
  }

}

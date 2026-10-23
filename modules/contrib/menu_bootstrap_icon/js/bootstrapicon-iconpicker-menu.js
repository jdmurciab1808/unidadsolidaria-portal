(function ($, Drupal, drupalSettings) {
  $(function () {
    const iconFile = drupalSettings.menu_bootstrap_icon.icons;

    if (!iconFile) {
      console.error('Icon file path is not provided in drupalSettings.');
      return;
    }

    // Fetch the icon file
    fetch(iconFile)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch icons: ${response.statusText}`);
        }
        return response.json();
      })
      .then((icons) => {
        // Initialize iconpicker
        $('.iconpicker').attr('autocomplete', 'off').iconpicker({
          hideOnSelect: true,
          icons: icons,
        });
      })
      .catch((error) => {
        console.error('Error loading icons:', error);
      });

    // Bind iconpicker events
    $('.iconpicker').on('iconpickerSelected', (event) => {
      const iconPreview = $('.icon-preview');
      if (iconPreview.length) {
        iconPreview.attr('class', `icon-preview ${event.iconpickerValue}`);
      }
    });
  });
})(jQuery, Drupal, drupalSettings);

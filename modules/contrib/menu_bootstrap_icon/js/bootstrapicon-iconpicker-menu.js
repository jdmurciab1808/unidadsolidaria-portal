(function ($, Drupal, drupalSettings) {
  $(function () {
    let icons = drupalSettings.menu_bootstrap_icon.icons;
    $('.iconpicker').iconpicker({
      hideOnSelect: true,
      icons: icons
    });
    // Bind iconpicker events to the element
    $('.iconpicker').on('iconpickerSelected', function(event){
      $('.icon-preview').removeClass().addClass('icon-preview ' + event.iconpickerValue);
    });
  });
})(jQuery, Drupal, drupalSettings);

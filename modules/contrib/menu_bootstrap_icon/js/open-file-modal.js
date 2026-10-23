(function ($, Drupal, once) {
  Drupal.behaviors.openFileModal = {
    attach: function (context) {
      // Attach click events to elements with the `open-file` class.
      $(once('open-file', '.open-file', context)).on('click', function (e) {
        e.preventDefault();

        // Extract attributes and settings.
        const iframeUrl = $(this).attr('href');
        const iframeText = $(this).text();
        const windowHeight = window.innerHeight;
        const defaultModalHeight = windowHeight * 0.8;
        const height = $(this).data('height') || defaultModalHeight;

        // Create the modal with an iframe inside.
        $('<div>').html(`<iframe src="${iframeUrl}" width="100%" height="100%" style="border:none;"></iframe>`)
        .dialog({
          title: iframeText,
          modal: true,
          width: '80%',
          height: height + 50, // Include padding for modal content.
          close: function () {
            $(this).dialog('destroy').remove();
          },
        });
      });
    },
  };
})(jQuery, Drupal, once);

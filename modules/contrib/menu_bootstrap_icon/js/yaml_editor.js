(function ($, Drupal, once) {

  "use strict";

  Drupal.behaviors.iconYamlEditor = {
    attach: function (context) {
      let initEditor = function () {
        once('icon-yaml-editor', '.yaml-editor', context).forEach(function ($textarea) {
          // Init ace editor.
          let $editDiv = document.createElement('div');
          if (!$textarea.parentNode) {
            return;
          }
          $textarea.classList.add('visually-hidden');
          $textarea.parentNode.insertBefore($editDiv, $textarea);
          let editor = ace.edit($editDiv);
          editor.setValue($textarea.value);
          editor.getSession().setMode("ace/mode/yaml");
          editor.focus();
          editor.getSession().setTabSize(2);
          editor.setTheme('ace/theme/chrome');
          editor.setOptions({
            minLines: 3,
            maxLines: 20
          });

          // Update Drupal textarea value.
          editor.getSession().on('change', function () {
            $textarea.value = editor.getSession().getValue();
          });

        });
      };

      // Check if Ace editor is already available and load it from source cdn otherwise.

      if (typeof ace !== 'undefined') {
        initEditor();
      }
    }
  };

}(jQuery, Drupal, once));

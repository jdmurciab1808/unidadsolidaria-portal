/**
 * @file defines InsertBootstrapIconsCommand, which is executed when the icon
 * toolbar button is pressed.
 */
// cSpell:ignore bootstrapicons

import { Command } from 'ckeditor5/src/core';

export default class InsertIconCommand extends Command {
  execute(addClass) {
    const { model } = this.editor;
    model.change((writer) => {
      let classes = 'bi';
      if (addClass.icon !== '') {
        classes += ' bi-' + addClass.icon;
      }
      const attributes = {
        class: classes,
      };
      const content = writer.createElement('bootstrapIcons', attributes);
      const docFrag = writer.createDocumentFragment();
      writer.append(content, docFrag);
      writer.insertText(drupalSettings.icon, content);
      this.editor.model.insertContent(docFrag);
    });
  }

  refresh() {
    const { model } = this.editor;
    const { selection } = model.document;
    const allowedIn = model.schema.findAllowedParent(
      selection.getFirstPosition(),
      'bootstrapIcons',
    );
    this.isEnabled = allowedIn !== null;
  }
}

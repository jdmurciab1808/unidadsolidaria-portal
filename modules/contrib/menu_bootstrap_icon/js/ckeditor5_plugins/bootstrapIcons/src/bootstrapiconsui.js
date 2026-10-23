/**
 * @file registers the bootstrapIcons toolbar button and binds functionality to it.
 */

import { Plugin } from 'ckeditor5/src/core';
import { ButtonView, ContextualBalloon, clickOutsideHandler } from 'ckeditor5/src/ui';
import FormView from './bootstrapicon-view';
import icon from '../../../../icons/bootstrap.svg';

export default class BootstrapIconsUI extends Plugin {
  init() {
    const editor = this.editor;
    this._balloon = this.editor.plugins.get(ContextualBalloon);
    this.formView = this._createFormView();

    // This will register the bootstrapIcons toolbar button.
    editor.ui.componentFactory.add('bootstrapIcons', (locale) => {
      const command = editor.commands.get('InsertIconCommand');
      const buttonView = new ButtonView(locale);

      // Create the toolbar button.
      buttonView.set({
        label: editor.t('Bootstrap icons'),
        icon,
        tooltip: true,
      });

      // Bind the state of the button to the command.
      buttonView.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled');

      // Execute the command when the button is clicked (executed).
      this.listenTo(buttonView, 'execute', () => {
        this._showUI();
      });

      return buttonView;
    });

  }

  _createFormView() {
    const editor = this.editor;
    const formView = new FormView(editor);

    // On btn icon click send class to the writer, then hide the form view.
    this.listenTo(formView, 'bootstrapicon', () => {
      let addClass = {
        icon: formView.searchInputView.fieldView.element.value,
      };
      editor.execute('InsertIconCommand', addClass);
      this._hideUI();
    });

    // On submit send the user data to the writer, then hide the form view.
    this.listenTo(formView, 'submit', () => {
      let addClass = {
        icon: formView.searchInputView.fieldView.element.value,
      };
      editor.execute('InsertIconCommand', addClass);
      this._hideUI();
    });

    // Hide the form view after clicking the "Cancel" button.
    this.listenTo(formView, 'cancel', () => {
      this._hideUI();
    });

    // Hide the form view when clicking outside the balloon.
    clickOutsideHandler({
      emitter: formView,
      activator: () => this._balloon.visibleView === formView,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI()
    });

    return formView;
  }

  _hideUI() {
    this.formView.searchInputView.fieldView.value = '';
    this.formView.element.reset();
    this._balloon.remove(this.formView);

    // Focus the editing view after closing the form view.
    this.editor.editing.view.focus();
  }

  _showUI() {
    let search = sessionStorage.getItem('bootstrapIconSearch');
    this.formView.searchInputView.fieldView.value = search;
    this._balloon.add({
      view: this.formView,
      position: this._getBalloonPositionData(),
      icon: 'testIcon'
    });
    this.formView.focus();
  }

  _getBalloonPositionData() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;
    let target = null;

    // Set a target position by converting view selection range to DOM.
    target = () => view.domConverter.viewRangeToDom(
      viewDocument.selection.getFirstRange()
    );
    return {target};
  }

}

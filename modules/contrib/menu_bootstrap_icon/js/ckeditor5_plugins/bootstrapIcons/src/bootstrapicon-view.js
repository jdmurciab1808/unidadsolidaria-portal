import { View, LabeledFieldView, createLabeledInputText, ButtonView, submitHandler, ListView, ListItemView} from 'ckeditor5/src/ui';
import {icons} from 'ckeditor5/src/core';
import { IconCheck, IconCancel } from '@ckeditor/ckeditor5-icons';

/**
 * A class rendering the information required from user input.
 *
 * @extends module:ui/view~View
 *
 * @internal
 */
export default class BootstrapIconView extends View {

  /**
   * @inheritdoc
   */
  constructor(editor) {
    const locale = editor.locale;
    super(locale);

    this.searchInputView = this._createInput('Search icon (ie. chevron-down)');

    // Icons list.
    const config = editor.config.get('bootstrapicons');
    let iconsBootstrap = config.search_list;
    let cdn = config.cdn;
    if (cdn.length) {
      let link = document.createElement("link");
      link.rel = "stylesheet";
      link.type = "text/css";
      link.href = cdn;
      document.head.appendChild(link);
    }
    this.iconsBootstrap = new ListView();
    setTimeout(()=> this._createListIcons(iconsBootstrap), 0);
    const elements = this.iconsBootstrap.items._items;
    this.searchInputView.fieldView.on('input', (event)=>{
      let search = event.source.element.value.toLowerCase().replace(/[_\-+]/g, ' ');
      sessionStorage.setItem('bootstrapIconSearch', search);
      elements.forEach(item => {
        const indexOfSearch = item.element.textContent.indexOf(search);
        item.element.style.display = indexOfSearch !== -1 ? 'block' : 'none';
      });
    });

    // Create the save and cancel buttons.
    this.saveButtonView = this._createButton(
      editor.t('Save'), IconCheck, 'ck-button-save'
    );
    this.saveButtonView.type = 'submit';

    this.cancelButtonView = this._createButton(
      editor.t('Cancel'), IconCancel, 'ck-button-cancel'
    );
    // Delegate ButtonView#execute to FormView#cancel.
    this.cancelButtonView.delegate('execute').to(this, 'cancel');

    this.childViews = this.createCollection([
      this.searchInputView,
      this.iconsBootstrap,
      this.saveButtonView,
      this.cancelButtonView
    ]);

    this.setTemplate({
      tag: 'form',
      attributes: {
        class: ['ck', 'ck-bootstrapicon-form', 'ck-responsive-form'],
        tabindex: '-1'
      },
      children: this.childViews
    });
  }

  /**
   * @inheritdoc
   */
  render() {
    super.render();

    // Submit the form when the user clicked the save button or
    // pressed enter the input.
    submitHandler({
      view: this
    });
  }

  /**
   * @inheritdoc
   */
  focus() {
    this.childViews.first.focus();
  }

  // Create a generic input field.
  _createInput(label) {
    const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
    labeledInput.label = label;
    let search = sessionStorage.getItem('bootstrapIconSearch');
    if (search) {
      labeledInput.fieldView.bind('value').to(this, value => search);
    }
    return labeledInput;
  }

  // Create a generic button.
  _createButton(label, icon, className) {
    const button = new ButtonView();

    button.set({
      label: label,
      icon: icon,
      tooltip: true,
      class: className
    });

    return button;
  }

  _createIconBtn(className, search) {
    const button = new ButtonView();
    button.set({
      label: search,
      tooltip: search,
      class: 'bootstrapicon bi bi-' + className
    });

    button.on( 'execute', () => {
      this.searchInputView.fieldView.element.value = className;
      this.searchInputView.fieldView.element.focus();
    } );

    const liView = new ListItemView();
    liView.children.add(button)
    return liView;
  }

  _createListIcons(icons){
    icons.forEach((element) => {
      let search = Array.isArray(element.searchTerms) ? element.searchTerms : Object.values(element.searchTerms);
      let icon = this._createIconBtn(
        element.title, search.join(' ')
      );
      this.iconsBootstrap.items.add(icon);
    });
  }
}

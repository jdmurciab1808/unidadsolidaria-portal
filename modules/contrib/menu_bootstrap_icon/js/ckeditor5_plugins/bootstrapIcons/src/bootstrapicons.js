/**
 * @file The build process always expects an index.js file. Anything exported
 * here will be recognized by CKEditor 5 as an available plugin. Multiple
 * plugins can be exported in this one file.
 *
 * I.e. this file's purpose is to make plugin(s) discoverable.
 */
// cSpell:ignore bootstrapicons

import { Plugin } from 'ckeditor5/src/core';
import BootstrapIconsUI from "./bootstrapiconsui";
import BootstrapIconsEditing from "./bootstrapiconsediting";

export default class BootstrapIcons extends Plugin {
  /**
   * @inheritdoc
   */
  static get requires() {
    return [BootstrapIconsEditing, BootstrapIconsUI];
  }

  /**
   * @inheritdoc
   */
  static get pluginName() {
    return 'BootstrapIcons';
  }
}

# Features
All icons come from [Bootstrap 5 icons](https://icons.getbootstrap.com)

### How to use
After installing the module, go to settings module, you can customize
your other icon class with another class or other search terms.

By default, all icons and definitions can be found in modules/icons folder,
you can add your icon.md manually, after that click generate button,
it'll generate your custom icon.

Icon version is 1.11.3, if you want to update to the latest version, download
the icon folder from [bootstrap 5 icons](https://github.com/twbs/icons/tree/main/docs/content/icons)
replace in modules/icons folder and click generate button in module settings

The included field will load the required Bootstrap icons library automatically.

The menu field will not load the required Bootstrap icons library automatically,
so the following should be added to the custom theme's info file:

    libraries:
      - menu_bootstrap_icon/cdn

### Recommended modules/libraries
Best use for [bootstrap 5 admin theme](https://www.drupal.org/project/bootstrap5_admin)

### Similar projects
Similar functionality [Font Awesome Icons](https://www.drupal.org/project/fontawesome)

## Bootstrap icon file link and the viewer file
You can use bootstrap icon formatter for field file. It'll display corresponding
bootstrap icon for file extension. It supports preview pdf, word, excel,
power point,... files by Google document or Microsoft Office

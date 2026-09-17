# Social Media Platforms module

Provides a block that allows to display a set of links to several social
network profiles.

This module differs from [Social Media Links Block and Field](https://www.drupal.org/project/social_media_links) in the fact
that the social network configuration does not live in the block, but in a
separate settings form.

This module works nicely with [Domain](https://www.drupal.org/project/domain) submodule Domain Config, which allows 
to override the configuration forms for each individual domain and language, 
and then, place a single block for all the domains and languages available.

## Requirements

This module requires the block core module.

## Recommended modules

This module is recommended to be used in combination with domain_config
submodule from [Domain](https://www.drupal.org/project/domain).

## Features 

+ Configurable social media platforms order.
+ Customize the label names.
+ Configure the display ( icons, labels, icons + labels )
+ Easy integration with icon libraries such as FontAwesome, Bootstrap Icons, and similar. ( >= 1.1 ).
+ Customize your own icons images via preprocess hook in the theme.
+ If using domain and domain_config, configure different social media platforms for each one, with one single block.

## Supported social media platforms

+ Facebook
+ Youtube
+ LinkedIn
+ X ( Twitter )
+ Instagram
+ Pinterest
+ TikTok

## Documentation

Read the complete documentation [here](https://www.drupal.org/docs/extending-drupal/contributed-modules/contributed-module-documentation/social-media-platforms).

## Maintainers

- [Guiu Rocafort Ferrer] - [guiu.rocafort.ferrer](https://www.drupal.org/u/guiu.rocafort.ferrer)
- [Ekaterina Shoshina] - [shoshina.ekaterina](https://www.drupal.org/u/shoshinaekaterina)

# Customising Humanity donations

This plugin has several customisation options, described below.  

## Editor modifications
The post type Gutenberg template can be modified by adding a filter; this example prepends a section block from the [Humanity Theme](https://github.com/amnestywebsite/humanity-donations):
```php
add_filter(
  'amnesty_donations_template',
  function ( array $template = [] ): array {
    array_unshift( $template, [ 'amnesty-core/block-section' ] );

  	return $template;
  }
);
```

## Frontend modifications
The block's markup can be overridden by copying the file located at `amnesty-donations/views/block.php` into your theme, and adding the following filter:
```php
add_filter(
    'amnesty_petition_view',
    function ( string $template = '' ): string {
        return locate_template( 'path/to/block.php' );
    }
);
```

You can modify the "slug" for donations in Settings -> Permalinks from within WP Admin, however the slug used for the template will remain 'petition' (e.g. `single-petition.php`).  

## Reporting errors to users
If a signature fails to be recorded by the adapter that is in use, you can display an error message to the user by adding the following code to your petition template:  

```php
<?php if ( has_action( 'amnesty_donations_error' ) ) : ?>
    <div><?php do_action( 'amnesty_donations_error' ); ?></div>
<?php endif; ?>
```

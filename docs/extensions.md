# Extending Humanity donations
By default, this plugin stores signatory data and error logs in the WordPress database.  
It can, however, be extended to support external CRMs, databases, and logging mechanisms.  

## Storing signatory data
To implement a new destination for signatory data records, you will need to create a new "adapter", which is a two-step process.  

### Step 1
Create your adapter class:  

```php
<?php

declare( strict_types = 1 );

namespace Your\Namespace;

use Amnesty\donations\Adapter;
use Amnesty\donations\Exception;
use WP_Post;

class Your_Adapter implements Adapter {

    /**
     * Record a petition signature
     *
     * @param \WP_Post $petition the signatory's petition
     * @param array $signature the sanitised signatory data
     *
     * @throws \Amnesty\donations\Exception
     *
     * @return int
     */
    public static function record_signature( WP_Post $petition, array $signature = [] ): int {
        $crm_petition_id = add_signature_to_crm(
            [
                'first_name' => $signature['first_name'],
                'last_name'  => $signature['last_name'],
                'email'      => $signature['email'],
                'phone'      => $signature['phone'],
                'petition'   => $petition->ID,
            ]
        );

        if ( ! $crm_petition_id ) {
            throw new Exception( 'Failed to record signature in CRM', 'warning' );
        }

        return $crm_petition_id;
    }

    /**
     * Get signatures for a petition
     *
     * @param \WP_Post $petition the petition to get signatures for
     * @param int $per_page the signatures per page
     * @param int $page the page number
     *
     * @return array
     */
    public static function get_signatures( WP_Post $petition, int $per_page = 10, int $page = 1 ): array {
        return get_signatures_from_crm(
            [
                'crm_petition_id' => get_post_meta( $petition->ID, 'crm_petition_id', true ),
                'page_number'     => $page,
                'quantity'        => $per_page,
            ]
        );
    }

    /**
     * Count recorded signatures for a petition
     *
     * @param \WP_Post $petition the petition to count signatures for
     *
     * @return int
     */
    public static function count_signatures( WP_Post $petition ): int {
        return get_signature_count_from_crm(
            [
                'crm_petition_id' => get_post_meta( $petition->ID, 'crm_petition_id', true ),
            ]
        );
    }

}
```

### Step two
Register your adapter:  

```php
<?php

add_filter(
    'amnesty_donations_adapters',
    function ( array $adapters = [] ): array {
        $adapters['\Your\Namespace\Your_Adapter'] = __( 'Your CRM', 'your-textdomain' );

        return $adapters;
    }
);
```

### Step three (optional)
If you wish to add new settings specifically for your extension, simply register your settings with CMB2 and with the main plugin.  
Saving of settings is handled automatically; you need only register them; they'll then appear as their own tab in the plugin settings page.  

```php
<?php

add_action(
    'cmb2_admin_init',
    function () {
        $your_settings = new_cmb2_box(
            [
                'id'           => 'your_settings_id',
                'title'        => __( 'Your Adapter Settings', 'your-textdomain' ),
                'object_types' => [ 'options-page' ],
                'hookup'       => false, // <-- important!
            ]
        );

        // etc.
    }
);

add_filter(
    'amnesty_donations_settings_tabs',
    function ( $tabs = [] ) {
        $tabs[] = [
            'title' => __( 'Your Adapter', 'your-textdomain' ),
            'id'    => 'your_settings_id',
            'slug'  => 'your-settings-slug',
        ];

        return $tabs;
    }
);
```

## Storing Log data
To implement a new destination for error logging information, you will need to create a new Logger; this is a two-step process:  

### Step one
Create your logging class:  

```php
<?php

declare( strict_types = 1 );

namespace Your\Namespace;

use Amnesty\donations\AbstractLogger;

class Your_Logger extends AbstractLogger {

    /**
     * Log a message
     *
     * @param string $type the message type
     * @param string $message the log message
     * @param integer $code the log code
     *
     * @return void
     */
    public function log( string $type = '', string $message = '', int $code = 500 ): void {
        send_log_to_your_logger( $type, $message, $code );
    }

    /**
     * Retrieve logs
     *
     * @param int $per_page logs per page to retrieve
     * @param int $page the page of logs to retrieve
     *
     * @return array
     */
    public function get( int $per_page = 10, int $page = 1 ): array {
        return get_logs_from_your_logger( $per_page, $page );
    }

}
```

### Step two
Register your logger:  

```php
<?php

use Your\Namespace\Your_Logger;

add_filter(
    'amnesty_donations_logger',
    function ( string $logger = '' ): string {
        return Your_Logger::class;
    }
);
```

### NB
The `Amnesty\donations\AbstractLogger` class provides some convenience wrapper methods for aiding readability; these are:  
```php
abstract class AbstractLogger {

    // ...

    public function error( string $message = '', int $code = 500 ): void;
    public function warning( string $message = '', int $code = 500 ): void;
    public function info( string $message = '', int $code = 500 ): void;
    
    // ...
}
```

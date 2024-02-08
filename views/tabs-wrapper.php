<div class="donation-main">
<?php

foreach ( [ 'donation', 'subscription' ] as $product_type ) {
	if ( empty( $args[ "{$product_type}Variations" ] ) ) {
		continue;
	}

	$data   = amnesty_donation_product_variations( $args[ "{$product_type}Variations" ] );
	$count  = count( $data );
	$active = 'donation' === $product_type;

	require dirname( __DIR__ ) . '/views/tabs.php';
}

unset( $get_data );

?>
</div>

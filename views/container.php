<?php

if ( empty( $args ) ) {
	return;
}

$js_data = amnesty_prep_donation_block_data_for_js( $args );
?>

<form class="wp-block-amnesty-wc-donation donation <?php echo esc_attr( $args['className'] ); ?>" method="POST" action="<?php echo esc_url( $js_data['donation']['link'] ); ?>" aria-role="complementary" data-info='<?php echo esc_js( wp_json_encode( $js_data ) ); ?>'>
<?php

require dirname( __DIR__ ) . '/views/header.php';
require dirname( __DIR__ ) . '/views/image.php';
require dirname( __DIR__ ) . '/views/types.php';

echo '<hr>';

$show_label = ( $args['showDonation'] || $args['showSubscription'] ) && $args['variationLabel'];
if ( $show_label ) {
	echo wp_kses_post( sprintf( '<span class="donation-label">%s</span>', $args['variationLabel'] ) );
}

require dirname( __DIR__ ) . '/views/tabs-wrapper.php';

// from theme companion
do_action( 'amnesty_country_selector', $args );
do_action( 'amnesty_currency_selector', $args );

require dirname( __DIR__ ) . '/views/campaigns.php';


if ( $args['campaignDescription'] ) {
	echo wp_kses_post( sprintf( '<div class="donation-campaignText">%s</div>', $args['campaignDescription'] ) );
}

// from theme companion - button that shows link for donations to section
do_action( 'amnesty_section_redirect', $args );

require dirname( __DIR__ ) . '/views/submit.php';

?>
</form>

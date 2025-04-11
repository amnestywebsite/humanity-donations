<?php

if ( $attributes['alignment'] ) {
	$attributes['className'] .= sprintf( ' align%s', esc_attr( $attributes['alignment'] ) );
}

if ( $attributes['showCampaignOptions'] && ! empty( $attributes['campaignFieldName'] ) ) {
	$attributes['campaignLabel'] = amnesty_get_campaign_field_label( $attributes['campaignFieldName'] );
	$attributes['campaigns']     = amnesty_get_campaign_field_options( $attributes['campaignFieldName'] );
}

if ( $attributes['showDonation'] ) {
	$attributes['donation']           = array_map( 'wc_get_product', $attributes['donation'] );
	$attributes['donation']           = array_filter( $attributes['donation'] );
	$attributes['donationVariations'] = array_reduce(
		$attributes['donation'],
		fn ( $carry, $donation ) => array_merge( $carry, array_map( 'wc_get_product', $donation->get_children() ) ),
		[]
	);
}

if ( $attributes['showSubscription'] ) {
	$attributes['subscription']           = array_map( 'wc_get_product', $attributes['subscription'] );
	$attributes['subscription']           = array_filter( $attributes['subscription'] );
	$attributes['subscriptionVariations'] = array_reduce(
		$attributes['subscription'],
		fn ( $carry, $subscription ) => array_merge( $carry, array_map( 'wc_get_product', $subscription->get_children() ) ),
		[]
	);
}

$js_data = amnesty_prep_donation_block_data_for_js( $attributes );

$nyp = 0;
foreach ( $js_data['donation']['variations'] as $variation ) {
	if ( ! $variation['nyp'] ) {
		continue;
	}

	$nyp = WC_Name_Your_Price_Helpers::get_suggested_price( $variation['pid'] );
}

?>

<form class="wp-block-amnesty-wc-donation donation <?php echo esc_attr( $attributes['className'] ); ?>" method="POST" action="<?php echo esc_url( $js_data['donation']['link'] ); ?>" aria-role="complementary" data-info='<?php echo esc_js( wp_json_encode( $js_data ) ); ?>'>
	<header class="donation-header">
		<?php echo wp_kses_post( sprintf( '<h%1$s class="donation-title">%2$s</h%1$s>', $attributes['titleTag'], $attributes['title'] ) ); ?>
		<p class="donation-description"><?php echo wp_kses_post( $attributes['description'] ); ?></p>
	</header>

	<?php if ( $attributes['showImage'] ) : ?>
	<div class="donation-image">
		<?php echo wp_get_attachment_image( $attributes['image'], 'post-half@2x' ); ?>
	</div>
	<?php endif; ?>

	<?php if ( ( $attributes['showDonation'] && $attributes['donation'] ) || ( $attributes['showSubscription'] && $attributes['subscription'] ) ) : ?>
	<div class="donation-selectType">
		<label for="donation" class="is-active" tabindex="0" data-type="donation"><?php echo wp_kses_post( $attributes['donationLabel'] ); ?></label>
		<input id="donation" type="radio" name="select-type" style="display:none">
		<label for="subscription" tabindex="0" data-type="subscription"><?php echo wp_kses_post( $attributes['subscriptionLabel'] ); ?></label>
		<input id="subscription" type="radio" name="select-type" style="display:none">
	</div>
	<?php endif; ?>

	<hr>

	<?php if ( ( $attributes['showDonation'] || $attributes['showSubscription'] ) && $attributes['variationLabel'] ) : ?>
	<span class="donation-label"><?php echo wp_kses_post( $attributes['variationLabel'] ); ?></span>
	<?php endif; ?>

	<div class="donation-main">
	<?php

	foreach ( [ 'donation', 'subscription' ] as $product_type ) {
		if ( empty( $attributes[ "{$product_type}Variations" ] ) ) {
			continue;
		}

		$data   = amnesty_donation_product_variations( $attributes[ "{$product_type}Variations" ] );
		$count  = count( $data );
		$active = 'donation' === $product_type;

		?>

		<div class="donation-options <?php $active && print 'is-active'; ?>" data-type="<?php echo esc_attr( $product_type ); ?>">
			<div class="donation-tabs">
			<?php for ( $i = 0; $i < $count; $i++ ) : ?>
				<div id="<?php echo esc_attr( sprintf( 'tab-%s', $data[ $i ]['id'] ) ); ?>" data-donate-price="<?php echo esc_attr( $data[ $i ]['price'] ); ?>" class="<?php 0 === $i && print 'is-active'; ?>" tabindex="0"><?php echo esc_html( $data[ $i ]['price'] ); ?></div>
			<?php endfor; ?>
			</div>
			<div class="donation-details">
			<?php for ( $i = 0; $i < $count; $i++ ) : ?>
				<div id="<?php echo esc_attr( sprintf( 'desc-%s', $data[ $i ]['id'] ) ); ?>" class="<?php 0 === $i && print 'is-active'; ?>">
					<?php echo esc_html( $data[ $i ]['desc'] ); ?>

				<?php

				if ( $data[ $i ]['nyp'] ) {
					$input_html = apply_filters( 'amnesty_donation_block_custom_price_input_html', amnesty_donations_get_nyp_input( $data[ $i ]['id'] ) );
					echo wp_kses( $input_html, wp_kses_allowed_html( 'donations' ) );
				}

				?>
				</div>
			<?php endfor; ?>
			</div>
		</div>

		<?php
	}

	?>
	</div>

	<?php do_action( 'amnesty_country_selector', $attributes ); // theme companion ?>
	<?php do_action( 'amnesty_currency_selector', $attributes ); // theme companion ?>

	<?php if ( $attributes['showCampaignOptions'] && ! empty( $attributes['campaigns'] ) ) : ?>
	<?php $make_id = fn ( string $value ): string => amnesty_hash_id( 'donate-campaign-selector-' . $value ); ?>
	<div class="donation-campaignWrap">
		<p id="campaigns" class="donation-campaignLabel"><?php echo esc_html( $attributes['campaignLabel'] ); ?></p>
		<div class="checkboxGroup is-control">
			<button class="checkboxGroup-button" type="button" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="campaigns">
				<?php /* translators: [admin/front] */ esc_html_e( 'Choose a campaign?', 'aitc' ); ?>
			</button>

			<fieldset class="checkboxGroup-list">
				<legend class="screen-reader-text"><?php echo esc_html( $attributes['campaignLabel'] ); ?></legend>

				<span class="checkboxGroup-item">
					<input id="<?php echo esc_attr( $make_id( '' ) ); ?>" type="radio" name="additional_<?php echo esc_attr( $attributes['campaignFieldName'] ); ?>" value="" checked required>
					<label for="<?php echo esc_attr( $make_id( '' ) ); ?>"><?php /* translators: [admin/front] */ esc_html_e( 'Choose a campaign?', 'aitc' ); ?></label>
				</span>

			<?php foreach ( $attributes['campaigns'] as $campaign ) : ?>
				<span class="checkboxGroup-item">
					<input id="<?php echo esc_attr( $make_id( $campaign ) ); ?>" type="radio" name="additional_<?php echo esc_attr( $attributes['campaignFieldName'] ); ?>" value="<?php echo esc_attr( $campaign ); ?>">
					<label for="<?php echo esc_attr( $make_id( $campaign ) ); ?>"><?php echo esc_html( $campaign ); ?></label>
				</span>
			<?php endforeach; ?>

			<input type="hidden" name="additional_field_names" value="additional_<?php echo esc_attr( $attributes['campaignFieldName'] ); ?>">
		</div>
	</div>
	<?php endif; ?>

	<?php if ( $attributes['campaignDescription'] ) : ?>
	<div class="donation-campaignText"><?php wp_kses_post( $attributes['campaignDescription'] ); ?></div>
	<?php endif; ?>

	<?php do_action( 'amnesty_section_redirect', $attributes ); // theme companion ?>

	<div class="internal-donate-wrapper">
		<button class="btn btn--fill internal-donate-btn" type="submit"><?php echo wp_kses_post( $attributes['buttonText'] ); ?></button>
		<input type="hidden" name="attribute_size" value="<?php echo esc_attr( $js_data['donation']['variations'][0]['size'] ?? '' ); ?>">
		<input type="hidden" name="quantity" value="1">
		<input type="hidden" name="nyp" value="<?php echo esc_attr( $nyp ); ?>">
		<input type="hidden" name="add-to-cart" value="<?php echo esc_attr( $js_data['donation']['pid'] ); ?>">
		<input type="hidden" name="product_id" value="<?php echo esc_attr( $js_data['donation']['pid'] ); ?>">
		<input type="hidden" name="variation_id" value="<?php echo esc_attr( $js_data['donation']['variations'][0]['pid'] ?? '' ); ?>">
	</div>
</form>

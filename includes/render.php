<?php

if ( ! function_exists( 'amnesty_get_donation_block_defaults' ) ) {
	/**
	 * Retrieve the donation block's default attribute values
	 *
	 * @return array<string,mixed>
	 */
	function amnesty_get_donation_block_defaults(): array {
		return [
			'className'              => 'donation',
			/* translators: [front] */
			'title'                  => __( 'Support human rights', 'aidonations' ),
			'titleTag'               => 2,
			/* translators: [front] */
			'description'            => __( 'Every donation matters!', 'aidonations' ),
			'showImage'              => false,
			'image'                  => 0,
			/* translators: [front] */
			'variationLabel'         => __( 'Choose donation amount', 'aidonations' ),
			'showDonation'           => true,
			'donation'               => [],
			/* translators: [admin/front] */
			'donationLabel'          => __( 'One-off', 'aidonations' ),
			'donationVariations'     => [],
			'showSubscription'       => true,
			'subscription'           => [],
			/* translators: [admin/front] */
			'subscriptionLabel'      => __( 'Recurring', 'aidonations' ),
			'subscriptionVariations' => [],
			'showCampaignOptions'    => true,
			'campaignFieldName'      => null,
			'campaignLabel'          => '',
			'campaignDescription'    => '',
			'campaigns'              => [],
			/* translators: [admin/front] */
			'buttonText'             => __( 'Donate', 'aidonations' ),
			'alignment'              => false,
		];
	}
}

if ( ! function_exists( 'amnesty_render_donation_block' ) ) {
	/**
	 * Donation block renderer
	 *
	 * @param array $attributes block attributes
	 *
	 * @return string
	 */
	function amnesty_render_donation_block( array $attributes = [] ) {
		$args = wp_parse_args( $attributes, amnesty_get_donation_block_defaults() );

		if ( $args['alignment'] ) {
			$args['className'] .= sprintf( ' align%s', esc_attr( $args['alignment'] ) );
		}

		if ( $args['showCampaignOptions'] && ! empty( $args['campaignFieldName'] ) ) {
			$args['campaignLabel'] = amnesty_get_campaign_field_label( $args['campaignFieldName'] );
			$args['campaigns']     = amnesty_get_campaign_field_options( $args['campaignFieldName'] );
		}

		if ( $args['showDonation'] ) {
			$args['donation']           = array_map( 'wc_get_product', $args['donation'] );
			$args['donation']           = array_filter( $args['donation'] );
			$args['donationVariations'] = array_reduce(
				$args['donation'],
				function ( $carry, $donation ) {
					return array_merge( $carry, array_map( 'wc_get_product', $donation->get_children() ) );
				},
				[]
			);
		}

		if ( $args['showSubscription'] ) {
			$args['subscription']           = array_map( 'wc_get_product', $args['subscription'] );
			$args['subscription']           = array_filter( $args['subscription'] );
			$args['subscriptionVariations'] = array_reduce(
				$args['subscription'],
				function ( $carry, $subscription ) {
					return array_merge( $carry, array_map( 'wc_get_product', $subscription->get_children() ) );
				},
				[]
			);
		}

		spaceless();
		require dirname( __DIR__ ) . '/views/container.php';
		return endspaceless( false );
	}
}

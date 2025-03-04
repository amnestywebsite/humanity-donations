<?php

declare( strict_types = 1 );

if ( ! function_exists( 'noop' ) ) {
	/**
	 * Noop function
	 *
	 * @param mixed $arg0 first passed parameter
	 *
	 * @return mixed
	 */
	function noop( $arg0 ) {
		return $arg0;
	}
}

if ( ! function_exists( 'amnesty_product_is_donation' ) ) {
	/**
	 * Check whether product is a donation type
	 *
	 * @param integer $id the product id
	 *
	 * @return boolean
	 */
	function amnesty_product_is_donation( $id = 0 ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return false;
		}

		$product = wc_get_product( $id );

		if ( ! $product ) {
			return false;
		}

		if ( 'variation' === $product->get_type() ) {
			$product = wc_get_product( $product->get_parent_id() );
		}

		return 'donation' === get_post_meta( $product->get_id(), 'amnesty_wc_product_type', true );
	}
}

if ( ! function_exists( 'amnesty_product_is_subscription' ) ) {
	/**
	 * Check whether product is a subscription type
	 *
	 * @param integer $id the product id
	 *
	 * @return boolean
	 */
	function amnesty_product_is_subscription( $id = 0 ) {
		if ( ! function_exists( 'wc_get_product' ) ) {
			return false;
		}

		$product = wc_get_product( $id );

		if ( ! $product ) {
			return false;
		}

		return in_array( $product->get_type(), [ 'subscription', 'variable-subscription', 'subscription_variation' ], true );
	}
}

if ( ! function_exists( 'amnesty_get_wooccm_fields' ) ) {
	/**
	 * Retrieve WooCommerce Checkout Manager "additional" fields used for donations
	 *
	 * @param string $filter_callback option filter to apply to fields
	 *
	 * @return array
	 */
	function amnesty_get_wooccm_fields( $filter_callback = 'noop' ) {
		$referrer      = wp_get_raw_referer() ?: '';
		$is_adminesque = is_admin() || ( $referrer && false !== strpos( $referrer, '/wp-admin/' ) );

		if ( $is_adminesque || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return array_filter( get_option( 'wooccm_additional' ) ?: [], $filter_callback );
		}

		return array_filter( WC()->checkout->get_checkout_fields( 'additional' ) ?: [], $filter_callback );
	}
}

if ( ! function_exists( 'amnesty_get_wooccm_field' ) ) {
	/**
	 * Retrieve individual WooCommerce Checkout Manager "additional" field
	 *
	 * @param string $field_name the field to retrieve
	 *
	 * @return array
	 */
	function amnesty_get_wooccm_field( $field_name = '' ) {
		$fields = amnesty_get_wooccm_fields();

		if ( ! $fields ) {
			return [];
		}

		$cache_key = sprintf( '%s-%s', __FUNCTION__, $field_name );
		$cached    = wp_cache_get( $cache_key );

		if ( $cached ) {
			return $cached;
		}

		$fields = array_column( $fields, null, 'name' );

		if ( ! isset( $fields[ $field_name ] ) ) {
			return [];
		}

		wp_cache_add( $cache_key, $fields[ $field_name ] );

		return $fields[ $field_name ];
	}
}

if ( ! function_exists( 'amnesty_wc_get_wooccm_field_value' ) ) {
	/**
	 * Retrieve a value from any WooCommerce Checkout Manager additional field
	 * on an order. Used for retrieving donation campaign targets.
	 *
	 * @param int $order_id the order to retrieve the field from
	 *
	 * @return string
	 */
	function amnesty_wc_get_wooccm_field_value( int $order_id = 0 ): string {
		if ( ! function_exists( 'WOOCCM' ) ) {
			return '';
		}

		$order = wc_get_order( $order_id );

		foreach ( WOOCCM()->additional->get_fields() as $id => $field ) {
			$key = sprintf( '_%s', $field['key'] );
			$val = $order->get_meta( $key );
			$val = $val ?: $order->get_meta( $field['name'] );

			if ( $val ) {
				return $val;
			}
		}

		return '';
	}
}

if ( ! function_exists( 'amnesty_get_campaign_field_label' ) ) {
	/**
	 * Retrieve chosen WooCommerce Checkout Manager "additional" field label
	 *
	 * @param string $field_name the field name
	 *
	 * @return string
	 */
	function amnesty_get_campaign_field_label( $field_name = '' ) {
		$field = amnesty_get_wooccm_field( $field_name );
		return $field ? $field['label'] : '';
	}
}

if ( ! function_exists( 'amnesty_get_campaign_field_options' ) ) {
	/**
	 * Context-sensitive means of retrieving campaign fields
	 *
	 * @param string   $field_name      the field to retrieve
	 * @param callable $filter_callback optional filter callback
	 *
	 * @return array
	 */
	function amnesty_get_campaign_field_options( $field_name = '', $filter_callback = 'noop' ) {
		$field = amnesty_get_wooccm_field( $field_name );

		if ( ! $field ) {
			return [];
		}

		$options = array_map( fn ( array $option ): string => $option['label'], $field['options'] );

		return array_filter( $options, $filter_callback );
	}
}

if ( ! function_exists( 'amnesty_get_donation_obj_data' ) ) {
	/**
	 * Retrieve the donation block object data
	 *
	 * @param object $obj Donations object data
	 *
	 * @return array
	 */
	function amnesty_get_donation_obj_data( $obj ) {
		return [
			'pid'  => $obj->get_id(),
			'name' => $obj->get_name(),
			'size' => $obj->get_attribute( 'size' ),
			'link' => $obj->get_permalink(),
			'nyp'  => WC_Name_Your_Price_Helpers::is_nyp( $obj ),
		];
	}
}

if ( ! function_exists( 'amnesty_prep_donation_block_data_for_js' ) ) {
	/**
	 * Prep block data required for WooCommerce integration
	 *
	 * @param array $raw_data the raw data to prep for JS
	 *
	 * @return array the prepped data
	 */
	function amnesty_prep_donation_block_data_for_js( $raw_data = [] ) {
		// return empty data scaffold if the product(s) aren't set
		if ( ! isset( $raw_data['donation'][0] ) && ! isset( $raw_data['subscription'][0] ) ) {
			return [
				'donation'     => [
					'pid'        => 0,
					/* translators: [admin] */
					'name'       => __( 'No product found.', 'aidonations' ),
					'link'       => home_url( '', 'https' ),
					'variations' => [
						[
							'pid'  => 0,
							/* translators: [admin] */
							'name' => __( 'No product found', 'aidonations' ),
							'size' => 'custom',
							'nyp'  => 'no',
						],
					],
				],
				'subscription' => [
					'pid'        => 0,
					/* translators: [admin] */
					'name'       => __( 'No product found.', 'aidonations' ),
					'link'       => home_url( '', 'https' ),
					'variations' => [
						[
							'pid'  => 0,
							/* translators: [admin] */
							'name' => __( 'No product found', 'aidonations' ),
							'size' => 'custom',
							'nyp'  => 'no',
						],
					],
				],
			];
		}

		$donation     = [];
		$subscription = [];

		if ( ! empty( $raw_data['donation'][0] ) ) {
			$donation = amnesty_get_donation_obj_data( $raw_data['donation'][0] );

			$donation['variations'] = array_map( 'amnesty_get_donation_obj_data', $raw_data['donationVariations'] );
		}

		if ( ! empty( $raw_data['subscription'][0] ) ) {
			$subscription = amnesty_get_donation_obj_data( $raw_data['subscription'][0] );

			$subscription['variations'] = array_map( 'amnesty_get_donation_obj_data', $raw_data['subscriptionVariations'] );
		}

		return compact( 'donation', 'subscription' );
	}
}

if ( ! function_exists( 'amnesty_donations_get_nyp_input' ) ) {
	/**
	 * Retrieve the Name Your Price input field for a WooCommerce product variation
	 *
	 * @param int   $variation_id  the product variation ID
	 * @param float $default_price the input default value
	 *
	 * @return string
	 */
	function amnesty_donations_get_nyp_input( int $variation_id = 0, float $default_price = 100 ): string {
		$default = $default_price ?: WC_Name_Your_Price_Helpers::get_suggested_price( $variation_id ) ?: 100;
		$product = wc_get_product( $variation_id );

		$type = 'default';
		if ( $product ) {
			if ( amnesty_product_is_donation( $product->get_id() ) ) {
				$type = 'donation';
			}

			if ( amnesty_product_is_subscription( $product->get_id() ) ) {
				$type = 'subscription';
			}
		}

		$input_html  = '<span class="donation-nyp">';
		$input_html .= sprintf( '<span aria-hidden="true" data-currency>%s</span>', esc_html( get_woocommerce_currency_symbol() ) );
		$input_html .= sprintf(
			'<input id="donation-input-%1$s-%2$s" type="text" name="_nyp" value="%3$s" placeholder="%3$s" %4$s>',
			esc_attr( $type ),
			esc_attr( $variation_id ),
			esc_attr( number_format_i18n( $default, 2 ) ),
			'default' === $type ? disabled( 1, 1, false ) : ''
		);
		$input_html .= '</span>';

		return apply_filters( 'amnesty_donations_get_nyp_input', $input_html );
	}
}

if ( ! function_exists( 'amnesty_donation_product_variations' ) ) {
	/**
	 * Get all the donation variations and return the money denominations
	 *
	 * @param array $variations Array of all the donation variations
	 *
	 * @return array Donation value options
	 */
	function amnesty_donation_product_variations( $variations ) {
		$data = [];

		foreach ( $variations as $variation ) {
			$nyp = WC_Name_Your_Price_Helpers::is_nyp( $variation );

			$data[] = [
				'id'    => $variation->get_id(),
				'desc'  => $variation->get_description(),
				/* translators: [admin/front] label for donation block when a custom donation amount can be specified */
				'price' => $nyp ? __( 'Custom', 'aidonations' ) : amnesty_wc_price_format( $variation->get_price() ),
				'nyp'   => $nyp,
			];
		}

		return $data;
	}
}

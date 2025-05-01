<?php // phpcs:ignore WordPress.Files.FileName.InvalidClassFileName

/**
 * Plugin Name:       Humanity Donations
 * Plugin URI:        https://github.com/amnestywebsite/humanity-donations
 * Description:       Add support for donations via WooCommerce
 * Version:           1.1.4
 * Author:            Amnesty International
 * Author URI:        https://www.amnesty.org
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       aidonations
 * Domain Path:       /languages
 * Network:           true
 * Requires PHP:      8.2.0
 * Requires at least: 5.8.0
 * Tested up to:      6.7.2
 * Requires Plugins:  woocommerce, woocommerce-subscriptions
 */

declare( strict_types = 1 );

namespace Amnesty\Donations;

use WC_Cart;
use WC_Product;

require_once __DIR__ . '/includes/helpers.php';
require_once __DIR__ . '/includes/kses.php';
require_once __DIR__ . '/includes/render.php';

if ( ! function_exists( 'get_plugin_data' ) ) {
	require_once ABSPATH . '/wp-admin/includes/plugin.php';
}


/**
 * Plugin instantiation class
 */
class Init {

	/**
	 * Reference to this plugin file
	 *
	 * @var string
	 */
	public static $file = __FILE__;

	/**
	 * Plugin data
	 *
	 * @var array
	 */
	protected $data = [];

	/**
	 * Bind hooks
	 */
	public function __construct() {
		add_filter( 'register_translatable_package', [ $this, 'register_translatable_package' ], 12 );

		add_action( 'init', [ $this, 'textdomain' ] );
		add_action( 'init', [ $this, 'register_block' ] );
		add_action( 'init', [ $this, 'register_meta' ] );

		if ( version_compare( $GLOBALS['wp_version'], '5.8', '<' ) ) {
			add_filter( 'block_categories', [ $this, 'register_category' ], 100 );
		} else {
			add_filter( 'block_categories_all', [ $this, 'register_category' ], 100 );
		}

		add_action( 'enqueue_block_assets', [ $this, 'register_assets' ] );
		add_action( 'enqueue_block_editor_assets', [ $this, 'register_block_assets' ] );

		add_filter( 'woocommerce_register_post_type_product', [ $this, 'modify_product_post_type' ] );
		add_filter( 'woocommerce_add_to_cart_product_id', [ $this, 'handle_cart_addition' ] );
		add_filter( 'woocommerce_add_to_cart_product_id', [ $this, 'handle_cart_removal' ] );
		add_filter( 'woocommerce_add_to_cart_redirect', [ $this, 'handle_cart_redirect' ], 20, 2 );
		add_filter( 'woocommerce_checkout_get_value', [ $this, 'checkout_get_value' ], 10, 2 );
		add_action( 'woocommerce_remove_cart_item', [ $this, 'maybe_update_session' ], 10, 2 );
		add_action( 'woocommerce_after_product_object_save', [ $this, 'save_product_meta' ] );
		add_filter( 'woocommerce_currency', [ $this, 'handle_currency_change' ] );
	}

	/**
	 * Register this plugin as a translatable package
	 *
	 * @param array<int,array<string,string>> $packages existing packages
	 *
	 * @return array<int,array<string,string>>
	 */
	public function register_translatable_package( array $packages = [] ): array {
		$packages[] = [
			'id'     => 'humanity-donations',
			'label'  => __( 'Donations', 'aidonations' ),
			'path'   => realpath( __DIR__ ),
			'pot'    => realpath( __DIR__ ) . '/languages/aidonations.pot',
			'domain' => 'aidonations',
		];

		return $packages;
	}

	/**
	 * Returns the currency, can be changed in the dropdown in donations
	 *
	 * @param string $currency the selected currency code
	 *
	 * @return mixed
	 */
	public function handle_currency_change( string $currency ): string {
		if ( ! WC()->session ) {
			return $currency;
		}

		if ( ! WC()->session->get( 'user_currency' ) ) {
			return $currency;
		}

		return WC()->session->get( 'user_currency' );
	}

	/**
	 * Register textdomain
	 *
	 * @return void
	 */
	public function textdomain(): void {
		$this->data = get_plugin_data( __FILE__ );

		load_plugin_textdomain( 'aidonations', false, basename( __DIR__ ) . '/languages' );
	}

	/**
	 * Register the Gutenberg block
	 *
	 * @return void
	 */
	public function register_block(): void {
		if ( ! current_theme_supports( 'woocommerce' ) ) {
			return;
		}

		register_block_type(
			'amnesty-wc/donation',
			[
				'render_callback' => 'amnesty_render_donation_block',
				'attributes'      => [
					'showDonation'     => [
						'type'    => 'boolean',
						'default' => true,
					],
					'showSubscription' => [
						'type'    => 'boolean',
						'default' => true,
					],
				],
			]
		);
	}

	/**
	 * Register meta for the API
	 *
	 * @return void
	 */
	public function register_meta(): void {
		if ( ! post_type_exists( 'product' ) ) {
			return;
		}

		register_meta(
			'product',
			'_campaigns',
			[
				'show_in_rest' => true,
				'single'       => true,
				'type'         => 'string',
			]
		);
	}

	/**
	 * Add a custom category to Gutenberg for easy selection of the custom blocks.
	 *
	 * @param array $categories - Current Gutenberg categories.
	 *
	 * @return array
	 */
	public function register_category( array $categories = [] ): array {
		if ( current_theme_supports( 'woocommerce' ) ) {
			array_splice(
				$categories,
				1,
				0,
				[
					[
						/* translators: [admin] */
						'title' => __( 'Amnesty WooCommerce', 'aidonations' ),
						'slug'  => 'amnesty-wc',
					],
				]
			);
		}

		return $categories;
	}

	/**
	 * Register assets for front-end
	 *
	 * @return void
	 */
	public function register_assets(): void {
		if ( is_admin() || 'wp-login.php' === $GLOBALS['pagenow'] ) {
			return;
		}

		wp_enqueue_style( 'aidonations-style', plugins_url( '/assets/styles/app.css', __FILE__ ), [], $this->data['Version'], 'all' );
		wp_enqueue_script( 'aidonations-app', plugins_url( '/assets/scripts/app.js', __FILE__ ), [], $this->data['Version'], true );

		if ( ! current_theme_supports( 'woocommerce' ) ) {
			return;
		}

		wp_localize_script(
			'aidonations-app',
			'amnestyWC',
			[
				'nonce'  => wp_create_nonce( 'amnesty-wc' ),
				'wooccm' => amnesty_get_wooccm_fields(
					fn ( $field ) => empty( $field['disabled'] ) && 'select' === $field['type'],
				),
			],
		);
	}

	/**
	 * Register assets for Gutenberg
	 *
	 * @return void
	 */
	public function register_block_assets(): void {
		wp_enqueue_style( 'aidonations-style', plugins_url( '/assets/styles/app.css', __FILE__ ), [], $this->data['Version'], 'all' );
		wp_enqueue_style( 'aidonations-editor', plugins_url( '/assets/styles/block.css', __FILE__ ), [ 'aidonations-style' ], $this->data['Version'], 'all' );
		wp_enqueue_script( 'aidonations-editor', plugins_url( '/assets/scripts/block.js', __FILE__ ), [ 'lodash', 'wp-blocks', 'wc-settings' ], $this->data['Version'], true );

		if ( ! current_theme_supports( 'woocommerce' ) ) {
			return;
		}

		wp_localize_script(
			'aidonations-editor',
			'amnestyWC',
			[
				'nonce'  => wp_create_nonce( 'amnesty-wc' ),
				'wooccm' => amnesty_get_wooccm_fields(
					fn ( $field ) => empty( $field['disabled'] ) && 'select' === $field['type'],
				),
			],
		);
	}

	/**
	 * Modify post type registration args
	 *
	 * @param array $args the product registration arguments
	 *
	 * @return array
	 */
	public function modify_product_post_type( array $args = [] ): array {
		$args['has_archive'] = 'products';

		return $args;
	}

	/**
	 * If the product being added to the cart is a donation/subscription,
	 * clear out previously-added products before redirecting to the cart.
	 *
	 * @param int $id the ID of the product being added
	 *
	 * @return int $id
	 */
	public function handle_cart_addition( int $id = 0 ): int {
		if ( 0 === $id ) {
			return $id;
		}

		$is_donation     = amnesty_product_is_donation( $id );
		$is_subscription = amnesty_product_is_subscription( $id );

		if ( ! $is_donation && ! $is_subscription ) {
			return $id;
		}

		WC()->cart->empty_cart();

		return $id;
	}

	/**
	 * If the product being added to the cart is not a donation/subscription,
	 * clear out previously-added donations/subscriptions.
	 *
	 * @param int $id the ID of the product being added
	 *
	 * @return int $id
	 */
	public function handle_cart_removal( int $id = 0 ): int {
		if ( 0 === $id ) {
			return $id;
		}

		$cart_items = WC()->cart->get_cart();

		foreach ( $cart_items as $hash => $item ) {
			$product_id = absint( $item['product_id'] );

			if ( ! $product_id ) {
				continue;
			}

			$is_donation     = amnesty_product_is_donation( $product_id );
			$is_subscription = amnesty_product_is_subscription( $product_id );

			if ( ! $is_donation && ! $is_subscription ) {
				continue;
			}

			WC()->cart->remove_cart_item( $hash );
		}

		return $id;
	}

	/**
	 * Redirect straight to cart if product added to basket is a donation/subscription
	 *
	 * @param string     $url     the redirect URL
	 * @param WC_Product $product the product being added to the cart
	 *
	 * @return string $url
	 *
	 * phpcs:disable WordPress.Security.NonceVerification.Missing
	 * ^ this callback is only triggered if WC has verified the request
	 */
	public function handle_cart_redirect( string $url, WC_Product $product = null ): string {
		if ( ! $product ) {
			return $url;
		}

		$is_donation     = amnesty_product_is_donation( $product->get_id() );
		$is_subscription = amnesty_product_is_subscription( $product->get_id() );

		if ( ! $is_donation && ! $is_subscription ) {
			return $url;
		}

		// store additional fields here - there's sadly no decent alternative hook
		$data_fields = sanitize_text_field( $_POST['additional_field_names'] ?? '' );

		if ( ! $data_fields ) {
			return wc_get_checkout_url();
		}

		$data_fields = explode( ',', $data_fields );
		$save_fields = [];

		foreach ( $data_fields as $field ) {
			$value = sanitize_text_field( $_POST[ $field ] ?? '' );

			if ( ! $value ) {
				continue;
			}

			WC()->session->set( $field, $value );
			$save_fields[] = $field;
		}

		WC()->session->set( 'custom_session_fields', implode( ',', $save_fields ) );

		return wc_get_checkout_url();
	}
	// phpcs:enable WordPress.Security.NonceVerification.Missing

	/**
	 * Set data from the session, if there is a value in the store.
	 * Allows us to pre-populate additional fields from WOOCCM.
	 *
	 * @param null   $retval the override return value
	 * @param string $key    the key of the value to be retrieved
	 *
	 * @return mixed
	 */
	public function checkout_get_value( $retval = null, string $key = '' ) {
		if ( ! WC()->session ) {
			return $retval;
		}

		$fields = explode( ',', WC()->session->get( 'custom_session_fields' ) ?: '' );

		if ( ! $fields || ! in_array( $key, $fields, true ) ) {
			return $retval;
		}

		if ( WC()->session->get( $key ) ) {
			return WC()->session->get( $key );
		}

		return $retval;
	}

	/**
	 * Remove data from the session upon removal of a product from the cart.
	 *
	 * @param string  $key  the cart item key
	 * @param WC_Cart $cart the WooCommerce cart object
	 */
	public function maybe_update_session( string $key, WC_Cart $cart ): void {
		$product = $cart->get_cart_item( $key )['product_id'];

		$is_donation     = amnesty_product_is_donation( $product );
		$is_subscription = amnesty_product_is_subscription( $product );

		if ( ! $is_donation && ! $is_subscription ) {
			return;
		}

		$fields = WC()->session->get( 'custom_session_fields' );

		if ( null === $fields ) {
			return;
		}

		$fields = explode( ',', $fields );

		if ( ! $fields || ! in_array( $key, $fields, true ) ) {
			return;
		}

		foreach ( $fields as $field ) {
			WC()->session->set( $field, '' );
		}
	}

	/**
	 * Save donation product meta
	 *
	 * @param WC_Product $product the product being saved
	 *
	 * @return bool
	 */
	public function save_product_meta( WC_Product $product ): bool {
		// v this callback is only triggered if WC has verified the request
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		$is_donation = sanitize_text_field( $_POST['amnesty_wc_product_type'] ?? '' );

		if ( ! $is_donation || 'donation' !== $is_donation ) {
			return delete_post_meta( $product->get_id(), 'amnesty_wc_product_type' );
		}

		return ! ! update_post_meta( $product->get_id(), 'amnesty_wc_product_type', 'donation' );
	}

	/**
	 * Support currency changing
	 *
	 * @param string $currency the currency being changed
	 *
	 * @return string
	 */
	public function currency_change( string $currency ): string {
		return WC()->session->get( 'user_currency' ) ?: $currency;
	}
}

new Init();

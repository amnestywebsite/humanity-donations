<?php

$nyp = 0;
foreach ( $js_data['donation']['variations'] as $variation ) {
	if ( ! $variation['nyp'] ) {
		continue;
	}

	$nyp = WC_Name_Your_Price_Helpers::get_suggested_price( $variation['pid'] );
}

?>
<div class="internal-donate-wrapper">
	<button class="btn btn--fill internal-donate-btn" type="submit"><?php echo wp_kses_post( $args['buttonText'] ); ?></button>
	<input type="hidden" name="attribute_size" value="<?php echo esc_attr( $js_data['donation']['variations'][0]['size'] ?? '' ); ?>">
	<input type="hidden" name="quantity" value="1">
	<input type="hidden" name="nyp" value="<?php echo esc_attr( $nyp ); ?>">
	<input type="hidden" name="add-to-cart" value="<?php echo esc_attr( $js_data['donation']['pid'] ); ?>">
	<input type="hidden" name="product_id" value="<?php echo esc_attr( $js_data['donation']['pid'] ); ?>">
	<input type="hidden" name="variation_id" value="<?php echo esc_attr( $js_data['donation']['variations'][0]['pid'] ?? '' ); ?>">
</div>

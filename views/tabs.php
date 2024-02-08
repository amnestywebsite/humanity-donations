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

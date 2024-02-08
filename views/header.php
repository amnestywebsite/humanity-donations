<?php

if ( ! $args['title'] && ! $args['description'] ) {
	return;
}

?>
<header class="donation-header">
	<?php echo wp_kses_post( sprintf( '<h%1$s class="donation-title">%2$s</h%1$s>', $args['titleTag'], $args['title'] ) ); ?>
	<p class="donation-description"><?php echo wp_kses_post( $args['description'] ); ?></p>
</header>

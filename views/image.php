<?php

if ( ! $args['showImage'] ) {
	return;
}

?>

<div class="donation-image">
	<?php echo wp_get_attachment_image( $args['image'], 'post-half@2x' ); ?>
</div>

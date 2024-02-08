<?php

if ( ! $args['showDonation'] || empty( $args['donation'] ) || ! $args['showSubscription'] || empty( $args['subscription'] ) ) {
	return;
}

?>
<div class="donation-selectType">
	<label for="donation" class="is-active" tabindex="0" data-type="donation"><?php echo wp_kses_post( $args['donationLabel'] ); ?></label>
	<input id="donation" type="radio" name="select-type" style="display:none">
	<label for="subscription" tabindex="0" data-type="subscription"><?php echo wp_kses_post( $args['subscriptionLabel'] ); ?></label>
	<input id="subscription" type="radio" name="select-type" style="display:none">
</div>

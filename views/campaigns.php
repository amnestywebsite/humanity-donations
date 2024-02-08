<?php

if ( ! $args['showCampaignOptions'] || empty( $args['campaigns'] ) ) {
	return;
}

$make_id = fn ( string $value ): string => amnesty_hash_id( 'donate-campaign-selector-' . $value );

?>

<div class="donation-campaignWrap">
	<p id="campaigns" class="donation-campaignLabel"><?php echo esc_html( $args['campaignLabel'] ); ?></p>
	<div class="checkboxGroup is-control">
		<button class="checkboxGroup-button" type="button" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="campaigns">
			<?php /* translators: [admin/front] */ esc_html_e( 'Choose a campaign?', 'aitc' ); ?>
		</button>

		<fieldset class="checkboxGroup-list">
			<legend class="screen-reader-text"><?php echo esc_html( $args['campaignLabel'] ); ?></legend>

			<span class="checkboxGroup-item">
				<input id="<?php echo esc_attr( $make_id( '' ) ); ?>" type="radio" name="additional_<?php echo esc_attr( $args['campaignFieldName'] ); ?>" value="" checked required>
				<label for="<?php echo esc_attr( $make_id( '' ) ); ?>"><?php /* translators: [admin/front] */ esc_html_e( 'Choose a campaign?', 'aitc' ); ?></label>
			</span>

		<?php foreach ( $args['campaigns'] as $campaign ) : ?>
			<span class="checkboxGroup-item">
				<input id="<?php echo esc_attr( $make_id( $campaign ) ); ?>" type="radio" name="additional_<?php echo esc_attr( $args['campaignFieldName'] ); ?>" value="<?php echo esc_attr( $campaign ); ?>">
				<label for="<?php echo esc_attr( $make_id( $campaign ) ); ?>"><?php echo esc_html( $campaign ); ?></label>
			</span>
		<?php endforeach; ?>

		<input type="hidden" name="additional_field_names" value="additional_<?php echo esc_attr( $args['campaignFieldName'] ); ?>">
	</div>
</div>

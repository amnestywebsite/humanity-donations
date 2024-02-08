<?php

if ( ! function_exists( 'amnesty_donations_kses_allowed_html' ) ) {
	/**
	 * Declare donations-specific KSES tags
	 *
	 * @param array  $tags    currently-allowed HTML tags/attributes
	 * @param string $context the KSES context
	 *
	 * @return array
	 */
	function amnesty_donations_kses_allowed_html( array $tags, string $context ): array {
		if ( 'donations' !== $context ) {
			return $tags;
		}

		return array_merge_recursive(
			$tags,
			[
				'span'   => _wp_add_global_attributes( [] ),
				'select' => _wp_add_global_attributes( [] ),
				'option' => _wp_add_global_attributes( [] ),
				'input'  => array_merge(
					_wp_add_global_attributes( [] ),
					[
						'type'        => true,
						'name'        => true,
						'value'       => true,
						'min'         => true,
						'max'         => true,
						'step'        => true,
						'placeholder' => true,
						'disabled'    => true,
					] 
				),
			] 
		);
	}
}

add_filter( 'wp_kses_allowed_html', 'amnesty_donations_kses_allowed_html', 10, 2 );

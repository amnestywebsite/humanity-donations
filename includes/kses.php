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
		if ( ! in_array( $context, [ 'donations', 'post' ], true ) ) {
			return $tags;
		}

		$attributes = _wp_add_global_attributes(
			[
				'aria-role' => true,
			]
		);

		return array_merge_recursive(
			$tags,
			[
				'header'   => $attributes,
				'div'      => $attributes,
				'h2'       => $attributes,
				'p'        => $attributes,
				'a'        => $attributes,
				'span'     => $attributes,
				'fieldset' => $attributes,
				'legend'   => $attributes,
				'hr'       => [],
				'select'   => $attributes,
				'option'   => $attributes,
				'form'     => array_merge(
					$attributes,
					[
						'method'    => true,
						'action'    => true,
						'data-info' => true,
					],
				),
				'button'   => array_merge(
					$attributes,
					[
						'type'           => true,
						'aria-has-popup' => true,
					],
				),
				'label'    => array_merge(
					$attributes,
					[
						'for'      => true,
						'tabindex' => true,
					],
				),
				'input'    => array_merge(
					$attributes,
					[
						'type'        => true,
						'name'        => true,
						'value'       => true,
						'min'         => true,
						'max'         => true,
						'step'        => true,
						'placeholder' => true,
						'disabled'    => true,
						'required'    => true,
					],
				),
			]
		);
	}
}

add_filter( 'wp_kses_allowed_html', 'amnesty_donations_kses_allowed_html', 10, 2 );

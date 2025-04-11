/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ProductsControl from './products-control.jsx';

/**
 * Render the product selector for an attribute type
 */
export default function Select({ onSave, onSelect, selected }) {
  return (
    <>
      <ProductsControl selected={selected} isSingle={true} onChange={onSelect} />
      <Button variant="secondary" onClick={onSave}>
        {/* translators: [ignore] */ __('Done', 'woocommerce')}
      </Button>
    </>
  );
}

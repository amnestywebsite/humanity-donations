/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 *
 * These were originally going to be imported from WC as dependencies,
 * but it increased the bundle size dramatically (15MB!). Copypasta.
 */
import withSearchedProducts from '../hocs/with-searched-products.jsx';
import { SearchListControl } from './search-list-control.jsx';

const { __, _n, sprintf } = wp.i18n;

/**
 * The products control exposes a custom selector for searching and selecting
 * products.
 *
 * @param {Object} props Component props.
 * @param {Function} props.onChange  Callback fired when the selected item changes
 * @param {Function} props.onSearch  Callback fired when a search is triggered
 * @param {Array}    props.selected  An array of selected products.
 * @param {Array}    props.products  An array of products to select from.
 * @param {boolean}  props.isLoading Whether or not the products are being loaded.
 *
 * @return {Function} A functional component.
 */
const ProductsControl = ({ onChange, onSearch, selected, products, isLoading, isSingle }) => {
  const messages = {
    /* translators: [ignore] */
    clear: __('Clear all products', 'woocommerce'),
    /* translators: [ignore] */
    list: __('Products', 'woocommerce'),
    /* translators: [ignore] */
    noItems: __("Your store doesn't have any products.", 'woocommerce'),
    /* translators: [ignore] */
    search: __('Search for products to display', 'woocommerce'),
    selected: (n) =>
      sprintf(
        /* translators: [ignore] */
        _n('%d product selected', '%d products selected', n, 'woocommerce'),
        n,
      ),
    /* translators: [ignore] */
    updated: __('Product search results updated.', 'woocommerce'),
  };

  return (
    <SearchListControl
      className="woocommerce-products"
      list={products}
      isLoading={isLoading}
      isSingle={isSingle}
      selected={selected}
      onSearch={onSearch}
      onChange={onChange}
      messages={messages}
    />
  );
};

ProductsControl.propTypes = {
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func,
  selected: PropTypes.array,
  products: PropTypes.array,
  isLoading: PropTypes.bool,
  isSingle: PropTypes.bool,
};

ProductsControl.defaultProps = {
  selected: [],
  products: [],
  isLoading: true,
  isSingle: false,
};

export default withSearchedProducts(ProductsControl);

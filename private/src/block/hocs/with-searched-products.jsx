/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { getProducts } from '../utils/index.jsx';

const { createHigherOrderComponent } = wp.compose;
const { Component } = wp.element;

/**
 * A higher order component that enhances the provided component with products
 * from a search query.
 */
const withSearchedProducts = createHigherOrderComponent((OriginalComponent) => {
  /**
   * A Component wrapping the passed in component.
   *
   * @class WrappedComponent
   * @extends {Component}
   */
  class WrappedComponent extends Component {
    isLargeCatalog = false;

    state = {
      list: [],
      loading: true,
    };

    componentDidMount() {
      const { selected } = this.props;

      getProducts({ selected })
        .then((list) => {
          this.setState({ list, loading: false });
        })
        .catch(() => {
          this.setState({ list: [], loading: false });
        });
    }

    render() {
      const { list, loading } = this.state;
      const { selected } = this.props;

      return (
        <OriginalComponent
          {...this.props}
          products={list}
          isLoading={loading}
          selected={list.filter(({ id }) => selected.includes(id))}
          onSearch={null}
        />
      );
    }
  }

  WrappedComponent.propTypes = {
    selected: PropTypes.array,
  };

  WrappedComponent.defaultProps = {
    selected: [],
  };

  return WrappedComponent;
}, 'withSearchedProducts');

export default withSearchedProducts;

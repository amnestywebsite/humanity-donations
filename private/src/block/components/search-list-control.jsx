/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { buildTermsTree } from '../utils/index.jsx';
import SearchListItem from './search-list-item.jsx';
import Tag from './tag.jsx';

const { escapeRegExp, findIndex } = lodash;
const { Button, MenuGroup, Spinner, TextControl, withSpokenMessages } = wp.components;
const { compose, withInstanceId, withState } = wp.compose;
const { Component, Fragment } = wp.element;
const { __, _n, sprintf } = wp.i18n;

const defaultMessages = {
  /* translators: [ignore] */
  clear: __('Clear all selected items', 'woocommerce-admin'),
  /* translators: [ignore] */
  list: __('Results', 'woocommerce-admin'),
  /* translators: [ignore] */
  noItems: __('No items found.', 'woocommerce-admin'),
  /* translators: [ignore] */
  noResults: __('No results for %s', 'woocommerce-admin'),
  /* translators: [ignore] */
  search: __('Search for items', 'woocommerce-admin'),
  selected: (n) =>
    sprintf(
      /* translators: [ignore] */
      _n('%d item selected', '%d items selected', n, 'woocommerce-admin'),
      n,
    ),
  /* translators: [ignore] */
  updated: __('Search results updated.', 'woocommerce-admin'),
};

/**
 * Component to display a searchable, selectable list of items.
 */
export class SearchListControl extends Component {
  constructor(...params) {
    super(...params);

    this.onSelect = this.onSelect.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onClear = this.onClear.bind(this);
    this.isSelected = this.isSelected.bind(this);
    SearchListControl.defaultRenderItem = SearchListControl.defaultRenderItem.bind(this);
    this.renderList = this.renderList.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { onSearch, search } = this.props;

    if (search !== prevProps.search && typeof onSearch === 'function') {
      onSearch(search);
    }
  }

  onRemove(id) {
    const { isSingle, onChange, selected } = this.props;

    return () => {
      if (isSingle) {
        onChange([]);
      }

      const i = findIndex(selected, { id });

      onChange([...selected.slice(0, i), ...selected.slice(i + 1)]);
    };
  }

  onSelect(item) {
    const { isSingle, onChange, selected } = this.props;

    return () => {
      if (this.isSelected(item)) {
        this.onRemove(item.id)();
        return;
      }

      if (isSingle) {
        onChange([item]);
      } else {
        onChange([...selected, item]);
      }
    };
  }

  onClear() {
    this.props.onChange([]);
  }

  isSelected(item) {
    return findIndex(this.props.selected, { id: item.id }) !== -1;
  }

  getFilteredList(list, search) {
    const { isHierarchical } = this.props;

    if (!search) {
      return isHierarchical ? buildTermsTree(list) : list;
    }

    const messages = { ...defaultMessages, ...this.props.messages };
    const re = new RegExp(escapeRegExp(search), 'i');

    this.props.debouncedSpeak(messages.updated);

    const filteredList = list.map((item) => (re.test(item.name) ? item : false)).filter(Boolean);

    return isHierarchical ? buildTermsTree(filteredList, list) : filteredList;
  }

  static defaultRenderItem = (args) => <SearchListItem {...args} />;

  renderList(list, depth = 0) {
    const { isSingle, search } = this.props;
    const renderItem = this.props.renderItem || SearchListControl.defaultRenderItem;

    if (!list) {
      return null;
    }

    return list.map((item) => (
      <Fragment key={item.id}>
        {renderItem({
          item,
          isSelected: this.isSelected(item),
          onSelect: this.onSelect,
          isSingle,
          search,
          depth,
        })}
        {this.renderList(item.children, depth + 1)}
      </Fragment>
    ));
  }

  renderListSection() {
    const { isLoading, search } = this.props;
    const list = this.getFilteredList(this.props.list, search);
    const messages = { ...defaultMessages, ...this.props.messages };

    if (isLoading) {
      return (
        <div className="woocommerce-search-list__list is-loading">
          <Spinner />
        </div>
      );
    }

    if (!list.length) {
      return (
        <div className="woocommerce-search-list__list is-not-found">
          <span className="woocommerce-search-list__not-found-icon">
            <Gridicon icon="notice-outline" role="img" aria-hidden="true" focusable="false" />
          </span>
          <span className="woocommerce-search-list__not-found-text">
            {search ? sprintf(messages.noResults, search) : messages.noItems}
          </span>
        </div>
      );
    }

    return (
      <MenuGroup label={messages.list} className="woocommerce-search-list__list">
        {this.renderList(list)}
      </MenuGroup>
    );
  }

  renderSelectedSection() {
    const { isLoading, isSingle, selected } = this.props;
    const messages = { ...defaultMessages, ...this.props.messages };

    if (isLoading || isSingle || !selected) {
      return null;
    }

    const selectedCount = selected.length;

    return (
      <div className="woocommerce-search-list__selected">
        <div className="woocommerce-search-list__selected-header">
          <strong>{messages.selected(selectedCount)}</strong>
          {selectedCount > 0 ? (
            <Button isLink isDestructive onClick={this.onClear} aria-label={messages.clear}>
              {__('Clear all', 'woocommerce-admin')}
            </Button>
          ) : null}
        </div>
        {selected.map((item, i) => (
          <Tag key={i} label={item.name} id={item.id} remove={this.onRemove} />
        ))}
      </div>
    );
  }

  render() {
    const { className = '', search, setState } = this.props;
    const messages = { ...defaultMessages, ...this.props.messages };

    return (
      <div className={`woocommerce-search-list ${className}`}>
        {this.renderSelectedSection()}

        <div className="woocommerce-search-list__search">
          <TextControl
            label={messages.search}
            type="search"
            value={search}
            onChange={(value) => setState({ search: value })}
          />
        </div>

        {this.renderListSection()}
      </div>
    );
  }
}

SearchListControl.propTypes = {
  /**
   * Additional CSS classes.
   */
  className: PropTypes.string,
  /**
   * Whether the list of items is hierarchical or not. If true, each list item is expected to
   * have a parent property.
   */
  isHierarchical: PropTypes.bool,
  /**
   * Whether the list of items is still loading.
   */
  isLoading: PropTypes.bool,
  /**
   * Restrict selections to one item.
   */
  isSingle: PropTypes.bool,
  /**
   * A complete list of item objects, each with id, name properties. This is displayed as a
   * clickable/keyboard-able list, and possibly filtered by the search term (searches name).
   */
  list: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    }),
  ),
  /**
   * Messages displayed or read to the user. Configure these to reflect your object type.
   * See `defaultMessages` above for examples.
   */
  messages: PropTypes.shape({
    /**
     * A more detailed label for the "Clear all" button, read to screen reader users.
     */
    clear: PropTypes.string,
    /**
     * Label for the list of selectable items, only read to screen reader users.
     */
    list: PropTypes.string,
    /**
     * Message to display when the list is empty (implies nothing loaded from the server
     * or parent component).
     */
    noItems: PropTypes.string,
    /**
     * Message to display when no matching results are found. %s is the search term.
     */
    noResults: PropTypes.string,
    /**
     * Label for the search input
     */
    search: PropTypes.string,
    /**
     * Label for the selected items. This is actually a function, so that we can pass
     * through the count of currently selected items.
     */
    selected: PropTypes.func,
    /**
     * Label indicating that search results have changed, read to screen reader users.
     */
    updated: PropTypes.string,
  }),
  /**
   * Callback fired when selected items change, whether added, cleared, or removed.
   * Passed an array of item objects (as passed in via props.list).
   */
  onChange: PropTypes.func.isRequired,
  /**
   * Callback fired when the search field is used.
   */
  onSearch: PropTypes.func,
  /**
   * Callback to render each item in the selection list, allows any custom object-type rendering.
   */
  renderItem: PropTypes.func,
  /**
   * The list of currently selected items.
   */
  selected: PropTypes.array.isRequired,
  // from withState
  search: PropTypes.string,
  setState: PropTypes.func,
  // from withSpokenMessages
  debouncedSpeak: PropTypes.func,
  // from withInstanceId
  instanceId: PropTypes.number,
};

export default compose([withState({ search: '' }), withSpokenMessages, withInstanceId])(
  SearchListControl,
);

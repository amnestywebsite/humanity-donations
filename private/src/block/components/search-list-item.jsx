/**
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import {
  IconCheckChecked,
  IconCheckUnchecked,
  IconRadioSelected,
  IconRadioUnselected,
} from '../utils/icons.jsx';

const { escapeRegExp, first, last } = lodash;
const { MenuItem } = wp.components;

function getHighlightedName(name, search) {
  if (!search) {
    return name;
  }

  const re = new RegExp(escapeRegExp(search), 'ig');

  return name.replace(re, '<strong>$&</strong>');
}

function getBreadcrumbsForDisplay(breadcrumbs) {
  if (breadcrumbs.length === 1) {
    return first(breadcrumbs);
  }

  if (breadcrumbs.length === 2) {
    return `${first(breadcrumbs)} › ${last(breadcrumbs)}`;
  }

  return `${first(breadcrumbs)} … ${last(breadcrumbs)}`;
}

const getInteractionIcon = (isSingle = false, isSelected = false) => {
  if (isSingle) {
    return isSelected ? <IconRadioSelected /> : <IconRadioUnselected />;
  }

  return isSelected ? <IconCheckChecked /> : <IconCheckUnchecked />;
};

const SearchListItem = ({
  countLabel,
  className,
  depth = 0,
  item,
  isSelected,
  isSingle,
  onSelect,
  search = '',
  showCount = false,
  ...props
}) => {
  const classes = [className, 'woocommerce-search-list__item', `depth-${depth}`];

  if (isSingle) {
    classes.push('is-radio-button');
  }

  const hasBreadcrumbs = item.breadcrumbs && item.breadcrumbs.length;

  return (
    <MenuItem
      role={isSingle ? 'menuitemradio' : 'menuitemcheckbox'}
      className={classes.join(' ')}
      onClick={onSelect(item)}
      isSelected={isSelected}
      {...props}
    >
      <span className="woocommerce-search-list__item-state">
        {getInteractionIcon(isSingle, isSelected)}
      </span>

      <span className="woocommerce-search-list__item-label">
        {hasBreadcrumbs ? (
          <span className="woocommerce-search-list__item-prefix">
            {getBreadcrumbsForDisplay(item.breadcrumbs)}
          </span>
        ) : null}
        <span
          className="woocommerce-search-list__item-name"
          dangerouslySetInnerHTML={{
            __html: getHighlightedName(item.name, search),
          }}
        />
      </span>

      {!!showCount && (
        <span className="woocommerce-search-list__item-count">{countLabel || item.count}</span>
      )}
    </MenuItem>
  );
};

SearchListItem.propTypes = {
  /**
   * Additional CSS classes.
   */
  className: PropTypes.string,
  /**
   * Label to display if `showCount` is set to true. If undefined, it will use `item.count`.
   */
  countLabel: PropTypes.node,
  /**
   * Depth, non-zero if the list is hierarchical.
   */
  depth: PropTypes.number,
  /**
   * Current item to display.
   */
  item: PropTypes.object,
  /**
   * Whether this item is selected.
   */
  isSelected: PropTypes.bool,
  /**
   * Whether this should only display a single item (controls radio vs checkbox icon).
   */
  isSingle: PropTypes.bool,
  /**
   * Callback for selecting the item.
   */
  onSelect: PropTypes.func,
  /**
   * Search string, used to highlight the substring in the item name.
   */
  search: PropTypes.string,
  /**
   * Toggles the "count" bubble on/off.
   */
  showCount: PropTypes.bool,
};

export default SearchListItem;

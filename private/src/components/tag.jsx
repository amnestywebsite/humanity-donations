/**
 * WordPress dependencies
 */
import { Button, Dashicon, Popover } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';

/**
 * External dependencies
 */
import classnames from 'classnames';
import PropTypes from 'prop-types';

/**
 * This component can be used to show an item styled as a "tag", optionally with an `X` + "remove"
 * or with a popover that is shown on click.
 *
 * @return {object} -
 */
const Tag = ({ id, instanceId, label, popoverContents, remove, screenReaderLabel, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!label) {
    // A null label probably means something went wrong
    // @todo Maybe this should be a loading indicator?
    return null;
  }

  const classes = classnames('woocommerce-tag', className, {
    'has-remove': !!remove,
  });

  const labelId = `woocommerce-tag__label-${instanceId}`;

  const labelTextNode = (
    <>
      <span className="screen-reader-text">{screenReaderLabel || label}</span>
      <span aria-hidden="true">{label}</span>
    </>
  );

  return (
    <span className={classes}>
      {popoverContents ? (
        <Button
          className="woocommerce-tag__text"
          id={labelId}
          onClick={() => setIsVisible(true)}
          isToggled={isVisible}
        >
          {labelTextNode}
        </Button>
      ) : (
        <span className="woocommerce-tag__text" id={labelId}>
          {labelTextNode}
        </span>
      )}
      {popoverContents && isVisible && (
        <Popover onClose={() => setIsVisible(false)}>{popoverContents}</Popover>
      )}
      {remove && (
        <Button
          className="woocommerce-tag__remove"
          icon={<Dashicon icon="dismiss" size={20} />}
          onClick={remove(id)}
          label={sprintf(/* translators: [ignore] */ __('Remove %s', 'woocommerce'), label)}
          aria-describedby={labelId}
        />
      )}
    </span>
  );
};

Tag.propTypes = {
  /**
   * The ID for this item, used in the remove function.
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

  /**
   * The name for this item, displayed as the tag's text.
   */
  label: PropTypes.string.isRequired,
  /**
   * Contents to display on click in a popover
   */
  popoverContents: PropTypes.node,
  /**
   * A function called when the remove X is clicked. If not used, no X icon will display.
   */
  remove: PropTypes.func,
  /**
   * A more descriptive label for screen reader users. Defaults to the `name` prop.
   */
  screenReaderLabel: PropTypes.string,
};

export default withInstanceId(Tag);

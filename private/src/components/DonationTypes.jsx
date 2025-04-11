/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Slot } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Add buttons to toggle between donation types
 */
export default function DonationTypes({
  selected,
  setSelected,
  donationLabel,
  subscriptionLabel,
  showDonation,
  showSubscription,
}) {
  if (!showDonation || !showSubscription) {
    return (
      <>
        <Slot name="amnesty.donations.editor.beforeNav" />
        <Slot name="amnesty.donations.editor.afterNav" />
      </>
    );
  }

  const buttons = [];

  if (showDonation) {
    buttons.push({
      label: donationLabel,
      value: 'donation',
    });
  }

  if (showSubscription) {
    buttons.push({
      label: subscriptionLabel,
      value: 'subscription',
    });
  }

  const classes = classnames('donation-selectType', {
    [`is-${selected}`]: buttons.length,
  });

  return (
    <>
      <Slot name="amnesty.donations.editor.beforeNav" />
      <fieldset>
        <legend className="screen-reader-text">
          {/* translators: [admin] */ __('Donation Type', 'aidonations')}
        </legend>
        <div className={classes}>
          {buttons.map((button) => (
            <div key={button.label}>
              <input
                id={`${button.label.toLowerCase()}-option`}
                type="radio"
                value={button.value}
                checked={selected === button.value}
                onChange={() => null}
              />
              <label
                htmlFor={`${button.label.toLowerCase()}-option`}
                onClick={() => setSelected(button.value)}
              >
                {button.label}
              </label>
            </div>
          ))}
        </div>
      </fieldset>
      <Slot name="amnesty.donations.editor.afterNav" />
    </>
  );
}

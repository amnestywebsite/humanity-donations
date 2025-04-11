/**
 * WordPress dependencies
 */
import { isEqual } from 'lodash';
import { BlockAlignmentToolbar, BlockControls, InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, Slot, TextControl, ToggleControl, Toolbar } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import HeadingToolbar from './components/heading-toolbar.jsx';
import IntroductoryFields from './components/IntroductoryFields.jsx';
import { CampaignInspectorControls, Campaigns } from './components/DonationCampaigns.jsx';
import Preview from './components/Preview.jsx';
import Select from './components/Select.jsx';
import DonationTypes from './components/DonationTypes.jsx';

const wooVariationsStore = 'wc/admin/products/variations';

function BlockInspectorControls({ attributes, setAttributes, campaigns, campaignsLabel }) {
  return (
    <InspectorControls>
      <PanelBody title={/* translators: [admin] */ __('Content', 'aidonations')}>
        <label htmlFor="donation-title-size">
          {/* translators: [admin] */ __('Title Size', 'aidonations')}
        </label>
        <HeadingToolbar
          id="donation-title-size"
          minLevel={1}
          maxLevel={7}
          selectedLevel={attributes.titleTag}
          onChange={(titleTag) => setAttributes({ titleTag })}
        />
        <ToggleControl
          label={/* translators: [admin] */ __('Show image', 'aidonations')}
          checked={attributes.showImage}
          onChange={(showImage) => setAttributes({ showImage })}
        />
      </PanelBody>
      <PanelBody
        title={
          /* translators: [admin] */
          __('Products', 'aidonations')
        }
        initialOpen={false}
      >
        <ToggleControl
          label={/* translators: [admin] */ __('Show one-off donation', 'aidonations')}
          checked={attributes.showDonation}
          onChange={(showDonation) => setAttributes({ showDonation })}
        />
        {attributes.showDonation && (
          <TextControl
            label={/* translators: [admin] */ __('One-off donation label', 'aidonations')}
            value={attributes.donationLabel}
            onChange={(donationLabel) => setAttributes({ donationLabel })}
          />
        )}
        <hr />
        <ToggleControl
          label={/* translators: [admin] */ __('Show subscription donation', 'aidonations')}
          checked={attributes.showSubscription}
          onChange={(showSubscription) => setAttributes({ showSubscription })}
        />
        {attributes.showSubscription && (
          <TextControl
            label={/* translators: [admin] */ __('subscription donation label', 'aidonations')}
            value={attributes.subscriptionLabel}
            onChange={(subscriptionLabel) => setAttributes({ subscriptionLabel })}
          />
        )}
        <hr />
        {(attributes.showDonation || attributes.showSubscription) && (
          <TextControl
            label={/* translators: [admin] */ __('Pre-donation selection label', 'aidonations')}
            value={attributes.variationLabel}
            onChange={(variationLabel) => setAttributes({ variationLabel })}
          />
        )}
      </PanelBody>
      <CampaignInspectorControls
        attributes={attributes}
        campaigns={campaigns}
        campaignsLabel={campaignsLabel}
        setAttributes={setAttributes}
      />
    </InspectorControls>
  );
}

function BlockToolbarControls({ clientId, isEditing, setEditing, attributes, setAttributes }) {
  let showAlignment = true;
  const allBlocks = useSelect((select) => select('core/block-editor').getBlocks());
  allBlocks.forEach((block) => {
    if (block.name !== 'amnesty-core/hero') {
      return;
    }

    block.innerBlocks.forEach((inner) => {
      if (inner.name !== metadata.name || inner.clientId !== clientId) {
        return;
      }

      showAlignment = false;
    });
  });

  return (
    <BlockControls>
      {isEditing && (
        <Toolbar
          controls={[
            {
              icon: 'edit',
              title: __('Edit', 'default'),
              onClick: setEditing,
            },
          ]}
        />
      )}
      {showAlignment && (<BlockAlignmentToolbar
        value={attributes.alignment}
        onChange={(alignment) => setAttributes({ alignment })}
      />)}
    </BlockControls>
  );
}

export default function DonationBlockEdit({ attributes, className, clientId, setAttributes }) {
  const [selected, setSelected] = useState('donation');
  const [campaignsLabel, setCampaignsLabel] = useState('');
  const [productIds, setProductIds] = useState([]);
  const [editingDonation, setEditingDonation] = useState(
    attributes.showDonation && !attributes.donation.legnth,
  );
  const [editingSubscription, setEditingSubscription] = useState(
    attributes.showSubscription && !attributes.subscription.length,
  );
  const [activeVariation, setActiveVariation] = useState(0);
  const [currentVariations, setCurrentVariations] = useState({});

  const campaigns = useSelect(
    (select) => {
      const raw = select(coreStore).getSite()?.wooccm_additional;

      if (!Array.isArray(raw) || !raw.length) {
        return [];
      }

      const options = [];

      raw.forEach((field) => {
        if (field.name !== attributes.campaignsFieldLabel) {
          return;
        }

        setCampaignsLabel(field.label);

        field.options.forEach((option) => {
          const { label } = field.options[option];
          const value = label.replace(/[^a-zA-Z0-9-_]+/, '');

          options.push({ label, value });
        });
      });

      return options;
    },
    [attributes.campaignsFieldLabel],
  );

  useEffect(() => {
    if (!attributes.showDonation) {
      setSelected('subscription');
    }
  }, [attributes.showDonation]);

  useEffect(() => {
    setProductIds([...productIds, ...attributes.donation, ...attributes.subscription]);
  }, [attributes.donation, attributes.subscription]);

  const variations = useSelect(
    async (select) => {
      const results = [];

      productIds.forEach((id) => {
        const v = select(wooVariationsStore).getProductVariations({ product_id: id });
        if (Array.isArray(v)) {
          results.push(...v);
        }
      });

      return results;
    },
    [productIds],
  );

  useEffect(() => {
    const [selectedId] = attributes[selected];

    if (!Array.isArray(variations)) {
      return;
    }

    const productVariations = variations.filter((item) => item.product_id === selectedId);

    if (productVariations?.length) {
      setActiveVariation(productVariations[0]);
      setCurrentVariations(productVariations);
    }
  }, [attributes, selected, variations]);

  /**
   * Select products from the ProductsControl
   *
   * @param {string} type   the product type (donation, subscription)
   * @param {array}  values the product to select
   */
  const onSelectProduct = (type, values = []) => {
    const ids = values.map(({ id }) => id);
    if (!isEqual(attributes[type], ids)) {
      setAttributes({ [type]: ids });
    }
  };

  /**
   * Render either a selection screen or product preview for the Donation
   */
  const Donation = () => {
    if (selected !== 'donation') {
      return null;
    }

    if (editingDonation) {
      return (
        <Select
          onSave={() => setEditingDonation(false)}
          onSelect={(values) => onSelectProduct(selected, values)}
          selected={attributes[selected]}
        />
      );
    }

    return (
      <Preview
        activeVariation={activeVariation}
        setActiveVariation={setActiveVariation}
        currentVariations={currentVariations}
      />
    );
  };

  /**
   * Render either a selection screen or product preview for the Subscription
   */
  const Subscription = () => {
    if (selected !== 'subscription') {
      return null;
    }

    if (editingSubscription) {
      return (
        <Select
          onSave={() => setEditingSubscription(false)}
          onSelect={(values) => onSelectProduct(selected, values)}
          selected={attributes[selected]}
        />
      );
    }

    return (
      <Preview
        activeVariation={activeVariation}
        setActiveVariation={setActiveVariation}
        currentVariations={currentVariations}
      />
    );
  };

  const blockClasses = classnames(className, 'donation', {
    [`align${attributes.alignment}`]: !!attributes.alignment,
  });

  const displayLabel =
    (attributes.showDonation || attributes.showSubscription) && attributes.variationLabel;

  return (
    <>
      <BlockInspectorControls
        attributes={attributes}
        setAttributes={setAttributes}
        campaigns={campaigns}
        campaignsLabel={campaignsLabel}
        />
      <BlockToolbarControls
        attributes={attributes}
        clientId={clientId}
        setAttributs={setAttributes}
        isEditing={editingDonation || editingSubscription}
        setEditing={() => {
          setEditingDonation(true);
          setEditingSubscription(true);
        }}
      />
      <div {...useBlockProps(blockClasses)}>
        <Slot name="amnesty.donations.editor.afterStart" />
        <IntroductoryFields attributes={attributes} setAttributes={setAttributes} />
        <DonationTypes
          selected={selected}
          setSelected={setSelected}
          donationLabel={attributes.donationLabel}
          subscriptionLabel={attributes.subscriptionLabel}
          showDonation={attributes.showDonation}
          showSubscription={attributes.showSubscription}
        />
        <div className="donation-productSelect">
          {displayLabel && <span className="donation-label">{attributes.variationLabel}</span>}
          <Donation />
          <Subscription />
        </div>
        <Campaigns
          campaigns={campaigns}
          campaignsLabel={attributes.campaignsLabel}
          description={attributes.campaignDescription}
          setDescription={(campaignDescription) => setAttributes({ campaignDescription })}
        />
        <RichText
          tagName="p"
          className="btn btn--fill"
          allowedFormats={[]}
          format="string"
          placeholder={/* translators: [admin/front] */ __('Donate', 'aidonations')}
          value={attributes.buttonText}
          onChange={(buttonText) => setAttributes({ buttonText })}
        />
        <Slot name="amnesty.donations.editor.beforeEnd" />
      </div>
    </>
  );
}

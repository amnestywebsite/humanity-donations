/**
 * WordPress dependencies
 */
import { InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, SelectControl, Slot, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export function CampaignInspectorControls({ attributes, campaigns, setAttributes }) {
  const campaignOptions = [
    {
      /* translators: [admin] label for adding a campaigns selector to the donations block */
      label: __('Choose campaigns field.', 'aidonations'),
      value: '',
    },
    ...campaigns,
  ];

  return (
    <InspectorControls>
      <PanelBody
        title={
          /* translators: [admin] */
          __('Campaigns', 'aidonations')
        }
        initialOpen={false}
      >
        <ToggleControl
          label={
            /* translators: [admin] */
            __('Show campaign options (donation only)', 'aidonations')
          }
          checked={attributes.showCampaignOptions}
          onChange={(showCampaignOptions) => setAttributes({ showCampaignOptions })}
        />
        {attributes.showCampaignOptions && (
          <SelectControl
            label={/* translators: [admin] */ __('Campaign options field', 'aidonations')}
            help={
              /* translators: [admin] */
              __(
                'Set up your campaign select field in WooCommerce Checkout Manager.',
                'aidonations',
              )
            }
            value={attributes.campaignFieldName}
            onChange={(campaignFieldName) => setAttributes({ campaignFieldName })}
            options={campaignOptions}
          />
        )}
      </PanelBody>
    </InspectorControls>
  );
}

/**
 * Render campaigns field data from WooCommerce Checkout Manager
 */
export function Campaigns({ campaigns, campaignsLabel, description, setDescription }) {
  if (!campaigns.length) {
    return (
      <>
        <Slot name="amnesty.donations.editor.beforeCampaigns" />
        <Slot name="amnesty.donations.editor.afterCampaigns" />
      </>
    );
  }

  return (
    <>
      <Slot name="amnesty.donations.editor.beforeCampaigns" />
      <span className="donation-campaignLabel">{campaignsLabel}</span>
      <select>
        {campaigns.map((c) => (
          <option key={`option-${c.value}`}>{c.label}</option>
        ))}
      </select>
      <RichText
        tagName="div"
        className="donation-campaignText"
        allowedFormats={[]}
        format="string"
        placeholder={/* translators: [admin] */ __('Campaign Text', 'aidonations')}
        value={description}
        onChange={setDescription}
      />
      <Slot name="amnesty.donations.editor.afterCampaigns" />
    </>
  );
}

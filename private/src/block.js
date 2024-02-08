import './editor.scss';

import DisplayComponent from './block/DisplayComponent.jsx';

const { registerBlockStyle, registerBlockType } = wp.blocks;
const { __ } = wp.i18n;

registerBlockType('amnesty-wc/donation', {
  /* translators: [admin] */
  title: __('Donation', 'aidonations'),
  icon: 'cart',
  category: 'amnesty-wc',
  keywords: [
    /* translators: [admin] */
    __('Donation', 'aidonations'),
    /* translators: [admin/front] */
    __('Donate', 'aidonations'),
    /* translators: [admin] */
    __('Subscription', 'aidonations'),
    /* translators: [admin] */
    __('Subscribe', 'aidonations'),
  ],
  supports: {
    className: true,
    multiple: false,
  },

  attributes: {
    showDonation: {
      type: 'boolean',
      default: true,
    },
    showSubscription: {
      type: 'boolean',
      default: true,
    },
    showCampaignOptions: {
      type: 'boolean',
      default: true,
    },
    showImage: {
      type: 'boolean',
      default: false,
    },
    donation: {
      type: 'array',
      default: [],
    },
    subscription: {
      type: 'array',
      default: [],
    },
    donationLabel: {
      type: 'string',
      /* translators: [admin/front] */
      default: __('One-off', 'aidonations'),
    },
    subscriptionLabel: {
      type: 'string',
      /* translators: [admin/front] */
      default: __('Recurring', 'aidonations'),
    },
    title: {
      type: 'string',
      default: '',
    },
    titleTag: {
      type: 'number',
      default: 2,
    },
    description: {
      type: 'string',
      default: '',
    },
    image: {
      type: 'number',
      default: 0,
    },
    variationLabel: {
      type: 'string',
      default: '',
    },
    campaignFieldName: {
      type: 'string',
      default: '',
    },
    campaignDescription: {
      type: 'string',
      default: '',
    },
    buttonText: {
      type: 'string',
      /* translators: [admin/front] */
      default: __('Donate', 'aidonations'),
    },
    alignment: {
      type: 'string',
    },
  },

  edit: DisplayComponent,

  save: () => null,
});

registerBlockStyle('amnesty-wc/donation', {
  name: 'dark',
  /* translators: [admin] */
  label: __('Dark Background', 'aidonations'),
});

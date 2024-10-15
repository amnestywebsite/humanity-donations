/* eslint-disable class-methods-use-this */
/* eslint-disable no-restricted-syntax */

/**
 * External dependencies
 */
import classnames from 'classnames';
import makeComponentTrashable from 'trashable-react';

/**
 * Internal dependencies
 */
import ProductsControl from './components/products-control.jsx';
import HeadingToolbar from './components/heading-toolbar.jsx';
import PostMediaSelector from './components/PostMediaSelector.jsx';

const { assign, flatten, has, isEqual, keyBy, keys } = lodash;
const { apiFetch } = wp;
const { BlockAlignmentToolbar, BlockControls, InspectorControls, MediaUploadCheck, RichText } =
  wp.blockEditor;
const { Button, PanelBody, SelectControl, TextControl, ToggleControl, Toolbar } =
  wp.components;
const { Component, Fragment } = wp.element;
const { applyFilters } = wp.hooks;
const { __, sprintf } = wp.i18n;
const { addQueryArgs } = wp.url;

class DisplayComponent extends Component {
  /**
   * setup initial state
   *
   * @param {*} props the component props
   */
  constructor(props) {
    super(props);

    const { donation, showDonation, showSubscription, subscription } = props.attributes;

    let selected = 'donation';
    if (!showDonation) {
      selected = 'subscription';
    }

    this.state = {
      selected,
      products: {},
      variations: {},
      campaigns: [],
      campaignsLabel: '',
      editDonation: showDonation && !donation.length,
      editSubscription: showSubscription && !subscription.length,
      activeVariation: 0,
      currentVariations: {},
    };
  }

  /**
   * Fetch existing data into state on mount
   */
  componentDidMount() {
    const { attributes } = this.props;
    const { products } = this.state;
    const { campaignFieldName, donation, subscription } = attributes;
    const ids = [];

    if (campaignFieldName) {
      this.getCampaigns(campaignFieldName);
    }

    if (donation.length) {
      ids.push(donation[0]);
    }

    if (subscription.length) {
      ids.push(subscription[0]);
    }

    if (!ids.length || ids.length === ids.filter((id) => has(products, id)).length) {
      return;
    }

    this.fetchAll(ids);
  }

  /**
   * Update selected variations if the selected type changed
   *
   * @param {object} prevProps the previous props object
   * @param {object} prevState the previous state object
   */
  componentDidUpdate(prevProps, prevState) {
    if (prevState.selected !== this.state.selected) {
      this.selectVariations();
    }
  }

  /**
   * Perform API request for products & store in state
   *
   * @param {array} include the product ids to retrieve
   * @param {string} route the route to fetch data from
   *
   * @returns {Promise<any>} the object containing the products
   */
  createApiFetch = (include = [], route) => { // eslint-disable-line
    const { registerPromise } = this.props;

    if (!include.length) {
      return registerPromise(Promise.resolve());
    }

    const path = addQueryArgs(route, {
      include: include.join(','),
      context: 'view',
    });

    return registerPromise(apiFetch({ path }));
  };

  /**
   * Retrieve selected products and their variations
   *
   * @param {array} ids the product ids to fetch
   *
   * @returns {Promise<any>} the object containing the products
   */
  fetchProducts(ids = []) {
    if (isEqual(keys(this.state.products), ids)) {
      return Promise.resolve();
    }

    const include = ids.filter((id) => !has(this.state.products, id));

    if (!include.length) {
      return Promise.resolve();
    }

    return this.createApiFetch(include, '/wc/v3/products');
  }

  /**
   * Retrieve product variations
   *
   * @param {array} ids the product ids to retrieve
   *
   * @returns {Promise<any>} the object containing the products
   */
  fetchVariations = (products = []) => {
    const variations = [];

    products.forEach((product) => {
      if (!product.variations) {
        return;
      }

      const path = `/wc/v3/products/${product.id}/variations`;
      variations.push(this.createApiFetch(product.variations, path));
    });

    return Promise.all([products, ...variations]);
  };

  /**
   * Handle retrieval of all data
   *
   * @param {array} ids the product ids to fetch data for
   *
   * @returns {Promise<any>} the object containing the products
   */
  fetchAll = (ids = []) => {
    this.fetchProducts(ids)
      .then((products) => this.fetchVariations(products))
      .then(this.organiseData)
      .then(this.storeDataInState);
  };

  /**
   * Organise data retrieved from API
   *
   * @param {array} params the data returned from the previous promise
   *
   * @returns {object} the organised data
   */
  organiseData = ([rawProducts, ...rawVariations]) => {
    const allVariations = flatten(rawVariations);
    const products = assign({}, this.state.products, keyBy(rawProducts, 'id'));
    const variations = assign({}, this.state.variations, keyBy(allVariations, 'id'));

    return { products, variations };
  };

  /**
   * Store retrieved data in state
   *
   * @param {object} params the data returned from the previous promise
   */
  storeDataInState = ({ products: newProducts, variations: newVariations }) => {
    let { products, variations } = this.state;

    if (!isEqual(products, newProducts)) {
      products = newProducts;
    }

    if (!isEqual(variations, newVariations)) {
      variations = newVariations;
    }

    this.setState({ products, variations }, this.selectVariations);
  };

  /**
   * Retrieve campaign options from WooCommerce Checkout Manager (WooCCM)
   *
   * @param {string} fieldName the WooCCM field name
   */
  getCampaigns(fieldName = '') {
    const { setAttributes } = this.props;
    setAttributes({ campaignFieldName: fieldName });

    if (!fieldName) {
      return this.setState({ campaigns: [] });
    }

    if (!amnestyWC || !amnestyWC.wooccm) {
      return this.setState({ campaigns: [] });
    }

    const campaigns = [];

    amnestyWC.wooccm.forEach((field) => {
      if (field.name !== fieldName) {
        return;
      }

      if (field.label) {
        this.setState({ campaignsLabel: field.label });
      }

      Object.keys(field.options).forEach((key) => {
        const { label } = field.options[key];
        const value = label.replace(/[^a-zA-Z0-9-_]+/, '');

        campaigns.push({ label, value });
      });
    });

    if (!campaigns.length) {
      return this.setState({ campaigns: [] });
    }

    return this.setState({ campaigns });
  }

  /**
   * Select products from the ProductsControl
   *
   * @param {string} attrName the component attribute key name
   * @param {array} values the products to select
   */
  selectProducts(attrName, values = []) {
    const { attributes, setAttributes } = this.props;
    const ids = values.map(({ id }) => id);

    if (isEqual(keys(attributes[attrName]), ids)) {
      return;
    }

    setAttributes({ [attrName]: ids });
    this.fetchAll(ids);
  }

  /**
   * Set the active product type's variations
   * as current in state
   */
  selectVariations() {
    const { attributes } = this.props;
    const { products, selected, variations } = this.state;

    const value = attributes[selected];
    const product = products[value] || {};
    const currentVariations = [];

    if (!product.variations) {
      return;
    }

    Object.keys(variations).forEach((v) => {
      if (product.variations.indexOf(parseInt(v, 10)) === -1) {
        return;
      }

      const item = variations[v];

      item.meta_data.forEach((m) => {
        if (m.key === '_nyp') {
          item.nyp = m.value;
        }
      });

      currentVariations.push(item);
    });

    let { activeVariation } = this.state;
    if (currentVariations.length) {
      activeVariation = currentVariations[0].id;
    }

    this.setState({ currentVariations, activeVariation });
  }

  /**
   * Build the inspector controls
   *
   * @returns {string} the markup to render
   */
  inspectorControls() {
    const { attributes, setAttributes } = this.props;
    const options = amnestyWC.wooccm.map((f) => ({ value: f.name, label: f.label }));
    options.unshift({
      /* translators: [admin] label for adding a campaigns selector to the donations block */
      label: __('Choose campaigns field.', 'aidonations'),
      value: '',
    });

    return (
      <Fragment>
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
              <Fragment>
                <SelectControl
                  label={/* translators: [admin] */ __('Campaign options field', 'aidonations')}
                  help={
                    /* translators: [admin] */
                    __(
                      'Set up your campaign select field in WooCommerce Checkout Manager.',
                      'amnesty',
                    )
                  }
                  value={attributes.campaignFieldName}
                  onChange={(campaignFieldName) => this.getCampaigns(campaignFieldName)}
                  options={options}
                />
              </Fragment>
            )}
          </PanelBody>
        </InspectorControls>
      </Fragment>
    );
  }

  /**
   * Add block controls
   *
   * @returns {string} the markup to render
   */
  blockControls() {
    const { editDonation, editSubscription } = this.state;
    const { attributes, setAttributes } = this.props;

    const alignmentToolbar = (
      <BlockAlignmentToolbar
        value={attributes.alignment}
        onChange={(alignment) => setAttributes({ alignment })}
      />
    );

    if (editDonation && editSubscription) {
      return <BlockControls>{alignmentToolbar}</BlockControls>;
    }

    return (
      <BlockControls>
        <Toolbar
          controls={[
            {
              icon: 'edit',
              /* translators: [ignore] */
              title: __('Edit'),
              onClick: () => this.setState({ editDonation: true, editSubscription: true }),
            },
          ]}
        />
        {alignmentToolbar}
      </BlockControls>
    );
  }

  /**
   * Render the initial editable fields
   *
   * @returns {string} the markup to render
   */
  initialFields() {
    const { attributes, setAttributes } = this.props;

    return (
      <Fragment>
        <div className="donation-title">
          <RichText
            tagName={`h${attributes.titleTag}`}
            allowedFormats={[]}
            format="string"
            placeholder={/* translators: [admin] */ __('Title', 'aidonations')}
            value={attributes.title}
            onChange={(title) => setAttributes({ title })}
          />
        </div>
        <div className="donation-description">
          <RichText
            tagName="p"
            allowedFormats={[]}
            format="string"
            placeholder={/* translators: [admin] */ __('Description', 'aidonations')}
            value={attributes.description}
            onChange={(description) => setAttributes({ description })}
          />
        </div>
        {attributes.showImage && (
          <div className="donation-image">
            <MediaUploadCheck>
              <PostMediaSelector
                mediaId={attributes.image}
                onUpdate={(media) => setAttributes({ image: media.id })}
              />
            </MediaUploadCheck>
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * Add "navigation" - a toggle between product types
   *
   * @returns {string} the markup to render
   */
  navigation() {
    const { donationLabel, subscriptionLabel, showDonation, showSubscription } =
      this.props.attributes;
    const { selected } = this.state;
    const options = [];

    if (!showDonation || !showSubscription) {
      return null;
    }

    if (showDonation) {
      options.push({
        label: donationLabel,
        value: 'donation',
      });
    }

    if (showSubscription) {
      options.push({
        label: subscriptionLabel,
        value: 'subscription',
      });
    }

    const radioClasses = classnames('donation-selectType', {
      [`is-${selected}`]: !!options.length,
    });

    return (
      <fieldset>
        <legend className="screen-reader-text">
          {/* translators: [admin] */ __('Donation Type', 'aidonations')}
        </legend>
        <div className={radioClasses}>
          {options.map((option) => (
            <div key={option.label}>
              <input
                id={`${option.label.toLowerCase()}-option`}
                type="radio"
                value={option.value}
                checked={selected === option.value}
                onChange={() => null}
              />
              <label
                htmlFor={`${option.label.toLowerCase()}-option`}
                onClick={() => this.setState({ selected: option.value }) }
              >{option.label}</label>
            </div>
          ))}
        </div>
      </fieldset>
    );
  }

  /**
   * Render the product selector for an attribute type
   *
   * @param {string} attrName the attribute to update
   * @param {string} stateName the state prop to update
   *
   * @returns {string} the markup to render
   */
  renderSelect(attrName, stateName) {
    const { attributes } = this.props;

    return (
      <Fragment>
        <ProductsControl
          selected={attributes[attrName]}
          isSingle={true}
          onChange={(values) => this.selectProducts(attrName, values)}
        />
        <Button isDefault onClick={() => this.setState({ [stateName]: false })}>
          {/* translators: [ignore] */ __('Done', 'woocommerce')}
        </Button>
      </Fragment>
    );
  }

  /**
   * Render preview mode for a product
   *
   * @param {string} attrName the attribute to retrieve data from
   *
   * @returns {string} the markup to render
   */
  renderPreview() {
    const { activeVariation, currentVariations = [] } = this.state;
    const { priceFormat, symbol } = wcSettings.currency;

    if (!currentVariations.length) {
      return null;
    }

    const html = (v) =>
      /* translators: [admin/front] label for donation block when a custom donation amount can be specified */
      v.nyp === 'yes' ? __('Custom', 'aidonations') : sprintf(priceFormat, symbol, v.price);

    const tabs = currentVariations.map((v) => (
      <div
        id={v.id}
        key={`price-${v.id}`}
        className={activeVariation === v.id ? 'is-active' : ''}
        onClick={() => this.setState({ activeVariation: v.id })}
        dangerouslySetInnerHTML={{ __html: html(v) }}
      />
    ));

    const details = currentVariations.map((v) => (
      <div
        key={`desc-${v.id}`}
        aria-labelledby={v.id}
        dangerouslySetInnerHTML={{ __html: v.description }}
        style={{ zIndex: activeVariation === v.id ? 1 : 0 }}
      />
    ));

    return (
      <div className="donation-options">
        <div className="donation-tabs" data-qty={currentVariations.length}>
          {tabs}
        </div>
        <div className="donation-details">{details}</div>
      </div>
    );
  }

  /**
   * Render the campaign data if enabled
   *
   * @returns {string} the markup to render
   */
  campaigns() {
    const { attributes } = this.props;
    const { showCampaignOptions } = attributes;
    const { campaigns, campaignsLabel } = this.state;

    if (!showCampaignOptions || !campaigns.length) {
      return null;
    }

    return (
      <Fragment>
        {campaignsLabel && <span className="donation-campaignLabel">{campaignsLabel}</span>}
        <select>
          {campaigns.map((c) => (
            <option key={c.value}>{c.label}</option>
          ))}
        </select>
      </Fragment>
    );
  }

  /**
   * Handle render for the donation product
   *
   * @returns {string} the markup to render
   */
  donation() {
    const { showDonation } = this.props.attributes;
    const { editDonation } = this.state;

    if (!showDonation) {
      return null;
    }

    if (editDonation) {
      return this.renderSelect('donation', 'editDonation');
    }

    return this.renderPreview('donation');
  }

  /**
   * Handle render for the subscription product
   *
   * @returns {string} the markup to render
   */
  subscription() {
    const { showSubscription } = this.props.attributes;
    const { editSubscription } = this.state;

    if (!showSubscription) {
      return null;
    }

    if (editSubscription) {
      return this.renderSelect('subscription', 'editSubscription');
    }

    return this.renderPreview('subscription');
  }

  /**
   * Render the whole component
   *
   * @returns {string} the markup to render
   */
  render() {
    const { attributes, setAttributes } = this.props;
    const { showDonation, showSubscription, variationLabel } = attributes;
    const { selected } = this.state;
    const classes = classnames(this.props.className, 'donation', {
      [`align${attributes.alignment}`]: !!attributes.alignment,
    });

    const displayLabel = (showDonation || showSubscription) && variationLabel;

    return (
      <div className={classes}>
        {applyFilters('amnesty.donations.editor.afterStart', null, this)}
        {this.inspectorControls()}
        {this.blockControls()}
        {this.initialFields()}
        {applyFilters('amnesty.donations.editor.beforeNav', null, this)}
        {this.navigation()}
        {applyFilters('amnesty.donations.editor.afterNav', null, this)}
        <div className="donation-productSelect">
          {displayLabel && <span className="donation-label">{variationLabel}</span>}
          {selected === 'donation' && this.donation()}
          {selected === 'subscription' && this.subscription()}
        </div>
        {applyFilters('amnesty.donations.editor.beforeCampaigns', null, this)}
        {this.campaigns()}
        <RichText
          tagName="div"
          className="donation-campaignText"
          allowedFormats={[]}
          format="string"
          placeholder={/* translators: [admin] */ __('Campaign Text', 'aidonations')}
          value={attributes.campaignDescription}
          onChange={(campaignDescription) => setAttributes({ campaignDescription })}
        />
        {applyFilters('amnesty.donations.editor.afterCampaigns', null, this)}
        <RichText
          tagName="p"
          className="btn btn--fill"
          allowedFormats={[]}
          format="string"
          placeholder={/* translators: [admin/front] */ __('Donate', 'aidonations')}
          value={attributes.buttonText}
          onChange={(buttonText) => setAttributes({ buttonText })}
        />
        {applyFilters('amnesty.donations.editor.beforeEnd', null, this)}
      </div>
    );
  }
}

export default makeComponentTrashable(DisplayComponent);

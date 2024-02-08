# Humanity Donations
This plugin leverages WooCommerce to provide support for individual and recurring, fixed and variable price donations.  

## Minimum Requirements
This plugin requires:  
- WordPress 5.8+  
- PHP 8.2+ with the Intl extension  
- [Humanity Theme](https://github.com/amnestywebsite/humanity-donations) v1.0.0+  

## Required Plugins
- [WooCommerce](https://wordpress.org/plugins/woocommerce/)  
- [WooCommerce Checkout Manager](https://quadlayers.com/portfolio/woocommerce-checkout-manager/)  
- [WooCommerce Name Your Price](https://woocommerce.com/products/name-your-price/?quid=e43c9ef0c4c9521a6c2f6e5319a3ff63)  
- [WooCommerce Subscriptions](https://woocommerce.com/products/woocommerce-subscriptions/)  

## Companion Plugins
- [Salesforce Adapter](https://github.com/amnestywebsite/humanity-donations-salesforce-adapter)

## Usage
The quickest way to get started using the plugin is to download the zip of the [latest release](https://github.com/amnestywebsite/humanity-donations/releases/latest), and install it via upload directly within WP Admin -> Plugins.  

### One-off Donations
For fixed-price, one-off donations, create a *variable* product, and then follow the below process:
1. Create a custom attribute, and define the values (separated by a `|` pipe character) for each of the donation amounts you would like the user to be able to choose from. Ensure that you select the _used for variations_ option: ![](https://camo.githubusercontent.com/065d553ed91a40f7c2985455b2da3d6b808bab86e75fc5bbf538ad883e196be0/68747470733a2f2f642e70722f3851706655782b)
2. Create variations from the attribute, and specify the price for each option.
3. For each variation, ensure that it is a) enabled, and b) virtual. For a donation of a custom amount, select the _name your price_ field: ![](https://camo.githubusercontent.com/e1113cc39784412fef461d127a361899225ded441df6913e88eca788cc679066/68747470733a2f2f642e70722f6a643362374f2b)

You may create as many donation products as you like, and insert them into pages via use of the *donation Gutenberg block*.
Having multiple donation products means that you can create products for different campaigns or calls to action that you wish to accept donations for.

### Recurring Donations (Subscriptions)
Create a *variable subscription* product, and follow the same process for One-off Donations.

### Donations Gutenberg Block
The donation block supports adding either donations, subscriptions, or both.
If both a donation and a subscription are added to the block, it will show the user an option to toggle the form between one-off and recurring donations.

To add the option for a user to choose a specific target campaign/fund for their donation, you will need to create a checkout field using WooCommerce Checkout Manager. Visit WooCommerce Settings -> Checkout -> Additional to create your field; then:
1. create a *select* field type (this is very important), and give it an appropriate label
2. create as many options within this field as you wish - one for each desired campaign/fund that you'd like the user to be able to support ![](https://camo.githubusercontent.com/33b918da741d0aa4c1821b16e99f3943f51f41f0e772d05325a797643886a29c/68747470733a2f2f642e70722f306c7a5258332b)
3. this field, once saved, can then be used within a donation block - the block will retrieve its label and options automatically once you have told it which field to use. You can see an example here: ![](https://camo.githubusercontent.com/a3a7e87006cd5d5b758c06843c9e54ad8ee1fa647802b112c3d56beaeb3a0930/68747470733a2f2f642e70722f666e776439322b)

## Governance
See [GOVERNANCE.md](GOVERNANCE.md) for project governance information.  

## Changelog  
See [CHANGELOG.md](CHANGELOG.md) or [Releases page](https://github.com/amnestywebsite/humanity-donations/releases) for full changelogs.

## Contributing
For information on how to contribute to the project, or to get set up locally for development, please see the documentation in [CONTRIBUTING.md](CONTRIBUTING.md).  

### Special Thanks
We'd like to say a special thank you to these lovely folks:

| &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Cure53](https://cure53.de)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[WP Engine](https://wpengine.com)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
| --- | --- |
| ![Cure53](docs/static/cure_53_logo.svg) | ![WP Engine](docs/static/wpengine_logo.svg) |


### Want to know more about the work in other Amnesty GitHub accounts?

You can find repositories from other teams such as [Amnesty Web Ops](https://github.com/amnestywebsite), [Amnesty Crisis](https://github.com/amnesty-crisis-evidence-lab), [Amnesty Tech](https://github.com/AmnestyTech), and [Amnesty Research](https://github.com/amnestyresearch/) in their GitHub accounts

![AmnestyWebsiteFooter](https://wordpresstheme.amnesty.org/wp-content/uploads/2024/02/footer.gif)

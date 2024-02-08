const cache = {};

// find same-element siblings to a node
const siblings = (node) => {
  const fam = [];

  let child = node.parentElement.firstElementChild;

  while (child) {
    if (child.nodeName === node.nodeName && child !== node) {
      fam.push(child);
    }

    child = child.nextElementSibling;
  }

  return fam;
};

// manage name-your-price input events
const handleNYPEvents = (event, block) => {
  const { value } = event.target;
  block.querySelector('input[name="nyp"]').setAttribute('value', value);
};

// manage events for active tab
const handleTabsEvents = (event, tabs, block, index) => {
  const { target, which } = event;

  // it's not a tab
  if (target.id.indexOf('tab-') === -1) {
    return;
  }

  // not space or enter
  if (event.type === 'keyup' && [13, 32].indexOf(which) === -1) {
    return;
  }

  // toggle tab states
  target.classList.add('is-active');
  siblings(target).map((t) => t.classList.remove('is-active'));

  // find relevant tab descriptions
  const details = tabs.querySelector('.donation-details');
  // toggle visibility of relevant description
  Array.from(details.childNodes).map((d) => d.classList.remove('is-active'));
  const id = parseInt(target.id.replace('tab-', ''), 10);
  const desc = tabs.querySelector(`#desc-${id}`);
  desc.classList.add('is-active');

  // setup variation form data
  const { type } = tabs.dataset;
  const { variations } = cache[index][type];
  const variation = variations.filter((v) => v.pid === id)[0];

  block.querySelector('input[name="variation_id"]').setAttribute('value', variation.pid);
  block.querySelector('input[name="attribute_size"]').setAttribute('value', variation.size);
};

// toggle visibility of relevant product
const toggleElementVisibility = (type, block, index) => {
  const tabs = block.querySelector(`.donation-options[data-type="${type}"]`);
  const otherTabs = block.querySelector(`.donation-options:not([data-type="${type}"])`);

  // toggle tab states
  if (!tabs.classList.contains('is-active')) {
    tabs.classList.add('is-active');
  }

  const setupTabEvents = (evt) => handleTabsEvents(evt, tabs, block, index);
  const setupNYPEvents = (evt) => handleNYPEvents(evt, block);

  // ensure event listeners are cleaned up
  tabs.removeEventListener('click', setupTabEvents);
  tabs.removeEventListener('keyup', setupTabEvents);
  tabs.removeEventListener('input', setupNYPEvents);

  // set event listeners only for active tab group
  tabs.addEventListener('click', setupTabEvents);
  tabs.addEventListener('keyup', setupTabEvents);
  tabs.addEventListener('input', setupNYPEvents);

  if (otherTabs) {
    // trigger initial state
    tabs.querySelector('.is-active').dispatchEvent(
      new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      }),
    );

    otherTabs.classList.remove('is-active');
    otherTabs.removeEventListener('click', setupTabEvents);
    otherTabs.removeEventListener('keyup', setupTabEvents);
    otherTabs.removeEventListener('input', setupNYPEvents);
  }

  // setup product form data
  const productType = cache[index][type];
  block.setAttribute('action', productType.link);
  block.querySelector('input[name="product_id"]').setAttribute('value', productType.pid);
  block.querySelector('input[name="add-to-cart"]').setAttribute('value', productType.pid);
};

const handleTypeEvents = (event, block, index) => {
  const { target, type, which } = event;

  if (target.nodeName !== 'LABEL') {
    return;
  }

  // not space or enter
  if (type === 'keyup' && [13, 32].indexOf(which) === -1) {
    return;
  }

  // toggle label states
  if (!target.classList.contains('is-active')) {
    target.classList.add('is-active');
    siblings(target)[0].classList.remove('is-active');
  }

  toggleElementVisibility(event.target.getAttribute('for'), block, index);
};

// instantiate events
const initBlock = (block, index) => {
  const { info } = block.dataset;
  cache[index] = JSON.parse(info);

  const typeSelector = block.querySelector('.donation-selectType');

  if (!typeSelector) {
    const options = block.querySelector('.donation-options.is-active');

    if (!options) {
      return;
    }

    const { type } = options.dataset;

    if (!type) {
      return;
    }

    toggleElementVisibility(type, block, index);
    return;
  }

  typeSelector.addEventListener('click', (event) => handleTypeEvents(event, block, index));
  typeSelector.addEventListener('keyup', (event) => handleTypeEvents(event, block, index));

  // trigger initial state
  typeSelector.querySelector('label.is-active').dispatchEvent(
    new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    }),
  );
};

export default () => {
  const donationBlocks = Array.from(document.querySelectorAll('.wp-block-amnesty-wc-donation'));

  if (!donationBlocks.length) {
    return;
  }

  donationBlocks.map(initBlock);
};

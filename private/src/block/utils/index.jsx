/**
 * External dependencies
 */
const { flatten, forEach, groupBy, keyBy, uniqBy } = lodash;
const { apiFetch } = wp;
const { addQueryArgs } = wp.url;

const getProductsRequests = ({ selected = [], search = '', queryArgs = [] }) => {
  const defaultArgs = {
    per_page: -1,
    catalog_visibility: 'any',
    status: 'publish',
    search,
    orderby: 'title',
    order: 'asc',
  };
  const requests = [addQueryArgs('/wc/store/products', { ...defaultArgs, ...queryArgs })];

  // If we have a large catalog, we might not get all selected products in the first page.
  if (selected.length) {
    requests.push(
      addQueryArgs('/wc/store/products', {
        catalog_visibility: 'any',
        status: 'publish',
        include: selected,
      }),
    );
  }

  return requests;
};

/**
 * Get a promise that resolves to a list of products from the API.
 *
 * @param {Object} - A query object with the list of selected products and search term.
 */
// eslint-disable-next-line import/prefer-default-export
export const getProducts = ({ selected = [], search = '', queryArgs = [] }) => {
  const requests = getProductsRequests({ selected, search, queryArgs });

  return Promise.all(requests.map((path) => apiFetch({ path }))).then((data) =>
    uniqBy(flatten(data), 'id'),
  );
};

/**
 * Returns terms in a tree form.
 *
 * @param {Array} filteredList  Array of terms, possibly a subset of all terms, in flat format.
 * @param {Array} list  Array of the full list of terms, defaults to the filteredList.
 *
 * @return {Array} Array of terms in tree format.
 */
export function buildTermsTree(filteredList, list = filteredList) {
  const termsByParent = groupBy(filteredList, 'parent');
  const listById = keyBy(list, 'id');

  const getParentsName = (term = {}) => {
    if (!term.parent) {
      return term.name ? [term.name] : [];
    }

    const parentName = getParentsName(listById[term.parent]);
    return [...parentName, term.name];
  };

  const fillWithChildren = (terms) =>
    terms.map((term) => {
      const children = termsByParent[term.id];
      delete termsByParent[term.id];

      return {
        ...term,
        breadcrumbs: getParentsName(listById[term.parent]),
        children: children && children.length ? fillWithChildren(children) : [],
      };
    });

  const tree = fillWithChildren(termsByParent['0'] || []);
  delete termsByParent['0'];

  // anything left in termsByParent has no visible parent
  forEach(termsByParent, (terms) => {
    tree.push(...fillWithChildren(terms || []));
  });

  return tree;
}

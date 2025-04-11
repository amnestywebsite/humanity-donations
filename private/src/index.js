import './editor.scss';

import { registerBlockType } from '@wordpress/blocks';

import metadata from './block.json';
import DonationBlockEdit from './edit.jsx';

registerBlockType(metadata, {
  edit: DonationBlockEdit,
  save: () => null,
});

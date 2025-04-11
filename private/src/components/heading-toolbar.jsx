/**
 * WordPress dependencies
 */
import { range } from 'lodash';
import { Toolbar } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { HeadingLevelIcon } from './utils/icons.jsx';

/**
 * Render a heading level selection toolbar
 */
export default function HeadingToolbar({ minLevel, maxLevel, onChange, selectedLevel }) {
  return (
    <Toolbar
      controls={range(minLevel, maxLevel).map((index) => ({
        icon: <HeadingLevelIcon level={index} isPressed={index === selectedLevel} />,
        title: sprintf(/* translators: %d: the heading level */ __('Heading %d'), index),
        isActive: index === selectedLevel,
        onClick: () => onChange(index),
      }))}
    />
  );
}

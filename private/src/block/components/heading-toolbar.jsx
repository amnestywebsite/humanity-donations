/**
 * Internal dependencies
 */
import { HeadingLevelIcon } from '../utils/icons.jsx';

const { range } = lodash;
const { Toolbar } = wp.components;
const { Component } = wp.element;
const { __, sprintf } = wp.i18n;

export default class HeadingToolbar extends Component {
  // eslint-disable-next-line class-methods-use-this
  makeControl(targetLevel, selectedLevel, onChange) {
    const isActive = targetLevel === selectedLevel;

    return {
      icon: <HeadingLevelIcon level={targetLevel} isPressed={isActive} />,
      title: sprintf(/* translators: [ignore] */ __('Heading %d'), targetLevel),
      isActive,
      onClick: () => onChange(targetLevel),
    };
  }

  render() {
    const { minLevel, maxLevel, selectedLevel, onChange } = this.props;

    return (
      <Toolbar
        controls={range(minLevel, maxLevel).map((index) =>
          this.makeControl(index, selectedLevel, onChange),
        )}
      />
    );
  }
}

import React from 'react';
import classNames from 'classnames';

import BaseWidget from '../base';
import './styles.scss';

export default class SpacerWidget extends BaseWidget {
  constructor(props) {
    super(props);
  }

  render() {
    const classList = classNames(...this.classList, 'widget__transparent');

    return (
      <div className={classList} />
    );
  }
}

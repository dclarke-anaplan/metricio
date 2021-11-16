import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseWidget from '../base';

import './styles.scss';

export default class TextWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = { value: '---' };
  }

  render() {
    const classList = classNames(...this.classList, 'widget__text');

    const style = this.props.backgroundColor ? { backgroundColor: this.props.backgroundColor } : {};

    return (
      <div className={classList} style={style}>
        <h1 className="widget__title">{this.props.title}</h1>
        <h2 className="widget__value">{this.state.value}</h2>
        {this.props.showUpdatedAt && this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
      </div>
    );
  }
}

TextWidget.propTypes = {
  title: PropTypes.string.isRequired,
  backgroundColor: PropTypes.string,
  showUpdatedAt: PropTypes.bool
};

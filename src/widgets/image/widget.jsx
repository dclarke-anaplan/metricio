import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import BaseWidget from '../base';
import './styles.scss';

export default class ImageWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const classList = classNames(...this.classList, "widget-image");

    const defaultBackgroundSize='cover'
    const backgroundSize = this.props.backgroundSize === undefined ? defaultBackgroundSize : this.props.backgroundSize;

    const defaultBackgroundPosition='unset'
    const backgroundPosition = this.props.backgroundPosition === undefined ? defaultBackgroundPosition : this.props.backgroundPosition;

    const defaultBackgroundRepeat='unset'
    const backgroundRepeat = this.props.backgroundRepeat === undefined ? backgroundRepeat : this.props.backgroundRepeat;

    var backgroundImageStyle = {backgroundSize: backgroundSize,
      backgroundImage: `url(${this.props.backgroundImage})`,
      backgroundPosition: `${backgroundPosition}`,
      backgroundRepeat: `${backgroundRepeat}`
    };

    return (
      <div className={classList} style={backgroundImageStyle}>
    </div>
    );
  }
}

ImageWidget.propTypes = {
  backgroundSize: PropTypes.string,
  backgroundImage: PropTypes.string.isRequired,
  backgroundPosition: PropTypes.string,
  backgroundRepeat: PropTypes.string,
};

import React from 'react';
import PropTypes from 'prop-types';

import logger from '../../lib/logger';

export default class BaseWidget extends React.Component {
  constructor(props) {
    super(props);
    this.classList = ['widget-image', 'widget', `widget__${this.props.name}`];
    if (this.props.size) this.classList.push(`widget--${this.props.size}`);
  }

  componentWillMount() {
    this.props.socket.on(`widget:update:${this.props.name}`, data => {
      logger('info', `updating widget: ${this.props.name}`, data);
      this.setState(data);
    });
  }

  onClick() {
    return () => {
      if (this.state.link) window.open(this.state.link)
    };
  }

  getCursorStyle() {
    return this.state.link ? "pointer" : "auto";
  }

  getOpacity() {
    return this.state.isHovering && this.state.link ? 0.6 : 1;
  }

  startHover() {
    return () => this.setState({isHovering: true});
  }

  stopHover(){
    return () => this.setState({isHovering: false});
  }

}

BaseWidget.defaultProps = {
  size: 'small',
};

BaseWidget.propTypes = {
  size: PropTypes.string,
  name: PropTypes.string.isRequired,
  socket: PropTypes.shape.isRequired,
};

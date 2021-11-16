import React from 'react';
import BaseWidget from '../base';
import classNames from 'classnames';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';

import './styles.scss';

export default class ClockWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.intervalRef = undefined;
    this.format = props.format ? props.format : "HH:mm";
    this.state = {
      currentTime : moment().tz(props.timezone).format(this.format)
    }
  }

  componentDidMount() {
    this.intervalRef = setInterval(() => {
          this.setState({
              currentTime : moment().tz((this.props.timezone)).format(this.format)
          })
      }, 10 * 1000)
  }

  componentWillUnmount() {
      if(this.intervalRef) {
        clearInterval(this.intervalRef)
      }
  }

    getClassColourName(value) {


        if (this.props.softCoreStart && this.props.softCoreEnd && (value < this.props.softCoreStart || value > this.props.softCoreEnd)) {
            return "widget_outside_core_hours";
        }
        if (this.props.coreStart && this.props.coreEnd && (value < this.props.coreStart || value > this.props.coreEnd)) {
            return "widget_soft_core_hours";
        }
        return "widget_core_hours"
    }

    render() {
    const classList = classNames(
        ...this.classList,
        this.getClassColourName(this.state.currentTime)
      );

    return (
      <div className={classList}>
        <h1 className="widget__title">{this.props.title ? this.props.title : "Time" }</h1>
        <h2 className="clock">{ this.state.currentTime }</h2>
      </div>
    );
  }
}

ClockWidget.propTypes = {
  timezone: PropTypes.string.isRequired,
  title: PropTypes.string,
  format: PropTypes.string,
  coreStart: PropTypes.string,
  coreEnd: PropTypes.string,
  softCoreStart: PropTypes.string,
  softCoreEnd: PropTypes.string,
};


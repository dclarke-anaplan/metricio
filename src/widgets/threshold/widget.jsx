import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import numeral from 'numeral';

import NumberWidget from '../number/widget';
import './styles.scss';

export default class ThresholdWidget extends NumberWidget {
  constructor(props) {
    super(props);
  }


  getClassColourName(value) {
    if(this.props.higherBetter){
      if (this.props.errorLevel && value <= this.props.errorLevel) {
        return "widget__number_error";
      }

      if (this.props.warningLevel && value <= this.props.warningLevel) {
        return "widget__number_warning";
      }

    } else {
      if (this.props.errorLevel && value >= this.props.errorLevel) {
        return "widget__number_error";
      }

      if (this.props.warningLevel && value >= this.props.warningLevel) {
        return "widget__number_warning";
      }
    }
    return "widget__number_okay"

  }

  render() {
    const value = this.props.format
      ? numeral(this.state.value).format(this.props.format)
      : this.state.value;

    const classList = classNames(...this.classList, 'widget__number', this.getClassColourName(value));

    return (
      <div className={classList}
           onClick={super.onClick()}
           onMouseOver={super.startHover()}
           onMouseOut={super.stopHover()}
           style={{cursor: super.getCursorStyle(), opacity: super.getOpacity()}}>
        <h1 className="widget__title">{this.props.title}</h1>
        <h2 className="widget__value">
          {typeof this.state.value !== 'undefined' ? value : '---'}
          {this.props.metric && <small>{this.props.metric}</small>}
        </h2>
        {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
      </div>
    );
  }
}

ThresholdWidget.propTypes = {
  format: PropTypes.string,
  metric: PropTypes.string,
  title: PropTypes.string.isRequired,
  warningLevel: PropTypes.string,
  errorLevel: PropTypes.string.isRequired,
  higherBetter: PropTypes.string

};

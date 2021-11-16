import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseWidget from '../base';
import moment from 'moment-business-days';

import './styles.scss';

export default class TimeSinceWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      epochTime: 0,
      updatedAt: undefined,
      eventText: undefined,
      link: undefined
    };
  }

  parseTime(epochTime) {
    if(this.props.useBusinessDays) {
      // Report the business days difference if greater than 1, otherwise normal
      const businessDaysDifference = moment().businessDiff(moment(epochTime));
      if(businessDaysDifference != 0) {
        return moment().subtract(businessDaysDifference, 'days').from(moment(), true);
      }
    }
    return moment(epochTime).fromNow(this.props.withoutSuffix);
  }

  // Subtract the appropriate amount of time from the moment, potentially being business day aware
  subtract(moment, amount) {
    if(this.props.useBusinessDays) {
      return moment.businessSubtract(amount, this.props.units);
    } else {
      return moment.subtract(amount, this.props.units);
    }
  }

  getClassColourName(epochTime) {

    if(epochTime === 0) {
      return "timesince__value_age1"
    }

    const epochMoment = moment(epochTime);
    const currentMoment = moment();

    if (epochMoment.isBefore(this.subtract(currentMoment, this.props.finalThreshold))) {
      return "timesince__value_age4";
    }

    if (epochMoment.isBefore(this.subtract(currentMoment, this.props.secondThreshold))) {
      return "timesince__value_age3";
    }

    if (epochMoment.isBefore(this.subtract(currentMoment, this.props.firstThreshold))) {
      return "timesince__value_age2";
    }

    return "timesince__value_age1"

  }

  render() {
    let value = this.state.epochTime === 0 ? "---" : this.parseTime(this.state.epochTime)

    const classList = classNames(...this.classList, 'widget__text', this.getClassColourName(this.state.epochTime));

    return (
      <div className={classList}
           onClick={super.onClick()}
           onMouseOver={super.startHover()}
           onMouseOut={super.stopHover()}
           style={{cursor: super.getCursorStyle(), opacity: super.getOpacity()}}>
        <h1 className="widget__title">{this.props.title}</h1>
        <h2 className="timesince__value">{value}</h2>
        {this.state.eventText && <p className="timesince_eventText">{this.state.eventText}</p>}
        {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
      </div>
    );
  }
}

TimeSinceWidget.propTypes = {
  title: PropTypes.string.isRequired,
  units: PropTypes.oneOf(['minutes', 'hours', 'days', 'weeks', 'months', 'years']),
  firstThreshold: PropTypes.string,
  secondThreshold: PropTypes.string,
  finalThreshold: PropTypes.string,
  useBusinessDays: PropTypes.bool,
  withoutSuffix: PropTypes.bool,
};

TimeSinceWidget.defaultProps = {
  units: 'days',
  firstThreshold: '1',
  secondThreshold: '2',
  finalThreshold: '7',
  useBusinessDays: false,
  withoutSuffix: true,
};

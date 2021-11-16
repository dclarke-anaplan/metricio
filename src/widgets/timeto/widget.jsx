import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseWidget from '../base';
import moment from 'moment';

import './styles.scss';

export default class TimeToWidget extends BaseWidget {
    constructor(props) {
        super(props);
        this.state = {
            epochTime: 0,
            updatedAt: undefined,
        };
    }

    parseTime(epochTime) {
        return moment(epochTime).fromNow();
    }

    getClassColourName(epochTime) {

        if (epochTime === 0) {
            return "timeto__value_age1"
        }

        const epochMoment = moment(epochTime);
        if (epochMoment.isBefore(moment().add(this.props.finalThreshold, this.props.units))) {
            return "timeto__value_age4";
        }

        if (epochMoment.isBefore(moment().add(this.props.secondThreshold, this.props.units))) {
            return "timeto__value_age3";
        }

        if (epochMoment.isBefore(moment().add(this.props.firstThreshold, this.props.units))) {
            return "timeto__value_age2";
        }

        return "timeto__value_age1"

    }

    render() {
        let value = this.state.epochTime === 0 ? "---" : this.parseTime(this.state.epochTime)

        const classList = classNames(...this.classList, 'widget__text', this.getClassColourName(this.state.epochTime));

        return (
            <div className={classList}>
                <h1 className="widget__title">{this.props.title}</h1>
                <h2 className="timeto__value">{value}</h2>
                {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
            </div>
        );
    }
}

TimeToWidget.propTypes = {
    title: PropTypes.string.isRequired,
    units: PropTypes.oneOf(['minutes', 'hours', 'days', 'weeks', 'months', 'years']),
    firstThreshold: PropTypes.string,
    secondThreshold: PropTypes.string,
    finalThreshold: PropTypes.string,
};

TimeToWidget.defaultProps = {
    units: 'days',
    firstThreshold: '1',
    secondThreshold: '2',
    finalThreshold: '7',
};

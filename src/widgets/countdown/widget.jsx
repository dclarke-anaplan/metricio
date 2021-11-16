import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseWidget from '../base';
import moment from 'moment-timezone';

import './styles.scss';

export default class CountdownWidget extends BaseWidget {
    constructor(props) {
        super(props);
        this.intervalRef = undefined;
        moment.tz.setDefault(this.props.timezone);
        this.state = {
            epochTime: this.getCountdownValue(),
            updatedAt: undefined,
        };
    }

    parseTime(epochTime) {
        const beerhold = 'beerhold';
        return this.shouldShowCountdownText(epochTime) ? beerhold : moment(epochTime).fromNow();
    }

    componentDidMount() {
        this.intervalRef = setInterval(() => {
            this.setState({
                epochTime: this.getCountdownValue()
            })
        }, 10 * 1000)
    }

    componentWillUnmount() {
        if (this.intervalRef) {
            clearInterval(this.intervalRef)
        }
    }

    getCountdownValue() {
        let indexOfCountdownToDay = this.getIndexOfWeekday(this.props.countdownToDay),
            dayOfWeek = new Date().getDay(),
            //Figure out how many days there are till next day of the week to count down to
            numberOfDaysTillCountdownToDay = (indexOfCountdownToDay + 7 - dayOfWeek) % 7;

        let epochTime = moment(this.props.countdownToTime, 'h:mma');
        epochTime.add(numberOfDaysTillCountdownToDay, 'days');

        //If today is the day of the week to count down to and roundup time has passed, reset count down to 7 days.
        // let epochTimePlusDisplayDelay = epochTime.add(this.props.displayAfter, this.props.units);
        if (dayOfWeek == indexOfCountdownToDay && moment().tz(this.props.timezone).isAfter(epochTime)) {
            epochTime.add(7, 'days');
        }
        return epochTime;
    }

    getClassColourName(epochTime) {
        return this.shouldShowCountdownText(epochTime) ? "timeto__value_age4" : "timeto__value_age1";
    }

    shouldShowCountdownText(epochTime) {
        if (epochTime === 0) {
            return false;
        }

        const countdownStart = moment(this.props.countdownToTime, 'h:mma').subtract(this.props.displayBefore, this.props.units);
        const countdownEnd = moment(this.props.countdownToTime, 'h:mma').add(this.props.displayAfter, this.props.units);

        if ((this.getIndexOfWeekday(this.props.countdownToDay) == new Date().getDay()) && moment().isBetween(countdownStart, countdownEnd)) {
            return true;
        }
        return false;
    }

    getIndexOfWeekday(weekdayName) {
        const days = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6
        };
        return days[weekdayName.toLowerCase()];
    }


    render() {
        let value = this.state.epochTime === 0 ? "---" : this.parseTime(this.state.epochTime)
        const classList = classNames(...this.classList, 'widget__text', this.getClassColourName(this.state.epochTime));
        const beerClassName = this.shouldShowCountdownText(this.state.epochTime) ? "beer" : "";

        return (
            <div className={classList}>
                <h1 className="widget__title">{this.props.title}</h1>
                <div className={beerClassName}/>
                <h2 className="timeto__value">{value}</h2>
            </div>
        );
    }
}

CountdownWidget
    .propTypes = {
    title: PropTypes.string.isRequired,
    units: PropTypes.oneOf(['minutes', 'hours', 'days', 'weeks', 'months', 'years']),
    displayBefore: PropTypes.string,
    // the amount of time to continue displaying the special text after the targeted time.
    displayAfter: PropTypes.string,
    timezone: PropTypes.string,
    countdownToDay: PropTypes.string,
};

CountdownWidget
    .defaultProps = {
    units: 'minutes',
    displayBefore: '15',
    displayAfter: '15',
    timezone: 'Europe/London',
    countdownToTime: "4:15pm",
    countdownToDay: "Friday"
};
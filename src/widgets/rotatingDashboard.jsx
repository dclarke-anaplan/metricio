import React from 'react';
import PropTypes from 'prop-types';

export default class RotatingDashboards extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          currentDashboard: 0
        };
    }

    componentDidMount() {
        this._triggerRotateDashboardTimer();
    }

    _triggerRotateDashboardTimer() {
        if (this.props.rotationIntervalMillis > 0) {
            setInterval(() => {
                this.setState({currentDashboard: (this.state.currentDashboard + 1) % this.props.dashboards.length})
            }, this.props.rotationIntervalMillis)
        }
    }

    render() {
        const idx = this.state.currentDashboard;
        const dashboardPageInd = `${idx + 1}/${this.props.dashboards.length}`;

        const dashboards = this.props.dashboards.map((dashboard, index) => {
            return (
                <div style={index !== idx ? { display: 'none'} : {}}>
                { React.cloneElement( dashboard, { dashboardIndex: index }) }
                </div>
            );
        });
        return (
            <div>
                { this.props.dashboardTitles && <div className="dashboardTitle"><p>{this.props.dashboardTitles[idx]}</p></div> }
                <div className="dashboardPageInd">{dashboardPageInd}</div>
                <div>{dashboards}</div>
            </div>
        )
    }

}

RotatingDashboards.propTypes = {
    rotationIntervalMillis: PropTypes.number.isRequired,
    dashboards: PropTypes.array.isRequired,
    dashboardTitles: PropTypes.array
};

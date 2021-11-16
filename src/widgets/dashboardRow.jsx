import React from 'react';
import PropTypes from 'prop-types';

export default class DashboardRow extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        const direction = this.props.reverseLayout ? "rtl": 'ltr';
        return (
            <div className="dashboard-row" style={{ gridRowStart: this.props.row, direction }}>
                {this.props.rendererFunction(this.props.children)}
            </div>
        )
    }
}

DashboardRow.defaultProps = {
    reverseLayout: false
}

DashboardRow.propTypes = {
    row: PropTypes.string.isRequired,
    rendererFunction: PropTypes.func,
    reverseLayout: PropTypes.bool.isRequired
}
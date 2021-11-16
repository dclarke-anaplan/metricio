import React from 'react';
import PropTypes from 'prop-types';

export default class IFramer extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
          <div>
            <iframe src={this.props.url} width="100%" height="100%" />
          </div>
        )
    }
}

IFramer.propTypes = {
    url: PropTypes.string.isRequired,
}
import React from 'react';
import classNames from 'classnames';
import BaseWidget from '../base';

import './styles.scss';
import PropTypes from "prop-types";

export default class DeveloperExcuseWidget extends BaseWidget {
    constructor(props) {
        super(props);
        this.state = {
            value: null,
            updatedAt: undefined,
        }
    }

    render() {
        const classList = classNames(...this.classList);
        return (
            <div className={classList}>
                <h2 className="excuse">{this.state.value}</h2>
            </div>
        );
    }
}

DeveloperExcuseWidget.propTypes = {
    title: PropTypes.string.isRequired
}
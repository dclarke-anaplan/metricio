import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseWidget from '../base';

import './styles.scss';

export default class GkeNodePools extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = { value: [] };
  }

  render() {
    const classList = classNames(...this.classList, 'widget__text', 'widget__background');

    return (
      <div className={classList}>
        <h1 className="widget__title">{this.props.title}</h1>
        <div className="nodepools_list_wrapper">
          {this.state.value.map(nodePool => {
            return (
              <div className="nodepool_list_item">
                <p className="nodepool_list_item_title">{nodePool.name}</p>
                <p className="nodepool_list_item_body">machine type: <strong style={{ fontSize: "0.8rem" }}>{nodePool.config.machineType}</strong></p>
              </div>
            )
          })}
        </div>
      </div>
    );
  }
}

GkeNodePools.propTypes = {
  title: PropTypes.string.isRequired,
};

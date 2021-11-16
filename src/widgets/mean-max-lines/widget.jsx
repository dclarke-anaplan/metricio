import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { VictoryArea } from 'victory';
import { VictoryChart } from 'victory';
import { VictoryLegend } from 'victory';
import { VictoryAxis } from 'victory';

import BaseWidget from '../base';
import './styles.scss';

export default class MeanMaxLinesWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      value: {},
      updatedAt: undefined,
    };
  }


  render() {
      console.log(">>>>>>>>> this.state:", this.state);
    const value = this.state.value;
    const max = value.maxValue;
    // console.log(`******************************* state is ${this.state.value} *******************************`)
    const mean = value.meanValue;

    const classList = classNames(...this.classList, 'widget__background');

    let title = this.props.title;

    return (
        <div className={classList}>
          <div className="widget__main_grid">
            <h1 className="widget__title">{title}</h1>
            <div className="device_widget__body_values">
              <VictoryChart>
                  <VictoryAxis crossAxis
                               style={{axis: {stroke: "white"}, tickLabels: { stroke: "white"}}}/>
                  <VictoryAxis dependentAxis crossAxis
                      style={{axis: {stroke: "white"}, tickLabels: { stroke: "white"}}}
                  />
                  <VictoryLegend x={150} y={-40}
                                 title="Legend"
                                 centerTitle
                                 orientation="horizontal"
                                 gutter={20}
                                 style={{ border: { stroke: "white" }, title: {fontSize: 20, fill: "white" }, color: "white" }}
                                 data={[
                                     { name: "Mean", symbol: { fill: "#8E2E7C" }, labels: {fill: "white"} },
                                     { name: "Max", symbol: { fill: "#41398A" }, labels: {fill: "white"} }
                                 ]}
                  />
                <VictoryArea
                    style={{
                      data: { fill: "#41398A" },
                      parent: { border: "1px solid #ccc"}
                    }}
                    data={ max }
                />
                <VictoryArea
                    style={{
                      data: { fill: "#8E2E7C" },
                      parent: { border: "2px solid #111"}
                    }}
                    data={ mean }
                />
              </VictoryChart>

            </div>
          </div>
          {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
        </div>
    );
  }
}

MeanMaxLinesWidget.propTypes = {
  title: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  backgroundImage: PropTypes.string
};


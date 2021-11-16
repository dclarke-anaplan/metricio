import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import numeral from 'numeral';
import { VictoryChart, VictoryLine, VictoryAxis } from 'victory';

import BaseWidget from '../base';
import './styles.scss';

export default class LineChartWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      updatedAt: undefined,
    };
    this.lineChartRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateDimensions.bind(this));
    this.updateDimensions();
  }

  componentDidUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  updateDimensions(event) {
    const width = this.lineChartRef.current.clientWidth;
    const height = this.lineChartRef.current.clientHeight;
    this.setState({
        chartWidth: width,
        chartHeight: height
    });
  }

  render() {
    const latestValue = this.state.value ? this.state.value.slice(-1).pop() : 0;
    const classList = classNames(...this.classList, 'widget__linechart');

    return (
        <div className={classList}>
          <h1 className="widget__title">{this.props.title}</h1>
          <div className="widget__mainbody">
            <div className="linechart" ref={this.lineChartRef}>
              {typeof this.state.value !== 'undefined' && (
                <VictoryChart 
                  domainPadding={{ y: 15 }}
                  padding={{ left: 40, right: 10, top: 5, bottom: 0 }}
                  width={this.state.chartWidth}
                  height={this.state.chartHeight}
                >
                  <VictoryLine
                    style={{ data: { stroke: "white" } }}
                    data={this.state.value}
                  />
                  <VictoryAxis dependentAxis
                    style={{
                      axis: {
                        stroke: 'white'
                      },
                      tickLabels: {
                        fill: 'white',
                        // fontSize: 30 
                      }, 
                    }}
                    tickFormat={this.props.tickFormat ? t => this.props.tickFormat(t) : t => t}
                  />
                </VictoryChart>
              )}
            </div>  
            <div className="widget__value">
                <span>
                  {this.props.mainNumberFormat ? numeral(latestValue).format(this.props.mainNumberFormat) : latestValue}
                  {this.props.metric && <small>{this.props.metric}</small>}
                </span>
            </div> 
          </div>
          {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
        </div>
    );
  }
}

LineChartWidget.propTypes = {
  mainNumberFormat: PropTypes.string,
  tickFormat: PropTypes.func,
  metric: PropTypes.string,
  title: PropTypes.string.isRequired,
};


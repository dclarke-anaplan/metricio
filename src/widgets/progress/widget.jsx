import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { VictoryPie, VictoryAnimation, VictoryLabel } from 'victory';

import BaseWidget from '../base';
import './styles.scss';

export default class ProgressWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      progress: undefined,
      max: undefined,
      updatedAt: undefined,
      link: undefined
    };
    this.MAX_DEFAULT = 100;
  }

  parseProgress(current) {
    const maxValue = (this.state.max && typeof this.state.max == 'number') ? this.state.max : this.MAX_DEFAULT;
    return [{ x: 1, y: current }, { x: 2, y: maxValue - current, fill: '#b57b9b' }];
  }

  render() {
    const classList = classNames(...this.classList, 'widget__progress');
    const progress = this.parseProgress(this.state.progress);

    return (
      <div className={classList}
           onClick={super.onClick()}
           onMouseOver={super.startHover()}
           onMouseOut={super.stopHover()}
           style={{cursor: super.getCursorStyle(), opacity: super.getOpacity()}}>
        <h1 className="widget__title">{this.props.title}</h1>
        {this.state.progress === undefined && <h2 className="widget__value">---</h2>}
        {this.state.progress !== undefined && (
          <svg className="progress" viewBox="0 0 400 400" width="100%" height="100%">
            <VictoryPie
              standalone={false}
              animate={{ duration: 1000 }}
              data={progress}
              innerRadius={110}
              labels={() => null}
            />
            <VictoryAnimation duration={1000} data={this.state}>
              {newProps => (
                <VictoryLabel
                  className="progress__text"
                  textAnchor="middle"
                  verticalAnchor="middle"
                  x={200}
                  y={200}
                  text={Math.round(newProps.progress)}
                  style={{
                    fill: '#fff',
                    fontSize: 125,
                    fontWeight: 700,
                    fontFamily: 'Saira',
                  }}
                />
              )}
            </VictoryAnimation>
          </svg>
        )}
        {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
      </div>
    );
  }
}

ProgressWidget.propTypes = {
  title: PropTypes.string.isRequired,
};

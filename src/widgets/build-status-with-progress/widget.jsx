import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import BaseWidget from '../base';
import './styles.scss';

const isFailure = outcome => outcome && (outcome.toLowerCase() === "failure" || outcome.toLowerCase() === "error" || outcome.toLowerCase() === "unstable");

export default class BuildStatusWithProgress extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      outcome: undefined,
      link: undefined,
      progress:  undefined,
      updatedAt: undefined,
      branch: undefined,
      shouldShake: false,
    };
    this.intervalId = undefined;
  }

  startShake() {
    this.intervalId = setInterval(() => {
      this.setState({ shouldShake: true });
      setTimeout(() => this.setState({ shouldShake: false }), this.props.shakePeriodMs);
    }, this.props.shakeIntervalMs);
  }

  stopShake() {
    this.intervalId && clearInterval(this.intervalId);
    this.setState({ shouldShake: false });
  }

  componentWillMount() {
    super.componentWillMount();
    if (this.props.shakeOnFailure && isFailure(this.state.outcome)) {
      this.startShake();
    } else {
      this.stopShake();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.shakeOnFailure) {
      if (isFailure(this.state.outcome) && !isFailure(prevState.outcome)) {
        // new failure state
        this.intervalId && clearInterval(this.intervalId); // clear any intervals that might still be lying around
        this.startShake();
      } else if (!isFailure(this.state.outcome) && isFailure(prevState.outcome)) {
        this.stopShake();
      }
    }
  }

  render() {
    let classList = classNames(
      ...this.classList,
      'widget__buildStatusWithProgress',
      `widget--${this.state.outcome}`,
    );

    if (this.state.shouldShake) {
      classList += `shake shake-constant shake-${this.props.shakeType}`;
    }

    const titleClassNames = `widget__title${this.props.title.length > 20 ? ' widget__longtitle' : ''}`;

    const boundedProgress = Math.max(Math.min(Math.round(this.state.progress) || 0, 95), 5);
    const gradient = this.state.outcome !== 'pending'
        ? ''
        : `linear-gradient(to right, #12b0c5, #12b0c5 ${boundedProgress}%, #90c1c7 ${boundedProgress}%, #90c1c7)`;


    return (
        <div className={classList}
           onClick={super.onClick()}
           onMouseOver={super.startHover()}
           onMouseOut={super.stopHover()}
           style={{
          height: '100%',
          widtht: '100%',
          background: gradient,
          animation: '3s linear 1s 1',
          cursor: super.getCursorStyle(),
          opacity: super.getOpacity()
        }}>
          <h1 className={titleClassNames}>{this.props.title}</h1>
          { this.state.branch && <h3 className="widget__subtitle"><b>({this.state.branch}</b> branch)</h3> }
          <h2 className="widget__value">{this.state.outcome ? this.state.outcome : '---'}</h2>
          {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
        </div>
    );
  }
}

BuildStatusWithProgress.defaultProps = {
  shakeOnFailure: false,
  shakeIntervalMs: 30000, // every 30 seconds start shaking
  shakePeriodMs: 5000, // shake for 5 seconds
  shakeType: 'vertical' // shake up and down
};

BuildStatusWithProgress.propTypes = {
  title: PropTypes.string.isRequired,
  shakeOnFailure: PropTypes.bool,
  shakeIntervalMs: PropTypes.number,
  shakePeriodMs: PropTypes.number,
  shakeType: PropTypes.oneOf(['hard', 'slow', 'little', 'horizontal', 'vertical', 'rotate', 'opacity', 'crazy', 'chunk']) // see https://elrumordelaluz.github.io/csshake/ for demonstrations
};

import React from 'react';
import PropTypes from 'prop-types';

import BaseWidget from '../base';
import './styles.scss';

const isFailure = outcome => outcome && (outcome.toLowerCase() === "failure" || outcome.toLowerCase() === "error" || outcome.toLowerCase() === "unstable");

class BuildLine extends BaseWidget {

  constructor(props) {
    super(props);
    this.state = { shouldShake: false, link: this.props.link };
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
    if (this.props.shakeOnFailure && isFailure(this.props.outcome)) {
      this.startShake();
    } else {
      this.stopShake();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.shakeOnFailure) {
      if (isFailure(nextProps.outcome) && !isFailure(this.props.outcome)) {
        // new failure state
        this.intervalId && clearInterval(this.intervalId); // clear any intervals that might still be lying around
        this.startShake();
      } else if (!isFailure(nextProps.outcome) && isFailure(this.props.outcome)) {
        this.stopShake();
      }
    }
  }

  componentWillUnmount() {
    this.intervalId && clearInterval(this.intervalId);
  }

  render() {
    const outcome = this.props.outcome === undefined ? "default" : this.props.outcome.toLowerCase();

    let classList = `build-line build-line--${outcome}`;

    if (this.state.shouldShake) {
      classList += ` shake shake-constant shake-${this.props.shakeType}`;
    }

    return (
      <div className={classList}
           onClick={super.onClick()}
           onMouseOver={super.startHover()}
           onMouseOut={super.stopHover()}
           style={{fontSize: this.props.lineFontSize + 'rem',
             cursor: super.getCursorStyle(),
             opacity: super.getOpacity()}}>
        <span>{this.props.jobName}</span>
      </div>
    );
  }

}


export default class MultiBuildStatus extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      buildStatuses: [],
      updatedAt: undefined,
    };
  }

  render() {
    const classList = "widget-image widget--" +this.props.size +" multi-build-status";

    const defaultFontSize = 1.5;
    const titleFontSize = this.props.titleFontSize === undefined ? defaultFontSize : this.props.titleFontSize;
    const lineFontSize = this.props.lineFontSize === undefined ? defaultFontSize : this.props.lineFontSize;

    return (
      <div className={classList}>
        { this.props.title ? <div className={"multi-build-title"} style={{fontSize: titleFontSize + 'rem'}}>{this.props.title}</div> : null }
        { this.state.buildStatuses.length === 0 ?
          <div className="multi-build-list empty-list">
            <div className="empty-list-placeholder">Multi-build status widget pending data...</div>
          </div>
          :
          <div className="multi-build-list">
            {
              this.state.buildStatuses.map(buildStatus => (
                <BuildLine
                  key={buildStatus.jobName}
                  jobName={buildStatus.jobName}
                  outcome={buildStatus.outcome}
                  link={buildStatus.link}
                  shakeOnFailure={this.props.shakeOnFailure}
                  shakeIntervalMs={this.props.shakeIntervalMs}
                  shakePeriodMs={this.props.shakePeriodMs}
                  shakeType={this.props.shakeType}
                  lineFontSize={lineFontSize}
                />
              ))
            }
          </div>
        }
        {this.state.updatedAt && <div className="updated-at">{this.state.updatedAt}</div>}
      </div>
    );
  }
}

MultiBuildStatus.defaultProps = {
  shakeOnFailure: false,
  shakeIntervalMs: 30000, // every 30 seconds start shaking
  shakePeriodMs: 5000, // shake for 5 seconds
  shakeType: 'horizontal' // shake left and right (avoids covering the build status lines above and below)
}

MultiBuildStatus.propTypes = {
  buildStatuses: PropTypes.array,
  title: PropTypes.string,
  titleFontSize: PropTypes.number,
  lineFontSize: PropTypes.number,
  shakeOnFailure: PropTypes.bool,
  shakeIntervalMs: PropTypes.number,
  shakePeriodMs: PropTypes.number,
  shakeType: PropTypes.oneOf(['hard', 'slow', 'little', 'horizontal', 'vertical', 'rotate', 'opacity', 'crazy', 'chunk']) // see https://elrumordelaluz.github.io/csshake/ for demonstrations
};

import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-business-days';

import BaseWidget from '../base';
import './styles.scss';

const secretAge = date => {
  if(date){
    return Math.abs(moment(new Date()).diff(moment(date), 'days'));
  } else return undefined;
}

const status = (secretStatus, thresholdDays) => {
  if (secretStatus.outcome.toLowerCase() === 'failure') {
    return 'failure'
  } else if(!secretStatus.lastRotated){
    return 'unknown-age'
  } else if (thresholdDays < 0 || secretAge(lastRotated) < thresholdDays) {
    return secretStatus.outcome.toLowerCase();
  } else {
    return 'warning'
  }
}

class SecretLine extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    let classList = `secret-line secret-line--${status(this.props, this.props.thresholdDays)}`;

    return (
      this.props.lastRotated ?
      <div className={classList}>
        <div style={{ fontSize: this.props.titleFontSize + 'rem' }}>
            <span>{this.props.secretName} : {secretAge(this.props.lastRotated)} days</span>
        </div>
        <div style={{ fontSize: this.props.lineFontSize + 'rem' }}>
          <span>{this.props.lastRotated}</span>
        </div>
      </div>
      :
      <div className={classList}>
        <div style={{ fontSize: this.props.titleFontSize + 'rem' }}>
            <span>{this.props.secretName}</span>
        </div>
        <div style={{ fontSize: this.props.lineFontSize + 'rem' }}>
          <span>age unknown</span>
        </div>
      </div>
    );
  }
}

export default class MultiSecretStatus extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      secretStatuses: [],
      updatedAt: undefined,
    };
  }

  render() {
    if (this.props.summary) {
      const classList = "widget widget__hawking widget--" + this.props.size + " multi-secret-status widget--" + this.status();
      return (
        <div className={classList}>
          {this.props.title ? <div className={"multi-secret-title"} style={{ fontSize: this.props.titleFontSize + 'rem' }}>{this.props.title}</div> : null}
          <div style={{ fontSize: this.props.lineFontSize + 'rem' }}>
            <span>{this.state.secretStatuses.length} secrets </span>
          </div>
          {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
        </div>)
    } else {
      const classList = "widget-image widget--" + this.props.size + " multi-secret-status";
      return (
        <div className={classList}>
          {this.props.title ? <div className={"multi-secret-title"} style={{ fontSize: this.props.titleFontSize + 'rem' }}>{this.props.title}</div> : null}
          {this.state.secretStatuses.length === 0 ?
            <div className="multi-secret-list empty-list">
              <div className="empty-list-placeholder">Multi-secret status widget pending data...</div>
            </div>
            :
            <div className="multi-secret-list">
              {
                this.state.secretStatuses.map(secretStatus => (
                  <SecretLine
                    key={secretStatus.secretName}
                    secretName={secretStatus.secretName}
                    lastRotated={secretStatus.lastRotated}
                    outcome={secretStatus.outcome}
                    titleFontSize={this.props.titleFontSize}
                    lineFontSize={this.props.lineFontSize}
                    thresholdDays={this.props.thresholdDays}
                  />
                ))
              }
            </div>}
          {this.state.updatedAt && <div className="updated-at">{this.state.updatedAt}</div>}
        </div>
      );
    }
  }

  hasFailureOutcome(statuses) {
    const foundFailed = statuses.some(element => {
      return status(element, this.props.thresholdDays) === 'failure'
    });
    return foundFailed;
  }
  
  hasOldSecrets(statuses){
    if(this.props.thresholdDays < 0){
      //no threshold set so secrets can't be 'old'
      return false;
    }
    const foundOld = statuses.some(element => {
      return status(element, this.props.thresholdDays) === 'warning'
    });
    return foundOld;
  }
  
  hasUnknownAgeSecrets(statuses) {
    const foundUnknown = statuses.some(element => {
      return status(element, this.props.thresholdDays) === 'unknown-age'
    });
    return foundUnknown;
  }

  worstOf(statuses) {
    if(this.hasFailureOutcome(statuses)){
      return 'failure'
    } else if(this.hasOldSecrets(statuses)){
      return 'warning'
    } else if(this.hasUnknownAgeSecrets(statuses)){
        return 'unknown-age'
    } else {
      return 'success';
    }
  }

  status(){
    return this.worstOf(this.state.secretStatuses);
  }
}

MultiSecretStatus.defaultProps = {
  titleFontSize: 1.5,
  lineFontSize: 0.75,
  thresholdDays: 29,
  summary: false,
}

MultiSecretStatus.propTypes = {
  secretStatuses: PropTypes.array,
  title: PropTypes.string,
  titleFontSize: PropTypes.number,
  lineFontSize: PropTypes.number,
  thresholdDays: PropTypes.number,
  summary: PropTypes.bool,
}

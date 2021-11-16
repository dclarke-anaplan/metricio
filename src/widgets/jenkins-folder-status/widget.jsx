import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import BaseWidget from '../base';
import './styles.scss';


export default class JenkinsFolderStatus extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      jobs: undefined,
      updatedAt: undefined,
    };
  }

  render() {
    console.log('rendering jenkins folder status', this.state.jobs);
    const classList = classNames(
      ...this.classList,
      'widget__buildStatus'
    );

    if (this.state.jobs === undefined) {
      return (<div className={classList}>
        <h1 className="widget__title">---</h1>
        <h2 className="widget__value">---</h2>
      </div>);
    } else {
      return (        
        <div className={classList}>
          {this.state.jobs.map(job => {
            return (
              <div className={`widget--${job.outcome} buildstatus-widget`}>
                <h1 className="widget__title">{job.name}</h1>
                <h2 className="widget__value">{job.outcome ? job.outcome : '---'}</h2>
                {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
              </div>
            );
          })}
        </div>
      );
    }
  }
}

JenkinsFolderStatus.propTypes = {
  title: PropTypes.string.isRequired,
};

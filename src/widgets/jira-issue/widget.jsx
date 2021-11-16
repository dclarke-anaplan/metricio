import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import NumberWidget from '../number/widget';
import './styles.scss';

export default class JiraIssueWidget extends NumberWidget {
  constructor(props) {
    super(props);
  }


  getClassColourName(issue) {
    if(issue){
      if (this.props.ageErrorLevel && issue.age >= this.props.ageErrorLevel) {
        return "widget__number_error";
      }
      if (this.props.ageWarningLevel && issue.age >= this.props.ageWarningLevel) {
        return "widget__number_warning";
      }
    }
    return "widget__number_okay"

  }

  render() {

    const classList = classNames(...this.classList, 'widget__number', this.getClassColourName(this.state.value));

    return (
      <div className={classList}
           onClick={super.onClick()}
           onMouseOver={super.startHover()}
           onMouseOut={super.stopHover()}
           style={{cursor: super.getCursorStyle(), opacity: super.getOpacity()}}>
        <h1 className="widget__title">{typeof this.state.value !== 'undefined' && this.state.value != null ? this.state.value.key : '---'}</h1>
        {this.state.value && <h2 className="widget__age">{this.state.value.age ? this.state.value.age + " days" : "---"}</h2>}
        {this.state.value && <p className="widget__name">{this.state.value.name}</p>}
        {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
      </div>
    );
  }
}

JiraIssueWidget.propTypes = {
  ageWarningLevel: PropTypes.string,
  ageErrorLevel: PropTypes.string
};

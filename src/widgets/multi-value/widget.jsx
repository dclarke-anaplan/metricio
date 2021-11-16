import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import BaseWidget from '../base';
import './styles.scss';

export default class MultiValueWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      updatedAt: undefined,
      link: undefined
    };
  }

  render() {
    const value = this.state.value;

    const classList = classNames(...this.classList, 'widget__background');

    const defaultFontSize = 2.5;
    const fontSize = this.props.fontSize === undefined ? defaultFontSize : this.props.fontSize;

    const items = [];
    // var renderedValue = "";
    if ( this.state.value === undefined ) {
      // renderedValue = '---'
      items.push(<div>---</div>)
    } else {
      for (const [entryKey, entryValue] of Object.entries(value)) {
        items.push(<div>{entryKey + "=" + entryValue}</div>)
        // renderedValue += entryKey + "=" + entryValue + "\n"
      }
    }

    return (
      <div className={classList}
           onClick={super.onClick()}
           onMouseOver={super.startHover()}
           onMouseOut={super.stopHover()}
           style={{cursor: super.getCursorStyle(), opacity: super.getOpacity()}}>
        <h1 className="widget__title">{this.props.title}</h1>
        <h2 className="widget__multivalue_value" style={{ fontSize: fontSize + 'rem' }}>
          {items}
        </h2>
        {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
      </div>
    );
  }
}

MultiValueWidget.propTypes = {
  title: PropTypes.string.isRequired,
  fontSize: PropTypes.string
};

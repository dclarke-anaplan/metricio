import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import '../styles/default.scss';

import Dashboard from '../widgets/dashboard';
import ClockWidget from '../widgets/clock/widget';
import TextWidget from '../widgets/text/widget';

class StaticTextWidget extends React.Component {

  render() {
    return (
      <div className="widget widget--large">
        <h1 className="widget__title" style={{ fontSize: "2.5rem"}}>{this.props.title}</h1>
        <p style={{ textAlign: "center",fontSize: "1.75rem", fontWeight: 200, color: "#fff"}}>{this.props.text}</p>
      </div>
    );
  }
}

StaticTextWidget.propTypes = {
  title: PropTypes.string.isRequired,
};

ReactDOM.render(
  <Dashboard>
      <StaticTextWidget title="Index Dashboard" size="medium" text="Try and make a dashboard?" />
      <ClockWidget name="Clock" title="London" timezone="Europe/London"/>
  </Dashboard>,
  document.getElementById('content'),
);

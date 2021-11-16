import React from 'react';
import moment from 'moment';

import jol from "../assets/jol.png";
import spider from "../assets/spider.png";
import bat from "../assets/bat.png";

class Cobwebs extends React.Component {
    render() {
        return (
            <div>
              <div className="cobweb-dashboard-background left-top-corner"/>
              <div className="cobweb-dashboard-background right-top-corner"/>
              <div className="cobweb-dashboard-background left-bottom-corner"/>
              <div className="cobweb-dashboard-background right-bottom-corner"/>
            </div>
        );
    }
}

class HalloweenFall extends React.Component {
  render() {
    return (
      <div className="snowflakes" aria-hidden="true">
        <img src={jol} height="40px" width="40px" className="snowflake"/>
        <img src={bat} height="40px" width="40px" className="snowflake"/>
        <img src={spider} height="40px" width="40px" className="snowflake"/>
        <img src={jol} height="40px" width="40px" className="snowflake"/>
        <img src={spider} height="40px" width="40px" className="snowflake"/>
        <img src={bat} height="40px" width="40px" className="snowflake"/>
        <img src={bat} height="40px" width="40px" className="snowflake"/>
        <img src={jol} height="40px" width="40px" className="snowflake"/>
        <img src={spider} height="40px" width="40px" className="snowflake"/>
        <img src={jol} height="40px" width="40px" className="snowflake"/>
        <img src={spider} height="40px" width="40px" className="snowflake"/>
      </div>
    );
  }
}

class SnowFall extends React.Component {
    render() {
        return (
            <div className="snowflakes" aria-hidden="true">
                <div className="snowflake">
                ❅
                </div>
                <div className="snowflake">
                ❆
                </div>
                <div className="snowflake">
                ❅
                </div>
                <div className="snowflake">
                ❆
                </div>
                <div className="snowflake">
                ❅
                </div>
                <div className="snowflake">
                ❆
                </div>
                <div className="snowflake">
                  ❅
                </div>
                <div className="snowflake">
                  ❆
                </div>
                <div className="snowflake">
                  ❅
                </div>
                <div className="snowflake">
                  ❆
                </div>
                <div className="snowflake">
                  ❅
                </div>
                <div className="snowflake">
                  ❆
                </div>
            </div>
        );
    }
}

const isHalloween = () => {
    const now = moment();
    return now.month() === 9 // is October?
        && (now.date() === 30 || now.date() === 31);
}

const isXmasMonth = () => {
    return moment().month() === 11;
}

const isGuyFawkes = () => {
    const now = moment();
    return now.month() === 10 // November
        && now.date() === 5; // 5th
}

const isAmericaDay = () => {
  const now = moment();
  return now.month() === 6 // July
      && now.date() === 5; // 4th
}

export default class Themed extends React.Component {

    constructor(props) {
      super(props);
      this.state = { theme: undefined }
      this.intervalId = undefined;
    }

    checkTheme() {
      if (isHalloween() || isXmasMonth() || isGuyFawkes() || isAmericaDay()) {
        // reloading the page is cleaner than re-rendering as the widgets lose their local state 
        // and don't get updates until the next job run
        window.location.reload();
      }
    }

    componentWillMount() {
      this.intervalId = setInterval(() => this.checkTheme(), 3600000 * 6); // check every 6 hours?
    }

    componentWillUnmount() {
      clearInterval(this.intervalId);
    }

    render() {
      if (isHalloween()) {
        require("../styles/holiday-themes/halloween.scss");
        return (
          <div>
            <div className="halloweenBackground"/>
            <Cobwebs/>
            <HalloweenFall/>
            { this.props.children }
          </div>
        );
      }
      else if (isXmasMonth()) {
        require("../styles/holiday-themes/xmas.scss");
        return (
          <div>
            <div className="xmasBackground"/>
            <SnowFall/>
            { this.props.children }
          </div>
        );
      }
      else if (isGuyFawkes() || isAmericaDay()) {
        require("../styles/holiday-themes/fireworks.scss");
        return (
          <div>
              <div class="onTopAndLeft">
                <div class="pyro">
                  <div class="before"></div>
                  <div class="after"></div>
                </div>
              </div>        
              { this.props.children }
          </div>
        )
      }
      else {
        // boo no theme
        return this.props.children;
      }
    }
  }

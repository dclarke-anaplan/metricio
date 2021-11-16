import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { VictoryPie } from 'victory';

import BaseWidget from '../base';
import './styles.scss';

class LocationBasedConnectionInfo extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      updatedAt: undefined,
    };
  }

  render() {
    const values = this.state.value && this.state.value.filter(({ location }) => location === this.props.location) ;

    const classList = classNames(...this.classList, 'widget__background');

    const dashboardSet = new Set([]);
    const rightColumnItems = [];

    if (values === undefined || values.length === 0) {
      rightColumnItems.push(<div>---</div>);
    } else {
      values.forEach(({ dashboard }, index) => {
        if (!dashboardSet.has(dashboard)) {
          rightColumnItems.push(<div key={index}>{dashboard}</div>);
          dashboardSet.add(dashboard);
        }
      });
    }

    const bodyHeader = `Dashboards Viewed: ${dashboardSet.size}`;

    let style = {};
    if (this.props.backgroundImage) {
      style = {
        backgroundImage: `url(${this.props.backgroundImage})`,
      };
    }

    return (
      <div className={classList}>
        <div className='location_widget_background_image' style={style}/>
        <h1 className="widget__title" style={{ zIndex: '2' }}>{this.props.title}</h1>
        <div className="location_widget__body">
          <div className="location_widget_body_header"><b>{bodyHeader}</b></div>
          <div className="location_widget_body_values">
            {rightColumnItems}  
          </div>
        </div>
        {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
      </div>
    );
  }
}

LocationBasedConnectionInfo.propTypes = {
  title: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  backgroundImage: PropTypes.string
};


class ClientConnectionDeviceInfo extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = {
      value: undefined,
      updatedAt: undefined,
    };
  }

  render() {
    const value = this.state.value;

    const classList = classNames(...this.classList, 'widget__background');

    const deviceBreakdownPieData = [];
    
    let title = this.props.title;
    if (value === undefined) {
      title += ": 0";
    } else {
      const deviceBreakdown = {};
      value.forEach(({ device, dashboard },index) => {
        deviceBreakdown[device] = deviceBreakdown[device] ? deviceBreakdown[device] + 1 : 1;
      });

      Object.keys(deviceBreakdown).forEach(device => {
        const count = deviceBreakdown[device];
        deviceBreakdownPieData.push({ y: count, label: `${device} (${count})` });
      })

      title += `: ${value.length}`;
    }

    return (
      <div className={classList}>
        <div className="widget__main_grid">
          <h1 className="widget__title">{title}</h1>
          <div className="device_widget__body_values">
            <VictoryPie
              data={deviceBreakdownPieData}
              colorScale={[ "#00796B", "#006064", "#3881f5", "#2ac5de", "#4f3ee6" ]}
              style={{ labels: { fontSize: '25', fill: 'white' } }}
              sortKey="y"
              sortOrder="descending"
              labelRadius={() => 100}
            />
          </div>
        </div>
        {this.state.updatedAt && <p className="widget__updatedAt">{this.state.updatedAt}</p>}
      </div>
    );
  }
}

ClientConnectionDeviceInfo.propTypes = {
  title: PropTypes.string.isRequired,
};

export {
  ClientConnectionDeviceInfo,
  LocationBasedConnectionInfo
};
import React from 'react';
import PropTypes from 'prop-types';
import socketIOClient from 'socket.io-client';
import Themed from './themes';
import DashboardRow from './dashboardRow';

class ConnectionStatusBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { fadeOut: false };
  }

  render() {
    if (this.props.connected === false) {
      return (
        <div className="connectionStatusBar connectionStatusBarDisconnected">
          <span>Disconnected from backend - widgets will not receive updates!</span>
        </div>
      );
    } else {
      let classNames = 'connectionStatusBar connectionStatusBarConnected connectionStatusBarFadeOut';
      return (
        <div className={classNames}>
          {
            this.props.willReload ? 
              <div>
                <span>Connection established to backend - dashboard will refresh to get new updates</span>   
                <span className="blinkText">...</span>
              </div>
              :
              <span>Connection established to backend</span>   
          }
        </div>        
      );
    }
  }
}

class ErrorWrapped extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.log("Error occurred rendering widget of type " + this.props.childWidgetType + " with name '" + this.props.childName + "':\n", error);
    console.log("Error info:", errorInfo);
  }

  render() {
    if (this.state.error) {
      const classNames = `widget--${this.props.childSize} error-widget`;
      return (
        <div className={classNames}>
          <div>Error occured in {this.props.childWidgetType} ({this.props.childName}):</div>
          <p style={{ fontSize: '0.7rem', paddingTop: "10px" }}>Error message: {this.state.error.message}</p>
          <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.7rem' }}>{this.state.errorInfo.componentStack.trim()}</p>    
        </div>
      );
    } else {
      return this.props.children;
    }

  }

}

export default class Dashboard extends React.Component {

  constructor(props) {
    super(props);
    // firstConnect exists to ensure we don't refresh the page on the first connection 
    this.state = { connected: false, firstConnect: true, willReload: false, error: null, errorInfo: null };

    const dashboardIndex = props.dashboardIndex || 0;

    this.socket = socketIOClient(`http://${window.location.host}/${dashboardIndex}`, { autoConnect: false });

    this.socket.on("connect", () => { 
      if (this.state.firstConnect === false) {
        this.setState({ willReload: true });
        setTimeout(() => window.location.reload(), 5000);
      }

      this.setState({ connected: true , firstConnect: false});
    });
    this.socket.on('disconnect', () => this.setState({ connected: false }));
  }

  componentWillMount() {
    const childrenArray = React.Children.toArray(this.props.children);
    let widgetNames = [];
    if (childrenArray[0].type === DashboardRow) {
      childrenArray.forEach(dashboardRow => {
        React.Children.toArray(dashboardRow.props.children).forEach(child => widgetNames.push(child.props.name));
      });
    } else {
      widgetNames = childrenArray.map(child => child.props.name);
    }

    if (this.socket.disconnected) {
      this.socket.open();
    }
    // sends the widget names to the server so that the server only sends relevant messages
    this.socket.emit("dashboard-client-init", widgetNames);
  }

  componentWillUnmount() {
    this.socket.close();
  }

  renderChildren() {
    const firstChildType = Array.isArray(this.props.children) ? this.props.children[0].type : this.props.children.type;
    if (firstChildType === DashboardRow) {
      return React.Children.map(this.props.children, child => React.cloneElement(child, { rendererFunction: this.connectWidgetsToSocketConnection.bind(this) }));
    } else {
      return this.connectWidgetsToSocketConnection(this.props.children);
    }
  }

  connectWidgetsToSocketConnection(childrenWidgetComponents) {
    return React.Children.map(childrenWidgetComponents, child => (
        <ErrorWrapped childName={child.props.name} childSize={child.props.size} childWidgetType={child.type.name}>
          {React.cloneElement(child, { socket: this.socket })}
        </ErrorWrapped>
    ));
  }

  // this lifecycle method will be called if an error occurred whilst rendering
  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.log("Error occurred: ", error);
    console.log("Error info: ", errorInfo);
  }

  getCustomisationComponent() {
    return 
  }

  render() {
    if (this.state.error) {
      return (
        <Themed>
          <div style={{ position: "absolute" }}>
            <div>An error occurred rendering the dashboard!</div>
            <p>Error message: {this.state.error.message}</p>
            <p style={{ whiteSpace: 'pre-wrap' }}>{this.state.errorInfo.componentStack}</p>    
          </div>
        </Themed>
      );
    } else {
      if (this.props.enableTeamName) {
        return (
          <Themed>
            <div>
              <div className="centerText">
                {window.location.pathname.substr(1,window.location.pathname.length).toUpperCase()}
                <div className={this.props.dashboardClassName}>{this.renderChildren()}</div>
              </div>
              <ConnectionStatusBar 
                connected={this.state.connected} 
                willReload={this.state.willReload}/>
            </div>
          </Themed>
        );
      } else {
        return (
          <Themed>
            <div>
                <div className={this.props.dashboardClassName}>{this.renderChildren()}</div>
                <ConnectionStatusBar 
                  connected={this.state.connected} 
                  willReload={this.state.willReload}/>
            </div>
          </Themed>
        )
      }
    }
  }
}

Dashboard.defaultProps = {
  enableTeamName: false,
  children: [],
  dashboardClassName: "dashboard"
}

Dashboard.propTypes = {
  enableTeamName: PropTypes.bool,
  children: PropTypes.node,
  dashboardClassName: PropTypes.string,
  dashboardIndex: PropTypes.number
};
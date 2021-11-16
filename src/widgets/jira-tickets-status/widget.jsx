import React from 'react';

import './styles.scss';
import BaseWidget from '../base';
import classNames from 'classnames';

export default class JiraTicketsStatusWidget extends BaseWidget {
  constructor(props) {
    super(props);
    this.state = { entries: [] };
  }

  render() {
    const classList = classNames(...this.classList, 'widget-jira-tickets-status');

    return (
      <div className={classList}>
        {this.state.entries.length === 0 ? 'No long-running tickets found' : ''}
        <JiraTicketsListWidget entries={this.state.entries} />
      </div>
    );
  }
}

const JiraTicketsListWidget = (tickets) => (
  tickets.entries.map((ticket) => (
    <div className="ticket" key={ticket.key}>
      <div className="title">
        <a
          rel="noopener noreferrer"
          target="_blank"
          href={`https://$jirasite.atlassian.net/browse/${ticket.key}`}
          title={ticket.summary}
        >{ticket.key}
        </a>
      </div>
      <div
        className={`currentStatus ${ticket.transitionSummary.status.toLowerCase().replace(/\s+/, '_')}`}
        title={ticket.transitionSummary ? ticket.transitionSummary.time : ''}
      >
        {ticket.transitionSummary === undefined ? '' : `${ticket.transitionSummary.status}`}
        {ticket.transitionSummary !== undefined && ticket.transitionSummary.time !== 0 ? ` (${ticket.transitionSummary.timeInDays} days)` : ''}
      </div>
    </div>
  ))
);

JiraTicketsStatusWidget.propTypes = {};

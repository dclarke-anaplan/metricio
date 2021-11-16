import request from 'request-promise-native';
import {getSecret, secretNames} from '../../../secrets';

const buildJiraRequest = (path) => {
  const secret = getSecret(secretNames.ATLASSIAN);
  return {
    uri: 'https://$jira-project.atlassian.net/rest/' + path,
    headers: {
      'User-Agent': 'Metricio - Jira',
      Authorization: `Basic ${Buffer.from(`${secret.username}:${secret.token}`).toString('base64')}`,
    },
    json: true,
  };
}

const runJql = async (jql, expand) => {
    const options = buildJiraRequest('api/2/search');
    options.qs = {
      jql: jql,
      expand: expand,
    };
    const result = await request(options);
    result.html_url = 'https://$jira-project.atlassian.net/issues/?jql=' + encodeURIComponent(jql);
    return result;
};

// This will get the most recent time the issue went into the specified status. If it has gone into it several times, others will be ignored.
const getTimeIssueWentToStatus = (issue, status) => {
    var histories = issue.changelog.histories
    histories.sort(function (a, b) {
      return new Date(a.created) - new Date(b.created);
    }).reverse();

    var history;
    for (history of histories){
      var item;
      for(item of history.items){
            if(item.field == 'status' && item.toString == status) {
                return new Date(history.created);
            }
      }
    }
    return undefined;
}

const countOfDoneIssues = (count, issue) => {
  if (issue.fields.status.name == 'Done' || issue.fields.status.name == "Won't do") {
    return count+1;
  } else {
    return count;
  }
}

const getEpicProgress = async (epicId) => {
  const epicIssuesRequest = buildJiraRequest(`agile/1.0/epic/${epicId}/issue?fields=status`)
  let response = await request(epicIssuesRequest);
  let totalIssues = Object.keys(response.issues).length;
  let doneIssues = response.issues.reduce( countOfDoneIssues, 0 );
  return doneIssues / totalIssues * 100;
}

const getUrlForJiraKey = (key) => {
    return "https://$jira-project.atlassian.net/browse/" + key;
};

module.exports = { runJql, getTimeIssueWentToStatus, buildJiraRequest, getEpicProgress, getUrlForJiraKey };

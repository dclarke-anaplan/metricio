import request from 'request-promise-native';
import { buildJiraRequest } from './jira';

const getLatestActiveSprintInBoard = async (boardId) => {
    const sprints = await getSprintsForBoard(boardId, 'active');
    if (sprints.length === 0) {
        return undefined;
    }
    return sprints[sprints.length - 1];
};

// State is optional
const getSprintsForBoard = async (boardId, stateFilter) => {
  const sprintsRequest = buildJiraRequest(`agile/1.0/board/${boardId}/sprint`);
  sprintsRequest.qs = {
    state: stateFilter,
  };
  const sprintsResponse = await request(sprintsRequest);
  return sprintsResponse.values;
}

// Get sprints with issues in, and attach metrics. For now, just `pointsInSprint`.
const getSprintsWithMetricsForBoard = async (boardId) => {
  const sprints = await getSprintsForBoard(boardId);
  var results = [];
  for(var index = 0 ; index < sprints.length ; index++) {
    const sprint = sprints[index];
    const issuesRequest = buildJiraRequest(`agile/1.0/board/${boardId}/sprint/${sprint.id}/issue`);
    const issuesResponse = await request(issuesRequest);
    if(issuesResponse.issues.length === 0) {
      continue;
    }
    const pointsInSprint = issuesResponse.issues.reduce((accumulator, issue) => {
      const storyPoints = issue.fields['customfield_10004']
      if(storyPoints === undefined) {
        return accumulator;
      } else {
        return accumulator + storyPoints;
      }
    }, 0);
    const sprintSummary = {
      id: sprint.id,
      name: sprint.name,
      pointsInSprint: pointsInSprint,
    };
    results.push(sprintSummary);
  };
  return results;
};

module.exports = { getLatestActiveSprintInBoard, getSprintsWithMetricsForBoard, getSprintsForBoard };

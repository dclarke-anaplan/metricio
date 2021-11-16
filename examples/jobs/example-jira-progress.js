import { businessDaysBetween } from './libs/datetime';
import {runJql, getTimeIssueWentToStatus, getEpicProgress, getUrlForJiraKey} from './libs/jira';

const mapWithInProgressTime = issue => {
  var result = new Object();
  result.key = issue.key;
  result.name = issue.fields.summary;
  result.timeIntoInProgress = getTimeIssueWentToStatus(issue, "In Progress")
  return result;
}

const oldestInProgress = (prev, current) => {
  return (prev.timeIntoInProgress < current.timeIntoInProgress) ? prev : current
};

export const interval = '*/1 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  const notBlockedJql = ' AND (Flagged IS null OR Flagged != Impediment)';
  const notGoalOrRetroJql = ' AND ("Epic Link" is null OR "Epic Link" NOT IN (PROJECT1-100,PROJECT1-107))';
  const notAnEpic = ' AND type!=Epic';
  const readyJql = ' AND status=Ready';
  const inProgressJql = ' AND status="In Progress"';

  const allTeamIssuesJql = '((issuesFromEpicsInQuery = Team_Epics AND (labels IS EMPTY OR labels NOT IN (OtherTeamBoard))) OR (labels is not EMPTY AND labels IN (TeamBoard)))' + notAnEpic + notGoalOrRetroJql;
  const readyIssues = await runJql(allTeamIssuesJql + readyJql + notBlockedJql);
  const inProgressIssues = await runJql(allTeamIssuesJql + inProgressJql + ' AND (labels is EMPTY OR labels NOT IN (BackgroundTasks))', 'changelog');

  const goalIssues = await runJql('"Epic Link"=PROJECT1-150 AND status="In Progress" ORDER BY Rank');
  const retroIssues = await runJql('"Epic Link"=PROJECT1-200 AND status NOT IN ("Done", "Won\'t Do")');


  var oldestInProgressIssue;
  if(inProgressIssues.issues && inProgressIssues.issues.length > 0) {
    oldestInProgressIssue = inProgressIssues.issues.map(mapWithInProgressTime).reduce(oldestInProgress);
    oldestInProgressIssue.age = businessDaysBetween(oldestInProgressIssue.timeIntoInProgress, new Date());
  }

  const goalSummaries = goalIssues.issues.map(issue => issue.fields.summary);

  const epicProgress100 = await getEpicProgress('PROJECT1-100'); // Some particualr epic you want status of

  return [
    {
      target: 'JiraReadyCount',
      data: {
        value: readyIssues.total,
        link: readyIssues.html_url
      },
    },
    {
      target: 'JiraInProgressCount',
      data: {
        value: inProgressIssues.total,
        link: inProgressIssues.html_url
      },
    },
    {
      target: 'JiraoldestInProgressIssue',
      data: {
        value: oldestInProgressIssue,
        link: oldestInProgressIssue ? getUrlForJiraKey(oldestInProgressIssue.key) : "#"
      },
    },
    {
      target: 'JiraRetroCount',
      data: {
        value: retroIssues.total,
        link: retroIssues.html_url
      },
    },
    {
      target: 'JiraGoal',
      data: {
        value: goalSummaries,
        link: goalIssues.html_url
      },
    },
    {
      target: 'epic-100',
      data: {
        progress: epicProgress100,
        link: getUrlForJiraKey('PROJECT1-100')
      },
    },
  ];
};

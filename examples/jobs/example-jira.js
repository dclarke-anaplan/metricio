import { runJql } from '../../src/jobs/libs/jira';
import { getLatestActiveSprintInBoard } from '../../src/jobs/libs/scrum-jira';
import config from '../../config';

export const interval = '*/1 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  const inProgressJiras = await runJql(config.team.jiraInProgressQuery);
  const latestSprint = await getLatestActiveSprintInBoard(config.team.jiraBoardId);

  return [
    {
      target: 'JiraInProgressCount', // Name of widget in dashboard to update
      data: {
        value: inProgressJiras.total, // Value to be passed to React component state
        link: inProgressJiras.html_url
      },
    },
    {
      target: 'JiraSprintGoal', // Name of widget in dashboard to update
      data: {
        value: latestSprint ? (latestSprint.name + ": " + latestSprint.goal) : "No current sprint", // Value to be passed to React component state
      },
    },
  ];
};

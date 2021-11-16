
export default {
  session: {
    secret: '',
  },

  team: {
    confluenceCalendarId: '8888999999999',
    githubPRQuery: 'is:open is:pr -label:"work in progress"',
    jiraInProgressQuery: 'project in (PROJECT1, PROJECT2) and status in ("In Review", "In Progress", "In Progress/Code Review", "Testing In Progress") and type != Epic',
    jiraBoardId: 100,
  },

  awsSecretStore: {
    region: 'some-aws-region',
    prefix: 'some-aws-project',
  },

};

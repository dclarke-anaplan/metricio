import request from 'request-promise-native';

const username = '';//jenkins username
const password = '';//access token (not password)

const options = {
  uri: 'http://$jenkins-server/job/$build-job-name/lastBuild/api/json',
  headers: {
    'User-Agent': 'Metricio - Jenkins',
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
  },
  json: true,
};

export const interval = '*/1 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  const response = await request(options);

  return [
    {
      target: 'JenkinsAPIQueryBuilder', // Name of widget in dashboard to update
      data: {
        outcome: response.result, // Value to be passed to React component state
      },
    },
  ];
};

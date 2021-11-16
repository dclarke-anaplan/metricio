import { getLastBuildStatus } from '../../src/jobs/libs/jenkinsj5s';

export const interval = '*/1 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  const buildStatus = await getLastBuildStatus('folder', 'build-job', 'branch');

  return [
    {
      target: 'j5s-status',
      data: {
        outcome: buildStatus.status,
        link: buildStatus.link,
      },
    },
  ];
};

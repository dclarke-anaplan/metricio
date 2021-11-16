import request from 'request-promise-native';

// Helper method to fetch a status for a folder of builds
function getBuildJobs(folder) {
  const username = '';
  const password = '';
  const endpoint = 'http://$jenkins-host/job';
  const options = {
    uri: `${endpoint}/${folder}/api/json`,
    headers: {
      'User-Agent': 'Metricio - Jenkins',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    },
    json: true,
  };
  return request(options);
}


function getBuildStatus(jobUrl) {
  const username = '';
  const password = '';
  const options = {
    uri: `${jobUrl}lastBuild/api/json`,
    headers: {
      'User-Agent': 'Metricio - Jenkins',
      Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
    },
    json: true,
  };
  return request(options).catch(e => console.error(`Failed Request for ${options.uri} e=${e}`));
}

export const interval = '*/1 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  const folderName = 'TempTest';
  const folderJobs = await getBuildJobs(folderName);
  const jobUrls = [];
  folderJobs.jobs.forEach(element => {
    jobUrls.push({ url: element.url, name: element.name });
  });

  const jobResponses = [];
  const jobPromise = [];
  jobUrls.forEach(({ url, name }) => {
    try {
      console.log(`NOW REQUESTING ${url}`);
      jobPromise.push(getBuildStatus(url).then(response => jobResponses.push({ response, name })));
    } catch (e) {
      console.error(`OTHER CATCH BLOCK request for ${url} e=${e}`);
    }
  });

  console.log('Waiting for all promises');
  await Promise.all(jobPromise);


  const dataArray = [];

  jobResponses.forEach(({ response, name }) => {
    if (response) {
      dataArray.push({
        name,
        outcome: response.result,
      });
    }
  });

  return [
    {
      target: folderName, // Name of widget in dashboard to update
      data: {
        jobs: dataArray,
      },
    },
  ];
};

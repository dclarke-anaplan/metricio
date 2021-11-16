import { lookupAllSecrets } from '../../secrets';
// Run a single job, and output the data structure it creates
lookupAllSecrets().then(() => {

    const jobName = process.argv[2];
    console.log("Running job '" + jobName + "'");
    
    const jobPath = '../jobs/' + jobName;
    const job = require(jobPath);
    
    job.perform().then(result => {
        console.log(JSON.stringify(result, null, ' '));
    }).catch( (error) => {
        console.error(error);
    });
  }).catch( (error) => {
      console.error(error);
  });
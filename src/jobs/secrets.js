import {getSecret, secretNames, getSecretMetadata, lookupAllSecrets, lookupAllSecretsMetadata} from '../../secrets';

export const interval = '*/20 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  await lookupAllSecretsMetadata();
  await lookupAllSecrets();

  function outcomeOfLookup (secret) {
    if(secret){
      return "SUCCESS"
    } else {
      return "FAILURE"
    }
  }

  const secretsToLookup = Object.keys(secretNames);
  const secretStatuses = [];
  for (const key of secretsToLookup) {
    let lastRotatedDate = undefined;
    if(getSecretMetadata(secretNames[key]) != undefined){
      lastRotatedDate = getSecretMetadata(secretNames[key]).LastRotatedDate;
    }
    console.log('key = ', key, 'secretNames[key] = ', secretNames[key], 'last changed ', lastRotatedDate);
    secretStatuses.push({
        secretName: key,
        lastRotated: lastRotatedDate,
        outcome: outcomeOfLookup(getSecret(secretNames[key]))
    });
  }
  return [
    {
      target: 'aws-secrets-status',
      data: {
        secretStatuses: secretStatuses,
      },
    }
  ];
};

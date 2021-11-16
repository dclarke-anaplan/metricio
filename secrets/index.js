import config from '../config'

const AWS = require('aws-sdk');

const region = config.awsSecretStore.region;
const prefix = config.awsSecretStore.prefix;


const secrets = new Map();
const secretsMetadata = new Map();

const secretNames = {
  ATLASSIAN : "atlassian",
  JENKINS : "jenkins",
  GITHUB_PROJECT : "github",
  GCP_project_STATS : "gcp-project-stats"
};

const client = new AWS.SecretsManager({
    region: region
  });
const getSecretFromAwsSecretsManager = async (secretName) => {
  try {
    const data = await client.getSecretValue({
      SecretId: prefix + secretName,
    }).promise();

    if (data) {
      if (data.SecretString) {
        const secret = data.SecretString;
        return JSON.parse(secret);
      }
      return data.SecretBinary;
    }
  } catch (error) {
    console.log('Error retrieving secret "' + secretName + '"', error.statusCode, error.code, error.message);
  }
};

const getSecretMetadataFromAwsSecretsManager = async (secretName) => {
  try {
    const metadata = await client.describeSecret({
      SecretId: prefix + secretName,
    }).promise();

    if (metadata) {
      return metadata;
    }
  } catch (error) {
    console.log('Error retrieving secret metadata "' + secretName + '"', error.statusCode, error.code, error.message);
  }
};

function getSecret(secretName) {
  return secrets.get(secretName);
}

function getSecretMetadata(secretName) {
  return secretsMetadata.get(secretName);
}

async function populateSecretFromAws(key, map) {
  console.log("looking up secret from aws - " + key);
  const secret = await getSecretFromAwsSecretsManager(key);
  map.set(key, secret);
  console.log("Secret for " + key + " created and set");
}

async function populateSecretMetadataFromAws(key, map) {
  console.log("looking up secret from aws - " + key);
  const metadata = await getSecretMetadataFromAwsSecretsManager(key);
  console.log('METADATA = ', metadata);
  map.set(key, metadata);
  console.log("Metadata for secret " + key + " created and set");
}

async function lookupAllSecrets() {
  if (process.env.SECRET_SOURCE === 'local') {
    let localSecrets;
    try {
      localSecrets = require('../local-secrets');
    } catch (err) {
      throw new Error('local-secrets file is required when running with SECRET_SOURCE=local, see README.md for details. ' + err);
    }
    console.log("Using local secrets : ", localSecrets);
    for (const key of Object.keys(localSecrets)) {
      secrets.set(key, localSecrets[key]);
    }
  } else {
    const secretsToLookup = Object.keys(secretNames);
    console.log("Number of secrets to process = " + secretsToLookup.length);
    const lookupPromises = [];
    for (const key of secretsToLookup) {
      lookupPromises.push(populateSecretFromAws(secretNames[key], secrets));
    }
    return Promise.all(lookupPromises);
  }
}

async function lookupAllSecretsMetadata() {
  if (process.env.SECRET_SOURCE === 'local') {
    console.log("Using local secrets so no metadata to extract");
  } else {
    const secretsToLookup = Object.keys(secretNames);
    console.log("Number of secrets to process = " + secretsToLookup.length);
    const lookupPromises = [];
    for (const key of secretsToLookup) {
      lookupPromises.push(populateSecretMetadataFromAws(secretNames[key], secretsMetadata));
    }
    return Promise.all(lookupPromises);
  }
}

module.exports = { getSecret, getSecretMetadata, secretNames, lookupAllSecrets, lookupAllSecretsMetadata};

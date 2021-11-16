import request from 'request-promise-native';
import {secretNames} from '../../secrets';
import {getFileFromRepo} from "../../src/jobs/libs/github";
import {getLastSuccessfulBuildVersion} from "../../src/jobs/libs/jenkinsj5s";

const parseString = require('xml2js').parseString;
export const interval = '*/10 * * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
    const buildVersion = await getLastSuccessfulBuildVersion("org-name", "job-name", "branchname")
    const publishedVersion = await getVersionFromArtifactory("group-name", "artefact-name")
    const pom = await getFileFromRepo("org-name", "artefact-name", "artefact-name/pom.xml", secretNames.GITHUB)
    const dependencyVersion = await getArtefactVersionFromPom(pom)

    return [
        {
            target: 'build-versions', // Name of widget in dashboard to update
            data: { // Value to be passed to React component state
                value: {
                    'latest': buildVersion,
                    'published': publishedVersion
                }
            }
        },
        {
            target: 'dependency-versions', // Name of widget in dashboard to update
            data: { // Value to be passed to React component state
                value: {
                    'latest': publishedVersion,
                    'used': dependencyVersion
                }
            }
        },
    ]
};

export const getVersionFromArtifactory = (group, repo) => {
    return new Promise((resolve, reject) => {
        request({uri: `https://$artifactory-host/artifactory/api/search/latestVersion?g=${group}&a=${repo}&repos=some-repo` },
            function (error, response, body) {
                if (error){
                    reject(error)
                } else {
                    resolve(body)
                }
            });
    })
};


export const getArtefactVersionFromPom = (pom) => {
    return new Promise((resolve, reject) => {
        parseString(pom, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result.project.properties[0]['some-artefact.version'][0]);
            }
        });
    });
};

#!/usr/bin/env groovy
@Library('platform_pipeline@v1.0.0')

//////////////////////////////////////////
// Pipeline Config
//////////////////////////////////////////

def VERSION
def DOCKER_ORG = "hawking"
def IMAGE_NAME = "hawking"

def DOCKERFILE_VALIDATOR_VERSION = '1.0.7'

def DOCKER_REGISTRY = "hub.docker.com"

//////////////////////////////////////////
// Pipeline Definition
//////////////////////////////////////////

def pipelinePod = """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:debug-v0.7.0
    command:
    - /busybox/cat
    tty: true
    resources:
      requests:
        memory: 2Gi
      limits:
        memory: 2Gi
    volumeMounts:
    - name: jenkins-docker-cfg
      mountPath: /kaniko/.docker
  - name: openjdk
    image: openjdk:11
    command: ["cat"]
    tty: true
    resources:
      requests:
        memory: 1Gi
      limits:
        memory: 1Gi
    volumeMounts:
    - name: jenkins-docker-cfg
      mountPath: /kaniko/.docker
  - name: node
    image: node:13.4.0-alpine
    command: ["cat"]
    tty: true
    resources:
      requests:
        memory: 2Gi
      limits:
        memory: 2Gi
  - name: docker
    image: docker:dind
    securityContext:
      privileged: true
    command: ["dockerd-entrypoint.sh", "--storage-driver=overlay2"]
  volumes:
  - name: jenkins-docker-cfg
    emptyDir: {}
"""

podPipeline(pipelinePod) {
    stage('Checkout') {
        checkout scm
    }

    stage('Get properties from Gradle') {
        container('openjdk') {
            VERSION = getProjectVersion('jenkins_git');
        }
        currentBuild.description = "Building $IMAGE_NAME $VERSION"
    }

    stage('Build Prod') {
      container('node') {
        echo "Running 'yarn install' to download dependencies"
        sh "yarn install"
        sh "yarn buildProdDist"
      }
    }

    def image = "$DOCKER_REGISTRY/$DOCKER_ORG/$IMAGE_NAME:$VERSION"

    stage('Build and push Docker image') {
        // Setup the configuration file for kaniko
          withCredentials([usernameColonPassword(credentialsId: 'artifactory-unstable', variable: 'ddartifactoryauth')]) {
            // bit dirty that we use the open-jdk container for this :D
            container(name: 'openjdk') {
              def config = [
                'auths': [
                  'hub.docker.com': [
                    'auth': ddartifactoryauth.bytes.encodeBase64().toString()
                  ]
                ]
              ];
              writeJSON file: 'config.json', json: config;

              sh 'cp config.json /kaniko/.docker/'
            }
          }

        container(name: 'kaniko', shell: '/busybox/sh') {
          withEnv(['PATH+EXTRA=/busybox:/kaniko']) {
            sh """#!/busybox/sh
            /kaniko/executor -f `pwd`/Dockerfile -c `pwd` --destination=${image} 
            """
          }
        }
    }

    stage('Integration Test') {
        container('docker') {
            // update certificates so that wget works
            sh "apk update && apk add ca-certificates wget && update-ca-certificates"

            sh "docker network create --driver bridge hawking"

            sh "docker run -d -p 6379:6379 --name redis --network hawking  redis:5.0.4"

            try {
              timeout(time: 20, unit: 'SECONDS') {
                  waitUntil {
                      script {
                          def r = sh script: 'wget -q localhost:6379 -O /dev/null', returnStatus: true
                          return r == 0;
                      }
                  }
              }
            } catch (ex) {
              error("Error waiting for Redis to start")
            }

            sh "docker run -d -p 3000:3000 -e REDIS_SERVER_HOST=redis --network hawking ${image}"

            try {
              timeout(time: 30, unit: 'SECONDS') {
                  waitUntil {
                      script {
                          def r = sh script: 'wget -q localhost:3000/index -O /dev/null', returnStatus: true
                          return r == 0;
                      }
                  }
              }
            } catch (ex) {
              error("Error in integration test - could not reach the web page")
            }
        }
    }
}

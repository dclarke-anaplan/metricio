# Hawking

## Introduction
Hawking is a dashboard system, allowing you to put tiles on a large screen showing more or less whatever you want.

### Creating a dashboard
Dashboards are placed in `src/dashboards`. Dashboards declare what widgets they will display, in what order, and what size they are. They also provide the 'widget name', which links jobs and widgets.

To create your dashboard, take a look at the existing ones, and do something like that. You'll very likely need to create some jobs for the specific data you want, but hopefully the existing widgets will be enough to display it.

### Adding a job
Jobs provide data for widgets to display. All jobs live in `src/jobs`, and declare an `interval` and a `perform` method. For example:
```javascript
export const interval = '*/2 * * * *'; // Cron expression, see https://crontab.guru/ for help
export const perform = async () => {
  return [
    {
      target: 'SomeWidget', // Name of widget in dashboard to update
      data: {
        value: ['A', 'B', 7], // Value to be passed to React component state
      },
    },
  ];
}
```
That job sets the same static data every two minutes, which isn't very useful, but it's a start. Look at some of the other jobs to see examples.

There are a couple of useful techniques for testing your jobs below, such as just running the job directly and looking at the returned data, and starting the full server, but only running some specific jobs, so yours gets run quickly, and without too much other noise.

#### Job Timeouts
The `perform` function for a Job is now run with a timeout to ensure a single Job does not take too long (and causes no other Jobs to run due to the single thread nature of Node JS). The default is 2 minutes, but can be configured per Job by specifying (and exporting) a `timeoutSecs` constant, for example:

```javascript
export const timeoutSecs = 300; // Set the timeout for the Job to be 5 minutes
export const interval = ... 
export const perform = ...
```

#### Job libraries
There are a few libraries you might find useful in `src/jobns/libs`. For example `github` for interacting with GitHub, `jira` for Jira, and `jenkinsj5s` for our latest Jenkins.

There are also some more use-case specific libraries, such as `kanban` which helps calculate Kanban metrics, `kanban-jira` which can help get the same from Jira specifically, and `scrum-jira` to get Scrum-type metrics from Jira.

### Adding a widget
If you can't find a way of displaying the data you want in the way you want, you may find you need to add a new widget type. Widgets live in `src/widgets` and are React widgets. They all need to extend `BaseWidget` and add some special magic CSS classes so that they are visible - here's a simple template which displays nothing, but will be visible:

```javascript
import React from 'react';
import classNames from 'classnames';
import BaseWidget from '../base';

export default class ExampleWidget extends BaseWidget {
  constructor(props) {
    super(props);
  }

  render() {
    const classList = classNames(...this.classList);

    return (
      <div className={classList} />
    );
  }
}
```


### Available Widget Sizes
|Size |Row|Column|
|-----|---|------|
|small|1  |1     |
|large|1  |2     |
|full |1  |10    |
|2x2  |2  |2     |
|tall |2  |1     |

Example : `<ClockWidget name="Clock" title="London" timezone="Europe/London" size="large"/>`

### Making tiles clickable

In order to make your hawking tile clickable, the widget needs the clickable functionality and your job need to return the relevant link.

##### Widget
Widget must extend the BaseWidget and contain the following html attributes in the div returned from `render()`

```
onClick={super.onClick()}
onMouseOver={super.startHover()}
onMouseOut={super.stopHover()}
style={{cursor: super.getCursorStyle(), opacity: super.getOpacity()}}
```
##### Job
In the `data` returned from your job, add a field called `link` and populate with the url you want to link to e.g.
```javascript
return [
    {
      target: 'SomeWidget',
      data: {
        value: ['A', 'B', 7],
        link: "https://www.google.com/"
      },
    }
];
```
 

## Developing Hawking
### Running locally
Copy `local-secrets.js_template` to create your local secrets file `local-secrets.js`. Populate with appropriate tokens for any jobs you want to run. See [api tokens](#create-access-tokens) for getting personal access tokens for local development.
See [below](#secret-store) for running locally using the AWS secret source.

Get Yarn
```
brew install yarn
```

```
docker run --rm -d -p 6379:6379 redis:5.0.4
```

To update dependencies and lockfiles:
```
yarn
```

To start the node server:
```
yarn start
```

Navigate to http://localhost:3000 to see dashboards

### Testing specific jobs

#### With UI
You can specify a subset of jobs to run using a regex for their file names, e.g.:
```
yarn start --jobs=.*jira.*.js
```
You can specify only one job filter, any additional ones will overwrite the previous.

#### Headless
If you want to just execute a job and see the data structure it spits out, you can use the `execute-job` command. For example:
```
yarn execute-job example-build-j5s
```
will execute only the `example-build-j5s` job, and then pretty print the data it returns.

### Secret store

Hawking uses AWS secrets manager when running in production to store tokens and secrets.  

Most developers currently do not have access to the ep AWS account where hawking runs. The best way to run locally 
with the secret store is to use an AWS account you have have access to (e.g. `$aws-project-name`).
This may require creating secrets in your account's Secrets Manager if they do not already exist. Set an appropriate 
prefix for your secrets in the `config/index.js` file (e.g. `dev/hawking/team1` for team1).

If you want to run hawking locally testing against the AWS secret store, there are AWS secret store versions of the normal development commands.
 
To start the node server using AWS secret store:
```
yarn start-aws
```
and to run a specific job using AWS secret store:
```
yarn execute-job-aws <job-name>
```
### Create access tokens
Treat all access tokens like you would your password, don't check them in or send them via messenger. Invalidate and rotate them
regularly and if you think they may have become compromised in any way.

Once you have a token you can either put it into your local-secrets.js or upload as the secret value in the [aws secrets manager](https://console.aws.amazon.com/secretsmanager/home?region=us-east-1#/listSecrets)

#### [Jenkins](https://jenkins.io/)
You should be able to get a token by following steps [here](https://stackoverflow.com/questions/45466090/how-to-get-the-api-token-for-jenkins)

#### [Atlassian - JIRA & Confluence](https://$yourjiraproject.atlassian.net/jira/)
You can create and revoke your personal access tokens from [this page](https://id.atlassian.com/manage/api-tokens)

#### [Github](https://github.com/)
Create your personal access token [here](https://github.com/settings/tokens)

#### Pre-requisites
Install and setup aws cli
You may need to change `$aws-project-name` in package.json to match your target profile in `~/.aws/config`


## Notes on building for Production & Deployment
A Docker image is built for 'production' deployment. To avoid making the Docker image too large there are specific yarn/npm commands for building and running Hawking which builds minified and optimized bundles (and also takes care of transpiling ES6 to ES5 - to enable it to be run on browsers). To test the production deployment path you can run `yarn buildProdDist` which puts the bundled files into the `dist/` folder and then `yarn startProd` will launch the bundled `app.js` under `dist/server`. The docker build process takes the `dist/` folder and then installs a minimal set of dependencies (needed to run the backend node server) to minimize the size of the Docker image.

### Why?
In development mode (when doing a `yarn start`) the server is launched using `babel-node` which compiles the app on the fly at the beginning (slow startup) and uses a larger amount of memory due to the compiled code being cached - this is fine for development but not ideal for production. In production we pre-compile the code so that it can be run directly in `node` (backend) and also browsers (for the front-end dashboard code) - this allows for better performance and reduced image size / memory footprint.

### How to run locally almost exactly like production
1. `yarn buildProdDist`
2. `docker build . -t hawking:local`
3. `docker run --rm -it -p 6379:6379 redis:5.0.4`
4. `docker run --rm -it -p 3000:3000 -e REDIS_SERVER_HOST=host.docker.internal hawking:local`


## Preparing your Pi

The Raspberry Pis may not have the right version of Chromium to display the dashboard site correctly.  You know that this is the case if the tiles don't display correctly, and instead render as a vertical list of tiles.

We require version 56 or later of Chromium, as it supports a specific experimental flag for enabling 'CSS grid support'.

### Upgrade your Chromium

This may well entail more steps that you expected.  

As a user with `sudo` privileges (e.g. the `pi` user)...

`sudo apt-get update`

`sudo apt-get upgrade`

You may have to force the `chromium-browser` package to be upgraded with

`sudo apt-get upgrade chromium-browser`

You may find it doesn't then start.  Try restarting the Pi.

If your Chromium still isn't a later version,  you may need to:

`sudo apt-get dist-upgrade`

Don't be afraid.

#### Troubleshooting

If after upgrading the Pi and Chromium you get this error when starting Chromium:

`/usr/lib/chromium-browser/chromium-browser: symbol lookup error: /usr/lib/chromium-browser/chromium-browser: undefined symbol: mmal_vc_init_fd`

Then you'll need to upgrade the firmware on the Pi, to do this run `rpi-update` with `sudo` privileges and then reboot the Pi. This should solve your problem.

### Configure Chromium

Open the browser, go to `chrome://flags`,  find the 
`Experimental Web Platform features` flag and set to `enabled`.

### If the Pi display has black borders (not using full screen)

Open the file `/boot/config.txt`.

Ensure that the following line is uncommented:

```
disable_overscan=1
```

### Setting up the Pi to display dashboard on boot

You probably want the Pi to open Chromium in 'kiosk' mode (full screen with no bars) on startup (if your Pi gets restarted or shuts down in the evenings/over the weekends etc). Assuming the Pi is running Rasbpian (and uses the LXDE desktop environment) you will want to edit the `/home/pi/.config/lxsession/LXDE-pi/autostart` file and add the following:

```
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --kiosk --app=http://$host:$port/$dashboard
```

You may also want to hide the mouse pointer (if it annoys you) which can be done by installing `unclutter`:

```
sudo apt install -y unclutter
```

and adding the following line to the same `autostart` file as above (one liner to do this):

```
echo “@unclutter -display :0 -idle 3 -root -noevents” >> ~/.config/lxsession/LXDE-pi/autostart
```

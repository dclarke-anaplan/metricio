import schedule from 'node-schedule';
import moment from 'moment';
import RequireAll from 'require-all';

import paths from '../config/paths';
import logger from './logger';
import { redis } from './storage';
import ResqueScheduler from './scheduler';
import ResqueWorker from './worker';
import ResqueQueue from './queue';
import url from 'url';
import ipaddr from 'ipaddr.js';

import { jobCountJob } from './metricsJobs';

const DEFAULT_JOB_TIMEOUT_SEC = 120; // 2 minutes

const jobCountJobName = "metrics-jobcount";

const clientConnectionInfoWidgetName = "Metrics-ClientConnectionInfo"
const connectedWidgetCountWidgetName = "Metrics-ConnectedWidgetCount"

const CLIENTS = [];
const QUEUES = ['dashboard'];
const DASHBOARD_WIDGETS = {};

let JOBS = {};

if (process.env.NODE_ENV === 'production') {
  JOBS = require('../dist/server/jobs/jobs.js');
} else {
  // assume 'development'
  const JOB_OPTIONS = {
    dirname : paths.jobs
  };
  
  const JOB_FILTER_ARGUMENT = "--jobs=";
  for (let index = 0; index < process.argv.length; index++) {
    const argument = process.argv[index];
    if(argument.startsWith(JOB_FILTER_ARGUMENT)) {
      const jobFilter = argument.substring(JOB_FILTER_ARGUMENT.length);
      JOB_OPTIONS.filter = new RegExp(jobFilter);
      logger('info', 'Set job filter', JOB_OPTIONS.filter);
    }
  }

  JOBS = RequireAll(JOB_OPTIONS);
} 

JOBS[jobCountJobName] = jobCountJob;

// remove the 'libs' folder from JOBS;
delete JOBS['libs'];

// modify all the perform() functions to run within a timeout
Object.keys(JOBS).filter(jobName => JOBS[jobName].perform).map(jobName => {
  const { interval, perform, timeoutSecs = DEFAULT_JOB_TIMEOUT_SEC } = JOBS[jobName];

  const performWithTimeout = () => {
    return new Promise((resolve, reject) => {
      let timer = setTimeout(
        () => reject('Job "' + jobName + '" did not complete within timeout of ' + timeoutSecs + ' seconds'), 
        timeoutSecs * 1000
      );

      // allow cancelling of timer to ensure that it doesn't reject even after the perform() Promise succeeds or errors
      let cancelTimer = _ => {
        if (timer) {
          clearTimeout(timer);
          timer = undefined;
        }
      }

      return perform()
        .then(result => {
          cancelTimer();
          resolve(result);
        })
        .catch(error => {
          cancelTimer();
          reject(error);
        })
    });
  } 

  JOBS[jobName] = {
    interval, 
    perform: performWithTimeout
  }
});

const worker = ResqueWorker(QUEUES, JOBS);
const queue = ResqueQueue(JOBS);
const scheduler = ResqueScheduler();

function createResponseObject(responseData) {
  const updatedAt = moment().format('D/M/YYYY h:mm:ss');
  return Object.assign({}, { updatedAt }, responseData);
}

/**
 * Caches all successful job responses
 * @param {Object} job parent job of requested widget
 * @param {Object} widget requested widget
 */
async function cacheResponseProxy(job, widget) {
  const cacheKey = `job:${job.class}`;
  const widgetData = createResponseObject(widget.data);

  logger('info', `cache: adding ${cacheKey}`);

  try {
    await redis.hset(cacheKey, widget.target, JSON.stringify(widgetData));
  } catch (err) {
    logger('error', 'cacheResponseProxy', err);
    throw err;
  }

  return widgetData;
}

function isWidgetInClient(clientId, widgetName) {
  return DASHBOARD_WIDGETS[clientId] && DASHBOARD_WIDGETS[clientId].includes(widgetName);
}

/**
 * Update a specific client from cache
 * @param {Object} client socket for newly connected client
 */
async function updateClientFromCache(client) {
  logger('info', 'cache: updating client ->', client.id);

  const cachedResponses = Object.keys(JOBS).map(job => {
    const cacheKey = `job:${job}`;
    return redis.hgetall(cacheKey);
  });

  const responses = await Promise.all(cachedResponses);

  responses.forEach(response => {
    const widgets = Object.keys(response);
    widgets.forEach(widget => {
      const parsed = JSON.parse(response[widget]);

      if (isWidgetInClient(client.id, widget)) {
        logger('info', `cache: updating widget -> ${widget} \n`, JSON.stringify(parsed));
        client.emit(`widget:update:${widget}`, parsed);
      }
    });
  });
}

/**
 * Update all currently connected clients from cache
 * @param {*} que current worker queue
 * @param {*} job current worker job
 * @param {*} widgets current job widgets
 */
function updateClients(que, job, widgets) {
  logger('info', `sockets: updating ${CLIENTS.length} clients`);

  CLIENTS.forEach(client => {
    widgets.forEach(async widget => {
      const { target } = widget;
      const response = await cacheResponseProxy(job, widget);

      if (isWidgetInClient(client.id, target)) {
        logger('info', `sockets: updating widget ${target} \n`, JSON.stringify(response));
        client.emit(`widget:update:${target}`, response);
      }
    });
  });
}

function extractIPAddressLocationInfo(ipAddress) {
  const ipAddr = ipaddr.process(ipAddress).toString();
  if (ipAddr.startsWith('::1') || ipAddr.startsWith('127.0.0.1') || ipAddr.startsWith('localhost')) {
    return "Localhost"
  } else {
    return "Unknown";
  }
}

function extractUserAgentInfo(userAgentString) {
  if (userAgentString.includes("Mac OS X")) {
    return "Mac"
  } else if (userAgentString.includes("Linux arm")) {
    return "Pi";
  } else if (userAgentString.includes("Windows")) {
    return "Win";
  } else {
    return "Other";
  }
}

function extractDashboardPath(refererURL) {
  const parsed = url.parse(refererURL);
  return parsed.pathname.substring(1);
}

function getUniqueConnections(sockets) {
  let connectionIds = [];
  return sockets.filter(socket => {
    if (!connectionIds.includes(socket.conn.id)){
      connectionIds.push(socket.conn.id);
      return true;
    } else {
      return false;
    }
  })
}

function emitSocketClientConnectionInfo() {
  const value = getUniqueConnections(CLIENTS).map(client => ({ 
    device: extractUserAgentInfo(client.handshake.headers['user-agent']), 
    dashboard: extractDashboardPath(client.handshake.headers.referer), 
    location: extractIPAddressLocationInfo(client.handshake.address) 
  }));

  CLIENTS.forEach(client => {
    if (isWidgetInClient(client.id, clientConnectionInfoWidgetName)) {
      client.emit(`widget:update:${clientConnectionInfoWidgetName}`, createResponseObject({ value }));
    }
  });
}

function emitNumberOfWidgetsConnected() {
  const value = Object.values(DASHBOARD_WIDGETS).reduce((acc, curr) => acc + curr.length, 0);
  CLIENTS.forEach(client => {
    if (isWidgetInClient(client.id, connectedWidgetCountWidgetName)) {
      client.emit(`widget:update:${connectedWidgetCountWidgetName}`, createResponseObject({ value }));
    }
  });
}

/**
 * Start all jobs and update all connected clients
 * @param {Object} io socket.io instance
 */
export default async function start(io) {
  io.of(/^.*$/).on('connection', socket => {
    logger('info', 'sockets: adding client ->', socket.id);
    CLIENTS.push(socket);

    socket.on('disconnect', () => {
      logger('info', 'sockets: removing client ->', socket.id);
      CLIENTS.splice(CLIENTS.indexOf(socket), 1);
      delete DASHBOARD_WIDGETS[socket.id];

      // Emit client connection count (bypass jobs)
      emitSocketClientConnectionInfo();

      // Emit widget counts across all live dashboards
      emitNumberOfWidgetsConnected();
    });

    socket.on('error', error => {
      logger('info', 'socket error has occurred! Error:', error)
    })

    // Called when a dashboard initially renders and sends its array of widgets
    socket.on('dashboard-client-init', names => {
        DASHBOARD_WIDGETS[socket.id] = names;
        updateClientFromCache(socket);

        // Emit client connection count (bypass jobs)
        emitSocketClientConnectionInfo();

        // Emit widget counts across all live dashboards
        emitNumberOfWidgetsConnected();
    });
    
  });

  // Wipe 'resque' data from Redis to remove stale jobs
  const resqueKeys = await redis.keys('metricio:resque:*');
  await Promise.all(resqueKeys.map(key => {
    const k = key.replace('metricio:', '');
    return redis.del(k);
  }));

  // Start and connect worker
  try {
    await worker.connect();
    await worker.start();
  } catch (error) {
    logger('error', 'worker failed connect/cleanup/start');
    throw error;
  }

  // Start and connect the scheduler
  try {
    await scheduler.connect();
    await scheduler.start();
  } catch (error) {
    logger('error', 'scheduler failed start/connect');
    throw error;
  }

  // Connect to the queue
  try {
    await queue.connect();
  } catch (error) {
    logger('error', 'queue failed connect');
    throw error;
  }

  // Update connected clients when a job is successfull
  worker.on('success', updateClients);

  // run the jobCount job once to set the number of jobs metric
  await queue.enqueue('dashboard', jobCountJobName, Object.keys(JOBS).filter(jobName => JOBS[jobName].perform).length);

  // Schedule all jobs to run now (bootstrap)
  await Promise.all(Object.keys(JOBS).filter(jobName => JOBS[jobName].interval).map(jobName => {
    return queue.enqueue('dashboard', jobName);
  }));

  // Schedule all available jobs (if they have intervals set)
  Object.keys(JOBS).filter(jobName => JOBS[jobName].interval).forEach(jobName => {
    const job = JOBS[jobName];

    logger('info', 'scheduler: adding job ->', jobName);
    schedule.scheduleJob(job.interval, async () => {
      if (scheduler.master) {
        queue.enqueue('dashboard', jobName);
      }
    });
  });
}

// Shutdown all processes
async function shutdown() {
  logger('info', 'shutting down');

  try {
    await scheduler.end();
    await worker.end();
    await queue.end();
  } catch (error) {
    logger('error', 'shutdown process failed');
    throw error;
  }

  process.exit();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

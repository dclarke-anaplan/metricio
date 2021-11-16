import { getStoryPointCycleTimesInputObjects, getTshirtSizeCycleTimesInputObjects } from './libs/kanban-jira';
import { calculateMeanCycleTimesForRanges, calculateCycleTimeQuantilesForRanges, calculateMeanCycleTimesForBuckets, calculateCycleTimeQuantilesForBuckets } from './libs/kanban';

export const interval = '* 4 * * *'; // See https://crontab.guru/ for help
export const perform = async () => {
  const rangeBoundaries = [1, 2, 3, 5, 8];
  const jiraScopeQuery = '("Team[Team]" = 100 OR project = PROJECT1 AND ("Epic Link" != PROJECT1-100 OR "Epic Link" is EMPTY) AND labels = SomeLabel)';
  const cycleTimesInputs = await getStoryPointCycleTimesInputObjects(jiraScopeQuery, 14);
  console.log(cycleTimesInputs)

  const cycleTimes = calculateMeanCycleTimesForRanges(cycleTimesInputs, rangeBoundaries);
  const cycleTimeQuantiles = calculateCycleTimeQuantilesForRanges(cycleTimesInputs, rangeBoundaries);

  const tshirtBuckets = [
    {
      name: 'Small',
      value: 'S'
    },
    {
      name: 'Medium',
      value: 'M'
    },
    {
      name: 'Large',
      value: 'L'
    }
    ];
  const tshirtSizeCycleTimesInputs = await getTshirtSizeCycleTimesInputObjects(jiraScopeQuery, 90);
  const tshirtCycleTimes = calculateMeanCycleTimesForBuckets(tshirtSizeCycleTimesInputs, tshirtBuckets, tshirtBucketSelector);
  const tshirtCycleTimeQuantiles = calculateCycleTimeQuantilesForBuckets(tshirtSizeCycleTimesInputs, tshirtBuckets, tshirtBucketSelector);

  return [
    {
      target: 'CycleTimes',
      data: {
        value: cycleTimes,
      },
    },
    {
      target: 'CycleTimeQuantiles',
      data: {
        value: cycleTimeQuantiles,
      },
    },
    {
      target: 'TshirtCycleTimes',
      data: {
        value: tshirtCycleTimes,
      },
    },
    {
      target: 'TshirtCycleTimeQuantiles',
      data: {
        value: tshirtCycleTimeQuantiles,
      },
    },
  ];
};

const tshirtBucketSelector = (tshirtBuckets, tshirtSize) => {
  const filteredBuckets = tshirtBuckets.filter(bucket => {
    if(bucket.value === tshirtSize) {
      return true;
    } else {
      return false;
    }
  });
  if(filteredBuckets.length == 0) {
      throw "No size bucket found, is this a new size? Value found '" + tshirtSize + "', buckets: " + JSON.stringify(tshirtBuckets)
  } else if(filteredBuckets.length > 1) {
      throw "Duplicates found, don't do this. Found these buckets: " + JSON.stringify(filteredBuckets)
  } else {
      return filteredBuckets[0];
  }
}
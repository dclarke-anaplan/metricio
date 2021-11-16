import { calculateMean, quantiles } from './arithmetic';

// Turn an ordered sequence of boundaries into 'range' objects, with a `name`, and either `toValue`, `fromValue` or both.
const createRanges = (rangeBoundaries) => {
    const ranges = [];
    var previousBoundary = undefined;
    for (var index = 0 ; index < rangeBoundaries.length ; index++ ) {
        const boundary = rangeBoundaries[index];
        if(index == 0) {
            // 0 to first boundary
            ranges.push({
                name: '[0-' + boundary + ') points',
                toValue: boundary,
            });
        } else {
            // Range with upper and lower limits
            ranges.push({
                name: '[' + previousBoundary + '-' + boundary + ') points',
                fromValue: previousBoundary,
                toValue: boundary,
            });
        }
        if (index == rangeBoundaries.length - 1) {
            // Last boundary to infinity
            ranges.push({
                name: boundary + '+ points',
                fromValue: boundary,
            });
        }
        previousBoundary = boundary;
    }
    return ranges;
}

// Find the range object that the specified issue falls into
const getRelevantRange = (ranges, value) => {
    const relevantRange = ranges.filter(range => {
        if(range.fromValue === undefined) {
            // From 0 inclusive
        } else if (value < range.fromValue) {
            return false;
        }
        if(range.toValue === undefined) {
            // All the way to the top
        } else if (value >= range.toValue) {
            return false;
        }
        return true;
    });
    if(relevantRange.length == 0) {
        // Gaps in ranges
        throw "No range found, does your range have gaps? Value '" + value + "', ranges: " + JSON.stringify(ranges)
    } else if(relevantRange.length > 1) {
        // Overlapping ranges
        throw "Overlapping ranges defined, don't do this. Found these ranges: " + JSON.stringify(relevantRange)
    } else {
        return relevantRange[0];
    }
}

const collectCycleTimesToBuckets = (cycleTimeObjects, buckets, bucketSelectionFunction) => {
    return cycleTimeObjects.reduce((accumulator, issue) => {
        // Bucket the measurements
        const bucket = bucketSelectionFunction(accumulator, issue.categorisingField);
        if(bucket.measurements === undefined) {
            bucket.measurements = [];
        }
        bucket.measurements.push(issue.daysInProgress);
        return accumulator;
    }, buckets)
    .filter((bucketWithMeasurements) => {
        // Remove buckets with zero measurements
        return bucketWithMeasurements.measurements != undefined && bucketWithMeasurements.measurements.length > 0;
    });
}

// Given a list of objects with `categorisingField` and `daysInProgress` fields,
//  calculate the cycle time quantiles according to the buckets provided
const calculateCycleTimeQuantilesForBuckets = (cycleTimeObjects, buckets, bucketSelectionFunction) => {
    return collectCycleTimesToBuckets(cycleTimeObjects, buckets, bucketSelectionFunction)
    .map(bucketWithMeasurements => {
        // Average the measurements
        return {
            name: bucketWithMeasurements.name,
            value: quantiles(bucketWithMeasurements.measurements, [0, 0.25, 0.5, 0.75, 1]),
        };
    });
}

// Given a list of objects with `categorisingField` and `daysInProgress` fields,
//  calculate the cycle time quantiles according to the range boundaries provided
const calculateCycleTimeQuantilesForRanges = (cycleTimeObjects, rangeBoundaries) => {
    return calculateCycleTimeQuantilesForBuckets(cycleTimeObjects, createRanges(rangeBoundaries), getRelevantRange);
}

// Given a list of objects with `categorisingField` and `daysInProgress` fields,
//  calculate the mean cycle times according to the buckets provided
const calculateMeanCycleTimesForBuckets = (cycleTimeObjects, buckets, bucketSelectionFunction) => {
    return collectCycleTimesToBuckets(cycleTimeObjects, buckets, bucketSelectionFunction)
    .map(bucketWithMeasurements => {
        // Average the measurements
        return {
            name: bucketWithMeasurements.name,
            value: calculateMean(bucketWithMeasurements.measurements),
        };
    })
    .reduce((accumulator, measurement) => {
        // Create the result object
        accumulator[measurement.name] = measurement.value.toFixed(1);
        return accumulator;
    }, {});  
}

// Given a list of objects with `categorisingField` and `daysInProgress` fields,
//  calculate the mean cycle times according to the range boundaries provided
const calculateMeanCycleTimesForRanges = (cycleTimeObjects, rangeBoundaries) => {
    return calculateMeanCycleTimesForBuckets(cycleTimeObjects, createRanges(rangeBoundaries), getRelevantRange);
}

module.exports = { calculateMeanCycleTimesForRanges, calculateCycleTimeQuantilesForRanges, calculateMeanCycleTimesForBuckets, calculateCycleTimeQuantilesForBuckets }

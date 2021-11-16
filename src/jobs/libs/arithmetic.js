
// Calculate the mean of a series of values
const calculateMean = (values) => {
    if(values === undefined || values.length === 0 ) {
        return 0;
    }
    const sum = values.reduce((accumulator, measurement) => {
        if (typeof measurement !== "number") {
            throw `${measurement} is not a number`;
        }
        return accumulator + measurement;
    }, 0);
    return sum / values.length;
}

// Calculate the median of a series of values
const calculateMedian = (values) => {
    const middleIndex = Math.floor(values.length / 2);
    const sorted = [...values].sort((a, b) => a - b);
    return values.length % 2 !== 0 ? sorted[middleIndex] : (sorted[middleIndex - 1] + sorted[middleIndex]) / 2;
};

// Calculate the mode of a series of values
const calculateMode = (values) => {
    var frequencyCounts = {};
    values.forEach(value => {
        if(frequencyCounts[value]) {
            frequencyCounts[value]++;
        } else {
            frequencyCounts[value] = 1;
        }
    });

    var highestFrequencySoFar = 0;
    var currentMode;
    for (const [value, frequencyCount] of Object.entries(frequencyCounts)) {
      if (frequencyCount > highestFrequencySoFar) {
        highestFrequencySoFar = frequencyCount;
        currentMode = Number(value);
      }
    }
    return currentMode;
}

const sum = arr => arr.reduce((a, b) => a + b, 0);

// sample standard deviation
const std = (arr) => {
    const mu = calculateMean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

// Get the quantiles of the provided values, given the specified quantiles.
const quantiles = (values, quantiles) => {
    const calculatedQuantiles = {};
    const sorted = values.sort((a, b) => a - b);
    quantiles.forEach((quantile) => {
        const position = ((sorted.length) - 1) * quantile;
        const base = Math.floor(position);
        const rest = position - base;
        if ((sorted[base + 1] !== undefined)) {
            const value = sorted[base] + rest * (sorted[base + 1] - sorted[base]);
            calculatedQuantiles[quantile] = value;
        } else {
            const value = sorted[base];
            calculatedQuantiles[quantile] = value;
        }
    });
    return calculatedQuantiles;
}

module.exports = { calculateMean, calculateMode, calculateMedian, quantiles }

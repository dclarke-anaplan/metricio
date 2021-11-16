
const jobCountJob = {
    perform: async jobCount => {
        return [{
            target: "Metrics-JobCount",
            data: {
                value: jobCount
            }
        }];
    }
};

export {
    jobCountJob
};
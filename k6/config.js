export const BASE_URL = "https://demoqa.com";

export const LOAD_OPTIONS = {
  vus: 10,
  duration: "30s",
};

export const STRESS_OPTIONS = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "1m", target: 0 },
  ],
};

export const SPIKE_OPTIONS = {
  stages: [
    { duration: "10s", target: 100 },
    { duration: "1m", target: 0 },
  ],
};
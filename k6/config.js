export const BASE_URL = "https://demoqa.com";

export const AUTH_LOAD_OPTIONS = {
  vus: 10,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<8000"],
    http_req_failed: ["rate<0.01"],
  },
};

export const BOOKSTORE_LOAD_OPTIONS = {
  vus: 3,
  duration: "30s",
  thresholds: {
    http_req_duration: ["p(95)<10000"],
    http_req_failed: ["rate<0.01"],
  },
};

export const AUTH_STRESS_OPTIONS = {
  stages: [
    { duration: "30s", target: 10 },  // ramp up
    { duration: "1m", target: 20 },   // steady
    { duration: "30s", target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<10000"],
    http_req_failed: ["rate<0.5"],  // lower threshold for stress test
  },
};

export const AUTH_SPIKE_OPTIONS = {
  stages: [
    { duration: "10s", target: 20 },  // sudden spike
    { duration: "30s", target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<15000"],
    http_req_failed: ["rate<0.5"],
  },
};
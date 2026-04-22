export const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const TIMEOUT = 120 * 1000; // 120s em ms

export const httpOptions = {
  timeout: TIMEOUT,
};

// Prometheus remote write — usado pelo --out experimental-prometheus-rw
// Sobrescreva com: K6_PROMETHEUS_RW_SERVER_URL=http://... npm run k6:load
export const PROMETHEUS_URL = __ENV.K6_PROMETHEUS_RW_SERVER_URL || "http://localhost:9090/api/v1/write";

export const thresholds = {
  http_req_duration: ["p(95)<1000", "p(99)<2000"],
  http_req_failed: ["rate<0.02"],
};

export const tags = {
  project: "search-products",
};

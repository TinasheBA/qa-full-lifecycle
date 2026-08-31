// Load test: staged ramp to see how the endpoint behaves under pressure.
// Run locally (not in CI): k6 run load.js

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // ramp up
    { duration: "1m", target: 20 },  // sustain
    { duration: "30s", target: 0 },  // ramp down
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    // Third-party demo API; see README on why we don't gate on latency tightly.
    http_req_duration: ["p(95)<4000"],
  },
};

export default function () {
  const res = http.get("https://automationexercise.com/api/productsList");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body has products": (r) => r.body.includes("products"),
  });
  sleep(1);
}

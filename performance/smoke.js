// Smoke test: small load, fast. Safe to gate CI.
// Validates the endpoints stay healthy without slow/heavy load.

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 2,
  duration: "20s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    // Third-party demo API; see README on why we don't gate on latency tightly.
    http_req_duration: ["p(95)<3000"],
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

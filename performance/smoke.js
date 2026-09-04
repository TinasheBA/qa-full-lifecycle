// Smoke test: small load, fast. Safe to gate CI.
// Validates the endpoints stay healthy without slow/heavy load.

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 2,
  duration: "20s",
  thresholds: {
    // `check()` failures do not set k6's exit code on their own, so without a
    // threshold on the checks metric every check below is decoration: a 200
    // carrying a garbage body would pass the run. This is the line that makes
    // the checks gate anything.
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.05"],
    // Third-party demo API; see README on why we don't gate on latency tightly.
    http_req_duration: ["p(95)<3000"],
  },
};

export default function () {
  const res = http.get("https://automationexercise.com/api/productsList");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body has products": (r) => !!r.body && r.body.includes("products"),
  });
  sleep(1);
}

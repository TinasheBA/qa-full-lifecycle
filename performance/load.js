// Load test: staged ramp to see how the endpoint behaves under pressure.
// Run locally (not in CI): k6 run load.js
//
// This points at test.k6.io, Grafana's own public target for k6 practice, and
// not at the demo API the rest of the suite reads. Twenty virtual users is real
// traffic, and aiming it at a third party's site because it happens to be
// convenient is not something to demonstrate. The smoke test still exercises
// the demo API, at two virtual users, which is the level a read-only health
// check needs.

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 }, // ramp up
    { duration: "1m", target: 20 },  // sustain
    { duration: "30s", target: 0 },  // ramp down
  ],
  thresholds: {
    // See smoke.js: without this, a failing check does not fail the run.
    checks: ["rate>0.99"],
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<4000"],
  },
};

export default function () {
  const res = http.get("https://test.k6.io/");
  check(res, {
    "status is 200": (r) => r.status === 200,
    "body is not empty": (r) => !!r.body,
  });
  sleep(1);
}

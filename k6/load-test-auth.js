import http from "k6/http";
import { check } from "k6";
import { sleep } from "k6";
import { BASE_URL, LOAD_OPTIONS } from "./config.js";

export const options = LOAD_OPTIONS;

export default function () {
  const res = http.post(
    `${BASE_URL}/Account/v1/GenerateToken`,
    JSON.stringify({
      userName: __ENV.K6_USERNAME,
      password: __ENV.K6_PASSWORD,
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  check(res, {
    "status is 200": (r) => r.status === 200,
    "token exists": (r) => JSON.parse(r.body).token !== null,
  });
  sleep(1); // rest 1 second between each iteration
}
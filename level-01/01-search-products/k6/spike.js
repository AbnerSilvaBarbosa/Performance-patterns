/**
 * Spike Test
 * Objetivo: simular um pico repentino de tráfego (ex: campanha, viral).
 * Carga: idle → 300 VUs instantaneamente → idle.
 */
import { sleep } from "k6";
import { thresholds } from "./config.js";
import { getProducts, searchProducts, randomSearchTerm } from "./helpers.js";

export const options = {
  stages: [
    { duration: "10s", target: 50 },    // baseline
    { duration: "30s", target: 500 },  // spike
    { duration: "1m",  target: 500 },  // mantém pressão
    { duration: "30s", target: 50 },    // volta ao normal
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.10"],
  },
};

export default function () {
  const action = Math.random();

  if (action < 0.7) {
    getProducts();
  } else {
    searchProducts(randomSearchTerm());
  }

  sleep(0.5);
}

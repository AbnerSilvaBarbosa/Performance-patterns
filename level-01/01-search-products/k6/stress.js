/**
 * Stress Test
 * Objetivo: encontrar o limite da aplicação aumentando a carga progressivamente.
 * Carga: sobe até 500 VUs em etapas, depois desce.
 */
import { sleep } from "k6";
import { thresholds } from "./config.js";
import { getProducts, searchProducts, randomSearchTerm } from "./helpers.js";

export const options = {
  stages: [
    { duration: "1m", target: 100 },
    { duration: "2m", target: 100 },
    { duration: "1m", target: 250 },
    { duration: "2m", target: 250 },
    { duration: "1m", target: 500 },
    { duration: "2m", target: 500 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<3000"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const action = Math.random();

  if (action < 0.6) {
    getProducts();
  } else {
    searchProducts(randomSearchTerm());
  }

  sleep(Math.random() + 0.2);
}

/**
 * Load Test
 * Objetivo: simular carga normal de uso.
 * Carga: sobe até 200 VUs em 1min, mantém por 3min, desce em 1min.
 */
import { sleep } from "k6";
import { thresholds } from "./config.js";
import { getProducts, searchProducts, randomSearchTerm } from "./helpers.js";

export const options = {
  stages: [
    { duration: "1m", target: 200 },
    { duration: "3m", target: 200 },
    { duration: "1m", target: 0 },
  ],
  thresholds,
};

export default function () {
  const action = Math.random();

  if (action < 0.6) {
    // 60% listagem geral
    getProducts();
  } else {
    // 40% busca por termo
    searchProducts(randomSearchTerm());
  }

  sleep(Math.random() * 2 + 0.5);
}

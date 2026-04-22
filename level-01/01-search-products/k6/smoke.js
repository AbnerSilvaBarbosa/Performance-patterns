/**
 * Smoke Test
 * Objetivo: verificar se a API está de pé e respondendo corretamente.
 * Carga: 1 VU por 30 segundos.
 */
import { sleep } from "k6";
import { thresholds } from "./config.js";
import { getProducts, searchProducts, randomSearchTerm } from "./helpers.js";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds,
};

export default function () {
  getProducts();
  sleep(1);

  searchProducts(randomSearchTerm());
  sleep(1);
}

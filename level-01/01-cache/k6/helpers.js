import { check } from "k6";
import http from "k6/http";
import { BASE_URL, httpOptions } from "./config.js";

export function getProducts(params = "") {
  const url = params
    ? `${BASE_URL}/products?${params}`
    : `${BASE_URL}/products`;

  const res = http.get(url, null, httpOptions);

  check(res, {
    "status 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
    "body is array": (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });

  return res;
}

export function searchProducts(query) {
  const res = http.get(`${BASE_URL}/products?search=${encodeURIComponent(query)}`, null, httpOptions);

  check(res, {
    "status 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });

  return res;
}

export const SEARCH_TERMS = [
  "notebook", "smartphone", "tablet", "monitor", "teclado",
  "mouse", "headset", "ssd", "placa", "memória",
];

export function randomSearchTerm() {
  return SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
}

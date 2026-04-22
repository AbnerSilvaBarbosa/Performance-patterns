import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { products } from "../schemas/products";

const PRODUCT_NAMES = [
  "Notebook", "Smartphone", "Tablet", "Monitor", "Teclado",
  "Mouse", "Headset", "Webcam", "SSD", "HD Externo",
  "Placa de Vídeo", "Processador", "Memória RAM", "Fonte ATX", "Gabinete",
  "Impressora", "Scanner", "Roteador", "Switch", "Cabo HDMI",
];

const CATEGORIES = [
  "Eletrônicos", "Periféricos", "Armazenamento", "Redes", "Componentes",
];

const ADJECTIVES = [
  "Pro", "Ultra", "Max", "Plus", "Lite", "Elite", "Basic", "Advanced", "Smart", "Mini",
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateProduct(index: number) {
  const name = PRODUCT_NAMES[index % PRODUCT_NAMES.length];
  const adjective = ADJECTIVES[Math.floor(index / PRODUCT_NAMES.length) % ADJECTIVES.length];
  const category = CATEGORIES[index % CATEGORIES.length];

  return {
    name: `${name} ${adjective} ${index + 1}`,
    description: `${name} da linha ${adjective} — categoria ${category}. Modelo ${index + 1}.`,
    price: randomBetween(49.9, 9999.9).toFixed(2),
  };
}

const TOTAL_PRODUCTS = 100000;
const BATCH_SIZE = 5000;

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log(`Seeding ${TOTAL_PRODUCTS} products...`);

  for (let i = 0; i < TOTAL_PRODUCTS; i += BATCH_SIZE) {
    const batch = Array.from({ length: BATCH_SIZE }, (_, j) => generateProduct(i + j));
    await db.insert(products).values(batch);
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, TOTAL_PRODUCTS)}/${TOTAL_PRODUCTS}`);
  }

  console.log("Done.");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

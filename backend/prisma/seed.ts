import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Populando banco de dados...");

  const passwordHash = await bcrypt.hash("Test@1234", 10);

  const testUser = await prisma.user.upsert({
    where: { email: "qa.tester@example.com" },
    update: {},
    create: {
      name: "QA Tester",
      email: "qa.tester@example.com",
      passwordHash,
    },
  });

  await prisma.cart.upsert({
    where: { userId: testUser.id },
    update: {},
    create: { userId: testUser.id },
  });

  const products = [
    { name: "Teclado Mecânico RGB", description: "Switches azuis, iluminação RGB", price: 349.9, stock: 25, category: "periféricos" },
    { name: "Mouse Gamer 16000 DPI", description: "Sensor óptico de alta precisão", price: 189.9, stock: 40, category: "periféricos" },
    { name: "Monitor 27\" 144Hz", description: "IPS, resposta de 1ms", price: 1599.0, stock: 10, category: "monitores" },
    { name: "Headset com Microfone", description: "Cancelamento de ruído passivo", price: 259.5, stock: 0, category: "áudio" },
    { name: "Cadeira Ergonômica", description: "Ajuste lombar e de altura", price: 899.0, stock: 5, category: "móveis" },
    { name: "Webcam Full HD", description: "1080p, foco automático", price: 219.9, stock: 15, category: "periféricos" },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: `seed-${product.name}` },
      update: {},
      create: { id: `seed-${product.name}`, ...product },
    }).catch(async () => {
      // Ignora colisão de id customizado; cria normalmente se necessário.
      const exists = await prisma.product.findFirst({ where: { name: product.name } });
      if (!exists) {
        await prisma.product.create({ data: product });
      }
    });
  }

  console.log("Seed concluído. Usuário de teste: qa.tester@example.com / Test@1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

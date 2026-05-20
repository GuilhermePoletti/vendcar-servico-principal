const { PrismaClient, RoleUsuario } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const MARCAS = [
  'Toyota', 'Honda', 'VW', 'Chevrolet', 'Ford',
  'Fiat', 'Hyundai', 'Nissan', 'BMW', 'Mercedes-Benz',
];

async function main() {
  console.log('🌱 Seeding database...');

  // Seed de Marcas (upsert para idempotência)
  for (const nome of MARCAS) {
    await prisma.marca.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }
  console.log(`✅ ${MARCAS.length} marcas inseridas/verificadas`);

  // Seed de Usuário Admin padrão (bcrypt para produção)
  const senhaHash = await bcrypt.hash('123456', 10);
  await prisma.usuario.upsert({
    where: { email: 'admin@vendcar.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@vendcar.com',
      senha_hash: senhaHash,
      role: RoleUsuario.ADMIN,
    },
  });
  console.log('✅ Usuário admin criado/verificado (admin@vendcar.com / 123456)');

  console.log('🌱 Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

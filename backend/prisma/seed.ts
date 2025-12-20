import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando seed padrão do sistema...');

  /* ============================
     🔐 Usuário padrão de suporte
  ============================ */
  const password = 'suporte123';
  const hashedPassword = await bcrypt.hash(password, 10);

  /* ============================
     👤 Roles do sistema
  ============================ */
  const superUserRole = await prisma.role.upsert({
    where: { name: 'superuser' },
    update: {},
    create: { name: 'superuser' },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'staff' },
    update: {},
    create: { name: 'staff' },
  });

  /* ============================
     🧑 Usuário "suporte"
  ============================ */
  const suporteUser = await prisma.user.upsert({
    where: { email: 'suporte@morea.system' },
    update: {},
    create: {
      username: 'suporte',
      email: 'suporte@morea.system',
      password: hashedPassword,
      isActive: true,
    },
  });

  /* ============================
     🏢 Laboratório "Suporte"
  ============================ */
  const suporteLab = await prisma.lab.upsert({
    where: { name: 'Suporte' },
    update: {},
    create: {
      name: 'Suporte',
    },
  });

  /* ============================
     🔗 Vínculo User ↔ Lab (staff)
  ============================ */
  await prisma.userLab.upsert({
    where: {
      userId_labId: {
        userId: suporteUser.id,
        labId: suporteLab.id,
      },
    },
    update: {
      isStaff: true,
    },
    create: {
      userId: suporteUser.id,
      labId: suporteLab.id,
      isStaff: true,
    },
  });

  /* ============================
     🛡️ Role superuser → suporte
  ============================ */
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: suporteUser.id,
        roleId: superUserRole.id,
      },
    },
    update: {},
    create: {
      userId: suporteUser.id,
      roleId: superUserRole.id,
    },
  });

  console.log('✅ Seed finalizado com sucesso!');
  console.log('👤 Usuário: suporte');
  console.log('🔐 Senha: suporte123');
  console.log('🏢 Laboratório padrão: Suporte');
  console.log('🛡️ Permissão: superuser + staff no lab Suporte');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

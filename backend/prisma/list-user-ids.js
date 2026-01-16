// backend/prisma/list-user-ids.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listUserIds() {
  console.log('👥 Listando IDs de utilizadores na BD:\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
    },
    orderBy: {
      username: 'asc',
    },
  });

  if (users.length === 0) {
    console.log('❌ Nenhum utilizador encontrado!');
    console.log('Execute: npx prisma migrate reset\n');
    return;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('ID                                   | Username          | Nome');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  users.forEach(user => {
    console.log(`${user.id} | ${user.username.padEnd(17)} | ${user.name}`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🔍 Procurando user ADMIN...');
  const admin = users.find(u => u.role === 'ADMIN');
  if (admin) {
    console.log(`\n✅ User ADMIN encontrado:`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Nome: ${admin.name}\n`);
  } else {
    console.log('❌ Nenhum user ADMIN encontrado!\n');
  }

  console.log('💡 Para usar no frontend:');
  console.log('   localStorage.setItem("factoryops_current_user_id", "' + (admin?.id || users[0]?.id) + '");\n');
}

listUserIds()
  .catch((e) => {
    console.error('❌ Erro:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
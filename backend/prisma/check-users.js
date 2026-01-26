const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('🔍 Verificando utilizadores na base de dados...\n');

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      password: true,
    },
  });

  console.log(`📊 Total de utilizadores: ${users.length}\n`);

  if (users.length === 0) {
    console.log('❌ Nenhum utilizador encontrado!');
    console.log('Execute: npx prisma migrate reset\n');
    return;
  }

  console.log('👥 Utilizadores encontrados:\n');
  
  for (const user of users) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Username: ${user.username}`);
    console.log(`Nome:     ${user.name}`);
    console.log(`Role:     ${user.role}`);
    console.log(`Password hash: ${user.password.substring(0, 20)}...`);
    
    // Testar password
    const isValid = await bcrypt.compare('password123', user.password);
    console.log(`✅ Password válida: ${isValid ? 'SIM ✓' : 'NÃO ✗'}`);
    
    if (!isValid) {
      console.log('⚠️  PROBLEMA: Password não bate com "password123"');
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Testar criar hash novo
  console.log('🔐 Testando criação de novo hash...');
  const testHash = await bcrypt.hash('password123', 10);
  const testValid = await bcrypt.compare('password123', testHash);
  console.log(`Novo hash criado: ${testHash.substring(0, 20)}...`);
  console.log(`Hash válido: ${testValid ? 'SIM ✓' : 'NÃO ✗'}\n`);

  console.log('💡 Credenciais para testar:');
  console.log('   Username: admin');
  console.log('   Password: password123\n');
}

checkUsers()
  .catch((e) => {
    console.error('❌ Erro:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
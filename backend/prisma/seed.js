// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Configuração da fábrica
const FACTORY_CONFIG = {
  productionLines: 8,
  robotsPerLine: 32,
  pressesPerLine: 4,
  conveyorsPerLine: 6,
  qualityStations: 3,
};

// Tipos de robôs e máquinas
const MACHINE_TYPES = {
  robots: {
    welding: { prefix: 'RW', name: 'Robô de Soldadura', count: 120 },
    gluing: { prefix: 'RG', name: 'Robô de Colagem', count: 45 },
    assembly: { prefix: 'RA', name: 'Robô de Montagem', count: 60 },
    painting: { prefix: 'RP', name: 'Robô de Pintura', count: 30 },
  },
  presses: {
    hydraulic: { prefix: 'PH', name: 'Prensa Hidráulica', count: 20 },
    stamping: { prefix: 'PS', name: 'Prensa de Estampagem', count: 12 },
  },
  cnc: {
    milling: { prefix: 'CM', name: 'CNC Fresadora', count: 15 },
    drilling: { prefix: 'CD', name: 'CNC Perfuradora', count: 10 },
  },
  conveyors: {
    main: { prefix: 'CV', name: 'Transportador Principal', count: 35 },
    transfer: { prefix: 'CT', name: 'Transportador de Transferência', count: 13 },
  },
  quality: {
    scanner: { prefix: 'QS', name: 'Scanner de Qualidade', count: 8 },
    camera: { prefix: 'QC', name: 'Sistema de Câmara 3D', count: 7 },
  },
};

// Linhas de produção
const PRODUCTION_LINES = [
  { name: 'Linha de Carroçaria', description: 'Soldadura e montagem da estrutura base', area: 'Body Shop' },
  { name: 'Linha de Pintura', description: 'Tratamento de superfície e pintura', area: 'Paint Shop' },
  { name: 'Linha de Montagem Final', description: 'Montagem de componentes e acabamentos', area: 'Assembly' },
  { name: 'Linha de Chassis', description: 'Montagem de chassis e suspensão', area: 'Chassis' },
  { name: 'Linha de Motor', description: 'Montagem e teste de motores', area: 'Powertrain' },
  { name: 'Linha de Prensagem', description: 'Prensagem de painéis metálicos', area: 'Press Shop' },
  { name: 'Linha de Controlo Qualidade', description: 'Inspeção e testes finais', area: 'Quality Control' },
  { name: 'Linha de Componentes', description: 'Preparação de sub-componentes', area: 'Components' },
];

// Utilizadores por turno e departamento
const USERS = [
  // Operadores - Turno 1
  { username: 'op.silva.t1', name: 'João Silva', role: 'OPERATOR', shift: 1 },
  { username: 'op.costa.t1', name: 'Maria Costa', role: 'OPERATOR', shift: 1 },
  { username: 'op.santos.t1', name: 'Pedro Santos', role: 'OPERATOR', shift: 1 },
  { username: 'op.oliveira.t1', name: 'Ana Oliveira', role: 'OPERATOR', shift: 1 },
  
  // Operadores - Turno 2
  { username: 'op.pereira.t2', name: 'Carlos Pereira', role: 'OPERATOR', shift: 2 },
  { username: 'op.rodrigues.t2', name: 'Sofia Rodrigues', role: 'OPERATOR', shift: 2 },
  { username: 'op.fernandes.t2', name: 'Miguel Fernandes', role: 'OPERATOR', shift: 2 },
  { username: 'op.alves.t2', name: 'Rita Alves', role: 'OPERATOR', shift: 2 },
  
  // Operadores - Turno 3
  { username: 'op.gomes.t3', name: 'Tiago Gomes', role: 'OPERATOR', shift: 3 },
  { username: 'op.martins.t3', name: 'Beatriz Martins', role: 'OPERATOR', shift: 3 },
  
  // Manutenção
  { username: 'mnt.sousa', name: 'Rui Sousa', role: 'MAINTENANCE', shift: 1 },
  { username: 'mnt.lopes', name: 'André Lopes', role: 'MAINTENANCE', shift: 1 },
  { username: 'mnt.ferreira', name: 'Paulo Ferreira', role: 'MAINTENANCE', shift: 2 },
  { username: 'mnt.carvalho', name: 'Bruno Carvalho', role: 'MAINTENANCE', shift: 2 },
  
  // Engenheiros
  { username: 'eng.ribeiro', name: 'Eng. Luís Ribeiro', role: 'ENGINEER', shift: 1 },
  { username: 'eng.correia', name: 'Eng. Joana Correia', role: 'ENGINEER', shift: 1 },
  { username: 'eng.machado', name: 'Eng. Nuno Machado', role: 'ENGINEER', shift: 2 },
  
  // Administração
  { username: 'admin', name: 'Administrador Sistema', role: 'ADMIN', shift: 1 },
];

// Função para gerar status aleatório
function getRandomStatus() {
  const rand = Math.random();
  if (rand < 0.75) return 'NORMAL';
  if (rand < 0.90) return 'WARNING';
  if (rand < 0.96) return 'FAILURE';
  return 'MAINTENANCE';
}

async function main() {
  console.log('🏭 FactoryOps - Seed Database\n');
  console.log('════════════════════════════════════════════\n');

  // Limpar dados existentes
  console.log('🗑️  Limpando dados existentes...');
  await prisma.chatMessage.deleteMany();
  await prisma.annotation.deleteMany();
  await prisma.eventLog.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.productionLine.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Dados limpos\n');

  // 1. Criar Utilizadores
  console.log('👥 Criando utilizadores...');
  const users = [];
  const defaultPassword = await bcrypt.hash('password123', 10);
  
  for (const userData of USERS) {
    const user = await prisma.user.create({
      data: {
        username: userData.username,
        name: userData.name,
        password: defaultPassword,
        role: userData.role,
      },
    });
    users.push(user);
    console.log(`   ✓ ${user.name} (${user.role})`);
  }

  // 2. Criar Linhas de Produção
  console.log('\n🏗️  Criando linhas de produção...');
  const productionLines = [];
  for (const lineData of PRODUCTION_LINES) {
    const line = await prisma.productionLine.create({
      data: {
        name: lineData.name,
        description: lineData.description,
        isActive: true,
      },
    });
    productionLines.push(line);
    console.log(`   ✓ ${line.name}`);
  }

  // 3. Criar Máquinas por Tipo
  console.log('\n🤖 Criando máquinas...');
  let totalMachines = 0;

  // Robôs de Soldadura (Linha de Carroçaria)
  console.log('\n   Robôs de Soldadura:');
  for (let i = 1; i <= MACHINE_TYPES.robots.welding.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.robots.welding.name} ${i}`,
        code: `${MACHINE_TYPES.robots.welding.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[0].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.robots.welding.count} robôs de soldadura`);

  // Robôs de Colagem (Linha de Carroçaria)
  console.log('   Robôs de Colagem:');
  for (let i = 1; i <= MACHINE_TYPES.robots.gluing.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.robots.gluing.name} ${i}`,
        code: `${MACHINE_TYPES.robots.gluing.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[0].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.robots.gluing.count} robôs de colagem`);

  // Robôs de Montagem (Linha de Montagem Final)
  console.log('   Robôs de Montagem:');
  for (let i = 1; i <= MACHINE_TYPES.robots.assembly.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.robots.assembly.name} ${i}`,
        code: `${MACHINE_TYPES.robots.assembly.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[2].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.robots.assembly.count} robôs de montagem`);

  // Robôs de Pintura (Linha de Pintura)
  console.log('   Robôs de Pintura:');
  for (let i = 1; i <= MACHINE_TYPES.robots.painting.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.robots.painting.name} ${i}`,
        code: `${MACHINE_TYPES.robots.painting.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[1].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.robots.painting.count} robôs de pintura`);

  // Prensas Hidráulicas (Linha de Prensagem)
  console.log('   Prensas Hidráulicas:');
  for (let i = 1; i <= MACHINE_TYPES.presses.hydraulic.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.presses.hydraulic.name} ${i}`,
        code: `${MACHINE_TYPES.presses.hydraulic.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[5].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.presses.hydraulic.count} prensas hidráulicas`);

  // Prensas de Estampagem (Linha de Prensagem)
  console.log('   Prensas de Estampagem:');
  for (let i = 1; i <= MACHINE_TYPES.presses.stamping.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.presses.stamping.name} ${i}`,
        code: `${MACHINE_TYPES.presses.stamping.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[5].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.presses.stamping.count} prensas de estampagem`);

  // CNC Fresadoras (Linha de Componentes)
  console.log('   CNC Fresadoras:');
  for (let i = 1; i <= MACHINE_TYPES.cnc.milling.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.cnc.milling.name} ${i}`,
        code: `${MACHINE_TYPES.cnc.milling.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[7].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.cnc.milling.count} CNC fresadoras`);

  // CNC Perfuradoras (Linha de Componentes)
  console.log('   CNC Perfuradoras:');
  for (let i = 1; i <= MACHINE_TYPES.cnc.drilling.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.cnc.drilling.name} ${i}`,
        code: `${MACHINE_TYPES.cnc.drilling.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[7].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.cnc.drilling.count} CNC perfuradoras`);

  // Transportadores Principais (distribuídos)
  console.log('   Transportadores Principais:');
  for (let i = 1; i <= MACHINE_TYPES.conveyors.main.count; i++) {
    const lineIndex = i % productionLines.length;
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.conveyors.main.name} ${i}`,
        code: `${MACHINE_TYPES.conveyors.main.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[lineIndex].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.conveyors.main.count} transportadores principais`);

  // Transportadores de Transferência (distribuídos)
  console.log('   Transportadores de Transferência:');
  for (let i = 1; i <= MACHINE_TYPES.conveyors.transfer.count; i++) {
    const lineIndex = i % productionLines.length;
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.conveyors.transfer.name} ${i}`,
        code: `${MACHINE_TYPES.conveyors.transfer.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[lineIndex].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.conveyors.transfer.count} transportadores de transferência`);

  // Scanners de Qualidade (Linha de Controlo Qualidade)
  console.log('   Scanners de Qualidade:');
  for (let i = 1; i <= MACHINE_TYPES.quality.scanner.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.quality.scanner.name} ${i}`,
        code: `${MACHINE_TYPES.quality.scanner.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[6].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.quality.scanner.count} scanners de qualidade`);

  // Sistemas de Câmara 3D (Linha de Controlo Qualidade)
  console.log('   Sistemas de Câmara 3D:');
  for (let i = 1; i <= MACHINE_TYPES.quality.camera.count; i++) {
    await prisma.machine.create({
      data: {
        name: `${MACHINE_TYPES.quality.camera.name} ${i}`,
        code: `${MACHINE_TYPES.quality.camera.prefix}-${String(i).padStart(3, '0')}`,
        status: getRandomStatus(),
        productionLineId: productionLines[6].id,
      },
    });
    totalMachines++;
  }
  console.log(`   ✓ ${MACHINE_TYPES.quality.camera.count} sistemas de câmara 3D`);

  // Resumo Final
  console.log('\n════════════════════════════════════════════');
  console.log('✨ Seed completed successfully!\n');
  console.log('📊 Resumo da Base de Dados:');
  console.log(`   👥 ${users.length} utilizadores criados`);
  console.log(`   🏗️  ${productionLines.length} linhas de produção criadas`);
  console.log(`   🤖 ${totalMachines} máquinas criadas`);
  console.log('\n🔐 Credenciais de Login (password: password123):');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('   👨‍💼 ADMIN:       admin');
  console.log('   👨‍🔧 ENGINEER:    eng.ribeiro, eng.correia, eng.machado');
  console.log('   🔧 MAINTENANCE: mnt.sousa, mnt.lopes, mnt.ferreira, mnt.carvalho');
  console.log('   👷 OPERATOR:    op.silva.t1, op.costa.t1, op.santos.t1, etc.');
  console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('\n❌ Erro no seed:', e.message);
    console.error('📝 Stack trace:', e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
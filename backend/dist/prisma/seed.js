"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enums_1 = require("../src/common/enums");
const prisma = new client_1.PrismaClient();
const FACTORY_CONFIG = {
    productionLines: 8,
    robotsPerLine: 32,
    pressesPerLine: 4,
    conveyorsPerLine: 6,
    qualityStations: 3,
};
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
const USERS = [
    { username: 'op.silva.t1', name: 'João Silva', role: enums_1.UserRole.OPERATOR, shift: 1 },
    { username: 'op.costa.t1', name: 'Maria Costa', role: enums_1.UserRole.OPERATOR, shift: 1 },
    { username: 'op.santos.t1', name: 'Pedro Santos', role: enums_1.UserRole.OPERATOR, shift: 1 },
    { username: 'op.oliveira.t1', name: 'Ana Oliveira', role: enums_1.UserRole.OPERATOR, shift: 1 },
    { username: 'op.pereira.t2', name: 'Carlos Pereira', role: enums_1.UserRole.OPERATOR, shift: 2 },
    { username: 'op.rodrigues.t2', name: 'Sofia Rodrigues', role: enums_1.UserRole.OPERATOR, shift: 2 },
    { username: 'op.fernandes.t2', name: 'Miguel Fernandes', role: enums_1.UserRole.OPERATOR, shift: 2 },
    { username: 'op.alves.t2', name: 'Rita Alves', role: enums_1.UserRole.OPERATOR, shift: 2 },
    { username: 'op.gomes.t3', name: 'Tiago Gomes', role: enums_1.UserRole.OPERATOR, shift: 3 },
    { username: 'op.martins.t3', name: 'Beatriz Martins', role: enums_1.UserRole.OPERATOR, shift: 3 },
    { username: 'mnt.sousa', name: 'Rui Sousa', role: enums_1.UserRole.MAINTENANCE, shift: 1 },
    { username: 'mnt.lopes', name: 'André Lopes', role: enums_1.UserRole.MAINTENANCE, shift: 1 },
    { username: 'mnt.ferreira', name: 'Paulo Ferreira', role: enums_1.UserRole.MAINTENANCE, shift: 2 },
    { username: 'mnt.carvalho', name: 'Bruno Carvalho', role: enums_1.UserRole.MAINTENANCE, shift: 2 },
    { username: 'eng.ribeiro', name: 'Eng. Luís Ribeiro', role: enums_1.UserRole.ENGINEER, shift: 1 },
    { username: 'eng.correia', name: 'Eng. Joana Correia', role: enums_1.UserRole.ENGINEER, shift: 1 },
    { username: 'eng.machado', name: 'Eng. Nuno Machado', role: enums_1.UserRole.ENGINEER, shift: 2 },
    { username: 'admin', name: 'Administrador Sistema', role: enums_1.UserRole.ADMIN, shift: 1 },
];
function getRandomStatus() {
    const rand = Math.random();
    if (rand < 0.75)
        return enums_1.MachineStatus.NORMAL;
    if (rand < 0.90)
        return enums_1.MachineStatus.WARNING;
    if (rand < 0.96)
        return enums_1.MachineStatus.FAILURE;
    return enums_1.MachineStatus.MAINTENANCE;
}
function randomDate(daysAgo = 7) {
    const now = new Date();
    const past = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}
async function main() {
    console.log('🏭 Iniciando seed da fábrica automóvel (estilo VW)...\n');
    console.log('🗑️  Limpando dados existentes...');
    await prisma.eventLog.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.annotation.deleteMany();
    await prisma.machine.deleteMany();
    await prisma.productionLine.deleteMany();
    await prisma.user.deleteMany();
    console.log('\n👥 Criando utilizadores...');
    const users = [];
    for (const userData of USERS) {
        const user = await prisma.user.create({
            data: {
                username: userData.username,
                name: userData.name,
                role: userData.role,
            },
        });
        users.push(user);
        console.log(`   ✓ ${user.name} (${user.role})`);
    }
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
    console.log('\n🤖 Criando máquinas...');
    let totalMachines = 0;
    const allMachines = [];
    console.log('\n   Robôs de Soldadura:');
    for (let i = 1; i <= MACHINE_TYPES.robots.welding.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.robots.welding.name} ${i}`,
                code: `${MACHINE_TYPES.robots.welding.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[0].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.robots.welding.count} robôs de soldadura`);
    console.log('   Robôs de Colagem:');
    for (let i = 1; i <= MACHINE_TYPES.robots.gluing.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.robots.gluing.name} ${i}`,
                code: `${MACHINE_TYPES.robots.gluing.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[0].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.robots.gluing.count} robôs de colagem`);
    console.log('   Robôs de Montagem:');
    for (let i = 1; i <= MACHINE_TYPES.robots.assembly.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.robots.assembly.name} ${i}`,
                code: `${MACHINE_TYPES.robots.assembly.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[2].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.robots.assembly.count} robôs de montagem`);
    console.log('   Robôs de Pintura:');
    for (let i = 1; i <= MACHINE_TYPES.robots.painting.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.robots.painting.name} ${i}`,
                code: `${MACHINE_TYPES.robots.painting.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[1].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.robots.painting.count} robôs de pintura`);
    console.log('   Prensas Hidráulicas:');
    for (let i = 1; i <= MACHINE_TYPES.presses.hydraulic.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.presses.hydraulic.name} ${i}`,
                code: `${MACHINE_TYPES.presses.hydraulic.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[5].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.presses.hydraulic.count} prensas hidráulicas`);
    console.log('   Prensas de Estampagem:');
    for (let i = 1; i <= MACHINE_TYPES.presses.stamping.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.presses.stamping.name} ${i}`,
                code: `${MACHINE_TYPES.presses.stamping.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[5].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.presses.stamping.count} prensas de estampagem`);
    console.log('   CNC Fresadoras:');
    for (let i = 1; i <= MACHINE_TYPES.cnc.milling.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.cnc.milling.name} ${i}`,
                code: `${MACHINE_TYPES.cnc.milling.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[7].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.cnc.milling.count} CNC fresadoras`);
    console.log('   CNC Perfuradoras:');
    for (let i = 1; i <= MACHINE_TYPES.cnc.drilling.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.cnc.drilling.name} ${i}`,
                code: `${MACHINE_TYPES.cnc.drilling.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[7].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.cnc.drilling.count} CNC perfuradoras`);
    console.log('   Transportadores:');
    const conveyorLines = [0, 1, 2, 3, 4];
    let conveyorCount = 0;
    for (let i = 1; i <= MACHINE_TYPES.conveyors.main.count; i++) {
        const lineIndex = conveyorLines[i % conveyorLines.length];
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.conveyors.main.name} ${i}`,
                code: `${MACHINE_TYPES.conveyors.main.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[lineIndex].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
        conveyorCount++;
    }
    for (let i = 1; i <= MACHINE_TYPES.conveyors.transfer.count; i++) {
        const lineIndex = conveyorLines[i % conveyorLines.length];
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.conveyors.transfer.name} ${i}`,
                code: `${MACHINE_TYPES.conveyors.transfer.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[lineIndex].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
        conveyorCount++;
    }
    console.log(`   ✓ ${conveyorCount} transportadores`);
    console.log('   Sistemas de Qualidade:');
    for (let i = 1; i <= MACHINE_TYPES.quality.scanner.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.quality.scanner.name} ${i}`,
                code: `${MACHINE_TYPES.quality.scanner.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[6].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    for (let i = 1; i <= MACHINE_TYPES.quality.camera.count; i++) {
        const machine = await prisma.machine.create({
            data: {
                name: `${MACHINE_TYPES.quality.camera.name} ${i}`,
                code: `${MACHINE_TYPES.quality.camera.prefix}-${String(i).padStart(3, '0')}`,
                status: getRandomStatus(),
                productionLineId: productionLines[6].id,
            },
        });
        allMachines.push(machine);
        totalMachines++;
    }
    console.log(`   ✓ ${MACHINE_TYPES.quality.scanner.count + MACHINE_TYPES.quality.camera.count} sistemas de qualidade`);
    console.log(`\n   📊 Total de máquinas criadas: ${totalMachines}`);
    console.log('\n📝 Criando histórico de eventos...');
    const eventCount = 500;
    for (let i = 0; i < eventCount; i++) {
        const machine = allMachines[Math.floor(Math.random() * allMachines.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const eventTypes = ['MACHINE_STATUS_CHANGE', 'ANNOTATION_CREATED', 'MESSAGE_SENT'];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        await prisma.eventLog.create({
            data: {
                eventType,
                description: `Evento em ${machine.name}`,
                machineId: machine.id,
                userId: user.id,
                createdAt: randomDate(7),
                metadata: {
                    previousStatus: 'NORMAL',
                    newStatus: machine.status,
                },
            },
        });
    }
    console.log(`   ✓ ${eventCount} eventos históricos criados`);
    console.log('\n💬 Criando mensagens de chat...');
    const chatTemplates = [
        'Ruído anormal detectado durante operação',
        'Temperatura acima do normal no motor',
        'Verificar calibração do sistema',
        'Substituição de componente necessária',
        'Manutenção preventiva programada',
        'Sistema operando dentro dos parâmetros',
        'Ajuste realizado com sucesso',
        'Verificar nível de fluido hidráulico',
        'Sensor de proximidade com leitura inconsistente',
        'Ciclo de produção concluído sem problemas',
    ];
    const messagesToCreate = 150;
    for (let i = 0; i < messagesToCreate; i++) {
        const machine = allMachines[Math.floor(Math.random() * allMachines.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const content = chatTemplates[Math.floor(Math.random() * chatTemplates.length)];
        await prisma.chatMessage.create({
            data: {
                content,
                machineId: machine.id,
                userId: user.id,
                createdAt: randomDate(7),
            },
        });
    }
    console.log(`   ✓ ${messagesToCreate} mensagens de chat criadas`);
    console.log('\n📐 Criando anotações técnicas...');
    const annotationTypes = [
        enums_1.AnnotationType.LINE,
        enums_1.AnnotationType.RECTANGLE,
        enums_1.AnnotationType.TEXT,
        enums_1.AnnotationType.CIRCLE,
        enums_1.AnnotationType.ARROW
    ];
    const annotationsToCreate = 200;
    for (let i = 0; i < annotationsToCreate; i++) {
        const machine = allMachines[Math.floor(Math.random() * allMachines.length)];
        const user = users[Math.floor(Math.random() * users.length)];
        const type = annotationTypes[Math.floor(Math.random() * annotationTypes.length)];
        let content = {
            x: Math.floor(Math.random() * 800),
            y: Math.floor(Math.random() * 500),
            color: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)],
            strokeWidth: Math.floor(Math.random() * 3) + 1,
        };
        if (type === 'LINE') {
            content.points = [content.x, content.y, content.x + Math.random() * 200, content.y + Math.random() * 200];
        }
        else if (type === 'RECTANGLE') {
            content.width = Math.floor(Math.random() * 150) + 50;
            content.height = Math.floor(Math.random() * 100) + 30;
        }
        else if (type === 'CIRCLE') {
            content.radius = Math.floor(Math.random() * 60) + 20;
        }
        else if (type === 'TEXT') {
            const texts = ['ATENÇÃO', 'Verificar', 'OK', 'Manutenção', 'Urgente', 'Sensor'];
            content.text = texts[Math.floor(Math.random() * texts.length)];
            content.fontSize = 16;
        }
        await prisma.annotation.create({
            data: {
                type,
                content,
                machineId: machine.id,
                userId: user.id,
                createdAt: randomDate(7),
            },
        });
    }
    console.log(`   ✓ ${annotationsToCreate} anotações técnicas criadas`);
    console.log('\n' + '='.repeat(60));
    console.log('✅ Seed concluído com sucesso!');
    console.log('='.repeat(60));
    console.log('\n📊 ESTATÍSTICAS DA FÁBRICA:\n');
    console.log(`   👥 Utilizadores: ${users.length}`);
    console.log(`   🏗️  Linhas de Produção: ${productionLines.length}`);
    console.log(`   🤖 Total de Máquinas: ${totalMachines}`);
    console.log(`      - Robôs de Soldadura: ${MACHINE_TYPES.robots.welding.count}`);
    console.log(`      - Robôs de Colagem: ${MACHINE_TYPES.robots.gluing.count}`);
    console.log(`      - Robôs de Montagem: ${MACHINE_TYPES.robots.assembly.count}`);
    console.log(`      - Robôs de Pintura: ${MACHINE_TYPES.robots.painting.count}`);
    console.log(`      - Prensas: ${MACHINE_TYPES.presses.hydraulic.count + MACHINE_TYPES.presses.stamping.count}`);
    console.log(`      - CNC: ${MACHINE_TYPES.cnc.milling.count + MACHINE_TYPES.cnc.drilling.count}`);
    console.log(`      - Transportadores: ${MACHINE_TYPES.conveyors.main.count + MACHINE_TYPES.conveyors.transfer.count}`);
    console.log(`      - Qualidade: ${MACHINE_TYPES.quality.scanner.count + MACHINE_TYPES.quality.camera.count}`);
    console.log(`   📝 Eventos: ${eventCount}`);
    console.log(`   💬 Mensagens: ${messagesToCreate}`);
    console.log(`   📐 Anotações: ${annotationsToCreate}`);
    console.log('\n' + '='.repeat(60));
    console.log('\n🚀 Para iniciar o servidor: npm run start:dev');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('📊 Prisma Studio: npx prisma studio\n');
}
main()
    .catch((e) => {
    console.error('\n❌ Erro durante o seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map
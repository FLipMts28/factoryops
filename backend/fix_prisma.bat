@echo off
echo ===========================================
echo 🔧 Prisma - Forcar Binary Engine
echo ===========================================
echo.

cd backend

echo 1️⃣ Definindo variaveis de ambiente...
set PRISMA_CLI_BINARY_TARGETS=windows,native
set PRISMA_ENGINES_MIRROR=https://binaries.prismacdn.com
echo    ✅ Variaveis definidas
echo.

echo 2️⃣ Removendo Prisma existente...
rmdir /s /q node_modules\.prisma 2>nul
rmdir /s /q node_modules\@prisma 2>nul
rmdir /s /q node_modules\prisma 2>nul
echo    ✅ Prisma removido
echo.

echo 3️⃣ Reinstalando Prisma...
call npm install prisma@5.22.0 --save-dev --force
call npm install @prisma/client@5.22.0 --force
echo    ✅ Prisma instalado
echo.

echo 4️⃣ Gerando Client com binary engine...
call npx prisma generate --schema=prisma/schema.prisma
echo    ✅ Client gerado
echo.

echo 5️⃣ Verificando instalacao...
if exist "node_modules\@prisma\client" (
    echo    ✅ Cliente Prisma instalado
) else (
    echo    ❌ Cliente Prisma NAO encontrado!
)
echo.

if exist "node_modules\.prisma\client" (
    echo    ✅ Prisma runtime instalado
) else (
    echo    ❌ Prisma runtime NAO encontrado!
)
echo.

echo 6️⃣ Validando schema...
call npx prisma validate
echo.

echo ===========================================
echo ✅ Processo concluido!
echo ===========================================
echo.
echo 📋 Proximo passo:
echo    npm run start:dev
echo.
pause
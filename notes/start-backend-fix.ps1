# ============================================
# START BACKEND - Solução Definitiva
# ============================================

Write-Host ""
Write-Host "🚀 FactoryOps Backend - Inicializador" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Navegar para backend
$backendPath = "E:\develop\03_Advanced_Internet_Programming\Fullstack Projects\factoryops\backend"

if (-not (Test-Path $backendPath)) {
    $backendPath = Join-Path $PSScriptRoot "backend"
}

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Pasta backend não encontrada!" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

# Verificar se já foi compilado
$compiledExists = Test-Path "dist\src\main.js"

if ($compiledExists) {
    Write-Host "✅ Backend já compilado!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Escolha o método:" -ForegroundColor Yellow
    Write-Host "  [1] Executar compilado (node dist\src\main.js)" -ForegroundColor White
    Write-Host "  [2] Desenvolvimento com hot-reload (ts-node-dev)" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Opção (1 ou 2)"
    
    if ($choice -eq "1") {
        Write-Host ""
        Write-Host "🏃 Executando backend compilado..." -ForegroundColor Cyan
        Write-Host "   URL: http://localhost:3001" -ForegroundColor Green
        Write-Host "   Ctrl+C para parar" -ForegroundColor Yellow
        Write-Host ""
        node dist\src\main.js
        exit
    }
}

# Instalar ts-node-dev se não existir
$packageJson = Get-Content "package.json" | ConvertFrom-Json
if (-not $packageJson.devDependencies."ts-node-dev") {
    Write-Host "📦 Instalando ts-node-dev..." -ForegroundColor Yellow
    npm install --save-dev ts-node-dev
    Write-Host ""
}

# Verificar se script dev existe
if (-not $packageJson.scripts.dev) {
    Write-Host "🔧 Adicionando script 'dev' ao package.json..." -ForegroundColor Yellow
    
    # Adicionar script
    $packageJson.scripts | Add-Member -NotePropertyName "dev" -NotePropertyValue "ts-node-dev --respawn --transpile-only src/main.ts" -Force
    
    # Salvar package.json
    $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
    Write-Host "✅ Script adicionado!" -ForegroundColor Green
    Write-Host ""
}

# Gerar Prisma se necessário
if (-not (Test-Path "node_modules\.prisma\client")) {
    Write-Host "🔧 Gerando Prisma Client..." -ForegroundColor Yellow
    npm run prisma:generate
    Write-Host ""
}

# Executar
Write-Host "🏃 Executando backend com ts-node-dev..." -ForegroundColor Cyan
Write-Host ""
Write-Host "   ✅ Hot-reload ATIVADO" -ForegroundColor Green
Write-Host "   ✅ Não precisa recompilar" -ForegroundColor Green
Write-Host "   📝 Mudanças detectadas automaticamente" -ForegroundColor Green
Write-Host ""
Write-Host "   🌐 URL: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   ⏹️  Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

npx ts-node-dev --respawn --transpile-only src/main.ts
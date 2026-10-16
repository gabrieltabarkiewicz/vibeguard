@echo off
REM Facilitador de instalacao do VibeGuard para Windows.
REM Pre-requisito: Node.js instalado (https://nodejs.org).

echo.
echo ====== VibeGuard ======
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [!] O Node.js nao foi encontrado.
  echo     Instale o Node.js em https://nodejs.org e rode este arquivo de novo.
  echo.
  pause
  exit /b 1
)

echo [1/3] Preparando o gerenciador de pacotes...
call corepack enable >nul 2>nul

echo [2/3] Instalando as dependencias (pode demorar na primeira vez)...
call pnpm install
if errorlevel 1 (
  echo [!] Algo deu errado na instalacao. Veja as mensagens acima.
  pause
  exit /b 1
)

echo [3/3] Iniciando o VibeGuard...
echo     Quando aparecer o endereco http://localhost:3000, abra-o no navegador.
echo.
call pnpm dev

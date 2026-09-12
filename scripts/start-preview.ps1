param([int]$FrontendPort = 4173, [int]$BackendPort = 8000, [int]$DatabasePort = 55440)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$previewRoot = Join-Path $projectRoot '.cache\preview'
$backendRoot = Join-Path $projectRoot 'backend'
$frontendRoot = $projectRoot
$pythonExe = Join-Path $backendRoot '.venv\Scripts\python.exe'
$pgBin = 'C:\Program Files\PostgreSQL\18\bin'
$clusterRoot = Join-Path $previewRoot 'postgres'
$backendPidPath = Join-Path $previewRoot 'backend.pid'
$frontendPidPath = Join-Path $previewRoot 'frontend.pid'
$backendUrl = 'http://127.0.0.1:' + $BackendPort
$frontendUrl = 'http://127.0.0.1:' + $FrontendPort

function Test-ApiHealth([string]$url) {
  try {
    $health = Invoke-RestMethod ($url + '/health') -TimeoutSec 2
    return $health.code -eq 0 -and $health.data.status -eq 'ok'
  } catch { return $false }
}

function Get-PreviewListener([int]$port, [string]$kind) {
  $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $listener) { return $null }
  $service = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
  $command = if ($service) { $service.CommandLine.Replace('/', '\') } else { '' }
  $isOurs = $command.Contains($projectRoot) -and (
    ($kind -eq 'frontend' -and $command.Contains('vite') -and $service.Name -eq 'node.exe') -or
    ($kind -eq 'backend' -and $command.Contains('app.main:create_app'))
  )
  if (-not $isOurs) { throw "Port $port is occupied by a different process; refusing to replace it." }
  return $service
}

# Discover the live listeners rather than trusting stale/recycled PID files.
$backendProcess = Get-PreviewListener $BackendPort 'backend'
$frontendProcess = Get-PreviewListener $FrontendPort 'frontend'
New-Item -ItemType Directory -Force -Path $previewRoot | Out-Null
if (-not (Test-Path -LiteralPath $pythonExe)) { throw 'Install the backend dependencies with uv sync first.' }
if (-not (Test-Path -LiteralPath (Join-Path $pgBin 'initdb.exe'))) { throw 'PostgreSQL 18 binaries are required. Set pgBin to your installation directory.' }
$passwordFile = Join-Path $previewRoot 'db-password'
if (-not (Test-Path -LiteralPath $passwordFile)) {
  & $pythonExe -c "import secrets,sys; from pathlib import Path; Path(sys.argv[1]).write_text(secrets.token_urlsafe(32))" $passwordFile
  if ($LASTEXITCODE -ne 0) { throw 'Cannot generate preview database password.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $clusterRoot 'PG_VERSION'))) {
  & (Join-Path $pgBin 'initdb.exe') -D $clusterRoot -U vmrb --auth=scram-sha-256 "--pwfile=$passwordFile" --encoding=UTF8 --locale=C
  if ($LASTEXITCODE -ne 0) { throw 'Preview database initialization failed.' }
}
& (Join-Path $pgBin 'pg_isready.exe') -h 127.0.0.1 -p $DatabasePort -U vmrb *> $null
if ($LASTEXITCODE -ne 0) {
  $pgArguments = @('-D', ('"' + $clusterRoot + '"'), '-l', ('"' + (Join-Path $previewRoot 'postgres.log') + '"'), '-o', ('"-h 127.0.0.1 -p ' + $DatabasePort + '"'), '-w', 'start')
  Start-Process -FilePath (Join-Path $pgBin 'pg_ctl.exe') -ArgumentList $pgArguments -WindowStyle Hidden | Out-Null
  $databaseReady = $false
  for ($i = 0; $i -lt 40; $i++) {
    & (Join-Path $pgBin 'pg_isready.exe') -h 127.0.0.1 -p $DatabasePort -U vmrb *> $null
    if ($LASTEXITCODE -eq 0) { $databaseReady = $true; break }
    Start-Sleep -Milliseconds 250
  }
  if (-not $databaseReady) { throw 'Preview database did not become ready; inspect .cache/preview/postgres.log.' }
}
$previewPassword = (Get-Content -LiteralPath $passwordFile -Raw).Trim()
$env:DATABASE_URL = 'postgresql+psycopg://vmrb:' + $previewPassword + '@127.0.0.1:' + $DatabasePort + '/postgres'
& $pythonExe -c "import os; from sqlalchemy import create_engine,text; e=create_engine(os.environ['DATABASE_URL'],isolation_level='AUTOCOMMIT'); c=e.connect(); exists=c.execute(text('SELECT 1 FROM pg_database WHERE datname=:name'),{'name':'vmrb_preview'}).scalar(); c.execute(text('CREATE DATABASE vmrb_preview')) if not exists else None; c.close(); e.dispose()"
if ($LASTEXITCODE -ne 0) { throw 'Cannot create preview database.' }
$env:DATABASE_URL = 'postgresql+psycopg://vmrb:' + $previewPassword + '@127.0.0.1:' + $DatabasePort + '/vmrb_preview'
$env:STORAGE_ROOT = Join-Path $previewRoot 'medical-data'
$env:VMRB_DEMO_SEED = '1'
# Demo sessions last through a normal working day. Expiry is still enforced by
# both the API and the browser, and production keeps the safer 60-minute default.
$env:ACCESS_TOKEN_MINUTES = '1440'
if (-not $backendProcess) {
  Push-Location $backendRoot
  try {
    & $pythonExe -m alembic upgrade head
    if ($LASTEXITCODE -ne 0) { throw 'Migration failed.' }
    # Normal restarts must not rewrite accounts, profiles or patient records.
    & $pythonExe -c "from app.config import Settings; from app.db import make_engine,make_session_factory; from app.models import User; from sqlalchemy import select; from app.demo import seed; s=Settings(); e=make_engine(s.database_url); db=make_session_factory(e)(); empty=db.scalar(select(User.id).limit(1)) is None; db.close(); e.dispose(); seed(s) if empty else print('Existing preview records retained.')"
    if ($LASTEXITCODE -ne 0) { throw 'Preview data creation failed.' }
  } finally { Pop-Location }
  $backendArgs = @('-m', 'uvicorn', 'app.main:create_app', '--app-dir', ('"' + $backendRoot + '"'), '--factory', '--host', '127.0.0.1', '--port', $BackendPort, '--workers', '1', '--no-access-log')
  Start-Process -FilePath $pythonExe -ArgumentList $backendArgs -WorkingDirectory $backendRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $previewRoot 'backend.log') -RedirectStandardError (Join-Path $previewRoot 'backend-error.log') | Out-Null
}
$backendReady = $false
for ($i = 0; $i -lt 40; $i++) {
  if (Test-ApiHealth $backendUrl) { $backendReady = $true; break }
  Start-Sleep -Milliseconds 250
}
if (-not $backendReady) { throw 'Backend startup failed; inspect .cache/preview/backend-error.log.' }
$backendProcess = Get-PreviewListener $BackendPort 'backend'
$backendProcess.ProcessId | Set-Content -LiteralPath $backendPidPath
$env:VITE_PREVIEW = 'true'
$env:VITE_LOCAL_PREVIEW = 'false'
$env:VMRB_BACKEND_URL = $backendUrl
$nodeExe = (Get-Command node.exe).Source
$viteEntry = Join-Path $frontendRoot 'node_modules\vite\bin\vite.js'
# A frontend started alone may have an obsolete proxy target. Reuse it only
# when its proxy reaches the now-healthy API; otherwise restart this project's Vite.
if ($frontendProcess -and -not (Test-ApiHealth $frontendUrl)) {
  Stop-Process -Id $frontendProcess.ProcessId
  $frontendProcess = $null
}
if (-not $frontendProcess) {
  Start-Process -FilePath $nodeExe -ArgumentList @(('"' + $viteEntry + '"'), '--host', '127.0.0.1', '--port', $FrontendPort) -WorkingDirectory $frontendRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $previewRoot 'frontend.log') -RedirectStandardError (Join-Path $previewRoot 'frontend-error.log') | Out-Null
}
$previewReady = $false
for ($i = 0; $i -lt 40; $i++) {
  try {
    $health = Invoke-RestMethod "http://127.0.0.1:$FrontendPort/health" -TimeoutSec 2
    if ($health.data.status -eq 'ok') { $previewReady = $true; break }
  } catch { Start-Sleep -Milliseconds 250 }
}
if (-not $previewReady) { throw 'Preview startup failed; inspect logs in .cache/preview and run stop-preview.ps1.' }
$frontendProcess = Get-PreviewListener $FrontendPort 'frontend'
$frontendProcess.ProcessId | Set-Content -LiteralPath $frontendPidPath
Write-Output "Preview ready: http://127.0.0.1:$FrontendPort"
Write-Output "Backend docs: http://127.0.0.1:$BackendPort/docs"
Write-Output 'Administrator: admin / 123456'
Write-Output 'Demo doctor: demo_doctor / 123456'
Write-Output 'Complete patient: demo_patient_full / 123456'
Write-Output 'Report test patient: demo_patient_test / 123456'

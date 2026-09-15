param(
  [int]$FrontendPort = 4173,
  [int]$BackendPort = 8000,
  [int]$DatabasePort = 55440,
  [string]$PostgresBin = $env:VMRB_POSTGRES_BIN,
  [string]$NvSegmentDir = $env:NV_SEGMENT_CT_DIR
)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$previewRoot = Join-Path $projectRoot '.cache\preview'
$backendRoot = Join-Path $projectRoot 'backend'
$frontendRoot = $projectRoot
$pythonExe = Join-Path $backendRoot '.venv\Scripts\python.exe'
$clusterRoot = Join-Path $previewRoot 'postgres'
New-Item -ItemType Directory -Force -Path $previewRoot | Out-Null
$uv = Get-Command uv.exe -ErrorAction SilentlyContinue
if (-not (Test-Path -LiteralPath $pythonExe)) {
  if (-not $uv) { throw 'Install uv, then run uv sync --locked --project backend.' }
  & $uv.Source sync --locked --project $backendRoot
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $pythonExe)) {
    throw 'Backend dependency installation failed.'
  }
}
if (-not $NvSegmentDir -and (Test-Path -LiteralPath 'D:\NV-Segment-CTMR')) {
  $NvSegmentDir = 'D:\NV-Segment-CTMR'
}
if ($NvSegmentDir) {
  $resolvedNvSegmentDir = (Resolve-Path -LiteralPath $NvSegmentDir -ErrorAction Stop).Path
  $modelHelper = Join-Path $resolvedNvSegmentDir 'hugging_face_pipeline.py'
  $modelWeights = Join-Path $resolvedNvSegmentDir 'vista3d_pretrained_model\model.pt'
  if (-not (Test-Path -LiteralPath $modelHelper) -or -not (Test-Path -LiteralPath $modelWeights)) {
    throw "NV-Segment-CTMR is incomplete at $resolvedNvSegmentDir; expected hugging_face_pipeline.py and vista3d_pretrained_model/model.pt."
  }
  & $pythonExe -c "import monai, torch, transformers" *> $null
  if ($LASTEXITCODE -ne 0) {
    if (-not $uv) { throw 'Install uv so the NV-Segment-CTMR runtime dependencies can be installed.' }
    Write-Output 'Installing NV-Segment-CTMR runtime dependencies (first launch only)...'
    & $uv.Source pip install --python $pythonExe -r (Join-Path $backendRoot 'requirements-nv.txt')
    if ($LASTEXITCODE -ne 0) { throw 'NV-Segment-CTMR runtime dependency installation failed.' }
  }
  $env:NV_SEGMENT_CT_DIR = $resolvedNvSegmentDir
  $env:NV_SEGMENT_DEVICE = if ($env:NV_SEGMENT_DEVICE) { $env:NV_SEGMENT_DEVICE } else { 'cuda:0' }
  $env:NV_SEGMENT_ROI_SIZE = if ($env:NV_SEGMENT_ROI_SIZE) { $env:NV_SEGMENT_ROI_SIZE } else { '[192,192,128]' }
  $env:NV_SEGMENT_OVERLAP = if ($env:NV_SEGMENT_OVERLAP) { $env:NV_SEGMENT_OVERLAP } else { '0.3' }
  Write-Output "NV-Segment-CTMR connected: $resolvedNvSegmentDir"
}
if (-not $PostgresBin) {
  $initdb = Get-Command initdb.exe -ErrorAction SilentlyContinue
  if ($initdb) {
    $PostgresBin = Split-Path -Parent $initdb.Source
  } else {
    $postgresRoot = Join-Path $env:ProgramFiles 'PostgreSQL'
    $installation = Get-ChildItem -LiteralPath $postgresRoot -Directory -ErrorAction SilentlyContinue |
      Sort-Object Name -Descending |
      Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName 'bin\initdb.exe') } |
      Select-Object -First 1
    if ($installation) { $PostgresBin = Join-Path $installation.FullName 'bin' }
  }
}
if (-not $PostgresBin -or -not (Test-Path -LiteralPath (Join-Path $PostgresBin 'initdb.exe'))) {
  throw 'PostgreSQL tools were not found. Add them to PATH or set VMRB_POSTGRES_BIN.'
}
$PostgresBin | Set-Content -LiteralPath (Join-Path $previewRoot 'postgres-bin')
$passwordFile = Join-Path $previewRoot 'db-password'
if (-not (Test-Path -LiteralPath $passwordFile)) {
  & $pythonExe -c "import secrets,sys; from pathlib import Path; Path(sys.argv[1]).write_text(secrets.token_urlsafe(32))" $passwordFile
  if ($LASTEXITCODE -ne 0) { throw 'Cannot generate preview database password.' }
}
if (-not (Test-Path -LiteralPath (Join-Path $clusterRoot 'PG_VERSION'))) {
  & (Join-Path $PostgresBin 'initdb.exe') -D $clusterRoot -U vmrb --auth=scram-sha-256 "--pwfile=$passwordFile" --encoding=UTF8 --locale=C
  if ($LASTEXITCODE -ne 0) { throw 'Preview database initialization failed.' }
}
& (Join-Path $PostgresBin 'pg_ctl.exe') -D $clusterRoot status *> $null
if ($LASTEXITCODE -ne 0) {
  $pgArguments = @('-D', ('"' + $clusterRoot + '"'), '-l', ('"' + (Join-Path $previewRoot 'postgres.log') + '"'), '-o', ('"-h 127.0.0.1 -p ' + $DatabasePort + '"'), '-w', 'start')
  Start-Process -FilePath (Join-Path $PostgresBin 'pg_ctl.exe') -ArgumentList $pgArguments -WindowStyle Hidden | Out-Null
  $databaseReady = $false
  for ($i = 0; $i -lt 40; $i++) {
    & (Join-Path $PostgresBin 'pg_isready.exe') -h 127.0.0.1 -p $DatabasePort -U vmrb *> $null
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
Push-Location $backendRoot
try {
  & $pythonExe -m alembic upgrade head
  if ($LASTEXITCODE -ne 0) { throw 'Migration failed.' }
  if ($env:VMRB_DEMO_SCAN_DIR) {
    $env:VMRB_DEMO_SEED = '1'
    & $pythonExe -m app.demo
    if ($LASTEXITCODE -ne 0) { throw 'Preview data creation failed.' }
  }
} finally { Pop-Location }
$backendPidPath = Join-Path $previewRoot 'backend.pid'
$frontendPidPath = Join-Path $previewRoot 'frontend.pid'
foreach ($entry in @(@($backendPidPath, $BackendPort), @($frontendPidPath, $FrontendPort))) {
  if (Test-Path -LiteralPath $entry[0]) {
    $previous = Get-Process -Id ([int](Get-Content -LiteralPath $entry[0])) -ErrorAction SilentlyContinue
    if ($previous) { throw "Preview process already running on port $($entry[1]). Use scripts/stop-preview.ps1 before restarting." }
  }
}
$backendArgs = @('-m', 'uvicorn', 'app.main:create_app', '--factory', '--host', '127.0.0.1', '--port', $BackendPort, '--workers', '1', '--no-access-log')
$backendProcess = Start-Process -FilePath $pythonExe -ArgumentList $backendArgs -WorkingDirectory $backendRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $previewRoot 'backend.log') -RedirectStandardError (Join-Path $previewRoot 'backend-error.log')
$backendProcess.Id | Set-Content -LiteralPath $backendPidPath
$env:VITE_LOCAL_PREVIEW = 'false'
$env:VITE_PREVIEW = if ($env:VMRB_DEMO_SCAN_DIR) { 'true' } else { 'false' }
$env:VMRB_BACKEND_URL = 'http://127.0.0.1:' + $BackendPort
$nodeExe = (Get-Command node.exe).Source
$viteEntry = Join-Path $frontendRoot 'node_modules\vite\bin\vite.js'
$frontendProcess = Start-Process -FilePath $nodeExe -ArgumentList @(('"' + $viteEntry + '"'), '--host', '127.0.0.1', '--port', $FrontendPort) -WorkingDirectory $frontendRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $previewRoot 'frontend.log') -RedirectStandardError (Join-Path $previewRoot 'frontend-error.log')
$frontendProcess.Id | Set-Content -LiteralPath $frontendPidPath
$previewReady = $false
for ($i = 0; $i -lt 40; $i++) {
  try {
    $health = Invoke-RestMethod "http://127.0.0.1:$FrontendPort/health" -TimeoutSec 2
    if ($health.data.status -eq 'ok') { $previewReady = $true; break }
  } catch { Start-Sleep -Milliseconds 250 }
}
if (-not $previewReady) { throw 'Preview startup failed; inspect logs in .cache/preview and run stop-preview.ps1.' }
Write-Output "Preview starting: http://127.0.0.1:$FrontendPort"
Write-Output "Backend docs: http://127.0.0.1:$BackendPort/docs"
if ($env:VMRB_DEMO_SCAN_DIR) {
  Write-Output 'Demo accounts: admin, demo_doctor, demo_patient, test_patient / 123456'
} else {
  Write-Output 'No demo scans were configured; register a new account from the login page.'
}

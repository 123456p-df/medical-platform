$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$previewRoot = Join-Path $projectRoot '.cache\preview'
foreach ($name in @('frontend', 'backend')) {
  $pidPath = Join-Path $previewRoot ($name + '.pid')
  if (Test-Path -LiteralPath $pidPath) {
    $processId = [int](Get-Content -LiteralPath $pidPath)
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$processId"
    $expected = if ($name -eq 'frontend') { 'node_modules\vite\bin\vite.js' } else { 'app.main:create_app' }
    if ($processInfo -and $processInfo.CommandLine.Contains($expected)) { Stop-Process -Id $processId }
    elseif ($processInfo) { throw "PID $processId belongs to a different process; refusing to stop it." }
    Remove-Item -LiteralPath $pidPath
  }
}
$clusterRoot = Join-Path $previewRoot 'postgres'
if (Test-Path -LiteralPath (Join-Path $clusterRoot 'postmaster.pid')) {
  $postgresBinPath = Join-Path $previewRoot 'postgres-bin'
  if (-not (Test-Path -LiteralPath $postgresBinPath)) {
    throw 'Cannot locate the PostgreSQL installation used to start this preview.'
  }
  $postgresBin = (Get-Content -LiteralPath $postgresBinPath -Raw).Trim()
  & (Join-Path $postgresBin 'pg_ctl.exe') -D $clusterRoot -m fast -w stop
}
Write-Output 'Preview stopped; database and uploaded files have been retained.'

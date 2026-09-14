$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$previewRoot = Join-Path $projectRoot '.cache\preview'
foreach ($name in @('frontend', 'backend')) {
  $pidPath = Join-Path $previewRoot ($name + '.pid')
  if (Test-Path -LiteralPath $pidPath) {
    $processId = [int](Get-Content -LiteralPath $pidPath)
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$processId"
    $expected = if ($name -eq 'frontend') { 'medical-platform\Medical\node_modules\vite\bin\vite.js' } else { 'app.main:create_app' }
    if ($processInfo -and $processInfo.CommandLine.Contains($expected)) { Stop-Process -Id $processId }
    elseif ($processInfo) { throw "PID $processId belongs to a different process; refusing to stop it." }
    Remove-Item -LiteralPath $pidPath
  }
}
$clusterRoot = Join-Path $previewRoot 'postgres'
if (Test-Path -LiteralPath (Join-Path $clusterRoot 'postmaster.pid')) {
  & 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D $clusterRoot -m fast -w stop
}
Write-Output 'Preview stopped; database and uploaded files have been retained.'

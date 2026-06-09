param([switch]$Watch)

$ErrorActionPreference = 'Stop'
$ServerPort = 8766

$AppDir = (Get-Item (Split-Path $MyInvocation.MyCommand.Path -Parent)).Parent.FullName
$TestDir = Join-Path $AppDir 'tests'

Write-Host '=== BaZi Smoke Test ===' -ForegroundColor Cyan
Write-Host "App: $AppDir" -ForegroundColor Gray

# 1. Cleanup
Write-Host '[1/8] Cleanup...' -ForegroundColor Yellow
Get-Process -Name 'python' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Remove-Item "$AppDir\.playwright-cli" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Start HTTP server
Write-Host '[2/8] Starting HTTP server...' -ForegroundColor Yellow
$server = Start-Process -FilePath 'python' -ArgumentList "-m http.server $ServerPort -d $AppDir" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 2

try {
  $result = Invoke-WebRequest -Uri "http://127.0.0.1:$ServerPort/" -TimeoutSec 5 -UseBasicParsing
  if ($result.StatusCode -ne 200) { throw "HTTP $($result.StatusCode)" }
  Write-Host '  OK: Server running' -ForegroundColor Green
} catch {
  Write-Host "  FAIL: Server unreachable - $_" -ForegroundColor Red
  Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
  exit 1
}

# 3. Open browser
Write-Host '[3/8] Opening Playwright browser...' -ForegroundColor Yellow
$openOut = & playwright-cli -s=btest open "http://127.0.0.1:$ServerPort/" 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host "  FAIL: $openOut" -ForegroundColor Red
  Stop-Process -Id $server.Id -Force
  exit 1
}
Write-Host '  OK' -ForegroundColor Green

Start-Sleep -Seconds 1

# 4. Console check
Write-Host '[4/8] Console check...' -ForegroundColor Yellow
$consoleBefore = & playwright-cli -s=btest console 2>&1
$consoleLines = @($consoleBefore | Where-Object { $_ -match 'error|warn|exception' -and $_ -notmatch 'fonts\.googleapis|fonts\.gstatic' })
if ($consoleLines.Count -gt 0) {
  Write-Host "  WARN: $($consoleLines.Count) non-font errors:" -ForegroundColor Yellow
  $consoleLines | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
} else {
  Write-Host '  OK: No errors' -ForegroundColor Green
}

# 5. Run smoke test
Write-Host '[5/8] Running smoke test...' -ForegroundColor Yellow
$smokeScript = Get-Content -Raw (Join-Path $TestDir 'smoke.js')
$startResult = & playwright-cli -s=btest eval $smokeScript 2>&1
Write-Host "  done" -ForegroundColor Gray

# 6. Wait for completion
Write-Host '[6/8] Waiting for test completion...' -ForegroundColor Yellow
$maxWait = 15
$waited = 0
do {
  if ($waited -gt 0) { Start-Sleep -Seconds 1 }
  $waited++
  $done = & playwright-cli -s=btest eval 'window.__test && window.__test.done' 2>&1
  $doneStr = ($done | Out-String).Trim()
  $doneMatch = if ($doneStr -match '### Result\s*\n(true|false)') { $Matches[1] } else { $doneStr }
  Write-Host "  waiting... ($waited/$maxWait) done=$doneMatch" -ForegroundColor Gray
} while ($doneMatch -ne 'true' -and $waited -lt $maxWait)

# 7. Read results
Write-Host '[7/8] Test results:' -ForegroundColor Yellow
$raw = & playwright-cli -s=btest eval "window.__test.results.join('::')" 2>&1
$rawStr = ($raw | Out-String).Trim()

# Extract content: format is "### Result\n"value"\n### Ran Playwright..."
$content = ''
if ($rawStr -match '### Result\s*\n"(.+)"') {
  $content = $Matches[1]
} else {
  $content = $rawStr
}

$resultsArr = $content -split '::'

$passCount = 0
$failCount = 0
$failures = @()
foreach ($r in $resultsArr) {
  $r = $r.Trim()
  if ($r -match '^F:') {
    $failCount++
    $failures += $r
    Write-Host "  FAIL $($r.Substring(2))" -ForegroundColor Red
  } elseif ($r -match '^P:') {
    $passCount++
    Write-Host "  PASS $($r.Substring(2))" -ForegroundColor Green
  }
}

# 8. Cleanup
Write-Host '[8/8] Cleanup...' -ForegroundColor Yellow
& playwright-cli -s=btest close 2>&1 | Out-Null
Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
Remove-Item "$AppDir\.playwright-cli" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host '' -ForegroundColor Cyan
Write-Host '=== Summary ===' -ForegroundColor Cyan
if ($failCount -eq 0) {
  Write-Host "Pass: $passCount   Fail: $failCount" -ForegroundColor Green
} else {
  Write-Host "Pass: $passCount   Fail: $failCount" -ForegroundColor Red
  foreach ($f in $failures) { Write-Host "  $f" -ForegroundColor Red }
}

if ($Watch -and $failCount -gt 0) {
  Write-Host '' -ForegroundColor Gray
  Write-Host 'Press Enter to exit...'
  $null = Read-Host
}

exit $failCount

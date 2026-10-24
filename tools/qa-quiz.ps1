# qa-quiz.ps1 — 起一个临时 headless Chrome，批量跑 tools/qa-quiz.mjs，然后清理
# 用法：pwsh -File tools/qa-quiz.ps1 bx1-c4-s2 bx1-c5-s1 ...
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Slugs)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8

$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$port = 9333
$prof = Join-Path $env:TEMP ('qa-quiz-' + $PID)
if (Test-Path $prof) { Remove-Item $prof -Recurse -Force }

Start-Process -FilePath $chrome -ArgumentList @(
  '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
  "--user-data-dir=$prof", "--remote-debugging-port=$port", '--no-first-run', 'about:blank'
) | Out-Null
Start-Sleep -Seconds 3

try {
  $env:CDP = "http://127.0.0.1:$port"
  node (Join-Path $PSScriptRoot 'qa-quiz.mjs') @Slugs
  $code = $LASTEXITCODE
} finally {
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
    Where-Object { $_.CommandLine -like "*$prof*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  if (Test-Path $prof) { Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue }
}
exit $code

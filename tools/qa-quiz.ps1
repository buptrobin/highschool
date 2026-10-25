# qa-quiz.ps1 — 起一个临时 headless Chrome，批量跑 tools/qa-quiz.mjs，然后清理
# 用法：pwsh -File tools/qa-quiz.ps1 bx1-c4-s2 bx1-c5-s1 ...
#       pwsh -File tools/qa-quiz.ps1 -Subject bio bx1-c1-s1 ...
#
# 端口必须每次自己找一个空闲的：写死 9333 时多个组同时跑会连到别人的 Chrome，
# 拿到别页的数字（2026-10 生物组踩到过：q/hud 与本页题数对不上）。
param(
  [string]$Subject = 'geo',
  [Parameter(ValueFromRemainingArguments = $true)][string[]]$Slugs
)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8

$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'

function Get-FreePort {
  $l = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $l.Start()
  $p = ([System.Net.IPEndPoint]$l.LocalEndpoint).Port
  $l.Stop()
  return $p
}

# 起 Chrome 并等到它自己的调试端口真的有应答；万一端口被抢就换一个重来
$port = $null
$prof = $null
for ($try = 1; $try -le 3; $try++) {
  $candidate = Get-FreePort
  $candProf = Join-Path $env:TEMP ('qa-quiz-' + $PID + '-' + $candidate)
  if (Test-Path $candProf) { Remove-Item $candProf -Recurse -Force }
  Start-Process -FilePath $chrome -ArgumentList @(
    '--headless=new', '--disable-gpu', '--allow-file-access-from-files',
    "--user-data-dir=$candProf", "--remote-debugging-port=$candidate", '--no-first-run', 'about:blank'
  ) | Out-Null
  $ready = $false
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 300
    try {
      $v = Invoke-RestMethod -Uri "http://127.0.0.1:$candidate/json/version" -TimeoutSec 2
      if ($v.webSocketDebuggerUrl) { $ready = $true; break }
    } catch { }
  }
  if ($ready) { $port = $candidate; $prof = $candProf; break }
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
    Where-Object { $_.CommandLine -like "*$candProf*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}
if (-not $port) { Write-Error '无法启动带调试端口的 headless Chrome'; exit 2 }

try {
  $env:CDP = "http://127.0.0.1:$port"
  $env:QUIZ_SUBJ = $Subject
  node (Join-Path $PSScriptRoot 'qa-quiz.mjs') @Slugs
  $code = $LASTEXITCODE
} finally {
  Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
    Where-Object { $_.CommandLine -like "*$prof*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  if (Test-Path $prof) { Remove-Item $prof -Recurse -Force -ErrorAction SilentlyContinue }
}
exit $code

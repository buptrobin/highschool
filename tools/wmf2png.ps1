# wmf2png.ps1 —— 把 docx 里的公式 WMF 矢量图转成高清 PNG
#
# 为什么需要它：数学真题的公式在 docx 里是 Equation 3.0 OLE 对象，正文只留下一个
# 预览用的 WMF（word/media/imageN.wmf）。python-docx 读不到公式内容，只能把这个
# WMF 当图片用。PIL 也能开 WMF，但按 96dpi 出图，缩放到正文大小就糊；这里用 GDI+
# 画 Metafile（矢量，画多大都清晰）。
#
# 用法：
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\wmf2png.ps1 -InDir <wmf目录> -OutDir <png目录> [-Dpi 600]
#
# 注意：Metafile.Width/Height 的单位是 **1/100 毫米**，不是像素。直接拿它当像素会
# 得到 20000×5000 的巨图（第一版就这么翻车的），必须按 dpi 换算。
param(
  [Parameter(Mandatory = $true)][string]$InDir,
  [Parameter(Mandatory = $true)][string]$OutDir,
  [int]$Dpi = 600
)
Add-Type -AssemblyName System.Drawing
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }

$sw = [Diagnostics.Stopwatch]::StartNew()
$ok = 0; $fail = 0
foreach ($f in Get-ChildItem $InDir -Filter *.wmf) {
  $png = Join-Path $OutDir ($f.BaseName + ".png")
  if (Test-Path $png) { $ok++; continue }
  try {
    $mf = New-Object System.Drawing.Imaging.Metafile($f.FullName)
    $w = [int][Math]::Ceiling($mf.Width / 100.0 * $Dpi / 25.4)
    $h = [int][Math]::Ceiling($mf.Height / 100.0 * $Dpi / 25.4)
    if ($w -lt 1 -or $h -lt 1 -or $w -gt 8000 -or $h -gt 8000) { $fail++; continue }
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = 'HighQuality'
    $g.TextRenderingHint = 'AntiAliasGridFit'
    $g.PixelOffsetMode = 'HighQuality'
    $g.Clear([System.Drawing.Color]::White)
    $g.DrawImage($mf, (New-Object System.Drawing.Rectangle(0, 0, $w, $h)))
    $g.Dispose()
    $bmp.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose(); $mf.Dispose()
    $ok++
  } catch {
    $fail++
  }
}
$sw.Stop()
"wmf2png: 成功 $ok，失败 $fail，用时 $([math]::Round($sw.Elapsed.TotalSeconds,1)) 秒，dpi=$Dpi"

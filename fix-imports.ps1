$files = Get-ChildItem -Path "C:\Users\Marcos\Desktop\LavaPro\src" -Recurse -Include "*.tsx","*.ts"
foreach ($f in $files) {
  $c = Get-Content -Path $f.FullName -Raw
  if ($c -match 'react-router"') {
    $new = $c -replace 'react-router"', 'react-router-dom"'
    Set-Content -Path $f.FullName -Value $new -NoNewline
    Write-Host "Fixed: $($f.FullName)"
  }
}
Write-Host "Done."

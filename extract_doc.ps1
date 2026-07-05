Add-Type -AssemblyName 'WindowsBase'
$filePath = 'C:\Users\Abel ADIGUN\Desktop\repos\S.A.F.E\SAFE_AI_Mesh_Full_Project (1).docx'
$outPath = 'C:\Users\Abel ADIGUN\Desktop\repos\S.A.F.E\doc_text.txt'

$pkg = [System.IO.Packaging.Package]::Open($filePath)
$partUri = [System.Uri]::new('/word/document.xml', [System.UriKind]::Relative)
$part = $pkg.GetPart($partUri)
$sr = [System.IO.StreamReader]::new($part.GetStream())
$xml = $sr.ReadToEnd()
$sr.Close()
$pkg.Close()

$text = [System.Text.RegularExpressions.Regex]::Replace($xml, '<[^>]+>', '')
$text | Out-File -FilePath $outPath -Encoding utf8
Write-Host "Done"

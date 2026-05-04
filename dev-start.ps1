# dev-start.ps1 — Starts Prisma dev server then Next.js
# Usage: ./dev-start.ps1

Set-Location $PSScriptRoot

Write-Host "Starting Prisma dev server..." -ForegroundColor Cyan
$prismaOutput = npx prisma dev --detach 2>&1
$tcpLine = $prismaOutput | Select-String "postgres://"
if ($tcpLine) {
    $url = $tcpLine.ToString().Trim()
    Write-Host "Prisma server: $url" -ForegroundColor Green

    # Update both .env files with the new URL
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$url`""
    Set-Content ".env" $envContent.TrimEnd() -Encoding utf8

    $envLocalContent = Get-Content ".env.local" -Raw
    $envLocalContent = $envLocalContent -replace 'DATABASE_URL="[^"]*"', "DATABASE_URL=`"$url`""
    Set-Content ".env.local" $envLocalContent.TrimEnd() -Encoding utf8

    Write-Host "Updated .env and .env.local with new port" -ForegroundColor Green
}

Write-Host "Starting Next.js dev server..." -ForegroundColor Cyan
npm run dev

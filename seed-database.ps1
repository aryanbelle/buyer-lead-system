# Seed production database with sample data
$url = "https://buyer-lead-system-vercel-aeb2ywpfe-aryanbelles-projects.vercel.app/api/seed"

try {
    Write-Host "Seeding production database..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json"
    Write-Host "Seed response:" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Error seeding database:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

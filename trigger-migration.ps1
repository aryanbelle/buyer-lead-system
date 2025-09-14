# Trigger migration on production
$url = "https://buyer-lead-system-vercel-gus8u18vw-aryanbelles-projects.vercel.app/api/migrate"

try {
    Write-Host "Triggering database migration..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $url -Method POST -ContentType "application/json"
    Write-Host "Migration response:" -ForegroundColor Green
    Write-Host $response.Content
} catch {
    Write-Host "Error triggering migration:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

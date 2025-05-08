# Test script for recommendations POST endpoint
$baseUrl = "http://localhost:3000"
$endpoint = "/api/recommendations"
$url = $baseUrl + $endpoint

Write-Host "Testing POST $endpoint endpoint..."
Write-Host "Sending request to $url"

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -ContentType "application/json" -ErrorVariable $restError

    Write-Host "`nResponse Status: Success"
    Write-Host "`nResponse Body:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError occurred:" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    $errorDetails = $_.ErrorDetails
    if (-not $errorDetails) {
        $rawResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($rawResponse)
        $errorDetails = $reader.ReadToEnd()
    }
    
    Write-Host "`nError Details:"
    $errorDetails | ConvertFrom-Json | ConvertTo-Json -Depth 10
} 
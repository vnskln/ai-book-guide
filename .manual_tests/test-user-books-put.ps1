# Test script for user-books PUT endpoint
param(
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:3000",
    [Parameter(Mandatory=$false)]
    [string]$BookId
)

# Constants for user book statuses
$READ_STATUS = "read"
$TO_READ_STATUS = "to_read"
$REJECTED_STATUS = "rejected"

# Test statistics
$stats = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    StartTime = Get-Date
}

# Function to make PUT request to user-books endpoint
function Update-UserBook {
    param(
        [Parameter(Mandatory=$true)]
        [string]$BookId,
        [Parameter(Mandatory=$true)]
        [string]$Status,
        [Parameter(Mandatory=$false)]
        [Nullable[bool]]$Rating,
        [Parameter(Mandatory=$true)]
        [int]$ExpectedStatus
    )

    $endpoint = "$BaseUrl/api/user-books?id=$BookId"
    $headers = @{
        "Content-Type" = "application/json"
    }

    $body = @{
        status = $Status
    }
    if ($null -ne $Rating) {
        $body.rating = $Rating
    }

    $bodyJson = $body | ConvertTo-Json

    Write-Host "`nRequest Details:" -ForegroundColor Cyan
    Write-Host "  URL: $endpoint" -ForegroundColor Gray
    Write-Host "  Method: PUT" -ForegroundColor Gray
    Write-Host "  Request Body:" -ForegroundColor Gray
    Write-Host "  $bodyJson" -ForegroundColor Gray

    $startTime = Get-Date
    try {
        $webRequest = Invoke-WebRequest -Uri $endpoint -Method Put -Headers $headers -Body $bodyJson -ContentType "application/json" -ErrorVariable restError
        $response = $webRequest.Content | ConvertFrom-Json
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds

        Write-Host "`nResponse Details:" -ForegroundColor Cyan
        Write-Host "  Status: Success" -ForegroundColor Green
        Write-Host "  Status Code: $($webRequest.StatusCode)" -ForegroundColor Green
        Write-Host "  Duration: $($duration.ToString('0.00'))ms" -ForegroundColor Gray
        Write-Host "  Response Body:" -ForegroundColor Gray
        Write-Host "  $($response | ConvertTo-Json)" -ForegroundColor Gray

        if ($webRequest.StatusCode -eq $ExpectedStatus) {
            $script:stats.PassedTests++
            Write-Host "`nTest Result: OK" -ForegroundColor Green
        } else {
            $script:stats.FailedTests++
            Write-Host "`nTest Result: NOK" -ForegroundColor Red
            Write-Host "Expected status $ExpectedStatus but got $($webRequest.StatusCode)" -ForegroundColor Red
        }
        Write-Host "Duration: $($duration.ToString('0.00'))ms" -ForegroundColor Gray
        
        # Add 10 second sleep after test
        Write-Host "`nSleeping for 10 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        return $true
    }
    catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorDetails = $_.ErrorDetails.Message
        if (-not $errorDetails) {
            $errorDetails = $_.Exception.Message
        }

        Write-Host "`nResponse Details:" -ForegroundColor Cyan
        Write-Host "  Status: Failed" -ForegroundColor Red
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $errorDetails" -ForegroundColor Red
        Write-Host "  Duration: $($duration.ToString('0.00'))ms" -ForegroundColor Gray

        if ($statusCode -eq $ExpectedStatus) {
            $script:stats.PassedTests++
            Write-Host "`nTest Result: OK (expected error)" -ForegroundColor Green
        } else {
            $script:stats.FailedTests++
            Write-Host "`nTest Result: NOK" -ForegroundColor Red
            Write-Host "Expected status $ExpectedStatus but got $statusCode" -ForegroundColor Red
        }
        Write-Host "Duration: $($duration.ToString('0.00'))ms" -ForegroundColor Gray
        
        # Add 10 second sleep after test
        Write-Host "`nSleeping for 10 seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        return $false
    }
}

# Function to run all test cases
function Test-UserBookEndpoint {
    param(
        [Parameter(Mandatory=$true)]
        [string]$BookId
    )

    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host "Starting user books PUT endpoint tests..." -ForegroundColor Cyan
    Write-Host "Started at: $($stats.StartTime)" -ForegroundColor Cyan
    Write-Host "Book ID: $BookId" -ForegroundColor Cyan
    Write-Host "============================================`n" -ForegroundColor Cyan

    # Test Case 1: Update to READ status with positive rating
    $script:stats.TotalTests++
    Write-Host "`nTest Case #$($stats.TotalTests)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "Name: Update to READ status with positive rating" -ForegroundColor Yellow
    Write-Host "Expected Status: 200" -ForegroundColor Yellow
    Update-UserBook -BookId $BookId -Status $READ_STATUS -Rating $true -ExpectedStatus 200

    # Test Case 2: Update to READ status with negative rating
    $script:stats.TotalTests++
    Write-Host "`nTest Case #$($stats.TotalTests)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "Name: Update to READ status with negative rating" -ForegroundColor Yellow
    Write-Host "Expected Status: 200" -ForegroundColor Yellow
    Update-UserBook -BookId $BookId -Status $READ_STATUS -Rating $false -ExpectedStatus 200

    # Test Case 3: Update to TO_READ status (rating should be null)
    $script:stats.TotalTests++
    Write-Host "`nTest Case #$($stats.TotalTests)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "Name: Update to TO_READ status" -ForegroundColor Yellow
    Write-Host "Expected Status: 200" -ForegroundColor Yellow
    Update-UserBook -BookId $BookId -Status $TO_READ_STATUS -ExpectedStatus 200

    # Test Case 4: Update to REJECTED status (rating should be null)
    $script:stats.TotalTests++
    Write-Host "`nTest Case #$($stats.TotalTests)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "Name: Update to REJECTED status" -ForegroundColor Yellow
    Write-Host "Expected Status: 200" -ForegroundColor Yellow
    Update-UserBook -BookId $BookId -Status $REJECTED_STATUS -ExpectedStatus 200

    # Test Case 5: Invalid case - READ status without rating (should fail)
    $script:stats.TotalTests++
    Write-Host "`nTest Case #$($stats.TotalTests)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "Name: Invalid case - READ status without rating" -ForegroundColor Yellow
    Write-Host "Expected Status: 400" -ForegroundColor Yellow
    Update-UserBook -BookId $BookId -Status $READ_STATUS -ExpectedStatus 400

    # Test Case 6: Invalid book ID
    $script:stats.TotalTests++
    Write-Host "`nTest Case #$($stats.TotalTests)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "Name: Invalid book ID" -ForegroundColor Yellow
    Write-Host "Expected Status: 500" -ForegroundColor Yellow
    Update-UserBook -BookId "1af97d00-5293-4e02-ace6-68144d4272f0" -Status $TO_READ_STATUS -ExpectedStatus 500

    # Print test summary
    $endTime = Get-Date
    $totalDuration = ($endTime - $stats.StartTime).TotalSeconds

    Write-Host "`n============================================" -ForegroundColor Cyan
    Write-Host "Test Summary" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "Total Tests: $($stats.TotalTests)" -ForegroundColor White
    Write-Host "Passed: $($stats.PassedTests)" -ForegroundColor Green
    Write-Host "Failed: $($stats.FailedTests)" -ForegroundColor Red
    Write-Host "Total Duration: $($totalDuration.ToString('0.00'))s" -ForegroundColor White
    Write-Host "Started: $($stats.StartTime)" -ForegroundColor White
    Write-Host "Finished: $($endTime)" -ForegroundColor White
    Write-Host "============================================`n" -ForegroundColor Cyan
}

# Main execution
if (-not $BookId) {
    Write-Host "Please provide a book ID using the -BookId parameter" -ForegroundColor Red
    Write-Host "Example: .\test-user-books-put.ps1 -BookId 'your-book-id' [-BaseUrl 'http://your-base-url']"
    exit 1
}

# Run all test cases
Test-UserBookEndpoint -BookId $BookId 
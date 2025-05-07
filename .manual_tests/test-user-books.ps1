# Test script for user books endpoints

# Configuration
$baseUrl = "http://localhost:3000/api"
$headers = @{
    "Content-Type" = "application/json"
}


# Test statistics
$stats = @{
    TotalTests = 0
    PassedTests = 0
    FailedTests = 0
    StartTime = Get-Date
}

# Helper function to make HTTP requests
function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Endpoint,
        $Body
    )
    
    $url = "$baseUrl/$Endpoint"
    $bodyJson = $null
    if ($Body) {
        $bodyJson = $Body | ConvertTo-Json -Depth 10
    }
    
    Write-Host "`nRequest Details:" -ForegroundColor Cyan
    Write-Host "  URL: $url" -ForegroundColor Gray
    Write-Host "  Method: $Method" -ForegroundColor Gray
    if ($Body) {
        Write-Host "  Request Body:" -ForegroundColor Gray
        Write-Host "  $(($Body | ConvertTo-Json -Depth 10))" -ForegroundColor Gray
    }
    
    $startTime = Get-Date
    try {
        $webRequest = Invoke-WebRequest -Method $Method -Uri $url -Headers $headers -Body $bodyJson -ContentType "application/json"
        $response = $webRequest.Content | ConvertFrom-Json
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "`nResponse Details:" -ForegroundColor Cyan
        Write-Host "  Status: Success" -ForegroundColor Green
        Write-Host "  Status Code: $($webRequest.StatusCode)" -ForegroundColor Green
        Write-Host "  Duration: $($duration.ToString('0.00'))ms" -ForegroundColor Gray
        
        return @{
            Success = $true
            Data = $response
            StatusCode = $webRequest.StatusCode
            Duration = $duration
        }
    }
    catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.ErrorDetails.Message
        if (-not $errorMessage) {
            $errorMessage = $_.Exception.Message
        }
        
        Write-Host "`nResponse Details:" -ForegroundColor Cyan
        Write-Host "  Status: Failed" -ForegroundColor Red
        Write-Host "  Status Code: $statusCode" -ForegroundColor Red
        Write-Host "  Error: $errorMessage" -ForegroundColor Red
        Write-Host "  Duration: $($duration.ToString('0.00'))ms" -ForegroundColor Gray
        
        return @{
            Success = $false
            StatusCode = $statusCode
            Error = $errorMessage
            Duration = $duration
        }
    }
}

# Test cases
$testCases = @(
    @{
        Name = "Create book with READ status and rating"
        Body = @{
            book = @{
                title = "The Pragmatic Programmer"
                language = "en"
                authors = @(
                    @{
                        name = "Dave Thomas"
                    },
                    @{
                        name = "Andy Hunt"
                    }
                )
            }
            status = "read"
            rating = $true
        }
        ExpectedStatus = 201
    },
    @{
        Name = "Create book with TO_READ status"
        Body = @{
            book = @{
                title = "Clean Code"
                language = "en"
                authors = @(
                    @{
                        name = "Robert C. Martin"
                    }
                )
            }
            status = "to_read"
        }
        ExpectedStatus = 201
    },
    @{
        Name = "Create book with REJECTED status"
        Body = @{
            book = @{
                title = "Design Patterns"
                language = "en"
                authors = @(
                    @{
                        name = "Erich Gamma"
                    },
                    @{
                        name = "Richard Helm"
                    }
                )
            }
            status = "rejected"
        }
        ExpectedStatus = 201
    },
    @{
        Name = "Create book with invalid status"
        Body = @{
            book = @{
                title = "Invalid Book"
                language = "en"
                authors = @(
                    @{
                        name = "Test Author"
                    }
                )
            }
            status = "invalid_status"
        }
        ExpectedStatus = 400
    },
    @{
        Name = "Create READ book without rating"
        Body = @{
            book = @{
                title = "Missing Rating Book"
                language = "en"
                authors = @(
                    @{
                        name = "Test Author"
                    }
                )
            }
            status = "read"
        }
        ExpectedStatus = 400
    }
)

# Run tests
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "Starting user books endpoint tests..." -ForegroundColor Cyan
Write-Host "Started at: $($stats.StartTime)" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

foreach ($test in $testCases) {
    $stats.TotalTests++
    Write-Host "`nTest Case #$($stats.TotalTests)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "Name: $($test.Name)" -ForegroundColor Yellow
    Write-Host "Expected Status: $($test.ExpectedStatus)" -ForegroundColor Yellow
    
    $response = Invoke-ApiRequest -Method "POST" -Endpoint "user-books" -Body $test.Body
    
    if ($response.Success) {
        if ($response.StatusCode -eq $test.ExpectedStatus) {
            $stats.PassedTests++
            Write-Host "`nTest Result: OK" -ForegroundColor Green
            Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
            Write-Host "Duration: $($response.Duration.ToString('0.00'))ms" -ForegroundColor Gray
        }
        else {
            $stats.FailedTests++
            Write-Host "`nTest Result: NOK" -ForegroundColor Red
            Write-Host "Expected status $($test.ExpectedStatus) but got $($response.StatusCode)" -ForegroundColor Red
            Write-Host "Duration: $($response.Duration.ToString('0.00'))ms" -ForegroundColor Gray
        }
    }
    else {
        if ($response.StatusCode -eq $test.ExpectedStatus) {
            $stats.PassedTests++
            Write-Host "`nTest Result: OK (expected error)" -ForegroundColor Green
            Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
            Write-Host "Error: $($response.Error)" -ForegroundColor Gray
            Write-Host "Duration: $($response.Duration.ToString('0.00'))ms" -ForegroundColor Gray
        }
        else {
            $stats.FailedTests++
            Write-Host "`nTest Result: NOK" -ForegroundColor Red
            Write-Host "Expected status $($test.ExpectedStatus) but got $($response.StatusCode)" -ForegroundColor Red
            Write-Host "Error: $($response.Error)" -ForegroundColor Red
            Write-Host "Duration: $($response.Duration.ToString('0.00'))ms" -ForegroundColor Gray
        }
    }
}

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
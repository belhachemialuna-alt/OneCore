# PowerShell script to stop all processes on port 5000
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  STOPPING ALL PROCESSES ON PORT 5000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get all processes listening on port 5000
$processes = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "Found $($processes.Count) process(es) on port 5000:" -ForegroundColor Yellow
    
    foreach ($pid in $processes) {
        try {
            $process = Get-Process -Id $pid -ErrorAction Stop
            Write-Host "  - PID $pid ($($process.ProcessName))" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
            Write-Host "    ✓ Killed PID $pid" -ForegroundColor Green
        } catch {
            Write-Host "    ✗ Could not kill PID $pid" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "Waiting 2 seconds..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    
    # Verify all killed
    $remaining = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host "⚠ Some processes still running on port 5000" -ForegroundColor Red
    } else {
        Write-Host "✓ Port 5000 is now free!" -ForegroundColor Green
    }
} else {
    Write-Host "No processes found on port 5000" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

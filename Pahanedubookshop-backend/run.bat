@echo off
echo Starting Pahana Edu Bookshop Backend...
echo.

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo Error: Java is not installed or not in PATH
    echo Please install Java 17 or higher
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if errorlevel 1 (
    echo Error: Maven is not installed or not in PATH
    echo Please install Maven 3.6 or higher
    pause
    exit /b 1
)

echo Building the project...
mvn clean package

if errorlevel 1 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo Starting the server on http://localhost:8080
echo Press Ctrl+C to stop the server
echo.

java -jar target/pahana-backend-1.0.0.jar

pause 
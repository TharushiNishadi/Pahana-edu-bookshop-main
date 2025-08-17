@echo off
echo ========================================
echo Pahana Edu Bookshop Backend
echo ========================================
echo.

echo Cleaning previous build...
call mvn clean

echo.
echo Compiling project...
call mvn compile

echo.
echo Running application...
call mvn exec:java -Dexec.mainClass="com.pahana.backend.Main"

pause 
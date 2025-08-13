#!/bin/bash

echo "Starting Pahana Edu Bookshop Backend..."
echo

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed or not in PATH"
    echo "Please install Java 17 or higher"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven is not installed or not in PATH"
    echo "Please install Maven 3.6 or higher"
    exit 1
fi

echo "Building the project..."
mvn clean package

if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi

echo
echo "Starting the server on http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo

java -jar target/pahana-backend-1.0.0.jar 
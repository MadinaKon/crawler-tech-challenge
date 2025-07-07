#!/bin/bash

# Cypress Test Runner Script
# This script helps run Cypress tests with proper setup

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a service is running
check_service() {
    local url=$1
    local service_name=$2
    
    if curl -s "$url" > /dev/null 2>&1; then
        print_success "$service_name is running at $url"
        return 0
    else
        print_error "$service_name is not running at $url"
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        print_status "Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start after $max_attempts attempts"
    return 1
}

# Function to start services
start_services() {
    print_status "Starting Docker services..."
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed"
        exit 1
    fi
    
    # Start backend and database
    docker-compose up -d
    
    # Wait for services to be ready
    wait_for_service "http://localhost:8090/health" "Backend API" || {
        print_error "Backend failed to start"
        docker-compose logs backend
        exit 1
    }
    
    wait_for_service "http://localhost:3306" "MySQL Database" || {
        print_error "Database failed to start"
        docker-compose logs mysql
        exit 1
    }
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend development server..."
    
    # Check if frontend is already running
    if check_service "http://localhost:3000" "Frontend" > /dev/null 2>&1; then
        print_warning "Frontend is already running"
        return 0
    fi
    
    # Start frontend in background
    npm run dev &
    FRONTEND_PID=$!
    
    # Wait for frontend to be ready
    wait_for_service "http://localhost:3000" "Frontend" || {
        print_error "Frontend failed to start"
        kill $FRONTEND_PID 2>/dev/null || true
        exit 1
    }
    
    print_success "Frontend started with PID $FRONTEND_PID"
}

# Function to run tests
run_tests() {
    local test_suite=$1
    
    print_status "Running Cypress tests..."
    
    case $test_suite in
        "auth")
            print_status "Running authentication tests..."
            npm run test:e2e:auth
            ;;
        "dashboard")
            print_status "Running dashboard tests..."
            npm run test:e2e:dashboard
            ;;
        "details")
            print_status "Running crawl details tests..."
            npm run test:e2e:details
            ;;
        "journey")
            print_status "Running user journey tests..."
            npm run test:e2e:journey
            ;;
        "all"|"")
            print_status "Running all E2E tests..."
            npm run test:e2e
            ;;
        *)
            print_error "Unknown test suite: $test_suite"
            print_status "Available options: auth, dashboard, details, journey, all"
            exit 1
            ;;
    esac
}

# Function to cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Kill frontend if we started it
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Stop Docker services if requested
    if [ "$STOP_SERVICES" = "true" ]; then
        print_status "Stopping Docker services..."
        docker-compose down
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [TEST_SUITE]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -s, --start-services    Start Docker services before running tests"
    echo "  -f, --start-frontend    Start frontend development server"
    echo "  -c, --cleanup           Stop services after tests complete"
    echo "  -o, --open              Open Cypress Test Runner (interactive mode)"
    echo ""
    echo "Test Suites:"
    echo "  auth                    Authentication tests only"
    echo "  dashboard               Dashboard tests only"
    echo "  details                 Crawl details tests only"
    echo "  journey                 User journey tests only"
    echo "  all                     All E2E tests (default)"
    echo ""
    echo "Examples:"
    echo "  $0 --start-services --start-frontend all"
    echo "  $0 -s -f auth"
    echo "  $0 --open"
    echo "  $0 dashboard"
}

# Parse command line arguments
START_SERVICES=false
START_FRONTEND=false
STOP_SERVICES=false
OPEN_CYPRESS=false
TEST_SUITE="all"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -s|--start-services)
            START_SERVICES=true
            shift
            ;;
        -f|--start-frontend)
            START_FRONTEND=true
            shift
            ;;
        -c|--cleanup)
            STOP_SERVICES=true
            shift
            ;;
        -o|--open)
            OPEN_CYPRESS=true
            shift
            ;;
        auth|dashboard|details|journey|all)
            TEST_SUITE=$1
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Set up trap to cleanup on exit
trap cleanup EXIT

# Main execution
print_status "Cypress Test Runner"
print_status "==================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "cypress.config.ts" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
fi

# Start services if requested
if [ "$START_SERVICES" = "true" ]; then
    start_services
fi

# Start frontend if requested
if [ "$START_FRONTEND" = "true" ]; then
    start_frontend
fi

# Check if services are running
print_status "Checking service status..."
check_service "http://localhost:8090/health" "Backend API" || {
    print_warning "Backend is not running. Use -s to start services."
}

check_service "http://localhost:3000" "Frontend" || {
    print_warning "Frontend is not running. Use -f to start frontend."
}

# Run tests or open Cypress
if [ "$OPEN_CYPRESS" = "true" ]; then
    print_status "Opening Cypress Test Runner..."
    npm run cypress:open
else
    run_tests "$TEST_SUITE"
fi

print_success "Test execution completed!" 
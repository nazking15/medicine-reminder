#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting API tests..."

# Test 1: Health Check
echo -e "\n${GREEN}Testing health check endpoint...${NC}"
curl -s http://localhost:3000/health

# Test 2: Create a new medicine
echo -e "\n\n${GREEN}Testing medicine creation...${NC}"
MEDICINE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/medicines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Medicine",
    "dosage": "100mg",
    "frequency": [
      {"time": "09:00", "taken": false},
      {"time": "21:00", "taken": false}
    ],
    "notes": "Test notes",
    "userId": "test@example.com"
  }')
echo "$MEDICINE_RESPONSE"

# Extract the main medicine ID (not the frequency ID)
MEDICINE_ID=$(echo "$MEDICINE_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['_id'])")
echo -e "\n${GREEN}Created medicine ID: $MEDICINE_ID${NC}"

# Test 3: Get medicines for user
echo -e "\n${GREEN}Testing get medicines for user...${NC}"
curl -s http://localhost:3000/api/medicines/test@example.com

# Test 4: Update medicine
echo -e "\n\n${GREEN}Testing medicine update...${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH http://localhost:3000/api/medicines/$MEDICINE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "dosage": "200mg",
    "notes": "Updated test notes"
  }')
echo "$UPDATE_RESPONSE"

# Test 5: Get medicines again to verify update
echo -e "\n\n${GREEN}Testing get medicines after update...${NC}"
curl -s http://localhost:3000/api/medicines/test@example.com

# Test 6: Delete medicine
echo -e "\n\n${GREEN}Testing medicine deletion...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE http://localhost:3000/api/medicines/$MEDICINE_ID)
echo "$DELETE_RESPONSE"

echo -e "\n\n${GREEN}Tests completed!${NC}" 
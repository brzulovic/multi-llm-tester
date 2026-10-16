#!/usr/bin/env bash
# ==============================================================================
# Setup Script for Supabase Database
# ==============================================================================
# Usage:
#   ./scripts/setup_supabase.sh [DATABASE_URL]
# Or set environment variables:
#   export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"
#   ./scripts/setup_supabase.sh
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
SCHEMA_FILE="${SCRIPT_DIR}/supabase_schema.sql"

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  LLM Multi-Tester - Supabase Database Setup Script   ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check for DATABASE_URL argument or env variable
DB_URL="${1:-${DATABASE_URL:-${SUPABASE_DB_URL:-}}}"

# Load .env if present and DB_URL is still empty
if [ -z "${DB_URL}" ] && [ -f "${ROOT_DIR}/.env" ]; then
    echo -e "${YELLOW}Reading database configuration from .env...${NC}"
    # Read DATABASE_URL or SUPABASE_DB_URL from .env
    DB_URL=$(grep -E '^(DATABASE_URL|SUPABASE_DB_URL)=' "${ROOT_DIR}/.env" | head -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'") || true
fi

if [ ! -f "${SCHEMA_FILE}" ]; then
    echo -e "${RED}Error: Schema file not found at ${SCHEMA_FILE}${NC}"
    exit 1
fi

if [ -n "${DB_URL}" ]; then
    echo -e "${YELLOW}Applying schema to Supabase using connection string...${NC}"
    
    if command -v psql &> /dev/null; then
        echo -e "${BLUE}Found psql. Executing schema...${NC}"
        psql "${DB_URL}" -f "${SCHEMA_FILE}"
        echo -e "${GREEN}✓ Schema successfully applied to Supabase database!${NC}"
        exit 0
    else
        echo -e "${YELLOW}psql is not installed. Checking for Node.js / pg runner...${NC}"
        node "${SCRIPT_DIR}/init_supabase.mjs" "${DB_URL}"
        exit 0
    fi
fi

# If DB_URL is not set, check if Supabase CLI is available
if command -v supabase &> /dev/null; then
    echo -e "${BLUE}Detected Supabase CLI. Checking project status...${NC}"
    echo -e "${YELLOW}You can run 'supabase db push' or link your project with 'supabase link'.${NC}"
fi

echo -e "${YELLOW}No direct DATABASE_URL connection string provided.${NC}"
echo -e ""
echo -e "${BLUE}------------------------------------------------------${NC}"
echo -e "${BLUE} Option 1: Apply via Supabase Dashboard (Recommended) ${NC}"
echo -e "${BLUE}------------------------------------------------------${NC}"
echo -e "1. Open your Supabase project: ${GREEN}https://supabase.com/dashboard${NC}"
echo -e "2. Go to ${YELLOW}SQL Editor${NC} -> ${YELLOW}New Query${NC}"
echo -e "3. Copy & paste the contents of: ${GREEN}${SCHEMA_FILE}${NC}"
echo -e "4. Click ${GREEN}Run${NC}."
echo -e ""
echo -e "${BLUE}------------------------------------------------------${NC}"
echo -e "${BLUE} Option 2: Apply using Makefile with connection string${NC}"
echo -e "${BLUE}------------------------------------------------------${NC}"
echo -e "Run the following command:"
echo -e "  ${GREEN}make supabase-init DATABASE_URL=\"postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres\"${NC}"
echo -e ""
echo -e "${BLUE}------------------------------------------------------${NC}"
echo -e "${BLUE} Option 3: Configure frontend with Supabase API keys  ${NC}"
echo -e "${BLUE}------------------------------------------------------${NC}"
echo -e "Add these to your .env or the UI Settings:"
echo -e "  ${GREEN}VITE_SUPABASE_URL=https://[PROJECT-REF].supabase.co${NC}"
echo -e "  ${GREEN}VITE_SUPABASE_ANON_KEY=[YOUR-ANON-PUBLIC-KEY]${NC}"
echo -e "  ${GREEN}VITE_SUPABASE_TABLE_PREFIX=llm_tester_${NC}"
echo -e ""
echo -e "${GREEN}✓ Schema file is ready at: ${SCHEMA_FILE}${NC}"
exit 0

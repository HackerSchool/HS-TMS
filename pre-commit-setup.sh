#!/bin/bash

# Destination path for the pre-commit hook
hook_destination=".git/hooks/pre-commit"

# Content of the pre-commit hook script
hook_content=$(cat << 'EOF'
#!/bin/bash

# Run frontend Prettier Check
cd frontend
npm run prettier:check
frontend_status=$?
cd ..

# Run backend Prettier Check
cd backend
npm run prettier:check
backend_status=$?
cd ..

# Exit with a non-zero status if either check fails
if [ $frontend_status -ne 0 -o $backend_status -ne 0 ]; then
  echo -e "\nPrettier Check failed. Please fix the formatting issues before committing."
  exit 1
fi
EOF
)

# Check if the pre-commit hook already exists
if [ -e "$hook_destination" ]; then
  echo "A pre-commit hook already exists. Please remove it before running this script."
  exit 1
fi

# Create the pre-commit hook script in the hooks directory
echo "$hook_content" > "$hook_destination"

# Make the pre-commit hook script executable
chmod +x "$hook_destination"

echo "Pre-commit hook installed successfully."

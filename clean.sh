#!/bin/bash

# Array of directories
directories=(
  "./helpers/"
  "./orm/"
  "./parser/"
  "./queue/"
  "./router-api/"
  "./workers/"
)

# Loop through each directory and delete node_modules
for dir in "${directories[@]}"; do
  echo "Deleting node_modules in $dir"
  rm -rf "$dir/node_modules"
  if [ $? -ne 0 ]; then
    echo "Failed to delete node_modules in $dir. Aborting."
    exit 1
  fi
done

echo "node_modules deleted in all directories."

#!/bin/bash

# Array of directories
directories=(
  "./helpers/"
  "./orm/"
  "./parser/"
  "./queue/"
  "./router-api/"
  "./workers/"
)

# Loop through each directory and run yarn
for dir in "${directories[@]}"; do
  echo "Running yarn in $dir"
  (cd "$dir" && yarn)
  if [ $? -ne 0 ]; then
    echo "yarn failed in $dir. Aborting."
    exit 1
  fi
done

echo "yarn succeeded in all directories."

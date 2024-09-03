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

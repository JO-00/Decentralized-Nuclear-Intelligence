#!/usr/bin/bash

ENV_FILE="./frontend/.env.example"
KEY="VITE_PROJECT_ID"

echo "============================================"
echo "           _       _   _                 "
echo "     /\   | |    | | | |        (_)      "
echo "    /  \  | | ___| |_| |__   ___ _  __ _ "
echo "   / /\ \ | |/ _ \ __| '_ \ / _ \ |/ _  |"
echo "  / ____ \| |  __/ |_| | | | |  __/ | (_| |"
echo " /_/    \_\_|\___|\__|_| |_|\___|_|\__,_|"
echo
echo "============================================"

echo "Welcome to Aletheia"
echo "You can provide a Vite project ID or use the default."
read -r -p "Enter your project ID (default=-1): " project_id

project_id=${project_id:--1}

if [[ "$project_id" == "-1" ]]; then
  echo "Using the default project ID."
else
  if [[ ! -f "$ENV_FILE" ]]; then
    echo "Error: Environment file not found: $ENV_FILE"
    exit 1
  fi

  if grep -q "^${KEY}=" "$ENV_FILE"; then
    sed -i "s|^${KEY}=.*|${KEY}=${project_id}|" "$ENV_FILE"
  else
    echo "${KEY}=${project_id}" >>"$ENV_FILE"
  fi

  echo "Updated $KEY in $ENV_FILE."
fi
cp $ENV_FILE ./frontend/.env

docker compose up

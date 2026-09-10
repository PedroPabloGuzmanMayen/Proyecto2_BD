#!/bin/bash
set -euo pipefail

DB="proyecto2"
SEED_DIR="/data/seed"

echo "[seed] Importando datos a '$DB' ..."

mongoimport --jsonArray --db "$DB" --collection users --file "$SEED_DIR/users.json"
mongoimport --jsonArray --db "$DB" --collection restaurants --file "$SEED_DIR/restaurants.json"
mongoimport --jsonArray --db "$DB" --collection reviews --file "$SEED_DIR/reviews.json"
mongoimport --jsonArray --db "$DB" --collection orders --file "$SEED_DIR/orders.json"

echo "[seed] Base de datos '$DB' lista."
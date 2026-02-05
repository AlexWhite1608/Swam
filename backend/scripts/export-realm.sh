#!/bin/bash

# --- RILEVAMENTO PERCORSI ---
# Ottieni il percorso assoluto della cartella dove si trova questo script (cioè .../Swam/backend)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# --- CONFIGURAZIONE ---
CONTAINER_NAME="swam-keycloak"
REALM_NAME="swam-realm"
# Salviamo il file nella cartella 'keycloak-config' accanto allo script
LOCAL_CONFIG_DIR="$SCRIPT_DIR/keycloak-config"
EXPORT_PATH_IN_CONTAINER="/opt/keycloak/data/import"
GENERATED_FILE_NAME="${REALM_NAME}-realm.json"
FINAL_FILE_NAME="realm-export.json"

# --- 1. PREPARAZIONE ---
echo "🔄 Inizio procedura di export per il realm: $REALM_NAME"

# Crea la cartella se non esiste
mkdir -p "$LOCAL_CONFIG_DIR"

# --- 2. ESECUZIONE EXPORT DENTRO DOCKER ---
echo "📦 Esportazione configurazione dentro il container..."
# Nota: Usiamo docker exec, quindi funziona ovunque tu sia nel terminale
docker exec $CONTAINER_NAME /opt/keycloak/bin/kc.sh export \
    --dir $EXPORT_PATH_IN_CONTAINER \
    --realm $REALM_NAME \
    --users realm_file

# --- 3. COPIA FILE SU HOST ---
echo "📥 Copia del file esportato in $LOCAL_CONFIG_DIR..."

docker cp "$CONTAINER_NAME:$EXPORT_PATH_IN_CONTAINER/$GENERATED_FILE_NAME" "$LOCAL_CONFIG_DIR/$FINAL_FILE_NAME"

# --- 4. PULIZIA CONTAINER ---
docker exec $CONTAINER_NAME rm "$EXPORT_PATH_IN_CONTAINER/$GENERATED_FILE_NAME"

echo "✅ Export completato!"
echo "📂 File salvato in: $LOCAL_CONFIG_DIR/$FINAL_FILE_NAME"
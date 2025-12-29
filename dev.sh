#!/bin/bash

# ==========================================
# 1. CONFIGURAZIONE MAVEN (IntelliJ Bundled)
# ==========================================
# Questo è il percorso dove IntelliJ nasconde il suo Maven interno su Mac.
# Le virgolette sono importanti perché c'è uno spazio in "IntelliJ IDEA.app"
MVN_CMD="/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3/bin/mvn"

# ==========================================
# SWAM HELPER SCRIPT
# ==========================================

if [ $# -eq 0 ]; then
    echo "❌ Errore: Specifica almeno un servizio da aggiornare o 'all'."
    exit 1
fi

INPUT_ARGS="$@"
MVN_MODULES=""
DOCKER_SERVICES=""

if [ "$1" == "all" ]; then
    echo "🌍 Modalità ALL: Ricompilazione e riavvio di TUTTO il sistema..."

    # MODIFICA QUI: Usa $MVN_CMD invece di ./mvnw
    "$MVN_CMD" clean package -DskipTests

    if [ $? -ne 0 ]; then
        echo "💥 Maven Build Fallita!"
        exit 1
    fi

    docker-compose up -d --build --force-recreate
    echo "✅ Tutto aggiornato con successo!"
    exit 0
fi

for arg in $INPUT_ARGS; do
    case $arg in
        resource|resource-service)
            MVN_MODULES="${MVN_MODULES},resource-service"
            DOCKER_SERVICES="${DOCKER_SERVICES} resource-service"
            ;;
        pricing|pricing-service)
            MVN_MODULES="${MVN_MODULES},pricing-service"
            DOCKER_SERVICES="${DOCKER_SERVICES} pricing-service"
            ;;
        booking|booking-service)
            MVN_MODULES="${MVN_MODULES},booking-service"
            DOCKER_SERVICES="${DOCKER_SERVICES} booking-service"
            ;;
        gateway)
            MVN_MODULES="${MVN_MODULES},gateway"
            DOCKER_SERVICES="${DOCKER_SERVICES} gateway"
            ;;
        kernel|shared-kernel)
            echo "⚠️ Attenzione: Se cambi il Shared Kernel, è meglio usare './dev.sh all'."
            MVN_MODULES="${MVN_MODULES},shared-kernel"
            ;;
        *)
            echo "⚠️ Servizio '$arg' non riconosciuto. Ignorato."
            ;;
    esac
done

MVN_MODULES=${MVN_MODULES:1}

if [ -z "$MVN_MODULES" ]; then
    echo "❌ Nessun servizio valido selezionato."
    exit 1
fi

echo "🚀 Compilazione moduli: $MVN_MODULES ..."

# MODIFICA QUI: Usa $MVN_CMD invece di ./mvnw
"$MVN_CMD" clean package -DskipTests -pl $MVN_MODULES -am

if [ $? -ne 0 ]; then
    echo "💥 Maven Build Fallita! Interrompo Docker."
    exit 1
fi

echo "🐳 Riavvio Container Docker: $DOCKER_SERVICES ..."
docker-compose up -d --build --force-recreate $DOCKER_SERVICES

echo "✅ Operazione completata per: $DOCKER_SERVICES"
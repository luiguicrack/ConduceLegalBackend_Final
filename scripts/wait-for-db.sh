#!/bin/sh

set -e

host="$1"
shift
cmd="$@"

echo "⏳ Esperando a que MySQL esté disponible en $host..."

while ! mysqladmin ping -h"$host" -P"3306" --silent; do
    echo "⏳ MySQL no está listo aún..."
    sleep 2
done

echo "✅ MySQL está listo! Ejecutando: $cmd"
exec $cmd
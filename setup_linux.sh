#!/bin/bash

# =====================================================
# Script de Configuração para Servidores Linux
# Proposito: Automatizar permissões e pastas
# =====================================================

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando configuração do ambiente Linux...${NC}"

# 1. Identificar usuário do servidor web
if [ -d "/etc/debian_version" ]; then
    WEB_USER="www-data"
else
    WEB_USER="nginx"
fi

echo -e "Usuário detectado para o servidor: ${GREEN}$WEB_USER${NC}"

# 2. Criar pastas necessárias
echo "Criando diretório do banco de dados..."
mkdir -p backend/database

# 3. Ajustar permissões
echo "Ajustando permissões de proprietário (chown)..."
sudo chown -R $WEB_USER:$WEB_USER backend/database
sudo chown -R $WEB_USER:$WEB_USER backend/vendor 2>/dev/null || echo "Vendor ainda não criado."

echo "Ajustando permissões de escrita (chmod)..."
sudo chmod -R 775 backend/database

# 4. Verificar extensões PHP
echo -e "\n${GREEN}Verificando extensões PHP instaladas:${NC}"
EXTS=("openssl" "mbstring" "json" "curl")
for ext in "${EXTS[@]}"; do
    if php -m | grep -qi "$ext"; then
        echo -e "[ OK ] $ext"
    else
        echo -e "[ ERRO ] $ext NÃO ENCONTRADA"
        MISSING+="$ext "
    fi
done

if [ ! -z "$MISSING" ]; then
    echo -e "\n${RED}Atenção: Instale as extensões ausentes:${NC}"
    echo "sudo apt install php-$MISSING"
fi

# 5. Composer
if [ -f "backend/composer.json" ]; then
    echo -e "\n${GREEN}Dica: Não esqueça de rodar 'composer install' dentro da pasta backend!${NC}"
fi

echo -e "\n${GREEN}Configuração concluída com sucesso!${NC}"

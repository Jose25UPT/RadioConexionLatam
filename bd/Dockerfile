# Imagen oficial de MySQL
FROM mysql:8.0

# Variables de entorno para configurar MySQL
ENV MYSQL_ROOT_PASSWORD=radio_conexion_2024
ENV MYSQL_DATABASE=radio_conexion_db
ENV MYSQL_USER=radio_user
ENV MYSQL_PASSWORD=radio_pass_2024

# Copiar scripts de inicialización
COPY ./init/ /docker-entrypoint-initdb.d/

# Copiar archivo de configuración personalizado
COPY ./conf/my.cnf /etc/mysql/conf.d/

# Exponer puerto
EXPOSE 3306

# Configuración de charset
ENV MYSQL_CHARSET=utf8mb4
ENV MYSQL_COLLATION=utf8mb4_unicode_ci
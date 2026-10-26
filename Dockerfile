
FROM php:8.3-apache

RUN sed -i 's/Listen 80/Listen 10000/' /etc/apache2/ports.conf \
 && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:10000>/' /etc/apache2/sites-available/000-default.conf

COPY index.html style.css script.js submit.php /var/www/html/

EXPOSE 10000

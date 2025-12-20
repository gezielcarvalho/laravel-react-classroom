FROM mysql:8.0

LABEL maintainer="devops"

ENV MYSQL_ROOT_PASSWORD=rootpassword
ENV MYSQL_DATABASE=classroom
ENV MYSQL_USER=app
ENV MYSQL_PASSWORD=secret

VOLUME ["/var/lib/mysql"]

EXPOSE 3306

CMD ["docker-entrypoint.sh", "mysqld"]

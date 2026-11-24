#!/usr/bin/env bash
set -euo pipefail

backend="$GITHUB_WORKSPACE/.ci-backend"
scratch=$(mktemp -d)
container="olympic-ci-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"
backend_pid=
cleanup() {
  if [[ -n $backend_pid ]]; then
    kill "$backend_pid" 2>/dev/null || :
    wait "$backend_pid" 2>/dev/null || :
  fi
  docker rm -f -v "$container" >/dev/null 2>&1 || :
  rm -rf -- "$scratch" "$backend"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

MYSQL_ROOT_PASSWORD=$(openssl rand -hex 24)
SPRING_DATASOURCE_PASSWORD=$(openssl rand -hex 24)
BROWSER_TEST_PASSWORD=$(openssl rand -hex 24)
JWT_SECRET=$(openssl rand -base64 32)
export MYSQL_ROOT_PASSWORD SPRING_DATASOURCE_PASSWORD BROWSER_TEST_PASSWORD JWT_SECRET
for secret in "$MYSQL_ROOT_PASSWORD" "$SPRING_DATASOURCE_PASSWORD" "$BROWSER_TEST_PASSWORD" "$JWT_SECRET"; do
  printf '::add-mask::%s\n' "$secret"
done
unset secret

(
  cd "$backend"
  bash mvnw --batch-mode package
)
jars=("$backend"/target/olympic-nutrition-tracker-*.jar)
test "${#jars[@]}" -eq 1
test -f "${jars[0]}"
crypto=$(unzip -Z1 "${jars[0]}" 'BOOT-INF/lib/spring-security-crypto-*.jar')
test "$(printf '%s\n' "$crypto" | wc -l)" -eq 1
unzip -p "${jars[0]}" "$crypto" > "$scratch/crypto.jar"
hash=$(printf '%s\n' "$BROWSER_TEST_PASSWORD" |
  java --class-path "$scratch/crypto.jar" "$backend/deploy/exam-demo/ExamPasswordHash.java")
[[ $hash =~ ^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$ ]]
printf '::add-mask::%s\n' "$hash"

docker run --detach --name "$container" --publish 127.0.0.1:13317:3306 -e MYSQL_ROOT_PASSWORD \
  mysql:8.0.43@sha256:3e646bcda0d9448ffa3d2024eef04e1bca95528ec19b9e8b76749da9d97d4a10 --mysqlx=OFF >/dev/null
export MYSQL_PWD="$MYSQL_ROOT_PASSWORD"
unset MYSQL_ROOT_PASSWORD
mysql_fixture() {
  timeout 8s docker exec -i -e MYSQL_PWD "$container" \
    mysql --protocol=TCP --host=127.0.0.1 --user=root --connect-timeout=2 --batch "$@"
}
ready=false
for ((attempt = 0; attempt < 45; attempt++)); do
  if mysql_fixture --execute 'SELECT 1;' >/dev/null 2>&1; then
    ready=true
    break
  fi
  sleep 2
done
if [[ $ready != true ]]; then
  echo 'Disposable MySQL did not become ready.' >&2
  exit 1
fi

{
  sed 's/olympic_exam_demo/olympic_browser_fixture/g' "$backend/deploy/exam-demo/01-schema.sql"
  sed "s/olympic_exam_demo/olympic_browser_fixture/g; s|__EXAM_DEMO_BCRYPT_HASH__|$hash|g" \
    "$backend/deploy/exam-demo/02-sample-data.sql.template"
  printf "INSERT INTO users (username,password,role,athlete_profile_id) VALUES ('browser_other_athlete','%s','ATHLETE',2);\n" "$hash"
  printf "CREATE USER 'browser_app'@'%%' IDENTIFIED BY '%s';\n" "$SPRING_DATASOURCE_PASSWORD"
  printf "GRANT SELECT, INSERT, UPDATE, DELETE ON olympic_browser_fixture.* TO 'browser_app'@'%%';\n"
} | mysql_fixture >/dev/null 2>"$scratch/mysql-seed.log" || { echo 'Disposable database seeding failed.' >&2; exit 1; }
unset MYSQL_PWD hash

export SPRING_DATASOURCE_URL='jdbc:mysql://127.0.0.1:13317/olympic_browser_fixture'
export SPRING_DATASOURCE_USERNAME=browser_app
export SPRING_PROFILES_ACTIVE=browser-ci
export CORS_ALLOWED_ORIGINS='http://localhost:4200'
java -jar "${jars[0]}" --server.address=127.0.0.1 --server.port=8080 --debug=false \
  >"$scratch/backend.log" 2>&1 &
backend_pid=$!
unset SPRING_DATASOURCE_PASSWORD JWT_SECRET
ready=false
for ((attempt = 0; attempt < 45; attempt++)); do
  if ! kill -0 "$backend_pid" 2>/dev/null; then break; fi
  if curl --fail --silent --max-time 2 http://127.0.0.1:8080/readyz >/dev/null; then
    ready=true
    break
  fi
  sleep 2
done
if [[ $ready != true ]]; then
  echo 'Pinned backend did not become ready against disposable MySQL.' >&2
  exit 1
fi

npm run test:e2e

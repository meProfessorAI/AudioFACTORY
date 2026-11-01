#!/usr/bin/env bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
if [ -f "$DIR/android/gradlew" ]; then
    exec "$DIR/android/gradlew" "$@"
else
    mkdir -p /tmp/gradle-bootstrap
    touch /tmp/gradle-bootstrap/settings.gradle
    (cd /tmp/gradle-bootstrap && gradle wrapper --gradle-version 8.2)
    cp /tmp/gradle-bootstrap/gradlew "$DIR/android/gradlew"
    cp /tmp/gradle-bootstrap/gradle/wrapper/gradle-wrapper.jar "$DIR/android/gradle/wrapper/gradle-wrapper.jar"
    rm -rf /tmp/gradle-bootstrap
    exec "$DIR/android/gradlew" "$@"
fi

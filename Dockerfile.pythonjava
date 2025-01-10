FROM python:3.10.16-slim-bullseye

RUN apt-get update && apt-get install -y --no-install-recommends \
    openjdk-11-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"
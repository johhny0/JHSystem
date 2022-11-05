#!/bin/sh

docker exec -it <container_id> /bin/bash

# find . -name thisfile.txt
# /opt/bitnami/kafka/bin$ kafka-topics.sh --version
# bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092
# bin/kafka-topics.sh --describe --topic quickstart-events --bootstrap-server localhost:9092
# bin/kafka-console-producer.sh --topic quickstart-events --bootstrap-server localhost:9092
# bin/kafka-console-consumer.sh --topic quickstart-events --from-beginning --bootstrap-server localhost:9092

# docker exec broker kafka-topics --bootstrap-server broker:9092 --create --topic quickstart
# docker exec --interactive --tty broker kafka-console-producer --bootstrap-server broker:9092 --topic quickstart
# docker exec --interactive --tty broker kafka-console-consumer --bootstrap-server broker:9092 --topic quickstart --from-beginning


# Kafdrop
# http://localhost:19000/
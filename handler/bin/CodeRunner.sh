#!/bin/bash

cd `dirname "$0"`;

if [[ -z $JAVA_HOME ]]; then
    JAVA_HOME=`java -XshowSettings:properties -version 2>&1 | grep -E "java\.home" | awk '{print $3}'`;
fi

echo "Path to \"JAVA_HOME\": $JAVA_HOME"

JAVA_EXEC="$JAVA_HOME/bin/java"

# Minimal version to run CodeRunner
MINIMAL_VERSION=17

# Check if Java is present and the minimal version requirement
java_version=`$JAVA_EXEC --version | head -1 | awk '{print substr ($2, 1, 2);}'`

if [ $java_version ];
  then
  if [ $java_version -lt $MINIMAL_VERSION ]; then
    echo "Error: Java version is too low to run CodeRunner. At least Java ${MINIMAL_VERSION} needed.";
  fi

  else
    echo "Not able to find Java executable or version. Please check your Java installation.";

  exit 1;
fi

DEBUG_CR_ARGS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"

JMX_ARGS="
-Dcom.sun.management.jmxremote.port=1097
-Dcom.sun.management.jmxremote.authenticate=false
-Dcom.sun.management.jmxremote.ssl=false
-Djava.rmi.server.hostname=backendless-dev.local"

JAVA_ARGS="
-XX:-OmitStackTraceInFastThrow
-XX:+HeapDumpOnOutOfMemoryError
-server
-Xms384m
-Xmx768m
-Duser.timezone=UTC
-Dfile.encoding=UTF-8
-Djava.net.preferIPv4Stack=true
-Dlogback.configurationFile=logback.xml
${JAVA_ARGS}"

# to use Consul add these parameters to JAVA_ARGS:
#-Dbl.config.provider=consul
#-Dbl.consul.host=ubuntu-docker.kvm-nat.local
#-Dbl.consul.port=8500
#-Dbl.consul.acl.token=<secret_token>

ADD_OPENS_ARGS="
--add-modules java.se
--add-exports java.base/jdk.internal.ref=ALL-UNNAMED
--add-exports java.base/sun.security.provider=ALL-UNNAMED
--add-opens java.base/java.lang=ALL-UNNAMED
--add-opens java.base/java.lang.reflect=ALL-UNNAMED
--add-opens java.base/java.lang.invoke=ALL-UNNAMED
--add-opens java.base/java.util=ALL-UNNAMED
--add-opens java.base/java.util.concurrent=ALL-UNNAMED
--add-opens java.base/java.nio=ALL-UNNAMED
--add-opens java.base/sun.nio.ch=ALL-UNNAMED
--add-opens java.management/sun.management=ALL-UNNAMED
--add-opens jdk.management/com.sun.management.internal=ALL-UNNAMED
--add-opens jdk.jdeps/com.sun.tools.jdeps=ALL-UNNAMED"

CODERUNNER_RUN_CMD="env JAVA_HOME=$JAVA_HOME $JAVA_EXEC $JAVA_ARGS $ADD_OPENS_ARGS $JMX_ARGS $DEBUG_CR_ARGS -cp \"*:../libs/*\" com.backendless.coderunner.CodeRunnerLoader"

if [[ "$1" == "nohup" ]];
then
  shift
  CODERUNNER_RUN_CMD="nohup ${CODERUNNER_RUN_CMD} $@ &"
else
  CODERUNNER_RUN_CMD="${CODERUNNER_RUN_CMD} $@"
fi

separator="----------------------------------------"
echo -e "${separator}\nRunning CodeRunner ..."
echo $CODERUNNER_RUN_CMD
echo -e "${separator}\n"
eval $CODERUNNER_RUN_CMD

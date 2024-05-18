@echo off

title Backendless CodeRunner

set MINIMAL_VERSION=1.8.0

java -version 1>nul 2>nul || (
   echo "Not able to find Java executable or version. Please check your Java installation."
   exit /b 1
)

for /f tokens^=2-5^ delims^=.-_^" %%j in ('java -fullversion 2^>^&1') do set jver=%%j.%%k.%%l_%%m

if %jver% LSS %MINIMAL_VERSION% (
  echo "Error: Java version is too low to run CodeRunner. At least Java >= %MINIMAL_VERSION% needed."
  exit /b 1
)

echo Starting CodeRunner

set JAVA_EXEC="%JAVA_HOME%\bin\java"

set DEBUG_CR_ARGS=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005

set JMX_ARGS=-Dcom.sun.management.jmxremote.port=1097 -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=backendless-dev.local

set JAVA_ARGS=-XX:-OmitStackTraceInFastThrow -XX:+HeapDumpOnOutOfMemoryError -server -Xms384m -Xmx768m -Duser.timezone=UTC -Dfile.encoding=UTF-8 -Djava.net.preferIPv4Stack=true -Dlogback.configurationFile=logback.xml

set ADD_OPENS_ARGS=--add-modules java.se --add-exports java.base/jdk.internal.ref=ALL-UNNAMED --add-exports java.base/sun.security.provider=ALL-UNNAMED --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED --add-opens java.base/java.lang.invoke=ALL-UNNAMED --add-opens java.base/java.util=ALL-UNNAMED --add-opens java.base/java.util.concurrent=ALL-UNNAMED --add-opens java.base/java.nio=ALL-UNNAMED --add-opens java.base/sun.nio.ch=ALL-UNNAMED --add-opens java.management/sun.management=ALL-UNNAMED --add-opens jdk.management/com.sun.management.internal=ALL-UNNAMED --add-opens jdk.jdeps/com.sun.tools.jdeps=ALL-UNNAMED

set CODERUNNER_RUN_CMD=%JAVA_EXEC% %JAVA_ARGS% %ADD_OPENS_ARGS% %DEBUG_CR_ARGS% -cp ""*;..\libs\*"" com.backendless.coderunner.CodeRunnerLoader %*

echo %CODERUNNER_RUN_CMD%
%CODERUNNER_RUN_CMD%

pause

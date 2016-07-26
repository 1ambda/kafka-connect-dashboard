package kafkalot.storage.api

import java.net.URL

import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import kafkalot.storage.TestSuite
import kafkalot.storage.kafka.ConnectorClientApi


class KafkaConnectClientSpec extends TestSuite {

  import ConnectorClientApi._

  test("example") {

    val startConfig =
      """
         {
            "name": "kafka-connect-console-sink-143",
            "config": {
              "connector.class": "io.github.lambda.ConsoleSinkConnector",
              "tasks.max": "4",
              "topics": "test-p4-1",
              "name": "kafka-connect-console-sink-143",
              "id": "console-connector-id-2"
            }
         }
      """.stripMargin

    val config: String = """
  {
    "connector.class": "io.github.lambda.ConsoleSinkConnector",
    "tasks.max": "4",
    "topics": "test-p4-1",
    "name": "kafka-connect-console-sink-143",
    "id": "console-connector-id-2"
  }
                       """

    val jsonConfig: JsonObject = parse(config).getOrElse(Json.Null).asObject.get
    val startJsonConfig = parse(startConfig).getOrElse(Json.Null)
    val name = "kafka-connect-console-sink-143"
  }

}

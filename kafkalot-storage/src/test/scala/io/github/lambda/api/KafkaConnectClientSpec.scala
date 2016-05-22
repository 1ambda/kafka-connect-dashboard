package io.github.lambda.api

import java.net.URL

import io.github.lambda.TestSuite
import io.circe._, io.circe.generic.auto._, io.circe.jawn._, io.circe.syntax._
import cats.data.Xor
import com.twitter.util.Await


class KafkaConnectClientSpec extends TestSuite {

  import KafkaConnectClientApi._

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

//    val result = Await.result(startConnector(startJsonConfig))
//    println(result)
  }

}

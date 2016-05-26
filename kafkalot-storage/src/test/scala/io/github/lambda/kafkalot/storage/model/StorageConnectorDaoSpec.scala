package io.github.lambda.kafkalot.storage.model

import com.twitter.util.Await
import io.github.lambda.TestSuite
import io.github.lambda.kafkalot.storage.util.JsonUtil
import io.circe._

class StorageConnectorDaoSpec extends TestSuite {
  test("insert should put StorageConnector") {

    val config: String = """
  {
    "connector.class": "io.github.lambda.ConsoleSinkConnector",
    "tasks.max": "4",
    "topics": "test-p4-1",
    "name": "kafka-connect-console-sink-143",
    "id": "console-connector-id-3"
  }
                         """
    val jsonConfig: JsonObject = JsonUtil.convertStringToJsonObject(config)
    val s = StorageConnector("s2", jsonConfig, StorageConnectorMeta(false, List()))
    val f = StorageConnectorDao.delete(s)

    val result = Await.result(f)
    println(result)
  }
}

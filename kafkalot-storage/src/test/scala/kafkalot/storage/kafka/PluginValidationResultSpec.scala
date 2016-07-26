package kafkalot.storage.kafka

import io.circe.JsonObject
import io.circe.generic.auto._
import io.circe.syntax._
import io.circe.jawn._
import kafkalot.storage.TestSuite

class PluginValidationResultSpec extends TestSuite {
  import PluginValidationResultFixture._

  test("PluginValidation should be parsed") {
    val v = decode[PluginValidation](validationResult1).valueOr(throw _)
    v.name shouldBe "io.github.lambda.ConsoleSinkConnector"
  }

  test("toJSONSchema should return a valid JSONSchema") {
    val v: PluginValidation = decode[PluginValidation](validationResult1).valueOr(throw _)

    val schema: JSONSchema = v.toJSONSchema()

    /** validate `required` */
    schema.required should contain only ("connector.class", "name", "id")

    /** validate `properties` */
    schema.properties.fields should contain only ("connector.class", "name", "id", "topics", "tasks.max")
  }

  test("toJSONSchema should return the expected JSONSchema") {
    val v = decode[PluginValidation](validationResult1).valueOr(throw _)

    val expected: JsonObject = decode[JsonObject](expectedJSONSchema1).valueOr(throw _)
    v.toJSONSchema().asJson.asObject.get shouldBe expected
  }

  test(
    """toValidationResult should return
      |the expected ConnectorConfigValidationResult
      |which contains error_messages""".stripMargin) {

    val v = decode[PluginValidation](validationResult1).valueOr(throw _)
    val configValidationResult = v.toValidationResult()

    configValidationResult.error_count shouldBe 3
    configValidationResult.error_messages should contain only (
      "Missing required configuration \"connector.class\" which has no default value."
      , "Missing required configuration \"name\" which has no default value."
      , "Missing required configuration \"id\" which has no default value."
    )

  }
}

object PluginValidationResultFixture {
  val validationResult1 = /** validation result: error case */
    """
      |{
      |   "name":"io.github.lambda.ConsoleSinkConnector",
      |   "error_count":3,
      |   "groups":[
      |      "Common"
      |   ],
      |   "configs":[
      |      {
      |         "definition":{
      |            "name":"connector.class",
      |            "type":"STRING",
      |            "required":true,
      |            "default_value":"",
      |            "importance":"HIGH",
      |            "documentation":"Name or alias of the class for this connector. Must be a subclass of org.apache.kafka.connect.connector.Connector. If the connector is org.apache.kafka.connect.file.FileStreamSinkConnector, you can either specify this full name,  or use \"FileStreamSink\" or \"FileStreamSinkConnector\" to make the configuration a bit shorter",
      |            "group":"Common",
      |            "width":"LONG",
      |            "display_name":"Connector class",
      |            "dependents":[
      |
      |            ],
      |            "order":2
      |         },
      |         "value":{
      |            "name":"connector.class",
      |            "value":null,
      |            "recommended_values":[
      |
      |            ],
      |            "errors":[
      |               "Missing required configuration \"connector.class\" which has no default value."
      |            ],
      |            "visible":true
      |         }
      |      },
      |      {
      |         "definition":{
      |            "name":"name",
      |            "type":"STRING",
      |            "required":true,
      |            "default_value":"",
      |            "importance":"HIGH",
      |            "documentation":"Globally unique name to use for this connector.",
      |            "group":"Common",
      |            "width":"MEDIUM",
      |            "display_name":"Connector name",
      |            "dependents":[
      |
      |            ],
      |            "order":1
      |         },
      |         "value":{
      |            "name":"name",
      |            "value":null,
      |            "recommended_values":[
      |
      |            ],
      |            "errors":[
      |               "Missing required configuration \"name\" which has no default value."
      |            ],
      |            "visible":true
      |         }
      |      },
      |      {
      |         "definition":{
      |            "name":"id",
      |            "type":"STRING",
      |            "required":true,
      |            "default_value":"",
      |            "importance":"HIGH",
      |            "documentation":"Connector ID",
      |            "group":null,
      |            "width":"NONE",
      |            "display_name":"id",
      |            "dependents":[
      |
      |            ],
      |            "order":-1
      |         },
      |         "value":{
      |            "name":"id",
      |            "value":null,
      |            "recommended_values":[
      |
      |            ],
      |            "errors":[
      |               "Missing required configuration \"id\" which has no default value."
      |            ],
      |            "visible":true
      |         }
      |      },
      |      {
      |         "definition":{
      |            "name":"tasks.max",
      |            "type":"INT",
      |            "required":false,
      |            "default_value":"1",
      |            "importance":"HIGH",
      |            "documentation":"Maximum number of tasks to use for this connector.",
      |            "group":"Common",
      |            "width":"SHORT",
      |            "display_name":"Tasks max",
      |            "dependents":[
      |
      |            ],
      |            "order":3
      |         },
      |         "value":{
      |            "name":"tasks.max",
      |            "value":"1",
      |            "recommended_values":[
      |
      |            ],
      |            "errors":[
      |
      |            ],
      |            "visible":true
      |         }
      |      },
      |      {
      |         "definition":{
      |            "name":"topics",
      |            "type":"LIST",
      |            "required":false,
      |            "default_value":"",
      |            "importance":"HIGH",
      |            "documentation":"",
      |            "group":"Common",
      |            "width":"LONG",
      |            "display_name":"Topics",
      |            "dependents":[
      |
      |            ],
      |            "order":4
      |         },
      |         "value":{
      |            "name":"topics",
      |            "value":"",
      |            "recommended_values":[
      |
      |            ],
      |            "errors":[
      |
      |            ],
      |            "visible":true
      |         }
      |      }
      |   ]
      |}
    """.stripMargin

  val expectedJSONSchema1 =
    """
      |{
      |    "$schema": "http://json-schema.org/draft-04/schema#",
      |    "title": "io.github.lambda.ConsoleSinkConnector",
      |    "description": "io.github.lambda.ConsoleSinkConnector",
      |    "type": "object",
      |    "properties": {
      |      "connector.class": {
      |        "type": "string"
      |      },
      |      "name": {
      |        "type": "string"
      |      },
      |      "id": {
      |        "type": "string"
      |      },
      |      "tasks.max": {
      |        "type": "string"
      |      },
      |      "topics": {
      |        "type": "string"
      |      }
      |    },
      |    "required": ["connector.class", "name", "id"]
      |}
    """.stripMargin


}

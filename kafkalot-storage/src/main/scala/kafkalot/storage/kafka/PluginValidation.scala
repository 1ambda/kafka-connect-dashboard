package kafkalot.storage.kafka

import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import io.circe.jawn._

/** Raw response from the connector cluster for connector config validation */
case class PluginValidation(name: String,
                            error_count: Int,
                            groups: List[String],
                            configs: List[ValidationConfig]) {

  def toJSONSchema(): JSONSchema = {
    var properties: JsonObject = JsonObject.empty

    /** extract `required` */
    val required: List[String] = configs
      .filter(c => c.definition.required)
      .map(c => c.definition.name)

    /** extract `properties` */
    configs.foreach { c =>
      /** every type in PluginValidation should be converted to `string` in JSONSchema */
      val typeField = JsonObject.singleton("type", "string".asJson).asJson
      properties = properties.add(c.definition.name, typeField)
    }

    JSONSchema(name, name, properties, required)
  }

  def toValidationResult(): ConnectorConfigValidationResult = {
    val errorMessages = configs.foldLeft(List[String]()) { (acc, c) =>
      if (c.value.errors.size == 0) acc
      else acc ++ c.value.errors
    }

    ConnectorConfigValidationResult(name, error_count, errorMessages)
  }
}

case class ValidationConfigDefinition(name: String,
                                      `type`: String,
                                      required: Boolean)
case class ValidationConfigValue(name: String,
                                 value: Option[String], /** `value` field might be null */
                                 errors: List[String])
case class ValidationConfig(definition: ValidationConfigDefinition,
                            value: ValidationConfigValue)


/** JSONSchema used in config validation in client when opening dialogs */
case class JSONSchema(title: String,
                      description: String,
                      properties: JsonObject,
                      required: List[String],
                      $schema: String = "http://json-schema.org/draft-04/schema#",
                      `type`: String = "object" /** type is reserved keyword in Scala */)


/** ValidationResult used in config validation in client using `validate` button */
case class ConnectorConfigValidationResult(name: String,
                                           error_count: Int,
                                           error_messages: List[String])


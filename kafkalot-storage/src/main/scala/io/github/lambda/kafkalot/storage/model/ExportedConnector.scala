package io.github.lambda.kafkalot.storage.model

import io.circe._

case class ExportedConnectorMeta(enabled: Boolean,
                                 running: Boolean,
                                 tags: List[String])

case class ExportedConnector(name: String, config: JsonObject, _meta: ExportedConnectorMeta)


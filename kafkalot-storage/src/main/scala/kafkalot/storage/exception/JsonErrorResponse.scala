package kafkalot.storage.exception

import io.finch._
import io.finch.circe._
import io.finch.Output._
import com.twitter.finagle.http.Status
import io.circe._
import io.circe.generic.auto._
import io.circe.parser._
import io.circe.syntax._
import io.circe.jawn._
import shapeless._

case class JsonErrorResponse(error_type: String,
                             error_message: String)


object JsonErrorResponse {
  def fromException(e: Exception): JsonErrorResponse = {
    JsonErrorResponse(e.getClass.getCanonicalName, e.getMessage)
  }
}

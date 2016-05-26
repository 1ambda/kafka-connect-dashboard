package io.github.lambda.kafkalot.storage.util

import io.circe._
import io.circe.generic.auto._
import io.circe.jawn._
import io.circe.syntax._
import cats.data.Xor
import io.github.lambda.kafkalot.storage.exception.ErrorCode

import scala.util.Try

object JsonUtil {

  def convertStringToJsonObject(input: String): JsonObject = {
    decode[JsonObject](input) match {
      case Xor.Left(error) => throw error
      case Xor.Right(jsonObject) => jsonObject
    }
  }

}

package kafkalot.storage.api

import io.finch._
import com.twitter.io.{Buf, Reader}
import com.typesafe.scalalogging.LazyLogging

object StaticFileApi extends LazyLogging {

  val ContentTypeTextPlain = ("Content-Type", "text/plain")
  val ContentTypeTextHtml = ("Content-Type", "text/html")
  val ContentTypeTextCss = ("Content-Type", "text/css")

  val index: Endpoint[Buf] = get(/) {
    val indexResource = getClass.getResourceAsStream("/public/index.html")
    val indexStream = Reader.fromStream(indexResource)
    Ok(Reader.readAll(indexStream)).withHeader(ContentTypeTextHtml)
  }

  val bundle: Endpoint[Buf] = get("bundle.js") {
    val bundleResource = getClass.getResourceAsStream("/public/bundle.js")
    val bundleStream = Reader.fromStream(bundleResource)
    Ok(Reader.readAll(bundleStream)).withHeader(ContentTypeTextPlain)
  }

  /** TODO remove css files endpoint by bundling them into app.js or global css */
  val fontAwesomeCss: Endpoint[Buf] = get("bower_components" :: "font-awesome" :: "css" :: "font-awesome.min.css") {
    val fontAwesomeResource = getClass.getResourceAsStream("/public/bower_components/font-awesome/css/font-awesome.min.css")
    val fontAwesomeCssStream = Reader.fromStream(fontAwesomeResource)
    Ok(Reader.readAll(fontAwesomeCssStream)).withHeader(ContentTypeTextCss)
  }

  /** TODO remove css files endpoint by bundling them into app.js or global css */
  val materializeCss: Endpoint[Buf] = get("bower_components" :: "Materialize" :: "dist" :: "css" :: "materialize.min.css") {
    val materializeResource = getClass.getResourceAsStream("/public/bower_components/Materialize/dist/css/materialize.min.css")
    val materializeCssStream = Reader.fromStream(materializeResource)
    Ok(Reader.readAll(materializeCssStream)).withHeader(ContentTypeTextCss)
  }

  /** TODO remove css files endpoint by bundling them into app.js or global css */
  val materializeCssFont: Endpoint[Buf] = get("bower_components" :: "Materialize" :: "dist" :: "fonts" :: "roboto" :: string) {
    font: String =>
      val fontResource = getClass.getResourceAsStream(s"/public/bower_components/Materialize/dist/fonts/roboto/${font}")
      val fontStream = Reader.fromStream(fontResource)
      Ok(Reader.readAll(fontStream)).withHeader(ContentTypeTextCss)
  }

  val api = (
    index
      :+: bundle
      :+: fontAwesomeCss
      :+: materializeCss
      :+: materializeCssFont
    ) handle {
    case e: Exception =>
      logger.error("Unknown exception occurred while serving static files", e)
      InternalServerError(e)
  }
}

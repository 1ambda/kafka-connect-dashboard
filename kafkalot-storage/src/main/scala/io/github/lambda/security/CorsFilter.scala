package io.github.lambda.security

import com.twitter.finagle.{Service, SimpleFilter}
import com.twitter.finagle.http.filter.Cors
import com.twitter.finagle.http.filter.Cors.HttpFilter
import com.twitter.finagle.http.{Request, Response}
import com.twitter.util.Future

class CorsFilter extends SimpleFilter[Request, Response] {
  val allowsOrigin = { origin: String =>
    Some(origin)
  }
  val allowsMethods = { method: String =>
    Some(Seq("GET", "POST", "PUT", "DELETE"))
  }
  val allowsHeaders = { headers: Seq[String] =>
    Some(headers)
  }

  val policy = Cors.Policy(
      allowsOrigin, allowsMethods, allowsHeaders, supportsCredentials = true)
  val cors = new HttpFilter(Cors.UnsafePermissivePolicy)

  override def apply(request: Request,
                     service: Service[Request, Response]): Future[Response] = {
    cors.apply(request, service)
  }
}

package kafkalot.storage

import org.scalatest.{BeforeAndAfterAll, BeforeAndAfterEach, FunSuite, Matchers}

trait TestSuite
  extends FunSuite with Matchers with BeforeAndAfterEach with BeforeAndAfterAll

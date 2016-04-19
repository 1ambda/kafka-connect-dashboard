import * as Resource from './resource'
import * as Util from './util'

export function checkDuplicatedConnector(db) {
  return (req, res, next) => {

    let name = null
    const connector = req.body

    try {

      name = connector[Resource.KEY_NAME]

      if (name === void 0 || name === null) {
        return Util.sendErrorMessage(res, 400, `connector has no ${Resource.KEY_NAME} field`)
      }

      const existing = db(Resource.KEY_CONNECTORS)
        .find({ [Resource.KEY_NAME]: name, })

      if (existing !== void 0)
        Util.sendErrorMessage(res, 409, `Already exists ${name}`)
      else {
        next()
      }
    } catch (error) {
      Util.sendErrorMessage(res, 500, `Failed to create connector (${error.message})`)
    }
  }
}

export function checkStorageMeta(req, res, next) {
  const connector = req.body

  const storageMeta = connector[Resource.KEY_STORAGE_META]

  if (storageMeta === void 0 || storageMeta === null) {
    return Util.sendErrorMessage(res, 400, `No '${Resource.KEY_STORAGE_META}' (Object) field`)
  }

  const enabled = storageMeta[Resource.KEY_ENABLED]
  const tags = storageMeta[Resource.KEY_TAGS]

  if (enabled === void 0 || enabled === null || !Util.isBoolean(enabled)) {
    return Util.sendErrorMessage(res, 400, `Invalid '${Resource.KEY_ENABLED}' (Boolean) field`)
  }

  if (tags === void 0 || tags === null || !Util.isArray(tags)) {
    return Util.sendErrorMessage(res, 400, `Invalid '${Resource.KEY_TAGS}' (Array) field`)
  }

  next()
}

export function checkConfig(req, res, next) {
  const connector = req.body

  const config = connector[Resource.KEY_CONFIG]

  if (config === void 0 || config === null || !Util.isObject(config)) {
    return Util.sendErrorMessage(res, 400, `No '${Resource.KEY_CONFIG}' (Object) field`)
  }

  next()
}

export function checkConnectorExists(db) {
  return (req, res, next) => {
    const name = req.params[Resource.KEY_NAME]

    const connector = db(Resource.KEY_CONNECTORS)
      .find({ [Resource.KEY_NAME]: name, })

    if (connector === void 0) {
      Util.sendErrorMessage(res, 404, `Can't found connector ${name}`)
    } else {
      req[Resource.KEY_CONNECTOR] = connector
      next()
    }
  }
}




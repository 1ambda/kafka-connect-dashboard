export function sendErrorMessage(res, status, message) {
  res.status(status).json({
    'error_code': status,
    'message': message,
  })
}

export function isBoolean(variable) {
  return typeof variable === 'boolean'
}

export function isObject(variable) {
  return variable !== null && typeof variable === 'object'
}

export function isArray(variable) {
  return Array.isArray(variable)
}


export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({})
}



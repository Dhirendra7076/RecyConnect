export function success(res, data = null, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

export function failure(res, code, message, statusCode = 400, details = null) {
  const body = { success: false, error: { code, message } };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
}
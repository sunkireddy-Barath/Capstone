const success = (res, data, meta = null, statusCode = 200) => {
  const payload = { success: true, data };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const created = (res, data, meta = null) => success(res, data, meta, 201);

const error = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
  const payload = { success: false, error: { code, message } };
  if (details) payload.error.details = details;
  return res.status(statusCode).json(payload);
};

const paginated = (res, data, page, limit, total) =>
  success(res, data, {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
  });

module.exports = { success, created, error, paginated };

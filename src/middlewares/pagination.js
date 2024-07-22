import APIResponseBuilder from '../utils/api.builder.js';

export default function PaginationMiddleware(req, res, next) {
    if (req.method !== 'GET') {
        return next();
    }

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const { limit, page, sort, ...queryParams } = req.query;

    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;

    if (sort && !['asc', 'desc'].includes(sort.toString().toLowerCase())) {
        return APIResponseBuilder.builder()
            .withStatusCode(400)
            .withMessage("Invalid value for sort parameter. Allowed values are 'asc' or 'desc'.")
            .build(res)
            .send();
    }

    req.paginationParams = {
        page: pageInt,
        limit: limitInt,
        baseUrl,
        sort,
        queryParams,
    };

    next();
}

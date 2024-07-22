const ValidationMiddleware = (schema) => {
    return (req, res, next) => {
        const data = req.method === 'GET' || req.method === 'DELETE' ? req.query : req.body;
        const { error } = schema.validate(data, { abortEarly: false });

        if (error) {
            const errors = error.details.map(err => err.message);
            return res.status(400).json({ errors });
        }

        next();
    };
};

export default ValidationMiddleware;

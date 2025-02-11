const prisma = require("../prisma");

const paginationMiddleware = (
  modelName,
  allowedFilters = [],
  selecters = {}
) => {
  return async (req, res, next) => {
    try {
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);
      let skip;
      let take;

      if (page && pageSize) {
        skip = (page - 1) * pageSize;
        take = pageSize;
      }
      const filters = {};
      for (const key of allowedFilters) {
        if (req.query[key]) {
          const parsedValue = parseInt(req.query[key], 10);
          filters[key] = isNaN(parsedValue) ? req.query[key] : parsedValue;
        }
        if (req.params[key]) {
          const parsedValue = parseInt(req.params[key], 10);
          filters[key] = isNaN(parsedValue) ? req.params[key] : parsedValue;
        }
      }

      const sortBy = req.query.sortBy || "createdAt";
      const order = req.query.order === "desc" ? "desc" : "asc";

      const data = await prisma[modelName].findMany({
        where: filters,
        skip,
        take,
        orderBy: { [sortBy]: order },
        include: selecters.include,
        select: selecters.select,
        omit: selecters.omit,
      });

      const totalCount =
        page && pageSize
          ? await prisma[modelName].count({
              where: filters,
            })
          : undefined;

      res.status(200).json({
        data,
        meta:
          page && pageSize
            ? {
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize),
                currentPage: page,
                pageSize,
              }
            : null,
      });
    } catch (error) {
      next(error);
    }
  };
};

module.exports = paginationMiddleware;

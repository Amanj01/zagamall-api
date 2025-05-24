const fs = require("fs");
const path = require("path");
const prisma = require("../prisma");
const { getRelations } = require("../utils/utility");

const deleteFiles = async (record) => {
  const fileFields = Object.keys(record).filter(
    (key) =>
      typeof record[key] === "string" && record[key].startsWith("/uploads/")
  );

  for (const field of fileFields) {
    const filePath = path.join(__dirname, "../../", record[field]);
    try {
      await new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    } catch (err) {
      console.error(`Failed to delete file ${filePath}: ${err.message}`);
    }
  }
};

const deleteRecordMiddleware = (modelName, isDeepDelete = false) => {
  return async (req, res) => {
    const { id } = req.params;
    const include = isDeepDelete ? await getRelations(modelName) : {};

    try {
      const record = await prisma[modelName].findUnique({
        where: { id: parseInt(id) },
        include,
      });

      if (!record) {
        return res.status(404).json({ message: `${modelName} not found` });
      }

      const walkAndDelete = async (record, include) => {
        await deleteFiles(record);

        for (const key of Object.keys(include)) {
          const subInclude = include[key]?.include ?? {};
          const value = record[key];

          if (Array.isArray(value)) {
            for (const nested of value) {
              await walkAndDelete(nested, subInclude);
            }
          } else if (typeof value === "object" && value !== null) {
            await walkAndDelete(value, subInclude);
          }
        }
      };

      isDeepDelete
        ? await walkAndDelete(record, include)
        : await deleteFiles(record);

      await prisma[modelName].delete({ where: { id: parseInt(id) } });

      res.status(200).json({ message: `${modelName} deleted successfully` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

module.exports = deleteRecordMiddleware;

const fs = require("fs");
const path = require("path");
const { getDMMF } = require("@prisma/internals");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const isBeforeHoursAgo = (dateString, hours) => {
  const inputDate = new Date(dateString);

  const now = new Date();

  const hoursAgo = new Date(now.getTime() - hours * 60 * 60 * 1000);

  return inputDate < hoursAgo;
};

const deleteFile = async (filePath) => {
  const fileToDelete = path.join(__dirname, "../assets", filePath);
  try {
    await new Promise((resolve, reject) => {
      fs.unlink(fileToDelete, (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  } catch (err) {
    console.error(`Failed to delete file ${fileToDelete}: ${err.message}`);
  }
};

/**
 * Delete a Cloudinary image by its URL
 * @param {string} imageUrl
 */
const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl) return;
  try {
    // Extract public_id from the URL (no folder)
    // Example: https://res.cloudinary.com/your_cloud/image/upload/v1234567890/office_xxx.png
    const matches = imageUrl.match(/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
    let publicId = matches && matches[1] ? matches[1] : imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.lastIndexOf('.'));
    console.log('Deleting Cloudinary image:', { imageUrl, publicId });
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    console.log('Cloudinary destroy result:', result);
  } catch (err) {
    console.error(`Failed to delete Cloudinary image: ${imageUrl} - ${err.message}`);
  }
};

/* async function getRelations(modelName) {
  const dmmf = await getDMMF({
    datamodelPath: path.join(__dirname, "../../prisma/schema.prisma"),
  });

  const model = dmmf.datamodel.models.find(
    (m) => m.name.toLocaleLowerCase() === modelName.toLocaleLowerCase()
  );

  if (!model) {
    throw new Error(`Model "${modelName}" not found in the schema.`);
  }

  const includeRelations = {};
  model.fields
    .filter((field) => field.relationName)
    .forEach((field) => {
      includeRelations[field.name] = true;
    });

  return includeRelations;
} */

async function getRelations(modelName, dmmf = null, memo = new Set()) {
  if (!dmmf) {
    dmmf = await getDMMF({
      datamodelPath: path.join(__dirname, "../../prisma/schema.prisma"),
    });
  }

  const model = dmmf.datamodel.models.find(
    (m) => m.name.toLowerCase() === modelName.toLowerCase()
  );

  if (!model) {
    throw new Error(`Model "${modelName}" not found in the schema.`);
  }

  if (memo.has(model.name)) {
    return true;
  }

  const includeRelations = {};
  memo.add(model.name);

  for (const field of model.fields) {
    if (!field.relationName) continue;

    const nestedInclude = await getRelations(field.type, dmmf, memo);

    includeRelations[field.name] = {
      include: nestedInclude,
    };
  }

  return includeRelations;
}

module.exports = { isBeforeHoursAgo, deleteFile, getRelations, deleteCloudinaryImage };

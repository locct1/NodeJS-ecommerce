const BrandService = require("../services/brand.service");
const ImageService = require("../services/image.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { request } = require("../../app");
const fs = require('fs');
exports.image = async (req, res, next) => {
    // return res.json({"file":req.file});
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    // Define a JSONobject for the image attributes for saving to database
    var finalImg = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64')
    };
    try {
        const imageService = new ImageService(MongoDB.client);
        const document = await imageService.create(finalImg);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the brand")
        );
    }
}
//Create and Save a new Brand
exports.create = async (req, res, next) => {
    const obj = JSON.parse(JSON.stringify(req.body)); // req.body = [Object: null prototype] { title: 'product' }

    if (!req.body?.name) {
        return next(new ApiError(400, "Name can not be empty"));
    }
    try {
        const brandService = new BrandService(MongoDB.client);
        const document = await brandService.create(req.body,req.file.filename);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the brand")
        );
    }
};
// Retrieve all brands of a user from the database
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const brandService = new BrandService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await brandService.findByName(name);
        } else {
            documents = await brandService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurned while retrieving brands")
        );
    }
    return res.send(documents);
};
//  Find a single brand with an id
exports.findOne = async (req, res, next) => {
    try {
        const brandService = new BrandService(MongoDB.client);
        const document = await brandService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Brand not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving brand with id = ${req.params.id}`
            )
        );
    }
};
// Update a brand by the id in the request
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const brandService = new BrandService(MongoDB.client);
        const document = await brandService.update(req.params.id, req.body, req.file.filename);
        if (!document) {
            return next(new ApiError(404, "Brand not found"))
        }
        return res.send({ message: "Brand was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating brand with id = ${req.params.id}`)
        );
    }
};
// Update a brand by the id in the request
exports.updateNoImage = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const brandService = new BrandService(MongoDB.client);
        const document = await brandService.updateNoImage(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "Brand not found"))
        }
        return res.send({ message: "Brand was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating brand with id = ${req.params.id}`)
        );
    }
};
// Delete a brand with the specified id in the request
exports.delete = async (req, res, next) => {
    try {
        const brandService = new BrandService(MongoDB.client);
        const document = await brandService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "Brand not found"));
        }
        return res.send({ message: "Brand was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete brand with id = ${req.params.id}`
            )
        );
    }
};
// Delete all brands off a user from the database
exports.deleteAll = async (req, res, next) => {
    try {
        const brandService = new BrandService(MongoDB.client)
        const deletedCount = await brandService.deleteAll();
        return res.send({
            message: `${deletedCount} brands were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all brands")
        );
    }
};
// Find all favorite brands of a User
exports.findAllFavorite = async (req, res, next) => {
    try {
        const brandService = new BrandService(MongoDB.client);
        const documents = await brandService.findFavorite();
        return res.send(documents);
    } catch (error) {
        return next(
            new ApiError(
                500,
                "An error occurred while retrieving favorite brands"
            )
        );
    }
};
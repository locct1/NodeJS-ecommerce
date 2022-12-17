const UserService = require("../services/user.service");
const { ObjectId, ReturnDocument } = require("mongodb");
const ImageService = require("../services/image.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { request } = require("../../app");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const fs = require('fs');
//Create and Save a new User
exports.create = async (req, res, next) => {
    if (!req.body?.name || !req.body?.email || !req.body?.role|| !req.body?.address || !req.body?.phone || !req.body?.password ) {
        res.status(400).json({
            errCode: 1,
            message: "Các trường không được đê trống"
        });
    }
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.create(req.body);
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while creating the user")
        );
    }
};
exports.login = async (req, res, next) => {
    if (!req.body?.email ||  !req.body?.password) {
       return res.status(200).send({
            errCode: 1,
            message: "Các trường không được đê trống"
        });
    }
    try {
        const user = await MongoDB.client.db().collection("users").findOne({
            email: req.body.email,
            role:"1",
        });
        if (!user) {
            return res.status(200).send({errCode:1, message: 'Không tìm thấy hoặc không có quyền truy cập' });
        }
        if (!await bcrypt.compare(req.body.password, user.password)) {
            return res.status(200).send({ errCode: 2, message: 'Mật khẩu không đúng' });
        }
        const token = jwt.sign({ _id: user._id }, "serect");
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 //1 day
        })
        res.send({
            errCode:0,
            message: 'success',

        });
     
    } catch (error) {
        return next(
            new ApiError(500, "Đã có lỗi")
        );
    }
};
exports.logout = async (req, res, next) => {
   
    try {
        res.cookie('jwt', '', {
            maxAge: 0
        })
        res.send({
            message: 'success'
        });
     

    } catch (error) {
        return next(
            new ApiError(500, "Đã có lỗi")
        );
    }
};
exports.getInfoAdmin = async (req, res, next) => {
    try {
        const cookie = req.cookies['jwt'];
        const claims = jwt.verify(cookie, 'serect');
        if (!claims) {
            return res.status(200).send({
                errCode:1,    
                message: 'unauthenticated'
            
            });

        }
        const user = await MongoDB.client.db().collection("users").findOne({ _id: new ObjectId(claims._id) })
        delete user.password;
        user.errCode=0;
        user.message ='authenticated';
        return res.status(200).send({
            data:user
        });

    } catch (error) {
        return next(
            new ApiError(500, "Đã có lỗi")
        );
    }
};

// Retrieve all users of a user from the database
exports.findAll = async (req, res, next) => {
    let documents = [];
    try {
        const userService = new UserService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await userService.findByName(name);
        } else {
            documents = await userService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurned while retrieving users")
        );
    }
    return res.send(documents);
};

//  Find a single user with an id
exports.findOne = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Error retrieving user with id = ${req.params.id}`
            )
        );
    }
};
// Update a user by the id in the request
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update can not be empty"));
    }
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "User not found"))
        }
        return res.send({ message: "User was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error updating user with id = ${req.params.id}`)
        );
    }
};
// Delete a user with the specified id in the request
exports.delete = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found"));
        }
        return res.send({ message: "User was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(
                500,
                `Could not delete user with id = ${req.params.id}`
            )
        );
    }
};
// Delete all users off a user from the database
exports.deleteAll = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client)
        const deletedCount = await userService.deleteAll();
        return res.send({
            message: `${deletedCount} users were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all users")
        );
    }
};

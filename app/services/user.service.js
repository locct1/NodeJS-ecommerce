const { ObjectId, ReturnDocument } = require("mongodb");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
class UserService {
    constructor(client) {
        this.User = client.db().collection("users");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    async extractUserData(payload) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(payload.password, salt);
        const user = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            code: String(ObjectId()) + Math.floor(Math.random() * 16777215).toString(16),
            role: String(payload.role),
            password: hashedPassword,
            createAt: Date(),
            updateAt: Date(),
        };
        // Remove undefined fields
        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );
        return user;
    }
    async extractUserDataUpdate(payload) {
        const user = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            role: String(payload.role),
            updateAt: Date(),
        };
        if (payload.password) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = await bcrypt.hash(payload.password, salt);
            user.password = hashedPassword;
        }
        // Remove undefined fields
        Object.keys(user).forEach(
            (key) => user[key] === undefined && delete user[key]
        );
        return user;
    }
    async create(payload) {
        const user = await this.extractUserData(payload);
        const result = await this.User.findOneAndUpdate(
            user,
            { $set: user },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }
    async find(filter) {
        const cursor = await this.User.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findById(id) {
        let data = await this.User.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        delete data.password;
        return data;

    }
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = await this.extractUserDataUpdate(payload);
        const result = await this.User.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }
    async delete(id) {
        const result = await this.User.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }
    async findFavorite() {
        return await this.find({ favorite: true });
    }
    async deleteAll() {
        const result = await this.User.deleteMany({});
        return result.deletedCount;
    }
    // async login(payload) {
    //     const user = await this.User.findOne({
    //         email: payload.body.email,
    //     }
    //     );
    //     if (!user) {
    //         return {
    //             errCode: 1,
    //             message: 'user not found'
    //         };
    //     }
    //     if (!await bcrypt.compare(req.body.password, user.password)) {
    //         return {
    //             errCode: 2,
    //             message: 'invalid credentials'
    //         };
    //     }
    //     const token = jwt.sign({ _id: user._id }, "serect");
    //     return {
    //         errCode: 0,
    //         token: token,
    //         message: success
    //     };
    // }
}
module.exports = UserService;
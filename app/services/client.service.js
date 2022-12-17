const { ObjectId } = require("mongodb");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
class ClientService {
    constructor(client) {
        this.Brand = client.db().collection("brands");
        this.Product = client.db().collection("products");
        this.User = client.db().collection("users");
        this.Order = client.db().collection("orders");
    }
    async findAllBrands(filter) {
        const cursor = await this.Brand.find(filter);
        return await cursor.toArray();
    }
    async findByNameBrand(name) {
        return await this.Brand.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findAllProducts(filter) {
        const cursor = await this.Product.find(filter);
        return await cursor.toArray();
    }
    async findByNameProduct(name) {
        return await this.Brand.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findBrand(code) {
        return await this.Brand.findOne({
            code: code
        });
    }
    async findProduct(code) {
        return await this.Product.findOne({
            code: code
        });
    }
    async findAllProductsByBrand(code) {
    
        const cursor = await this.Product.aggregate(
            [{ $match: { brand_code: code } }, ]
        );
        return cursor.toArray();
    }
    //User
    async extractUserData(payload) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(payload.password, salt);
        const user = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            code: String(ObjectId()) + Math.floor(Math.random() * 16777215).toString(16),
            role: '2',
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
    async extractOrderData(payload) {
        console.log('ds',payload);
        const order = {
            status:'0',
            total: payload.total,
            user_code:payload.infoClient.code,
            infoClient: {
                name: payload.infoClient.name,
                email: payload.infoClient.email,
                phone: payload.infoClient.phone,
                address: payload.infoClient.address,
            },
            orderdetails:payload.cart,
            code: String(ObjectId()) + Math.floor(Math.random() * 16777215).toString(16),
            createAt: Date(),
            updateAt: Date(),
        };
        // Remove undefined fields
        Object.keys(order).forEach(
            (key) => order[key] === undefined && delete order[key]
        );
        return order;
    }
    async extractUserDataUpdate(payload) {
        const user = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            role:'2',
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
    async createUser(payload) {
        const user = await this.extractUserData(payload);
        const result = await this.User.findOneAndUpdate(
            user,
            { $set: user },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }
    async createOrder(payload) {
        const order = await this.extractOrderData(payload);
        console.log('order',order)
        const result = await this.Order.findOneAndUpdate(
            order,
            { $set: order },
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
    async updateUser(id, payload) {
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
    async getOrdersByClient(code) {

        const cursor = await this.Order.aggregate(
            [{ $match: { user_code: code } },]
        );
        return cursor.toArray();
    }
}
module.exports = ClientService;
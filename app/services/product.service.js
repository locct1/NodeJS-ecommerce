const { ObjectId } = require("mongodb");
const moment = require('moment');
const fs = require('fs');
class ProductService {
    constructor(client) {
        this.Product = client.db().collection("products");
        this.Brand = client.db().collection("brands");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
     extractProductData(payloadBody, payloadFile) {
        const product = {
            code: String(ObjectId()) + Math.floor(Math.random() * 16777215).toString(16),
            name: payloadBody.name,
            brand_code: payloadBody.brand_code,
            price: payloadBody.price,
            description: payloadBody.description,
            image: payloadFile,
            createAt: Date(),
            updateAt: Date(),
        };
        // Remove undefined fields
        Object.keys(product).forEach(
            (key) => product[key] === undefined && delete product[key]
        );
        return product;
    }
    extractProductDataUpdate(payloadBody, payloadFile) {
        const product = {
            name: payloadBody.name,
            brand_code:payloadBody.brand_code,
            price:payloadBody.price,
            description: payloadBody.description,
            image: payloadFile,
            updateAt: Date(),
        };
        // Remove undefined fields
        Object.keys(product).forEach(
            (key) => product[key] === undefined && delete product[key]
        );
        return product;
    }
    extractProductDataUpdateNoImage(payload) {
        const product = {
            name: payload.name,
            brand_code: payload.brand_code,
            price: payload.price,
            description: payload.description,
            updateAt: Date(),
        };
        // Remove undefined fields
        Object.keys(product).forEach(
            (key) => product[key] === undefined && delete product[key]
        );
        return product;
    }
    async create(payloadBody, payloadFile) {
        const product =  this.extractProductData(payloadBody, payloadFile);
        const result = await this.Product.findOneAndUpdate(
            product,
            { $set: product },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }
    async find(filter) {
        const cursor = await this.Product.aggregate([
            {
                $lookup: {
                    from: "brands",
                    localField: "brand_code",
                    foreignField: "code",
                    as: "brand"
                },
              
            },
        ]);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findById(id) {
        return await this.Product.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id, payloadBody, payloadFile) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractProductDataUpdate(payloadBody, payloadFile);
        await this.deleteFileProduct(id);
        const result = await this.Product.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }
    async updateNoImage(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };

        const update = this.extractProductDataUpdateNoImage(payload);
        const result = await this.Product.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }
    async deleteFileProduct(id) {
        let product = await this.findById(id);
        let filePath = './public/images/products/' + product.image;
        fs.unlinkSync(filePath);
    }
    async delete(id) {
        this.deleteFileProduct(id);
        const result = await this.Product.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }
    async deleteAll() {
        const result = await this.Product.deleteMany({});
        return result.deletedCount;
    }
}
module.exports = ProductService;
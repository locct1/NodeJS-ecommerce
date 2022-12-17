const { ObjectId } = require("mongodb");
const moment = require('moment');
const fs = require('fs');
class BrandService {
    constructor(client) {
        this.Brand = client.db().collection("brands");
    }
    // Định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractBrandData(payloadBody,payloadFile) {
        const brand = {
            name: payloadBody.name,
            image: payloadFile,
            code: String(ObjectId()) + Math.floor(Math.random() * 16777215).toString(16),
            createAt: Date(),
            updateAt:Date(),
        };
        // Remove undefined fields
        Object.keys(brand).forEach(
            (key) => brand[key] === undefined && delete brand[key]
        );
        return brand;
    }
    extractBrandDataUpdate(payloadBody, payloadFile) {
        const brand = {
            name: payloadBody.name,
            image: payloadFile ,
            updateAt: Date(),
        };
        // Remove undefined fields
        Object.keys(brand).forEach(
            (key) => brand[key] === undefined && delete brand[key]
        );
        return brand;
    }
    extractBrandDataUpdateNoImage(payload) {
        const brand = {
            name: payload.name,
            updateAt: Date(),
        };
        // Remove undefined fields
        Object.keys(brand).forEach(
            (key) => brand[key] === undefined && delete brand[key]
        );
        return brand;
    }
    async create(payloadBody,payloadFile) {
        const brand =  this.extractBrandData(payloadBody, payloadFile);
        const result = await this.Brand.findOneAndUpdate(
            brand,
            { $set: brand },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }
    async find(filter) {
        const cursor = await this.Brand.find(filter);
        return await cursor.toArray();
    }
    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }
    async findById(id) {
        return await this.Brand.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id, payloadBody, payloadFile) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractBrandDataUpdate(payloadBody,payloadFile);
        await this.deleteFileBrand(id);
        const result = await this.Brand.findOneAndUpdate(
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

        const update = this.extractBrandDataUpdateNoImage(payload);
        const result = await this.Brand.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }
    async deleteFileBrand(id){
        let brand = await this.findById(id);
        let filePath = './public/images/brands/' + brand.image;
        fs.unlinkSync(filePath);
    }
    async delete(id) {
       this.deleteFileBrand(id);
        const result = await this.Brand.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }
    async deleteAll() {
        const result = await this.Brand.deleteMany({});
        return result.deletedCount;
    }
}
module.exports = BrandService;
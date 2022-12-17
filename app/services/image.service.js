const { ObjectId } = require("mongodb");
class ImageService {
    constructor(client) {
        this.Image = client.db().collection("images");
    }
    async create(data) {
      let result = await this.Image.insertOne(data, (err, result) => {

           
          return result.value;
        })
    }
}
module.exports = ImageService;
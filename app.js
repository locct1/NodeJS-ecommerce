const contactsRouter = require("./app/routes/contact.route");
const brandsRouter = require("./app/routes/brand.route");
const productsRouter = require("./app/routes/product.route");
const ordersRouter = require("./app/routes/order.route");
const usersRouter = require("./app/routes/user.route");
const clientsRouter = require("./app/routes/client.route");
const cookieParser = require('cookie-parser');
const ApiError = require("./app/api-error");
const path = require('path');
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const app = express();
app.use(express.static('public'));
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "Welcome to contact book application." });
});

app.use(cookieParser())

app.use("/api/contacts", contactsRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/clients", clientsRouter);
app.use("/api/orders", ordersRouter);
// app.post("api/contacts/image", (req, res) => {
//     res.json({ message: "Welcome to contact book application." });
// });
// handle 404 response
app.use((req, res, next) => {
    // Code ở đây sẽ chạy khi không có route được định nghĩa nào
    // khớp với yêu cầu. Gọi next() để chuyển sang middleware xử lý lỗi
    return next(new ApiError(404,1, "Resource not found"));
});
// define error-handling middleware last, after other app.use() and routes calls
app.use((err, req, res, next) => {
    // Middleware xử lý lỗi tập trung.
    // Trong các đoạn code xử lý ở các route, gọi next(error)
    // sẽ chuyển về middleware xử lý lỗi này
    return res.status(err.statusCode || 500).json({
        message: err.message || "Internal Server Error",
    });
});

module.exports = app;
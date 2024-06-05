const express = require("express");
const vite_express = require("vite-express");

/* 
    Uncomment for production
    Need to run 'vite build [root]' to build for production first
*/
// vite_express.config({ mode: "production" });

const app = express();

const port = 3000;

app.use(express.static("public"));

vite_express.listen(app, port, function () {
    console.log(`listening at : http://localhost:${port}`);
});
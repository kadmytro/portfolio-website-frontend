const fs = require("fs");
require("dotenv").config();

fs.mkdirSync("dist", { recursive: true });

const env = {
  API_URL: process.env.API_URL,
};

const envString = `window.env = ${JSON.stringify(env)};`;

fs.writeFileSync("dist/env.js", envString);

fs.copyFileSync("index.html", "dist/index.html");
fs.copyFileSync("style.css", "dist/style.css");
fs.copyFileSync("script.js", "dist/script.js");
fs.cpSync("assets", "dist/assets", { recursive: true });
fs.cpSync("lib", "dist/lib", { recursive: true });

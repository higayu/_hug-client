// main/parts/handlers/sqlite/memo.js

const { createCrudHandler } = require("./crudFactory");

module.exports = createCrudHandler({
  table: "memo",
  columns: ["id", "title", "content"],
});
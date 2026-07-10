const headers = require("./headers");

const errorHandle = (
  res,
  statusCode = 400,
  message = "欄位填寫異常，或輸入 ID 不存在",
) => {
  res.writeHead(statusCode, headers);
  res.write(
    JSON.stringify({
      status: false,
      message: message,
    }),
  );
  res.end();
};

module.exports = errorHandle;

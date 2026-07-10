const http = require("http");
const { v4: uuidv4 } = require("uuid");
const headers = require("./headers");
const errorHandle = require("./errorHandle");

const todos = [];

// 建立共用的成功回應函式
const successHandle = (res, data, statusCode = 200) => {
  res.writeHead(statusCode, headers);
  res.write(
    JSON.stringify({
      status: "success",
      data: data,
    }),
  );
  res.end();
};

const reqListener = (req, res) => {
  let body = "";

  req.on("data", (chunk) => {
    body += chunk;
  });

  // 將所有路由判斷放在 end 事件中，確保非同步的 body 接收完畢
  req.on("end", () => {
    // 優先處理 OPTIONS 預檢請求
    if (req.method === "OPTIONS") {
      res.writeHead(200, headers);
      res.end();
      return;
    }

    if (req.url === "/todos" && req.method === "GET") {
      successHandle(res, todos);
    } else if (req.url === "/todos" && req.method === "POST") {
      try {
        const parsedBody = JSON.parse(body);
        const title = parsedBody?.title;

        if (typeof title === "string" && title?.trim() !== "") {
          const newTodo = {
            id: uuidv4(),
            title: title.trim(),
          };
          todos.push(newTodo);
          successHandle(res, todos, 201); // POST 成功通常回傳 201 Created
        } else {
          errorHandle(res);
        }
      } catch (err) {
        errorHandle(res);
      }
    } else if (req.url === "/todos" && req.method === "DELETE") {
      todos.length = 0;
      successHandle(res, todos);
    } else if (req.url.startsWith("/todos/") && req.method === "DELETE") {
      const id = req.url.split("/").pop();
      const index = todos.findIndex((todo) => todo.id === id);

      if (index !== -1) {
        todos.splice(index, 1);
        successHandle(res, todos);
      } else {
        errorHandle(res, 400, "查無此 ID");
      }
    } else if (req.url.startsWith("/todos/") && req.method === "PATCH") {
      try {
        const id = req.url.split("/").pop();
        const index = todos.findIndex((todo) => todo.id === id);
        const parsedBody = JSON.parse(body);
        const title = parsedBody.title;

        //  加上型別檢查
        if (index !== -1 && typeof title === "string" && title?.trim() !== "") {
          todos[index].title = title?.trim();
          successHandle(res, todos);
        } else {
          errorHandle(res);
        }
      } catch (err) {
        errorHandle(res);
      }
    } else {
      // 處理 404 Not Found
      errorHandle(res, 404, "Route not found");
    }
  });
};

const server = http.createServer(reqListener);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`[成功] 伺服器已啟動！正在監聽 http://127.0.0.1:${PORT}`);
});

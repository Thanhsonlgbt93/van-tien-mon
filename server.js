
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const TIKTOK_USERNAME = process.env.TIKTOK_USERNAME || "";

app.use(express.static("."));

const realms = [
  { name: "Phàm Nhân", power: 0 },
  { name: "Luyện Khí", power: 100 },
  { name: "Trúc Cơ", power: 300 },
  { name: "Kim Đan", power: 700 },
  { name: "Nguyên Anh", power: 1400 },
  { name: "Hóa Thần", power: 2500 },
  { name: "Luyện Hư", power: 4200 },
  { name: "Hợp Thể", power: 6500 },
  { name: "Đại Thừa", power: 9500 },
  { name: "Độ Kiếp", power: 13500 },
  { name: "Chân Tiên", power: 18500 },
  { name: "Tiên Đế", power: 25000 }
];

const disciples = {};

function getRealm(power) {
  let realm = realms[0].name;

  for (const item of realms) {
    if (power >= item.power) realm = item.name;
  }

  return realm;
}

function cultivate(userId, nickname, amount, source) {
  if (!disciples[userId]) {
    disciples[userId] = {
      id: userId,
      name: nickname || "Đệ tử vô danh",
      power: 0,
      stones: 0,
      realm: "Phàm Nhân"
    };
  }

  const disciple = disciples[userId];

  disciple.name = nickname || disciple.name;
  disciple.power += amount;
  disciple.realm = getRealm(disciple.power);

  io.emit("cultivation", {
    disciple,
    amount,
    source,
    disciples: Object.values(disciples)
  });
}

function joinSect(userId, nickname) {
  if (!disciples[userId]) {
    disciples[userId] = {
      id: userId,
      name: nickname || "Đệ tử vô danh",
      power: 0,
      stones: 0,
      realm: "Phàm Nhân"
    };
  }

  io.emit("joined", {
    disciple: disciples[userId],
    disciples: Object.values(disciples)
  });
}

io.on("connection", (socket) => {
  socket.emit("initialData", {
    disciples: Object.values(disciples),
    realms
  });

  socket.on("demoJoin", (name) => {
    const id = "demo_" + String(name).replace(/\W/g, "");
    joinSect(id, name);
  });

  socket.on("demoChat", (name) => {
    const id = "demo_" + String(name).replace(/\W/g, "");
    cultivate(id, name, 10, "Trò chuyện");
  });

  socket.on("demoLike", (name) => {
    const id = "demo_" + String(name).replace(/\W/g, "");
    cultivate(id, name, 100, "Thả tim");
  });

  socket.on("demoGift", (name) => {
    const id = "demo_" + String(name).replace(/\W/g, "");
    cultivate(id, name, 500, "Tặng quà thử nghiệm");
  });
});



app.get("/health", (req, res) => {
  res.json({ status: "online", sect: "Vạn Tiên Môn" });
});

server.listen(PORT, () => {
  console.log("Vạn Tiên Môn đang chạy tại cổng", PORT);
});

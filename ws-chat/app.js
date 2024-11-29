const WebSocket = require("ws");

// WebSocket 서버 생성
const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket 서버가 8080 포트에서 실행 중입니다.");

// 채팅방 관리 (Map: { roomId -> Set of clients })
const rooms = new Map();

wss.on("connection", (ws) => {
  console.log("새 클라이언트 연결됨.");
  let currentRoomId = null;

  // 메시지 수신
  ws.on("message", (data) => {
    try {
      const parsedData = JSON.parse(data); // JSON 형식으로 메시지 처리
      const { type, roomId, payload } = parsedData;

      if (type === "join") {
        // 클라이언트가 채팅방에 참여
        currentRoomId = roomId;

        // 방 생성 및 클라이언트 추가
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(ws);

        console.log(`클라이언트가 방 ${roomId}에 참여했습니다.`);
      } else if (type === "message" && currentRoomId) {
        // 메시지 브로드캐스트
        const roomClients = rooms.get(currentRoomId);
        if (roomClients) {
          roomClients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ roomId: currentRoomId, payload }));
            }
          });
        }
      }
    } catch (err) {
      console.error("메시지 처리 중 오류:", err);
    }
  });

  // 연결 종료
  ws.on("close", () => {
    if (currentRoomId && rooms.has(currentRoomId)) {
      rooms.get(currentRoomId).delete(ws);
      console.log(`클라이언트가 방 ${currentRoomId}에서 나갔습니다.`);
      // 방이 비었으면 삭제
      if (rooms.get(currentRoomId).size === 0) {
        rooms.delete(currentRoomId);
      }
    }
  });
});

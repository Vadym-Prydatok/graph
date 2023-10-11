import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [openData, setOpenData] = useState(false);
  const [socket, setSocket] = useState(null);
  const [dataPoints, setDataPoints] = useState([]);
  const height = 200;
  const maxDataPoints = 600;
  const canvasWidth = 800;
  const canvasRef = useRef(null);

  if (dataPoints.length > maxDataPoints) {
    setDataPoints(dataPoints.slice(dataPoints.length - maxDataPoints));
  }

  useEffect(() => {
    drawLine();
  }, [dataPoints]);

  function drawLine() {
    const canvas = canvasRef.current;

    if (!canvas) return;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "blue";
    context.lineWidth = 2;
    context.lineWidth = 1;

    for (let i = 1; i < 6; i++) {
      const y = height - i * (height / 6);
      context.moveTo(0, y);
      context.lineTo(10, y);
      context.fillText(i.toString(), 15, y + 4);
    }

    context.stroke();

    context.beginPath();
    for (let i = 1; i < dataPoints.length; i++) {
      const x1 = (i - 1) * (canvasWidth / maxDataPoints);
      const x2 = i * (canvasWidth / maxDataPoints);
      const y1 = height - dataPoints[i - 1];
      const y2 = height - dataPoints[i];

      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
    }

    context.stroke();
    context.closePath();
  }

  const openWebSocket = () => {
    const newSocket = new WebSocket(
      "wss://stream.binance.com:9443/ws/btcusdt@trade"
    );
    newSocket.onmessage = function (event) {
      const newData = JSON.parse(event.data);
      setDataPoints((prevDataPoints) => [...prevDataPoints, +newData.q * 100]);
    };

    setSocket(newSocket);
    setOpenData(true);
  };

  const closeWebSocket = () => {
    if (socket) {
      socket.close();
      setSocket(null);
      setOpenData(false);
    }
  };

  return (
    <div>
      {openData ? (
        <button onClick={closeWebSocket}>Закрити WebSocket</button>
      ) : (
        <button onClick={openWebSocket}>Відкрити WebSocket</button>
      )}
      <div>
        <h1>Кількість активу, що торгується binance</h1>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={height}
        />
      </div>
    </div>
  );
}

export default App;

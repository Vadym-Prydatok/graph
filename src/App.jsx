import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [openData, setOpenData] = useState(false);
  const [socket, setSocket] = useState(null);
  const [dataPoints, setDataPoints] = useState([]);

  const [maxValue, setMaxValue] = useState(0);
  const [minValue, setMinValue] = useState(Infinity);
  const [height, setHeight] = useState(100)

  const maxDataPoints = window.screen.width / 2;
  const canvasWidth = window.screen.width / 1.5;
  const canvasRef = useRef(null);
  console.log(window.screen.width)
  

  if (dataPoints.length > maxDataPoints) {
    setDataPoints(dataPoints.slice(dataPoints.length - maxDataPoints));
  }

  const maxData = Math.max.apply(null, dataPoints);
  const minData = Math.min.apply(null, dataPoints);

  if (maxData > maxValue) {
    setMaxValue(maxData);
    setHeight((maxData * 10));
  }

  if (minData < minValue) {
    setMinValue(minData)
  }

  useEffect(() => {
    drawLine();
  }, [dataPoints]);

  function drawLine() {
    const canvas = canvasRef.current;
    const canvasHeight = height;
    const rows = 10;
    const margin = 20;
  
    if (!canvas) return;
    const context = canvas.getContext("2d");
  
    context.clearRect(0, 0, canvas.width, canvas.height);
  
    const dataRange = maxValue - minValue;
    const graphHeight = canvasHeight - 2 * margin;
  
    //marking
    context.beginPath();
    context.strokeStyle = "#bbb";
    context.lineWidth = 1;
  
    for (let i = 0; i <= rows; i++) {
      const markingValue = minValue + (dataRange / rows) * i;
      const y = canvasHeight - margin - (markingValue - minValue) / dataRange * graphHeight;
  
      context.moveTo(0, y);
      context.lineTo(canvasWidth, y);
      context.fillText(markingValue.toFixed(3), 10, y - 5);
    }
  
    context.stroke();
    context.closePath();
  
    //graph
    context.beginPath();
    context.strokeStyle = "blue";
    context.lineWidth = 2;
  
    for (let i = 1; i < dataPoints.length; i++) {
      const x1 = (i - 1) * (canvasWidth / maxDataPoints);
      const x2 = i * (canvasWidth / maxDataPoints);
      const y1 = canvasHeight - margin - (dataPoints[i - 1] - minValue) / dataRange * graphHeight;
      const y2 = canvasHeight - margin - (dataPoints[i] - minValue) / dataRange * graphHeight;
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

      const BTStoUSD = +newData.p / 1000;
      setDataPoints((prevDataPoints) => [...prevDataPoints, BTStoUSD]);
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
        <h1>BTC Bitcoin</h1>
        {maxValue ? <p>{`min-$${minValue.toFixed(3)} max-$${maxValue.toFixed(3)}`}</p> : null}
        <canvas
          className="canvas"
          ref={canvasRef}
          width={canvasWidth}
          height={height}
        />
      </div>
    </div>
  );
}


export default App;

import React, { useEffect, useRef, useState } from "react";
import {env} from "./vars"
import mqtt from "mqtt";

const apiUrl = env.REACT_APP_API_URL;
const mqttUsername = env.REACT_APP_MQTT_USERNAME;
const mqttPassword = env.REACT_APP_MQTT_PASSWORD;
const mqttTopic = env.REACT_APP_MQTT_TOPIC;

function App() {
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState("desconectado");
  const [tried, setTried] = useState(false);

  const [history, setHistory] = useState<string[]>([]);
  const client_mqtt = useRef<mqtt.MqttClient>()

  const connectMQTT = async () => {
    setTried(true)
    try {

      let client = await mqtt.connectAsync(apiUrl, {
        reconnectPeriod: 1000,
        username: mqttUsername,
        password: mqttPassword,
        forceNativeWebSocket: true,
        connectTimeout: 5000,
        clean: true,
        keepalive: 10,
        reschedulePings: true
      });
      client_mqtt.current = client
      setStatus(client.connected ? "Conectado" : "Desconectado");

      await client.subscribe(mqttTopic);

      client.on("message", (topic, message) => {
        setHistory(prev => [...prev, message.toString()]);
      });

      // Establecer un intervalo para revisar la conexión
      setInterval(() => {
        setStatus(client.connected ? "Conectado" : "Desconectado");
      }, 1000);

    } catch (error) {
      console.error('Error during connection or subscription:', error);
    }
  };



  useEffect(() => {
    //setCount(prev => prev + 1);
  }, [count]);

  if (!tried ) return <input type="button" value="Connectar mqtt" onClick={connectMQTT} />

  return (
    <>
      <h1>Estado de la conexión: {status}</h1>
      <br />
      <br />
      <label htmlFor="Porcentaje de inclinación">Porcentaje de inclinación: </label>
      <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value))} />
      <button onClick={() => client_mqtt.current?.publish(mqttTopic, count.toString())}>Enviar mensaje</button>

      <br />
      <br />
      <h2>Mensajes</h2>
      {history.map((_e, index) => (
        <p key={index}>{_e}</p>
      ))}
    </>
  );
}

export { App };

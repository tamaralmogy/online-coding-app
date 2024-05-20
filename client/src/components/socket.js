import io from "socket.io-client";

// const socket = io.connect("http://localhost:4000");
const socket = io.connect("https://warm-mesa-50121-a03e03717a65.herokuapp.com");

export default socket;

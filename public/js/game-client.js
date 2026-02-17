import { WebSocketClient } from "./websocket-client.js";

export class GameClient {
  static instance = null;

  constructor() {
    if (GameClient.instance) {
      throw new Error(
        "Use GameClient.getInstance() instead of new GameClient()",
      );
    }

    this.wsClient = new WebSocketClient();
    this.roomCode = null;
    this.isCreator = false;
    this.playerCount = 6;

    this.initializeEventHandlers();
    this.initializeUI();

    this.boundCreateGame = this.createGame.bind(this);
    this.boundJoinGame = this.joinGame.bind(this);
    this.boundCopyRoomCode = this.copyRoomCode.bind(this);

    GameClient.instance = this;
  }

  static getInstance() {
    if (!GameClient.instance) {
      GameClient.instance = new GameClient();
    }
    return GameClient.instance;
  }

  initializeEventHandlers() {
    this.wsClient.on("connected", () => {
      this.updateConnectionStatus("Connected to game server", "success");
    });

    this.wsClient.on("disconnected", () => {
      this.updateConnectionStatus("Disconnected from game server", "error");
    });

    this.wsClient.on("error", (error) => {
      this.updateConnectionStatus("Connection error", "error");
      console.error("WebSocket error:", error);
    });

    this.wsClient.on("message", (data) => {
      this.handleServerMessage(data);
    });
  }

  initializeUI() {
    this.createGameBtn = document.getElementById("createGameBtn");
    this.joinGameBtn = document.getElementById("joinGameBtn");
    this.copyCodeBtn = document.getElementById("copyCodeBtn");
    this.playerCountSelect = document.getElementById("playerCount");
    this.roomCodeInput = document.getElementById("roomCode");
    this.roomCodeDisplay = document.getElementById("roomCodeDisplay");
    this.roomCodeContainer = document.getElementById("roomCodeContainer");
    this.connectionStatus = document.getElementById("connectionStatus");

    this.createGameBtn.addEventListener("click", this.boundCreateGame);
    this.joinGameBtn.addEventListener("click", this.boundJoinGame);
    this.copyCodeBtn.addEventListener("click", this.boundCopyRoomCode);

    this.roomCodeInput.addEventListener("input", () => {
      this.joinGameBtn.disabled = this.roomCodeInput.value.trim().length !== 6;
    });

    this.playerCountSelect.addEventListener("change", () => {
      this.playerCount = parseInt(this.playerCountSelect.value, 10);
    });

    this.connectToServer();
  }

  reinitializeUI() {
    if (this.createGameBtn) {
      this.createGameBtn.removeEventListener("click", this.boundCreateGame);
    }
    if (this.joinGameBtn) {
      this.joinGameBtn.removeEventListener("click", this.boundJoinGame);
    }
    if (this.copyCodeBtn) {
      this.copyCodeBtn.removeEventListener("click", this.boundCopyRoomCode);
    }
    this.initializeUI();
  }

  connectToServer() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    this.wsClient.connect(wsUrl);
  }

  createGame() {
    if (!this.wsClient.isConnected()) {
      this.updateConnectionStatus("Not connected to server", "error");
      return;
    }

    this.playerCount = parseInt(this.playerCountSelect.value, 10);

    this.wsClient.send({
      type: "create-room",
      data: {
        maxPlayers: this.playerCount,
      },
    });
  }

  joinGame() {
    const roomCode = this.roomCodeInput.value.trim().toUpperCase();

    if (!this.wsClient.isConnected()) {
      this.updateConnectionStatus("Not connected to server", "error");
      return;
    }

    if (roomCode.length !== 6) {
      this.updateConnectionStatus("Invalid room code", "error");
      return;
    }

    this.wsClient.send({
      type: "join-room",
      data: {
        roomCode: roomCode,
      },
    });
  }

  handleServerMessage(message) {
    console.log("Received message:", message);

    switch (message.type) {
      case "room-created":
        this.handleRoomCreated(message.payload);
        break;
      case "room-joined":
        this.handleRoomJoined(message.payload);
        break;
      case "player-joined":
        this.handleRoomJoined(message.payload);
        break;
      case "error":
        this.handleError(message.payload);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  handleRoomCreated(data) {
    this.roomCode = data.roomCode;
    this.isCreator = true;

    this.roomCodeDisplay.textContent = this.roomCode;
    this.roomCodeContainer.classList.remove("hidden");

    this.updateConnectionStatus(
      `Game created! Room code: ${this.roomCode}`,
      "success",
    );

    setTimeout(() => {
      window.location.href = `/croco/${this.roomCode}`;
    }, 2000);
  }

  handleRoomJoined(data) {
    this.roomCode = data.roomCode;
    this.isCreator = false;

    this.updateConnectionStatus(`Joined room: ${this.roomCode}`, "success");

    setTimeout(() => {
      window.location.href = `/croco/${this.roomCode}`;
    }, 2000);
  }

  handleError(data) {
    this.updateConnectionStatus(data.message || "An error occurred", "error");
  }

  updateConnectionStatus(message, type) {
    this.connectionStatus.textContent = message;
    this.connectionStatus.className = `connection-status ${type}`;
    this.connectionStatus.classList.remove("hidden");

    setTimeout(() => {
      this.connectionStatus.classList.add("hidden");
    }, 8000);
  }

  copyRoomCode() {
    if (this.roomCode) {
      navigator.clipboard
        .writeText(this.roomCode)
        .then(() => {
          this.updateConnectionStatus(
            "Room code copied to clipboard!",
            "success",
          );
        })
        .catch(() => {
          this.updateConnectionStatus("Failed to copy room code", "error");
        });
    }
  }

  generateRoomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

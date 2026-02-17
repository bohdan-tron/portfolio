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

    GameClient.instance = this;
  }

  static getInstance() {
    if (!GameClient.instance) {
      GameClient.instance = new GameClient();
    }
    return GameClient.instance;
  }

  initializeEventHandlers() {
    // WebSocket event handlers
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
    // Get UI elements
    this.createGameBtn = document.getElementById("createGameBtn");
    this.joinGameBtn = document.getElementById("joinGameBtn");
    this.copyCodeBtn = document.getElementById("copyCodeBtn");
    this.playerCountSelect = document.getElementById("playerCount");
    this.roomCodeInput = document.getElementById("roomCode");
    this.roomCodeDisplay = document.getElementById("roomCodeDisplay");
    this.roomCodeContainer = document.getElementById("roomCodeContainer");
    this.connectionStatus = document.getElementById("connectionStatus");

    // Add event listeners
    this.createGameBtn.addEventListener("click", () => this.createGame());
    this.joinGameBtn.addEventListener("click", () => this.joinGame());
    this.copyCodeBtn.addEventListener("click", () => this.copyRoomCode());

    // Enable/disable join button based on room code input
    this.roomCodeInput.addEventListener("input", () => {
      this.joinGameBtn.disabled = this.roomCodeInput.value.trim().length !== 6;
    });

    // Update player count when changed
    this.playerCountSelect.addEventListener("change", () => {
      this.playerCount = parseInt(this.playerCountSelect.value, 10);
    });

    // Initialize WebSocket connection
    this.connectToServer();
  }

  reinitializeUI() {
    if (this.createGameBtn) {
      this.createGameBtn.removeEventListener("click", this.createGame);
    }

    if (this.joinGameBtn) {
      this.joinGameBtn.removeEventListener("click", this.joinGame);
    }

    if (this.copyCodeBtn) {
      this.copyCodeBtn.removeEventListener("click", this.copyRoomCode);
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
        this.handleRoomCreated(message.data);
        break;
      case "room-joined":
        this.handleRoomJoined(message.data);
        break;
      case "error":
        this.handleError(message.data);
        break;
      default:
        console.log("Unknown message type:", message.type);
    }
  }

  handleRoomCreated(data) {
    this.roomCode = data.roomCode;
    this.isCreator = true;

    // Display room code
    this.roomCodeDisplay.textContent = this.roomCode;
    this.roomCodeContainer.classList.remove("hidden");

    this.updateConnectionStatus(
      `Game created! Room code: ${this.roomCode}`,
      "success",
    );

    // Redirect to room page after a short delay
    setTimeout(() => {
      window.location.href = `/croco/${this.roomCode}`;
    }, 2000);
  }

  handleRoomJoined(data) {
    this.roomCode = data.roomCode;
    this.isCreator = false;

    this.updateConnectionStatus(`Joined room: ${this.roomCode}`, "success");

    // Redirect to room page after a short delay
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

    // Hide status message after 5 seconds
    setTimeout(() => {
      this.connectionStatus.classList.add("hidden");
    }, 5000);
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

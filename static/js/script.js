class ChatBot {
  constructor() {
    this.messageInput = document.getElementById("messageInput");
    this.sendBtn = document.getElementById("sendBtn");
    this.chatMessages = document.getElementById("chatMessages");
    this.typingIndicator = document.getElementById("typingIndicator");
    this.charCount = document.querySelector(".char-count");
    this.resetBtn = document.getElementById("resetBtn");
    this.historyBtn = document.getElementById("historyBtn");
    this.historyModal = document.getElementById("historyModal");
    this.closeHistory = document.getElementById("closeHistory");
    this.historyContent = document.getElementById("historyContent");

    this.initEventListeners();
    this.updateCharCount();
  }

  initEventListeners() {
    this.sendBtn.addEventListener("click", () => this.sendMessage());
    this.messageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    this.messageInput.addEventListener("input", () => this.updateCharCount());
    this.resetBtn.addEventListener("click", () => this.resetConversation());
    this.historyBtn.addEventListener("click", () => this.showHistory());
    this.closeHistory.addEventListener("click", () => this.hideHistory());

    this.historyModal.addEventListener("click", (e) => {
      if (e.target === this.historyModal) {
        this.hideHistory();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideHistory();
      }
    });
  }

  updateCharCount() {
    const length = this.messageInput.value.length;
    this.charCount.textContent = `${length}/1000`;

    if (length > 800) {
      this.charCount.style.color = "#ef4444";
    } else if (length > 600) {
      this.charCount.style.color = "#f59e0b";
    } else {
      this.charCount.style.color = "#64748b";
    }
  }

  async sendMessage() {
    const message = this.messageInput.value.trim();
    if (!message) return;

    this.addUserMessage(message);
    this.messageInput.value = "";
    this.updateCharCount();
    this.setLoading(true);

    try {
      const response = await fetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message }),
      });

      const data = await response.json();

      if (response.ok) {
        this.addBotMessage(data.response);
      } else {
        this.addBotMessage(`Error: ${data.error}`);
        this.showToast("error", data.error);
      }
    } catch (error) {
      this.addBotMessage("An error occurred while connecting to the server.");
      this.showToast("error", "Unable to connect to server");
    }

    this.setLoading(false);
  }

  addUserMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message user-message";

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
                <div class="message-time">${time}</div>
            </div>
        `;

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  addBotMessage(message) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "bot-message";

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    messageDiv.innerHTML = `
            <div class="bot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>${this.formatMessage(message)}</p>
                <div class="message-time">${time}</div>
            </div>
        `;

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  formatMessage(message) {
    return this.escapeHtml(message)
      .replace(/\n/g, "<br>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  setLoading(loading) {
    this.sendBtn.disabled = loading;
    this.messageInput.disabled = loading;

    if (loading) {
      this.typingIndicator.style.display = "flex";
      this.scrollToBottom();
    } else {
      this.typingIndicator.style.display = "none";
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }, 100);
  }

  async resetConversation() {
    if (!confirm("Are you sure you want to clear the entire conversation?")) {
      return;
    }

    try {
      const response = await fetch("/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        this.clearMessages();
        this.showWelcomeMessage();
        this.showToast("success", "Conversation has been cleared");
      } else {
        this.showToast("error", data.error);
      }
    } catch (error) {
      this.showToast("error", "Unable to clear conversation");
    }
  }

  clearMessages() {
    this.chatMessages.innerHTML = "";
  }

  showWelcomeMessage() {
    const welcomeDiv = document.createElement("div");
    welcomeDiv.className = "welcome-message";
    welcomeDiv.innerHTML = `
            <div class="bot-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Hello! I'm your modern chatbot. Ask me anything!</p>
            </div>
        `;
    this.chatMessages.appendChild(welcomeDiv);
  }

  async showHistory() {
    this.historyModal.style.display = "block";
    this.historyContent.innerHTML = "<p>Loading history...</p>";

    try {
      const response = await fetch("/history");
      const data = await response.json();

      if (response.ok) {
        this.displayHistory(data.history);
      } else {
        this.historyContent.innerHTML = `<p>Error: ${data.error}</p>`;
      }
    } catch (error) {
      this.historyContent.innerHTML =
        "<p>Unable to load conversation history</p>";
    }
  }

  displayHistory(history) {
    if (history.length === 0) {
      this.historyContent.innerHTML = "<p>No conversation yet.</p>";
      return;
    }

    let historyHtml = "";
    history.forEach((item, index) => {
      const role = item.role === "user" ? "You" : "ChatBot";
      const roleClass = item.role === "user" ? "user" : "bot";

      historyHtml += `
                <div class="history-item">
                    <div class="history-role ${roleClass}">${role}:</div>
                    <div class="history-content">${this.formatMessage(
                      item.content
                    )}</div>
                </div>
            `;
    });

    this.historyContent.innerHTML = historyHtml;
  }

  hideHistory() {
    this.historyModal.style.display = "none";
  }

  showToast(type, message) {
    const toast = document.getElementById(`${type}Toast`);
    const messageSpan = document.getElementById(`${type}Message`);

    messageSpan.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
      toast.style.display = "none";
    }, 3000);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ChatBot();
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
      messageInput.focus();
    }
  }
});

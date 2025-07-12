document.addEventListener('DOMContentLoaded', function () {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const typingIndicator = document.getElementById('typingIndicator');
    const suggestionChips = document.querySelectorAll('.suggestion-chip');

    // Send message on button click
    sendButton.addEventListener('click', sendMessage);

    // Send message on Enter key
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') sendMessage();
    });

    // Suggestion chips
    suggestionChips.forEach(chip => {
        chip.addEventListener('click', function () {
            userInput.value = this.textContent;
            userInput.focus();
        });
    });

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        addMessage(message, "user");
        userInput.value = "";
        typingIndicator.style.display = 'flex';
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Study mode: restrict non-educational queries
        const bannedKeywords = ['movie', 'game', 'song', 'celebrity', 'joke', 'music', 'cricket', 'football', 'sports', 'entertainment'];
        const lowerMessage = message.toLowerCase();
        if (bannedKeywords.some(keyword => lowerMessage.includes(keyword))) {
            setTimeout(() => {
                typingIndicator.style.display = 'none';
                addMessage("⚠️ I'm currently in Study Mode. Let's focus on educational topics!", "ai");
            }, 1000);
            return;
        }

        try {
            const response = await fetch("/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();

            setTimeout(() => {
                typingIndicator.style.display = 'none';
                addMessage(data.reply, "ai");
            }, 1000);
        } catch (error) {
            typingIndicator.style.display = 'none';
            addMessage("⚠️ Sorry, I'm having trouble connecting. Please try again.", "ai");
            console.error("Error:", error);
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

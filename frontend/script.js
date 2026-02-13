const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const themeToggle = document.getElementById('theme-toggle');

// Stores the full conversation history for multi-turn context
const conversation = [];

// ── Dark Mode Toggle ──
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Load saved theme or respect system preference
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }
})();

// ── Markdown-lite Parser ──
function formatBotText(raw) {
  // Escape HTML
  let text = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks: ```...```
  text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Inline code: `...`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold: **...**
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *...*
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Split into lines for list/paragraph processing
  const lines = text.split('\n');
  let html = '';
  let inOl = false;
  let inUl = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Ordered list: "1. item"
    const olMatch = trimmed.match(/^\d+\.\s+(.*)/);
    // Unordered list: "- item" or "* item"
    const ulMatch = trimmed.match(/^[-*]\s+(.*)/);

    if (olMatch) {
      if (!inOl) { html += '<ol>'; inOl = true; }
      if (inUl) { html += '</ul>'; inUl = false; }
      html += `<li>${olMatch[1]}</li>`;
    } else if (ulMatch) {
      if (!inUl) { html += '<ul>'; inUl = true; }
      if (inOl) { html += '</ol>'; inOl = false; }
      html += `<li>${ulMatch[1]}</li>`;
    } else {
      if (inOl) { html += '</ol>'; inOl = false; }
      if (inUl) { html += '</ul>'; inUl = false; }
      if (trimmed === '') {
        // skip empty lines between paragraphs
      } else {
        html += `<p>${trimmed}</p>`;
      }
    }
  }
  if (inOl) html += '</ol>';
  if (inUl) html += '</ul>';

  return html;
}

// ── Chat Logic ──
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Show user message and clear input
  appendMessage('user', userMessage);
  input.value = '';

  // Track the message in conversation history
  conversation.push({ role: 'user', text: userMessage });

  // Show temporary thinking indicator
  const thinkingMsg = appendMessage('bot', 'Thinking...', true);

  // Disable form while waiting
  setFormDisabled(true);

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    const botReply = data.result;

    if (!botReply) {
      thinkingMsg.classList.remove('thinking');
      thinkingMsg.textContent = 'Sorry, no response received.';
      return;
    }

    // Replace thinking message with formatted reply
    thinkingMsg.classList.remove('thinking');
    thinkingMsg.innerHTML = formatBotText(botReply);

    // Track bot reply in conversation history
    conversation.push({ role: 'model', text: botReply });
  } catch (error) {
    console.error('Chat error:', error);
    thinkingMsg.classList.remove('thinking');
    thinkingMsg.textContent = 'Failed to get response from server.';
  } finally {
    setFormDisabled(false);
    input.focus();
    chatBox.scrollTop = chatBox.scrollHeight;
  }
});

/**
 * Appends a chat message to the chat box inside a row wrapper and returns the bubble element.
 */
function appendMessage(sender, text, isThinking = false) {
  const row = document.createElement('div');
  row.classList.add('message-row', sender);

  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (isThinking) {
    msg.classList.add('thinking');
    msg.textContent = text;
  } else if (sender === 'bot') {
    msg.innerHTML = formatBotText(text);
  } else {
    msg.textContent = text;
  }

  row.appendChild(msg);
  chatBox.appendChild(row);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

/**
 * Toggles the disabled state of the form input and button.
 */
function setFormDisabled(disabled) {
  input.disabled = disabled;
  form.querySelector('button').disabled = disabled;
}

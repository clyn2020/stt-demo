class TestWixMic extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isRecording = false;
    this.recognition = null;
  }

  connectedCallback() {
    // Create the UI
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          font-family: Arial, sans-serif;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
        }
        button:hover {
          background-color: #0056b3;
        }
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        textarea {
          width: 300px;
          height: 150px;
          padding: 10px;
          font-size: 14px;
          resize: none;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
      </style>
      <button id="micButton">Start Microphone</button>
      <textarea id="outputBox" placeholder="Your speech will appear here..." readonly></textarea>
    `;

    // Get elements
    this.micButton = this.shadowRoot.getElementById('micButton');
    this.outputBox = this.shadowRoot.getElementById('outputBox');

    // Initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.outputBox.value = "Sorry, your browser doesn't support Speech Recognition.";
      this.micButton.disabled = true;
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    // Event listeners
    this.micButton.addEventListener('click', this.toggleMic.bind(this));
    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
  }

  toggleMic() {
    if (!this.isRecording) {
      this.recognition.start();
      this.micButton.textContent = 'Stop Microphone';
      this.outputBox.value = 'Listening...';
      this.isRecording = true;
    } else {
      this.recognition.stop();
      this.micButton.textContent = 'Start Microphone';
      this.isRecording = false;
    }
  }

  handleResult(event) {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    this.outputBox.value = transcript;
  }

  handleError(event) {
    this.outputBox.value = `Error: ${event.error}`;
    this.micButton.textContent = 'Start Microphone';
    this.isRecording = false;
  }

  handleEnd() {
    if (this.isRecording) {
      this.recognition.start(); // Restart if still recording
    }
  }
}

// Define the custom element
customElements.define('test-wix-mic', TestWixMic);

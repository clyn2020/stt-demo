class TestWixMic extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isRecording = false;
    this.recognition = null;
  }

  connectedCallback() {
    console.log("TestWixMic element connected");
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

    this.micButton = this.shadowRoot.getElementById('micButton');
    this.outputBox = this.shadowRoot.getElementById('outputBox');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error("SpeechRecognition not supported");
      this.outputBox.value = "Sorry, your browser doesn't support Speech Recognition.";
      this.micButton.disabled = true;
      return;
    }

    console.log("SpeechRecognition API available");
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false; // Stop after each result
    this.recognition.interimResults = false; // Final results only
    this.recognition.lang = 'en-US';

    this.micButton.addEventListener('click', this.toggleMic.bind(this));
    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);
  }

  toggleMic() {
    console.log("Toggle mic clicked, isRecording:", this.isRecording);
    if (!this.isRecording) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          this.recognition.start();
          this.micButton.textContent = 'Stop Microphone';
          this.outputBox.value = 'Listening...';
          this.isRecording = true;
          console.log("Recognition started");
        })
        .catch(error => {
          console.error("getUserMedia error:", error.message);
          this.outputBox.value = `Mic access error: ${error.message}`;
        });
    } else {
      this.recognition.stop();
      this.micButton.textContent = 'Start Microphone';
      this.isRecording = false;
      console.log("Recognition stopped");
    }
  }

  handleResult(event) {
    const transcript = event.results[0][0].transcript;
    this.outputBox.value = transcript;
    console.log("Transcript:", transcript);
    // Send transcript to Wix page
    this.dispatchEvent(new CustomEvent('speechResult', { detail: { transcript }, bubbles: true }));
  }

  handleError(event) {
    console.error("Recognition error:", event.error);
    this.outputBox.value = `Error: ${event.error}`;
    this.micButton.textContent = 'Start Microphone';
    this.isRecording = false;
  }

  handleEnd() {
    console.log("Recognition ended");
    this.micButton.textContent = 'Start Microphone';
    this.isRecording = false;
  }
}

customElements.define('test-wix-mic', TestWixMic);

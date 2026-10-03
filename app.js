const state = {
  mode: "browse",
  layer: "application",
  steps: [],
  current: -1,
  timer: null,
  playing: false
};

const $ = (id) => document.getElementById(id);

const protocolSteps = $("protocolSteps");
const messageDetail = $("messageDetail");
const currentDirection = $("currentDirection");
const stepCounter = $("stepCounter");
const modeBadge = $("modeBadge");
const protocolSubtitle = $("protocolSubtitle");
const statusDot = $("statusDot");


// ======================================================
// LAYER SWITCHING
// ======================================================

function setLayer(layer) {
  state.layer = layer;

  $("applicationTab").classList.toggle(
    "active",
    layer === "application"
  );

  $("transportTab").classList.toggle(
    "active",
    layer === "transport"
  );

  if (!state.steps.length) {
    protocolSteps.innerHTML = `
      <div class="welcome">
        <div class="welcome-icon">⇄</div>
        <h3>Protocol flow will appear here</h3>
        <p>
          Select an activity on the left. Each step shows the simulated
          protocol message, direction, timing and important fields.
        </p>
      </div>
    `;
    return;
  }

  if (layer === "transport") {
    state.steps = getTransportSteps(state.mode);
  } else {
    if (state.mode === "browse") {
      state.steps = makeBrowseSteps();
    } else if (state.mode === "mail") {
      state.steps = makeMailSteps();
    } else {
      state.steps = makeStreamSteps();
    }
  }

  state.current = 0;

  renderSteps();
  showStep(0);
}


// ======================================================
// ACTIVITY TABS
// ======================================================

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((item) => {
      item.classList.remove("active");
    });

    tab.classList.add("active");

    state.mode = tab.dataset.mode;

    $("browseForm").classList.toggle(
      "hidden",
      state.mode !== "browse"
    );

    $("mailForm").classList.toggle(
      "hidden",
      state.mode !== "mail"
    );

    $("streamForm").classList.toggle(
      "hidden",
      state.mode !== "stream"
    );

    resetVisualization();
  });
});


// ======================================================
// APPLICATION / TRANSPORT TABS
// ======================================================

$("applicationTab").addEventListener("click", () => {
  setLayer("application");
});

$("transportTab").addEventListener("click", () => {
  setLayer("transport");
});


// ======================================================
// APPLICATION LAYER - BROWSING
// ======================================================

function makeBrowseSteps() {
  const url = $("urlInput").value || "https://example.com/";

  let hostname = "example.com";

  try {
    hostname = new URL(url).hostname;
  } catch (error) {
    hostname = "example.com";
  }

  return [
    {
      protocol: "DNS",
      title: "DNS Query",
      direction: "Client → DNS Server",
      time: "0.00 s",
      message:
`DNS QUERY

Name: ${hostname}
Type: A
Class: IN

Client asks the DNS resolver for the IPv4 address of ${hostname}.`,
      preview: `DNS QUERY • ${hostname} • A • IN`
    },

    {
      protocol: "DNS",
      title: "DNS Response",
      direction: "DNS Server → Client",
      time: "0.08 s",
      message:
`DNS RESPONSE

Name: ${hostname}
Type: A
Address: 93.184.216.34

DNS server returns the IPv4 address of the requested host.`,
      preview: `DNS RESPONSE • ${hostname} → 93.184.216.34`
    },

    {
      protocol: "HTTP",
      title: "TCP Connection Established",
      direction: "Client ↔ Web Server",
      time: "0.15 s",
      message:
`TCP CONNECTION

Server: 93.184.216.34
Port: 80
State: ESTABLISHED

A TCP connection is established before the HTTP request is sent.`,
      preview: "TCP connection to 93.184.216.34:80"
    },

    {
      protocol: "HTTP",
      title: "HTTP GET Request",
      direction: "Client → Web Server",
      time: "0.18 s",
      message:
`HTTP REQUEST

GET / HTTP/1.1
Host: ${hostname}
Connection: keep-alive

The browser requests the main web resource.`,
      preview: `GET / HTTP/1.1 • Host: ${hostname}`
    },

    {
      protocol: "HTTP",
      title: "HTTP 200 Response",
      direction: "Web Server → Client",
      time: "0.31 s",
      message:
`HTTP RESPONSE

HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1256

The web server successfully returns the requested resource.`,
      preview: "HTTP/1.1 200 OK • text/html"
    }
  ];
}


// ======================================================
// APPLICATION LAYER - MAIL
// ======================================================

function makeMailSteps() {
  const to = $("toInput").value || "student@example.com";
  const subject =
    $("subjectInput").value || "Computer Networks Assignment";

  return [
    {
      protocol: "DNS",
      title: "DNS Lookup",
      direction: "Mail Client → DNS Server",
      time: "0.00 s",
      message:
`DNS QUERY

Name: mail.example.com
Type: A
Class: IN

The mail client resolves the SMTP server address.`,
      preview: "DNS QUERY • mail.example.com • A"
    },

    {
      protocol: "DNS",
      title: "DNS Response",
      direction: "DNS Server → Mail Client",
      time: "0.06 s",
      message:
`DNS RESPONSE

mail.example.com → 192.0.2.25

The DNS server returns the SMTP server address.`,
      preview: "DNS RESPONSE • mail.example.com → 192.0.2.25"
    },

    {
      protocol: "SMTP",
      title: "SMTP Connection",
      direction: "Mail Client → SMTP Server",
      time: "0.12 s",
      message:
`SMTP CONNECTION

Server: mail.example.com
Port: 25

The mail client connects to the SMTP server.`,
      preview: "SMTP connection established"
    },

    {
      protocol: "SMTP",
      title: "MAIL FROM",
      direction: "Mail Client → SMTP Server",
      time: "0.18 s",
      message:
`SMTP COMMAND

MAIL FROM:<sender@example.com>

The client identifies the sender.`,
      preview: "MAIL FROM:<sender@example.com>"
    },

    {
      protocol: "SMTP",
      title: "RCPT TO",
      direction: "Mail Client → SMTP Server",
      time: "0.20 s",
      message:
`SMTP COMMAND

RCPT TO:<${to}>

The client identifies the recipient.`,
      preview: `RCPT TO:<${to}>`
    },

    {
      protocol: "SMTP",
      title: "DATA",
      direction: "Mail Client → SMTP Server",
      time: "0.22 s",
      message:
`SMTP DATA

Subject: ${subject}

The client transfers the email message content.`,
      preview: `DATA • Subject: ${subject}`
    },

    {
      protocol: "SMTP",
      title: "SMTP 250 OK",
      direction: "SMTP Server → Mail Client",
      time: "0.30 s",
      message:
`SMTP RESPONSE

250 OK

The SMTP server accepts the simulated email.`,
      preview: "250 OK • Message accepted"
    }
  ];
}


// ======================================================
// APPLICATION LAYER - STREAMING
// ======================================================

function makeStreamSteps() {
  const video =
    $("videoInput").value || "Network Fundamentals Demo";

  const quality =
    $("qualitySelect").value || "720p";

  return [
    {
      protocol: "DNS",
      title: "DNS Query",
      direction: "Player → DNS Server",
      time: "0.00 s",
      message:
`DNS QUERY

Name: video.example.com
Type: A
Class: IN

The player resolves the streaming server address.`,
      preview: "DNS QUERY • video.example.com"
    },

    {
      protocol: "DNS",
      title: "DNS Response",
      direction: "DNS Server → Player",
      time: "0.06 s",
      message:
`DNS RESPONSE

video.example.com → 192.0.2.50

The DNS server returns the streaming server address.`,
      preview: "DNS RESPONSE • video.example.com → 192.0.2.50"
    },

    {
      protocol: "HTTP",
      title: "Manifest Request",
      direction: "Player → Streaming Server",
      time: "0.12 s",
      message:
`HTTP REQUEST

GET /manifest.m3u8 HTTP/1.1
Stream: ${video}
Quality: ${quality}

The player requests the streaming manifest.`,
      preview: "GET /manifest.m3u8"
    },

    {
      protocol: "HTTP",
      title: "Manifest Response",
      direction: "Streaming Server → Player",
      time: "0.20 s",
      message:
`HTTP RESPONSE

HTTP/1.1 200 OK
Content-Type: application/vnd.apple.mpegurl

The server returns the media playlist.`,
      preview: "HTTP 200 OK • Media Manifest"
    },

    {
      protocol: "HTTP",
      title: "Media Segment Request",
      direction: "Player → Streaming Server",
      time: "0.28 s",
      message:
`HTTP REQUEST

GET /segment001.ts HTTP/1.1
Quality: ${quality}

The player requests a media segment.`,
      preview: "GET /segment001.ts"
    },

    {
      protocol: "HTTP",
      title: "Media Segment Data",
      direction: "Streaming Server → Player",
      time: "0.42 s",
      message:
`MEDIA DATA

Stream: ${video}
Quality: ${quality}
Segment: 001

The streaming server delivers media data to the player.`,
      preview: `MEDIA SEGMENT • ${quality}`
    }
  ];
}


// ======================================================
// TCP STEP HELPER
// ======================================================

function tcpStep(
  title,
  direction,
  time,
  flags,
  seq,
  ack,
  win,
  length,
  preview,
  explanation
) {
  return {
    protocol: "TCP",
    title,
    direction,
    time,
    message:
`TCP SEGMENT

Seq: ${seq}
Ack: ${ack}
Window: ${win}
Flags: ${flags}
Length: ${length}

${explanation}`,
    preview
  };
}


// ======================================================
// TRANSPORT - BROWSING
// ======================================================

function makeBrowseTransportSteps() {
  return [

    tcpStep(
      "TCP SYN",
      "Client → Web Server",
      "0.10 s",
      "SYN",
      1000,
      0,
      64240,
      0,
      "SYN • Seq=1000 • Win=64240",
      "Client starts a TCP connection and proposes initial sequence number 1000."
    ),

    tcpStep(
      "TCP SYN-ACK",
      "Web Server → Client",
      "0.11 s",
      "SYN, ACK",
      5000,
      1001,
      64240,
      0,
      "SYN-ACK • Seq=5000 • Ack=1001",
      "Server acknowledges the client's SYN and sends its own initial sequence number."
    ),

    tcpStep(
      "TCP ACK",
      "Client → Web Server",
      "0.12 s",
      "ACK",
      1001,
      5001,
      64240,
      0,
      "ACK • Seq=1001 • Ack=5001",
      "Client acknowledges the server SYN. The TCP connection is established."
    ),

    tcpStep(
      "HTTP GET over TCP",
      "Client → Web Server",
      "0.18 s",
      "PSH, ACK",
      1001,
      5001,
      64240,
      74,
      "PSH-ACK • Seq=1001 • Ack=5001 • Len=74",
      "HTTP GET data is carried inside a TCP segment."
    ),

    tcpStep(
      "TCP Flow & Congestion Control",
      "Client ↔ Web Server",
      "0.22 s",
      "ACK",
      1075,
      5001,
      64240,
      0,
      "ACK • Seq=1075 • Ack=5001 • rwnd=64240 • cwnd=10 MSS",
      `TCP FLOW / CONGESTION CONTROL

Receiver Window (rwnd): 64240 bytes
Congestion Window (cwnd): 10 MSS
Effective Send Window: min(rwnd, cwnd)

rwnd represents the receiver's available buffer.
cwnd represents the sender's congestion-control limit.

This is a simplified simulation of TCP flow and congestion control.`
    ),

    tcpStep(
      "HTTP Response over TCP",
      "Web Server → Client",
      "0.31 s",
      "PSH, ACK",
      5001,
      1075,
      64240,
      1256,
      "PSH-ACK • Seq=5001 • Ack=1075 • Len=1256",
      "The server sends the HTTP response data. The ACK confirms receipt of the client's data."
    ),

    tcpStep(
      "TCP FIN",
      "Client → Web Server",
      "0.40 s",
      "FIN, ACK",
      1075,
      6257,
      64240,
      0,
      "FIN-ACK • Connection close requested",
      "Client requests a graceful TCP connection shutdown."
    ),

    tcpStep(
      "TCP FIN-ACK",
      "Web Server → Client",
      "0.41 s",
      "FIN, ACK",
      6257,
      1076,
      64240,
      0,
      "FIN-ACK • Server closes connection",
      "Server acknowledges the client's FIN and requests its own shutdown."
    ),

    tcpStep(
      "Final TCP ACK",
      "Client → Web Server",
      "0.42 s",
      "ACK",
      1076,
      6258,
      64240,
      0,
      "ACK • TCP connection closed",
      "Client acknowledges the server FIN. The simulated TCP session is complete."
    )

  ];
}


// ======================================================
// TRANSPORT - MAIL
// ======================================================

function makeMailTransportSteps() {
  return [

    tcpStep(
      "TCP SYN",
      "Mail Client → SMTP Server",
      "0.10 s",
      "SYN",
      2000,
      0,
      64240,
      0,
      "SYN • Seq=2000",
      "Mail client starts a TCP connection to the SMTP server."
    ),

    tcpStep(
      "TCP SYN-ACK",
      "SMTP Server → Mail Client",
      "0.11 s",
      "SYN, ACK",
      7000,
      2001,
      64240,
      0,
      "SYN-ACK • Seq=7000 • Ack=2001",
      "SMTP server acknowledges the connection request."
    ),

    tcpStep(
      "TCP ACK",
      "Mail Client → SMTP Server",
      "0.12 s",
      "ACK",
      2001,
      7001,
      64240,
      0,
      "ACK • Connection established",
      "The TCP three-way handshake is complete."
    ),

    tcpStep(
      "SMTP Data over TCP",
      "Mail Client → SMTP Server",
      "0.20 s",
      "PSH, ACK",
      2001,
      7001,
      64000,
      180,
      "PSH-ACK • SMTP commands/data",
      "SMTP commands and message data are transported using TCP."
    ),

    tcpStep(
      "TCP Flow & Congestion Control",
      "Mail Client ↔ SMTP Server",
      "0.24 s",
      "ACK",
      2181,
      7001,
      64000,
      0,
      "ACK • rwnd=64000 • cwnd=10 MSS",
      `TCP FLOW / CONGESTION CONTROL

Receiver Window (rwnd): 64000 bytes
Congestion Window (cwnd): 10 MSS
Effective Send Window: min(rwnd, cwnd)

This is a simplified educational simulation.`
    ),

    tcpStep(
      "SMTP Response over TCP",
      "SMTP Server → Mail Client",
      "0.28 s",
      "PSH, ACK",
      7001,
      2181,
      64000,
      45,
      "PSH-ACK • 250 OK",
      "SMTP server sends its response and acknowledges the received data."
    ),

    tcpStep(
      "TCP FIN",
      "Mail Client → SMTP Server",
      "0.30 s",
      "FIN, ACK",
      2181,
      7046,
      64000,
      0,
      "FIN-ACK • Client closes",
      "The mail client requests graceful TCP termination."
    ),

    tcpStep(
      "TCP FIN-ACK",
      "SMTP Server → Mail Client",
      "0.31 s",
      "FIN, ACK",
      7046,
      2182,
      64000,
      0,
      "FIN-ACK • Server closes",
      "The SMTP server acknowledges and closes its side."
    ),

    tcpStep(
      "Final TCP ACK",
      "Mail Client → SMTP Server",
      "0.32 s",
      "ACK",
      2182,
      7047,
      64000,
      0,
      "ACK • Connection closed",
      "Final acknowledgement completes TCP teardown."
    )

  ];
}


// ======================================================
// TRANSPORT - STREAMING
// ======================================================

function makeStreamTransportSteps() {
  return [

    tcpStep(
      "TCP SYN",
      "Player → Streaming Server",
      "0.10 s",
      "SYN",
      3000,
      0,
      65535,
      0,
      "SYN • Seq=3000",
      "The player opens a TCP connection to obtain the streaming manifest."
    ),

    tcpStep(
      "TCP SYN-ACK",
      "Streaming Server → Player",
      "0.11 s",
      "SYN, ACK",
      8000,
      3001,
      65535,
      0,
      "SYN-ACK • Seq=8000 • Ack=3001",
      "The streaming server acknowledges the connection request."
    ),

    tcpStep(
      "TCP ACK",
      "Player → Streaming Server",
      "0.12 s",
      "ACK",
      3001,
      8001,
      65535,
      0,
      "ACK • Connection established",
      "The TCP three-way handshake is complete."
    ),

    tcpStep(
      "Manifest Request",
      "Player → Streaming Server",
      "0.15 s",
      "PSH, ACK",
      3001,
      8001,
      65535,
      96,
      "PSH-ACK • Manifest request",
      "The HTTP manifest request is carried inside TCP."
    ),

    tcpStep(
      "Manifest Response",
      "Streaming Server → Player",
      "0.23 s",
      "PSH, ACK",
      8001,
      3097,
      65535,
      420,
      "PSH-ACK • Manifest data",
      "The server sends the streaming playlist or manifest."
    ),

    tcpStep(
      "Media Segment Request",
      "Player → Streaming Server",
      "0.30 s",
      "PSH, ACK",
      3097,
      8421,
      60000,
      92,
      "PSH-ACK • Segment request",
      "The player requests a media segment."
    ),

    tcpStep(
      "TCP Flow & Congestion Control",
      "Player ↔ Streaming Server",
      "0.35 s",
      "ACK",
      3189,
      8421,
      60000,
      0,
      "ACK • rwnd=60000 • cwnd=20 MSS",
      `TCP FLOW / CONGESTION CONTROL

Receiver Window (rwnd): 60000 bytes
Congestion Window (cwnd): 20 MSS
Effective Send Window: min(rwnd, cwnd)

The receiver window controls how much unacknowledged
data the receiver can accept.

The congestion window limits the amount of data
that can be sent based on network congestion.

This is a simplified educational simulation.`
    ),

    tcpStep(
      "Media Segment Data",
      "Streaming Server → Player",
      "0.46 s",
      "PSH, ACK",
      8421,
      3189,
      60000,
      1048576,
      "PSH-ACK • Media data • Window=60000",
      "Large application media data is represented as a simulated data block. Actual TCP transmission would divide data into smaller segments."
    ),

    tcpStep(
      "TCP FIN",
      "Player → Streaming Server",
      "0.60 s",
      "FIN, ACK",
      3189,
      1058997,
      60000,
      0,
      "FIN-ACK • Player closes",
      "The simulated streaming TCP session is closed."
    ),

    tcpStep(
      "TCP FIN-ACK",
      "Streaming Server → Player",
      "0.61 s",
      "FIN, ACK",
      1058997,
      3190,
      60000,
      0,
      "FIN-ACK • Server closes",
      "The server acknowledges and closes its connection."
    ),

    tcpStep(
      "Final TCP ACK",
      "Player → Streaming Server",
      "0.62 s",
      "ACK",
      3190,
      1058998,
      60000,
      0,
      "ACK • TCP connection closed",
      "Final ACK completes the TCP teardown."
    )

  ];
}


// ======================================================
// GET TRANSPORT STEPS
// ======================================================

function getTransportSteps(mode) {
  if (mode === "browse") {
    return makeBrowseTransportSteps();
  }

  if (mode === "mail") {
    return makeMailTransportSteps();
  }

  return makeStreamTransportSteps();
}


// ======================================================
// RENDER STEPS
// ======================================================

function renderSteps() {
  protocolSteps.innerHTML = "";

  state.steps.forEach((step, index) => {

    const card = document.createElement("div");

    card.className = "protocol-step";

    card.dataset.index = index;

    card.innerHTML = `
      <div class="step-number">
        ${index + 1}
      </div>

      <div class="step-content">

        <div class="step-top">

          <span class="protocol-tag">
            ${step.protocol}
          </span>

          <strong>
            ${step.title}
          </strong>

        </div>

        <div class="step-meta">
          <span>${step.direction}</span>
          <span>${step.time}</span>
        </div>

        <div class="step-preview">
          ${step.preview}
        </div>

      </div>
    `;

    card.addEventListener("click", () => {
      showStep(index);
    });

    protocolSteps.appendChild(card);
  });

  stepCounter.textContent =
    state.steps.length > 0
      ? `1 / ${state.steps.length}`
      : "0 / 0";
}


// ======================================================
// SHOW STEP
// ======================================================

function showStep(index) {
  if (!state.steps.length) {
    return;
  }

  if (index < 0) {
    index = 0;
  }

  if (index >= state.steps.length) {
    index = state.steps.length - 1;
  }

  state.current = index;

  document.querySelectorAll(".protocol-step").forEach((card, i) => {
    card.classList.toggle(
      "active",
      i === index
    );
  });

  const step = state.steps[index];

  messageDetail.textContent = step.message;

  currentDirection.textContent =
    `${step.direction} • ${step.time}`;

  stepCounter.textContent =
    `${index + 1} / ${state.steps.length}`;

  modeBadge.textContent =
    state.layer === "transport"
      ? "TCP"
      : step.protocol;

  protocolSubtitle.textContent =
    state.layer === "transport"
      ? "Transport Layer • TCP connection, data transfer and teardown"
      : "Application Layer • DNS, HTTP and SMTP simulation";
}


// ======================================================
// START VISUALIZATION
// ======================================================

function startVisualization() {

  stopTimer();

  if (state.layer === "transport") {
    state.steps = getTransportSteps(state.mode);
  } else {

    if (state.mode === "browse") {
      state.steps = makeBrowseSteps();
    } else if (state.mode === "mail") {
      state.steps = makeMailSteps();
    } else {
      state.steps = makeStreamSteps();
    }

  }

  state.current = 0;

  renderSteps();
  showStep(0);

  state.playing = true;

  $("pauseBtn").textContent = "Pause";

  startTimer();

  statusDot.classList.add("active");

  modeBadge.textContent =
    state.layer === "transport"
      ? "TCP"
      : "RUNNING";
}


// ======================================================
// TIMER
// ======================================================

function startTimer() {

  stopTimer();

  state.timer = setInterval(() => {

    if (!state.playing) {
      return;
    }

    if (
      state.current <
      state.steps.length - 1
    ) {

      showStep(
        state.current + 1
      );

    } else {

      state.playing = false;

      $("pauseBtn").textContent = "Play";

      stopTimer();
    }

  }, 1000);
}


function stopTimer() {

  if (state.timer) {
    clearInterval(state.timer);
    state.timer = null;
  }

}


// ======================================================
// PREVIOUS
// ======================================================

$("prevBtn").addEventListener("click", () => {

  if (!state.steps.length) {
    return;
  }

  state.playing = false;

  $("pauseBtn").textContent = "Play";

  stopTimer();

  showStep(
    state.current - 1
  );
});


// ======================================================
// NEXT
// ======================================================

$("nextBtn").addEventListener("click", () => {

  if (!state.steps.length) {
    return;
  }

  state.playing = false;

  $("pauseBtn").textContent = "Play";

  stopTimer();

  showStep(
    state.current + 1
  );
});


// ======================================================
// PAUSE / PLAY
// ======================================================

$("pauseBtn").addEventListener("click", () => {

  if (!state.steps.length) {
    return;
  }

  if (state.playing) {

    state.playing = false;

    stopTimer();

    $("pauseBtn").textContent = "Play";

  } else {

    state.playing = true;

    $("pauseBtn").textContent = "Pause";

    startTimer();
  }

});


// ======================================================
// REPLAY
// ======================================================

$("replayBtn").addEventListener("click", () => {

  if (!state.steps.length) {
    return;
  }

  state.current = 0;

  state.playing = true;

  $("pauseBtn").textContent = "Pause";

  showStep(0);

  startTimer();

});


// ======================================================
// BROWSING BUTTON
// ======================================================

$("visitBtn").addEventListener("click", () => {

  addLog("Browsing started");

  startVisualization();

});


// ======================================================
// SEND EMAIL BUTTON
// ======================================================

$("sendBtn").addEventListener("click", () => {

  const to = $("toInput").value.trim();

  if (!to) {
    alert("Please enter a recipient email address.");
    $("toInput").focus();
    return;
  }

  addLog(`Email sent to ${to}`);

  startVisualization();

});


// ======================================================
// STREAMING BUTTON
// ======================================================

$("playBtn").addEventListener("click", () => {

  const video =
    $("videoInput").value.trim();

  if (!video) {
    alert("Please enter a stream name.");
    $("videoInput").focus();
    return;
  }

  addLog(
    `Streaming started: ${video}`
  );

  startVisualization();

});


// ======================================================
// ACTIVITY LOG
// ======================================================

function addLog(text) {

  const log = $("activityLog");

  const empty = log.querySelector(".empty-log");

  if (empty) {
    empty.remove();
  }

  const item = document.createElement("div");

  item.className = "log-item";

  const time =
    new Date().toLocaleTimeString();

  item.innerHTML = `
    <strong>${text}</strong>
    <span>${time}</span>
  `;

  log.prepend(item);
}


// ======================================================
// CLEAR LOG
// ======================================================

$("clearLogBtn").addEventListener("click", () => {

  $("activityLog").innerHTML = `
    <div class="empty-log">
      No activity yet. Start Browsing, Mail, or Streaming.
    </div>
  `;

});


// ======================================================
// RESET VISUALIZATION
// ======================================================

function resetVisualization() {

  stopTimer();

  state.steps = [];

  state.current = -1;

  state.playing = false;

  $("pauseBtn").textContent = "Pause";

  stepCounter.textContent = "0 / 0";

  modeBadge.textContent = "READY";

  protocolSubtitle.textContent =
    "Perform an activity on the left to start the visualization.";

  currentDirection.textContent = "—";

  messageDetail.textContent =
    "No protocol message selected.";

  protocolSteps.innerHTML = `
    <div class="welcome">

      <div class="welcome-icon">
        ⇄
      </div>

      <h3>
        Protocol flow will appear here
      </h3>

      <p>
        Select an activity on the left. Each step shows the simulated
        protocol message, direction, timing and important fields.
      </p>

    </div>
  `;

  statusDot.classList.remove("active");
}


// ======================================================
// INITIAL STATE
// ======================================================

resetVisualization();
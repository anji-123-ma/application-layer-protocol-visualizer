const state = {
  mode: "browse",
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

function now() {
  return new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", second: "2-digit"});
}

function escapeText(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function addLog(message) {
  const log = $("activityLog");
  const empty = log.querySelector(".empty-log");
  if (empty) empty.remove();
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.innerHTML = `<span class="log-time">${now()}</span>${escapeText(message)}`;
  log.prepend(entry);
}

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll(".tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  ["browse", "mail", "stream"].forEach(name => {
    $(`${name}Form`).classList.toggle("hidden", name !== mode);
  });
}

document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => setMode(btn.dataset.mode));
});

function parseHost(url) {
  try {
    return new URL(url).hostname || "example.com";
  } catch {
    return "example.com";
  }
}

function makeBrowseSteps() {
  const rawUrl = $("urlInput").value.trim() || "https://example.com/";
  const url = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  const host = parseHost(url);

  return [
    {
      protocol: "DNS", title: "DNS Query", direction: "Client → DNS Server", time: "0.00 s",
      message:
`DNS QUERY
Name: ${host}
Type: A
Class: IN

Client asks the DNS resolver for the IPv4 address of ${host}.`,
      preview: `QUERY ${host}  A  IN`
    },
    {
      protocol: "DNS", title: "DNS Response", direction: "DNS Server → Client", time: "0.08 s",
      message:
`DNS RESPONSE
Name: ${host}
Type: A
Class: IN
Answer: 93.184.216.34
TTL: 300 seconds

The resolver returns an IPv4 address (simulated).`,
      preview: `ANSWER ${host} → 93.184.216.34`
    },
    {
      protocol: "HTTP", title: "TCP connection established", direction: "Client ↔ Web Server", time: "0.15 s",
      message:
`TCP CONNECTION (simulated)
Client: ephemeral-port
Server: 93.184.216.34:80

HTTP normally runs over a TCP connection for HTTP/1.1.`,
      preview: `TCP connection to 93.184.216.34:80`
    },
    {
      protocol: "HTTP", title: "HTTP GET request", direction: "Client → Web Server", time: "0.18 s",
      message:
`GET ${new URL(url).pathname || "/"} HTTP/1.1
Host: ${host}
Accept: text/html
Connection: keep-alive
User-Agent: ProtocolVisualizer/1.0`,
      preview: `GET ${new URL(url).pathname || "/"} HTTP/1.1`
    },
    {
      protocol: "HTTP", title: "HTTP 200 response", direction: "Web Server → Client", time: "0.31 s",
      message:
`HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 1256
Cache-Control: max-age=300

<html> ... simulated response body ... </html>`,
      preview: `HTTP/1.1 200 OK • text/html`
    }
  ];
}

function makeMailSteps() {
  const to = $("toInput").value.trim() || "student@example.com";
  const subject = $("subjectInput").value.trim() || "Computer Networks Assignment";
  const body = $("bodyInput").value.trim() || "Hello from the simulator.";
  const domain = to.includes("@") ? to.split("@")[1] : "example.com";

  return [
    {
      protocol: "DNS", title: "DNS MX Query", direction: "Mail Client → DNS Server", time: "0.00 s",
      message:
`DNS QUERY
Name: ${domain}
Type: MX
Class: IN

The client looks up the destination mail exchanger for ${domain}.`,
      preview: `QUERY ${domain}  MX  IN`
    },
    {
      protocol: "DNS", title: "DNS MX Response", direction: "DNS Server → Mail Client", time: "0.06 s",
      message:
`DNS RESPONSE
Name: ${domain}
Type: MX
Preference: 10
Exchange: mail.${domain}

MX identifies the server responsible for receiving mail.`,
      preview: `MX ${domain} → mail.${domain}`
    },
    {
      protocol: "SMTP", title: "SMTP connection", direction: "Mail Client → SMTP Server", time: "0.14 s",
      message:
`S: 220 smtp.example.com ESMTP ready
C: EHLO student.example
C: MAIL FROM:<student@example.com>
C: RCPT TO:<${to}>`,
      preview: `EHLO → MAIL FROM → RCPT TO`
    },
    {
      protocol: "SMTP", title: "SMTP DATA command", direction: "Client → SMTP Server", time: "0.20 s",
      message:
`C: DATA
C: From: student@example.com
C: To: ${to}
C: Subject: ${subject}
C:
C: ${body}
C: .`,
      preview: `DATA • headers • body • <CRLF>.<CRLF>`
    },
    {
      protocol: "SMTP", title: "SMTP accepted", direction: "SMTP Server → Client", time: "0.28 s",
      message:
`S: 250 2.0.0 Message accepted for delivery

The SMTP server has accepted the message for delivery (simulated).`,
      preview: `250 2.0.0 Message accepted`
    },
    {
      protocol: "SMTP", title: "SMTP QUIT", direction: "Client → SMTP Server", time: "0.30 s",
      message:
`C: QUIT
S: 221 2.0.0 Bye

The SMTP session ends after the message is accepted.`,
      preview: `QUIT → 221 Bye`
    }
  ];
}

function makeStreamSteps() {
  const video = $("videoInput").value.trim() || "Network Fundamentals Demo";
  const quality = $("qualitySelect").value;

  return [
    {
      protocol: "DNS", title: "DNS Query", direction: "Player → DNS Server", time: "0.00 s",
      message:
`DNS QUERY
Name: video.example.com
Type: A
Class: IN

The player resolves the streaming host.`,
      preview: `QUERY video.example.com  A`
    },
    {
      protocol: "DNS", title: "DNS Response", direction: "DNS Server → Player", time: "0.07 s",
      message:
`DNS RESPONSE
Name: video.example.com
Type: A
Answer: 203.0.113.20
TTL: 60 seconds`,
      preview: `ANSWER video.example.com → 203.0.113.20`
    },
    {
      protocol: "HTTP", title: "GET master playlist / manifest", direction: "Player → Streaming Server", time: "0.15 s",
      message:
`GET /media/master.m3u8 HTTP/1.1
Host: video.example.com
Accept: application/vnd.apple.mpegurl

#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=${quality === "1080p" ? "1920x1080" : quality === "720p" ? "1280x720" : "640x360"}
media/${quality}.m3u8`,
      preview: `GET /media/master.m3u8 • ${quality}`
    },
    {
      protocol: "HTTP", title: "Playlist response", direction: "Streaming Server → Player", time: "0.23 s",
      message:
`HTTP/1.1 200 OK
Content-Type: application/vnd.apple.mpegurl

#EXTM3U
#EXT-X-TARGETDURATION:6
#EXTINF:6.0,
segment001.ts
#EXTINF:6.0,
segment002.ts`,
      preview: `200 OK • playlist • segments`
    },
    {
      protocol: "HTTP", title: "Media segment request", direction: "Player → Streaming Server", time: "0.30 s",
      message:
`GET /media/${quality}/segment001.ts HTTP/1.1
Host: video.example.com
Range: bytes=0-1048575

The player requests the next media segment.`,
      preview: `GET segment001.ts • Range request`
    },
    {
      protocol: "HTTP", title: "Media segment response", direction: "Streaming Server → Player", time: "0.46 s",
      message:
`HTTP/1.1 206 Partial Content
Content-Type: video/mp2t
Content-Range: bytes 0-1048575/1048576

[Binary media segment: ${video} — ${quality}]`,
      preview: `206 Partial Content • video/mp2t`
    },
    {
      protocol: "HTTP", title: "Next segment request", direction: "Player → Streaming Server", time: "0.52 s",
      message:
`GET /media/${quality}/segment002.ts HTTP/1.1
Host: video.example.com

The player continues fetching segments while playback proceeds.`,
      preview: `GET segment002.ts`
    }
  ];
}

function renderSteps() {
  if (!state.steps.length) return;

  protocolSteps.innerHTML = state.steps.map((step, i) => `
    <div class="step ${i === state.current ? "active" : ""} ${i < state.current ? "done" : ""}" data-index="${i}">
      <div class="step-top">
        <span class="step-num">${i + 1}</span>
        <span class="protocol-tag">${escapeText(step.protocol)}</span>
        <span class="step-title">${escapeText(step.title)}</span>
        <span class="direction">${escapeText(step.direction)}</span>
      </div>
      <div class="step-time">t = ${escapeText(step.time)}</div>
      <div class="step-preview">${escapeText(step.preview)}</div>
    </div>
  `).join("");

  protocolSteps.querySelectorAll(".step").forEach(el => {
    el.addEventListener("click", () => {
      stopPlayback();
      showStep(Number(el.dataset.index));
    });
  });
}

function showStep(index) {
  if (!state.steps.length) return;
  state.current = Math.max(0, Math.min(index, state.steps.length - 1));
  const step = state.steps[state.current];

  renderSteps();
  messageDetail.textContent = step.message;
  currentDirection.textContent = step.direction;
  stepCounter.textContent = `${state.current + 1} / ${state.steps.length}`;
  statusDot.classList.add("live");

  const active = protocolSteps.querySelector(".step.active");
  if (active) active.scrollIntoView({behavior: "smooth", block: "nearest"});
}

function startVisualization(mode, steps) {
  stopPlayback();
  state.mode = mode;
  state.steps = steps;
  state.current = 0;
  modeBadge.textContent = mode.toUpperCase();
  protocolSubtitle.textContent =
    mode === "browse" ? "DNS → HTTP request + response" :
    mode === "mail" ? "DNS (optional) → SMTP conversation" :
    "DNS → HTTP manifest/playlist → media segments";

  $("clientSummary").textContent =
    mode === "browse" ? "Web browser" :
    mode === "mail" ? "Mail client" : "Video player";

  $("serverSummary").textContent =
    mode === "browse" ? "Web server" :
    mode === "mail" ? "SMTP server" : "Streaming server";

  renderSteps();
  showStep(0);
  addLog(`${mode === "browse" ? "Browsing" : mode === "mail" ? "Email" : "Streaming"} activity started.`);
}

function stopPlayback() {
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
  state.playing = false;
  $("pauseBtn").textContent = "Pause";
}

function autoAdvance() {
  stopPlayback();
  state.playing = true;
  $("pauseBtn").textContent = "Pause";
  state.timer = setInterval(() => {
    if (state.current >= state.steps.length - 1) {
      stopPlayback();
      return;
    }
    showStep(state.current + 1);
  }, 1100);
}

$("visitBtn").addEventListener("click", () => startVisualization("browse", makeBrowseSteps()));
$("sendBtn").addEventListener("click", () => startVisualization("mail", makeMailSteps()));
$("playBtn").addEventListener("click", () => startVisualization("stream", makeStreamSteps()));

$("nextBtn").addEventListener("click", () => {
  stopPlayback();
  if (state.current < state.steps.length - 1) showStep(state.current + 1);
});
$("prevBtn").addEventListener("click", () => {
  stopPlayback();
  if (state.current > 0) showStep(state.current - 1);
});
$("pauseBtn").addEventListener("click", () => {
  if (!state.steps.length) return;
  if (state.playing) {
    stopPlayback();
  } else {
    autoAdvance();
  }
});
$("replayBtn").addEventListener("click", () => {
  if (!state.steps.length) return;
  showStep(0);
  autoAdvance();
});
$("clearLogBtn").addEventListener("click", () => {
  $("activityLog").innerHTML = '<div class="empty-log">No activity yet. Start Browsing, Mail, or Streaming.</div>';
});

// Keyboard controls for demo presentation.
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") $("nextBtn").click();
  if (e.key === "ArrowLeft") $("prevBtn").click();
  if (e.key === " ") {
    e.preventDefault();
    $("pauseBtn").click();
  }
});

# Reflection Document

## 1. AI platform/model chosen and why

I used ChatGPT as an AI-assisted development tool because it helped me understand the requirements of Assignment 2, extend the existing Assignment 1 dashboard, generate JavaScript code, debug errors, and improve the protocol visualization.

I also used it to understand TCP concepts such as the three-way handshake, sequence numbers, acknowledgement numbers, window size, flow control, congestion control, and connection teardown.

## 2. How the two panels are synchronized

The left panel starts an activity such as Browsing, Mail, or Streaming. JavaScript generates the corresponding application-layer or transport-layer protocol sequence and displays it in the right panel.

The right panel contains two views:

- Application Layer
- Transport Layer

Switching between these views displays the corresponding protocol sequence for the selected activity.

The Next, Previous, Pause/Play and Replay controls change the current protocol step while keeping the selected activity unchanged.

## 3. What the AI got wrong and how I corrected it

During development and testing, I found some problems in the AI-generated code.

- The Send Email function did not work correctly after changes were made to the JavaScript code.
- Some changes to the Transport Layer code caused the dashboard functionality to stop working temporarily.
- The initial transport-layer implementation needed additional flow-control and congestion-control information to better satisfy the assignment requirements.

I corrected these by:

- Checking and replacing the incorrect JavaScript sections.
- Testing the dashboard after each code change.
- Adding TCP sequence numbers, acknowledgement numbers, window sizes, flags and lengths.
- Adding a simplified flow-control and congestion-control step using receiver window (`rwnd`) and congestion window (`cwnd`).
- Manually testing Browsing, Mail, Streaming, the layer tabs and all visualization controls.

## 4. Key differences between the flows

### DNS + HTTP

DNS resolves a hostname to an IP address. HTTP then uses the server address to request and receive web content. In the Transport Layer visualization, the HTTP communication is carried over a simulated TCP connection.

### DNS + SMTP

DNS can be used to locate the destination mail server. SMTP then carries the email conversation using commands such as MAIL FROM, RCPT TO and DATA. The Transport Layer visualization shows the TCP connection used to carry the SMTP data.

### DNS + HTTP Streaming

A player first resolves the streaming host, then requests a manifest or playlist over HTTP and subsequently requests media segments as playback progresses. The Transport Layer visualization shows TCP being used to carry the manifest and media data.

## 5. Transport Layer learning outcome

This project helped me understand the TCP three-way handshake:

```text
SYN → SYN-ACK → ACK
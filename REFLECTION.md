# Reflection Document

## 1. AI platform/model chosen and why

I used ______________________________ because __________________________________________.

## 2. How the two panels are synchronized

The left panel starts an activity. JavaScript generates a corresponding protocol sequence and loads it into the right panel. The Next, Previous, Pause and Replay controls change the current protocol step without changing the selected activity.

## 3. What the AI got wrong and how I corrected it

During testing, I found:
- __________________________________________
- __________________________________________
- __________________________________________

I corrected these by:
- __________________________________________
- __________________________________________
- __________________________________________

## 4. Key differences between the flows

### DNS + HTTP
DNS resolves a hostname to an IP address. HTTP then uses the server address to request and receive web content.

### DNS + SMTP
DNS can be used to locate the destination mail server through an MX record. SMTP then carries the message submission/transfer conversation using commands such as EHLO, MAIL FROM, RCPT TO, DATA and QUIT.

### DNS + HTTP streaming
A player first resolves the streaming host, then requests a manifest/playlist over HTTP and subsequently requests media segments as playback progresses.

## 5. Learning outcome

This project helped me connect user-level actions (browsing, email and streaming) with the application-layer protocol messages that occur underneath them.

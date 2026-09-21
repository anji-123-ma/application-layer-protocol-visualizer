# Application Layer Protocol Visualizer

A GitHub Pages-ready web dashboard for the Computer Networks – Application Layer assignment.

## Features

- Exactly two main panels: Activity Panel and Protocol Visualization Panel.
- Three activities:
  1. Browsing — DNS query/response + HTTP GET/response
  2. Mail — DNS MX lookup + SMTP conversation
  3. Streaming — DNS + HTTP manifest/playlist + media segments
- Step-by-step protocol visualization.
- Pause, next, previous and replay controls.
- Activity log.
- Responsive layout for smaller screens.
- Pure HTML/CSS/JavaScript, so it can be hosted directly with GitHub Pages.

## Important

This is a **protocol simulation**. It does not send real SMTP email or real video traffic. The assignment explicitly permits protocol simulation, provided the visualization follows real protocol behavior.

## Run locally

Open `index.html` in a browser.

For a local server, from this folder run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a GitHub repository, for example:
   `application-layer-protocol-visualizer`
2. Upload:
   - `index.html`
   - `style.css`
   - `app.js`
   - `README.md`
   - `AI_USAGE_LOG.md`
   - `REFLECTION.md`
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the root (`/`) folder.
6. Save.
7. GitHub will publish the site. The URL is normally:
   `https://YOUR-USERNAME.github.io/application-layer-protocol-visualizer/`

## Suggested demo sequence

1. Click Browsing → Visit.
2. Show DNS Query.
3. Click Next → show DNS Response.
4. Click Next → HTTP GET.
5. Click Next → HTTP 200 response.
6. Click Replay to demonstrate animation.
7. Switch to Mail → Send Email and repeat.
8. Switch to Streaming → Play Stream and repeat.

## AI-assisted development

Fill `AI_USAGE_LOG.md` with the actual AI tool/model you used and attach screenshots or chat history as required by your instructor.

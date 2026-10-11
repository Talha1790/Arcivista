# Arcivista — Complete Website Source

This archive contains the current website, including the latest mobile text and layout fixes, 3D homepage, animated project concepts, portraits, and local checks.

## Files
- dist/index.html — page content and structure
- dist/style.css — styling, responsive layouts, and CSS animation
- dist/app.js — 3D homepage and site interactions
- dist/motion.mjs — scroll animation calculations
- dist/portraits.js — portrait animation controls
- dist/three.module.js — bundled Three.js dependency
- dist/assets/ — portrait images
- dist/logo.svg — Arcivista logo
- checks/ — existing motion, framing, and portrait checks
- netlify.toml — Netlify publishing configuration
- .openai/hosting.json — original ChatGPT Sites hosting metadata; not required by Netlify

## Run locally
No compilation or dependency installation is needed. With Python 3 installed, run from this folder:

    python -m http.server 8000 --directory dist

Open http://localhost:8000 in your browser. Use a web server instead of opening index.html directly, because the JavaScript uses modules.

## Netlify
For manual deployment, upload the dist folder, or zip the contents of dist with index.html at the ZIP root. For a Git-based deployment, publish the dist directory and leave the build command empty. The included netlify.toml specifies that directory.

## Existing checks
With Node.js 22 or newer installed:

    npm test

These checks cover animation logic; they do not replace visual browser testing.

## Editing
Edit the files in dist directly. They are the complete application source for this buildless website. No React or Next.js build is needed. Keep the bundled Three.js copyright notice.

The project planner prepares a brief locally; it does not send emails or submit to a server. WebGL powers the 3D scene on supported browsers. Google Fonts requires an internet connection; system fonts are used as fallback.

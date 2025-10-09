# OSU Day Traders Website

A clean, multi-page starter you can open in VS Code. Uses plain HTML/CSS/JS and mirrors a brand-forward layout like Coca-Cola’s site: bold hero, modular sections, and strong visuals.

## Structure
- `index.html` – Home (hero, slideshow placeholder, highlights, CTA)
- `about.html` – Mission, pillars, leadership
- `events.html` – Event cards
- `resources.html` – Playbooks, tools, guides
- `contact.html` – Demo contact form
- `css/style.css` – Scarlet/gray design system, responsive nav, cards
- `js/main.js` – Mobile nav + optional slideshow (works when you add images)
- `assets/images/` – Put your images here (logo included if available)
- `assets/icons/` – Favicon spot

## Slideshow
Add `<img>` tags inside `.slideshow__viewport` in `index.html`. The JS detects them automatically and enables controls + auto-rotate. Example:

```html
<img src="assets/images/slide-1.jpg" alt="Workshop in progress">
<img src="assets/images/slide-2.jpg" alt="Members collaborating">
<img src="assets/images/slide-3.jpg" alt="Strategy lab">
```

## Run
Just open `index.html` in your browser (or use a simple live server extension in VS Code).

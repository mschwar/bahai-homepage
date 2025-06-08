# Bahá’í Daily Homepage – Project Roadmap  
**Last updated:** 2025-06-07  
**Live site:** <https://mschwar.github.io/bahai-homepage/>  
**Repo:** <https://github.com/mschwar/bahai-homepage>

---

## 1 · Vision
Craft a minimalist, distraction-free homepage that surfaces a daily sacred verse and Badíʿ date, then grows into a multi-faith, multi-device spiritual companion.

---

## 2 · Current State (end of day 2025-06-07)

| Area | Highlights |
|------|------------|
| **UI / UX** | • Full-viewport “Today” jumbotron  <br>• Citation panel with generous whitespace  <br>• Down-arrow scrolls only to Badíʿ-date panel  <br>• “Yesterday” jumbotron hidden until user reveals it; identical quote/citation layout |
| **Panels** | • Badíʿ-date panel = ½ original height  <br>• Yesterday-button panel = ⅔ original height  <br>• Subtle 1 px divider beneath Badíʿ-date panel |
| **Theme** | • Dark/Light toggle now a floating, translucent button in the top-right corner |
| **Quote logic** | • Hidden-Words JSON (153 verses)  <br>• Word-count filter (`MAX_QUOTE_WORDS=75`)  <br>• Quote-of-day seeded by day-of-year |
| **Interactions** | • Click quote → clipboard copy  <br>• Click Badíʿ date → reveal Gregorian date  <br>• Click arrow in Yesterday jumbotron → slide citation |
| **Back-end** | Four scrapers present (`hidden_words`, `dhammapada`, `gita`, `kjv`)—not yet normalised |

---

## 3 · Work Completed **Today**

1. **Visual polish** – equalised spacing, centred arrows, citation layout parity.  
2. **Panel resizing** – slimmer Badíʿ-date + Yesterday-button panels.  
3. **Subtle theme toggle** – fixed top-right, reduced opacity.  
4. **Improved scroll flow** – main arrow stops after Badíʿ-date; Yesterday stays hidden.  
5. **Yesterday citation** – identical type + reveal animation.  
6. **Roadmap drafted & maintained.**

---

## 4 · Next Sprint – “Multi-Tradition & Settings Drawer”

| ID | Deliverable | Notes |
|----|-------------|-------|
| **4.1** | **Normalise scraper output** | Unified schema: `{ text, author, source, tradition }` → `data/quotes_<trad>.json`. |
| **4.2** | **Regenerate JSON datasets** | Hidden Words (Bahá’í) ✓  ·  Dhammapada (Buddhist)  ·  Gita (Hindu)  ·  KJV verses (Christian). |
| **4.3** | **Dataset loader & cache** | Lazy `fetch()`, in-memory cache, fallback to Bahá’í. |
| **4.4** | **Settings drawer** | • Tiny gear (⚙︎) fixed **top-right** (beside theme toggle).  <br>• Vertical drawer slides in from screen right. |
|  | | Drawer contents: faith icons (🟡 ✝︎ ☸︎ ॐ 🎲) + theme toggle (relocated). |
| **4.5** | **Persistent user prefs** | `localStorage` ➝ `selectedTradition`, `theme`. |
| **4.6** | **Robust error handling** | Graceful fallback if dataset unavailable. |
| **4.7** | **Roadmap refresh** | Update milestones & dates post-sprint. |

---

## 5 · Backlog / Future Ideas

* **Random-mix mode** – weighted or truly random verses across traditions.  
* **Tagging & search** – by theme (love, detachment, etc.).  
* **Progressive Web App** – offline cache & “quote-of-the-day” notifications.  
* **Dynamic wallpaper** – gentle background image tied to verse.  
* **Accessibility audit** – ARIA roles, high-contrast mode.

---

### Design Rationale – Settings Drawer

* **Placement:** top-right clusters non-essential controls (widely used pattern in Material, iOS/macOS).  
* **Motion:** slide-in from right mirrors macOS Notification Center—familiar yet discrete.  
* **Content hierarchy:** verses remain undisturbed; settings appear only on explicit user intent.  
* **Future-proof:** easy to append more controls (e.g., font size).

---

> **Immediate next step:** start Task 4.1 – refactor each `scrape_*.py` to emit the standard JSON schema, then commit regenerated datasets.


# Nanda portfolio

Personal site of Gede Ananda (Nanda): backend engineer building Go APIs, native iOS apps and AI-powered tools.
Next.js 16, React 19, Tailwind CSS v4, react-three-fiber, GSAP and Lenis.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm run start
```

## Configuration

| Variable         | Required | What it does                                                                                     |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `GEMINI_API_KEY` | no       | Turns on the "Ask a quick question" box in the contact section. Without it the box is not shown. |
| `GEMINI_MODEL`   | no       | Gemini model for that box. Defaults to `gemini-flash-latest`.                                    |

The question box is checked at build time, so redeploy after adding the key.

Content lives in `src/lib`: `site.ts` (name, email, socials, CV link), `projects.ts`, `skills.ts` and `journey.ts`.
To show a CV link, put the file in `public/cv.pdf` and set `cvUrl: "/cv.pdf"` in `src/lib/site.ts`.

## How the 3D works

Every 3D object renders into one fixed, shared WebGL canvas, so the page only ever holds a single WebGL context.

- Sections place an empty `<ViewSlot>` (`src/components/ui/ViewSlot.tsx`). It registers its `<div>` in `src/lib/stage.ts`.
- `src/components/three/Stage.tsx` is loaded after the page is idle and draws each registered slot's scene into that
  div's rectangle with drei's `View`. three.js is not part of the initial JavaScript.
- `src/components/SmoothScroll.tsx` runs one GSAP ticker: Lenis scrolls first, then the canvas renders
  (`frameloop="never"` + `advance()`), so the 3D stays locked to the DOM while scrolling. Rendering stops while no
  slot is on screen.
- Devices without WebGL 2 get plain fallbacks (portrait photo, text-only projects, a regular copy button).

| Scene           | File                                                           |
| --------------- | -------------------------------------------------------------- |
| Hero pin board  | `src/components/three/PinField.tsx`                            |
| Projects        | `src/components/three/ProjectStage.tsx` and `three/projects/*` |
| Skills keyboard | `src/components/three/Keyboard.tsx`                            |
| Contact button  | `src/components/three/PushButton.tsx`                          |

The Journey board is CSS 3D (`src/components/ui/DepartureBoard.tsx`).

### Changing the portrait

The pin board reads `public/images/portrait-pins.png`, a 160 x 200 cut-out with a transparent background. On a Mac,
`scripts/portrait-cutout.swift` makes one from any photo using Apple's Vision framework (see the usage note at the
top of the script). The relief pushes the face forward from about 38% across and 29% down the crop; if a new photo
frames the face elsewhere, adjust `FACE` in `PinField.tsx`.

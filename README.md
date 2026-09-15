# SLOSA Website

Website for the St. Luke's Grammar School Old Students' Association, Bariga, Lagos State.

## File structure

```
index.html        Main page, all sections
css/style.css      All styling
js/main.js         All interactivity (nav, parallax, reveal animations, before/after slider, lightbox)
assets/            Photos and the crest logo
```

## Running it locally

No build step, no dependencies to install. Just open `index.html` in a browser, or serve the folder with any static server, for example:

```
npx serve .
```

or

```
python3 -m http.server
```

## Publishing on GitHub Pages

1. Create a new repository and push the entire contents of this folder to it (`index.html`, `css/`, `js/`, `assets/` all at the root).
2. In the repository, go to Settings, then Pages.
3. Under Build and deployment, set Source to Deploy from a branch, pick the `main` branch and the `/ (root)` folder.
4. Save. GitHub will give you a URL such as `https://yourusername.github.io/your-repo-name/` within a minute or two.

## Placeholder content to replace before launch

- The school anthem lyrics are Lorem Ipsum placeholder text, styled to match the National Anthem card. Swap in the real verses when the secretariat has them.
- Instagram (`@slosa_bariga`) and X (`@slosa_ng`) handles are still placeholders. Phone, email, and Facebook are now the real ones the secretariat sent.
- The Executive & Set Portfolio role cards (President, Vice President 1 and 2, and so on) have no real names or photos attached yet, since none were supplied. Add them when ready.
- The canonical site URL and Open Graph image tags in `index.html` assume the domain `slosa.ng`; update those if a different domain is registered.

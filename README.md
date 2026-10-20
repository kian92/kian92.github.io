# Wei Kian’s portfolio

Personal portfolio at [weikian.com](https://weikian.com), served as static HTML, CSS, and JavaScript through GitHub Pages.

## Editing

- `index.html`: homepage, services, experience, and project cards.
- `projects/`: individual case studies.
- `css/site.css` and `css/portfolio.css`: shared styles and responsive layouts.
- `js/site.js` and `js/comparison.js`: navigation highlighting and image comparison.
- `img/`: screenshots, photos, and optimised image variants.
- `CNAME`, `robots.txt`, and `sitemap.xml`: custom domain and search engine discovery.

There is no build step and no third-party npm dependency. The former Bootstrap/jQuery template, copied vendor libraries, and Gulp/Sass build pipeline have been removed because the current site does not use them.

## Preview and validation

Open `index.html` in a browser, or preview locally with Python:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8000/`. Stop the server with Ctrl-C.

With Node.js installed, validate local links, image variants, canonical URLs, JSON-LD, and sitemap coverage:

```sh
npm run check
node --check js/site.js
node --check js/comparison.js
npm audit --package-lock-only --ignore-scripts
```

No `npm install` is required. The minimal package and lock files provide a repeatable validation command and make the absence of third-party npm dependencies explicit. The check also rejects links to removed vendor libraries.

When adding a case study, link it from the homepage, give it unique metadata, and add its canonical URL to `sitemap.xml`. Update `lastmod` only when the corresponding page meaningfully changes. Check phone and desktop layouts before publishing.

## Publishing

Commit and push the intended changes to `master` for the repository’s GitHub Pages deployment. Keep local drafts and tooling out of the commit. After deployment, verify the public pages and sitemap.

## License

The original Start Bootstrap copyright notice is retained in `LICENSE`.

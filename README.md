# yannickhuchard.github.io

Home page of [yannickhuchard.github.io](https://yannickhuchard.github.io/): Yannick Huchard's open work on enterprise architecture in the age of AI agents.

It links the project sites that GitHub Pages serves from their own repositories under the same domain:

| Path | Repository |
| --- | --- |
| `/enterprise-morphogenesis/` | [enterprise-morphogenesis](https://github.com/yannickhuchard/enterprise-morphogenesis) |
| `/semantic-id-generator/` | [semantic-id-generator](https://github.com/yannickhuchard/semantic-id-generator) |
| `/fluence-privacy/` | [fluence-privacy](https://github.com/yannickhuchard/fluence-privacy) |
| `/esmma-itthaque-privacy/` | [esmma-itthaque-privacy](https://github.com/yannickhuchard/esmma-itthaque-privacy) |

This repository only serves the root and the `404.html` page. Do not add a custom domain here: GitHub would move every project site above to that domain too.

## Structure

- `index.html`: the page, in French and English (`FR | EN` switch, `?lang=en`, choice remembered in the browser).
- `assets/site.css`, `assets/site.js`: styles, language switch and the rotating project graph. No dependency or build step.
- `404.html`: page shown for unknown paths at the root.

Preview locally:

```bash
python -m http.server 4180
```

Then open http://127.0.0.1:4180/. Links to the project sites only work once published.

Pages source: branch `main`, folder `/`.

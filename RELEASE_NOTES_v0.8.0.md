# Luke Shop Admin Web v0.8.0 — Visual Store Designer v3

Baseline: v0.7.0

## Built

- Replaces the separate fake phone preview with the real signed Customer Web renderer.
- Adds Desktop, Tablet, Mobile, and Side-by-side preview modes with zoom and pop-out preview.
- Keeps the design workspace visible while the section navigator and inspector scroll independently.
- Sends unsaved editor state to the signed Customer Web iframe using target-origin `postMessage`, then autosaves the durable draft after a debounce.
- Adds Undo/Redo, unpublished-change summary, and safer Publish confirmation.
- Separates Internal Store Name from Customer Display Name.
- Replaces the raw store-ID box with a tenant-scoped store selector.
- Adds visual template filters/gallery, layout/theme/full apply modes, and truthful `Template · Customized` state.
- Integrates the existing Media Library for storefront image/video selection.
- Adds drag/drop home-section ordering, hero slider slides, video/poster fields, featured-product hero reference, SEO/share metadata, responsive columns, and hero media positioning.
- Repairs the previous JSX/CSS class mismatch that caused raw template rows.

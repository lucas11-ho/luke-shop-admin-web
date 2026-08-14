# Technical Analysis — Admin Web v0.8.0

The previous Customer Experience page mixed a settings form with an independent `ExperiencePreview()` mock. That allowed Admin to expose options that did not necessarily match Customer Web. v0.8.0 removes that architectural fork.

The editor now treats Customer Web as the preview authority. A signed preview token loads the actual storefront in an iframe. Unsaved state is sent only to the configured `VITE_LUKE_SHOP_CUSTOMER_WEB_BASE_URL` origin. The preview iframe receives no merchant access token.

The three-column studio uses a bounded viewport workspace: section navigation, real preview canvas, and scrollable inspector. At narrower widths the layout degrades into two-column and stacked modes rather than forcing a desktop-only editor.

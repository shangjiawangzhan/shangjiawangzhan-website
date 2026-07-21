# Business Website v3.2.0 — Release-Ready Update

The public version number remains **3.2.0**.

## Included in this release

- Compact generated-site toolbar: Preview, Share, Manage Website, Publish.
- Central **Manage Website** panel for business information, service areas, images, custom domain requests, quote-module reservation, and redesign.
- Business information changes now regenerate the current preview after confirmation.
- Service-area control opens the correct field and places the cursor directly in it.
- Customer image replacement remains available from the hidden management panel.
- Paid customers can submit a custom-domain request for manual DNS confirmation.
- Quote module is clearly marked as reserved; it no longer behaves like an empty or broken control.
- Paid-site regeneration no longer depends on the public business email field.
- PWA cache refresh corrected while keeping the product version at 3.2.0.

## Release boundary

Custom-domain requests are recorded for manual confirmation. Automatic DNS changes, automated quote calculations, automatic pricing, and automatic business decisions are not claimed in this release.

## Recommended Git tag

`v3.2.0`

## v3.2.0 post-release stability update

- Kept the public product version at 3.2.0.
- Simplified the generated-site workspace to Preview, Publish, and one More Actions menu.
- Separated platform controls from the merchant website experience.
- Removed the reserved quote-module control from the main management interface.
- Added subscription status display, subscription restoration, data export, and confirmed account deletion controls.
- Paid accounts now publish directly after server-side subscription verification.
- Prevented checkout from opening a second subscription for an account that already has an active subscription.

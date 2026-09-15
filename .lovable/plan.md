# Unit 9 photo brightness adjustment

## Implementation
- Add a reusable Unit 9 image presentation class using a subtle `brightness(1.12) saturate(1.02)` filter.
- Give the Unit 9 entrance/exterior photo a gentler `brightness(1.06) saturate(1.01)` treatment.
- Apply the class only when the image belongs to Unit 9 across unit cards, detail main image and thumbnails, shared lightboxes, and the Gallery grid/lightbox.
- Pass Unit 9 identity into the shared lightbox so no other unit receives the adjustment.
- Preserve every original photo file byte-for-byte and leave all content, pricing, and booking behavior unchanged.

## Verification
- Compare Unit 9 against Unit 1 in desktop and mobile previews for balanced highlights and preserved blacks.
- Check Unit 9’s card, detail image, thumbnails, shared lightbox, Gallery tiles, and Gallery lightbox.
- Confirm another unit’s images remain unfiltered.
- Run the project’s existing checks, inspect preview errors, and update the project graph.
- Do not publish.

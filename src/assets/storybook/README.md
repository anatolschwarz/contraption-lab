# Sunny Attic runtime copies

These files are imported by `src/game/storybookAssets.ts`.

`npm run storybook-assets:process` rebuilds every runtime PNG from the
approved archive using `assets-manifest.json` categories. It keeps
environment assets byte-for-byte opaque copies. It removes the cream matte
from every `part` or `fx` asset, keeps a soft alpha edge, and trims only its
transparent outer margin. `npm run storybook-assets:check` verifies those
runtime invariants without writing files. Both commands use the system
`ffmpeg`/`ffprobe` already used by the asset workflow. The approved originals
remain untouched. Rendering dimensions are authored in level presentation
data; these PNG dimensions never define Matter geometry.

| Runtime file           | Provenance                                                                      | Approved-original SHA-256                                          |
| ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `mattress_idle_v1.png` | Cream matte removed and transparent margin trimmed: `part/mattress_idle_v1.png` | `548830616be49be68fe3868560d43c3ed947bf9d94f987c380b444f80b914a7a` |
| `teapot_idle_v1.png`   | Cream matte removed and transparent margin trimmed: `part/teapot_idle_v1.png`   | `628e4021fa8543c0de870aa06837a51f94bd982ff76fea610d7c292b08723c57` |
| `corner_L1_v1.png`     | Byte-for-byte copy: `environment/corner_L1_v1.png`                              | `148cde174dec3448571ea5674ec38da71cbf35041be0a0e8f60fde11a7a93eb9` |
| `corner_L2_v1.png`     | Byte-for-byte copy: `environment/corner_L2_v1.png`                              | `0975ada4195b52f69a3b1b58bad3040d79ffa3c89084776d8814510835b7ab49` |
| `marble_v1.png`        | Cream matte removed and transparent margin trimmed: `part/marble_v1.png`        | `a59e65dfa0b14cbdb4f752b5ffeafedacc832969b0185dc15269cbf99367ceb9` |
| `plank_v1.png`         | Cream matte removed and transparent margin trimmed: `part/plank_v1.png`         | `7c10c7a65f3303bea619f721bd91bca4c9a3b957021da52262796ec9919eed6d` |
| `teacup_empty_v1.png`  | Cream matte removed and transparent margin trimmed: `part/teacup_empty_v1.png`  | `870623522f9629694e5fa2ed117c60b9cf101313a14d9fe0944e894e78cd7a9c` |
| `teacup_goal_v1.png`   | Cream matte removed and transparent margin trimmed: `part/teacup_goal_v1.png`   | `dffb0ea48fd59a4b9ffdc4b9e5fd5506d6a5e9b2ecd3a1b8a3a4205fc712b228` |
| `sparkle_v1.png`       | Cream matte removed and transparent margin trimmed: `fx/sparkle_v1.png`         | `1be9d133d295d83330118fb1a394de13bdad32b6fc84c13aef10efd4f62809b7` |

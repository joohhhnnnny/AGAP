# Repository structure audit and cleanup scope

23 November 2026, Asia/Manila. **OPS-STRUCT-01**. Inspected baseline: `5038a36`.

**Status: audit complete; filesystem cleanup and source reorganization have not been executed.** The user requests a folder check before implementing the DCCPEC website. This report distinguishes application dependencies, generated files, local research material and preserved evidence. It does not label a folder disposable solely because it is old or absent from the browser bundle.

## 1. Main findings

The workspace occupies approximately **26 GiB**, but the **1,353 tracked files total about 108.3 MiB** of logical file content. These are different measurements: workspace usage includes ignored models, dependencies, Git storage and additional worktrees; Git history is not the sum of current tracked file sizes.

The largest confirmed cleanup candidate is **50 stale `.git/objects/pack/tmp_pack_*` files**, totaling **17,302,946,392 bytes (16.11 GiB)**. `git count-objects -vH` identifies them as garbage; a Git prune **dry run** identifies the same 50 as stale temporary files. Their modification dates are 2 November 2026. `git fsck --full --no-dangling` exited successfully with no diagnostics. No Git locks, visible Git processes or open temporary-pack handles were observed during inspection. These facts identify a narrow maintenance candidate, not permission to delete `.git`, valid packs, refs, reflogs or backup branches.

The remaining large areas are approximately **4.2 GiB of linked worktrees**, **4.4 GiB of model material** and **382 MiB of installed dependencies**. Most apparent clutter is local development/research storage rather than unnecessary application source.

## 2. Folder decisions

Sizes below are approximate allocated space from `du`, not independent artifact sizes or guaranteed recoverable space. The worktree inventory was captured before creating this audit's temporary documentation worktree.

| Location | Observed purpose/evidence | Decision |
| --- | --- | --- |
| `src/` — 1.4 MiB | Current React frontend, app state/routes, domain compatibility modules, shared controls and styles | Keep. This is the existing portal/product frontend. |
| `apps/` — 2.4 MiB | NestJS API, owner modules, migrations, database tests, operators and worker entry | Keep. Distinct from browser source. |
| `packages/` — 1.4 MiB | Shared finance, canonical contracts/OpenAPI and API client, imported by frontend/backend | Keep. This is not a duplicate of `src/domain`. |
| `public/` — 1.3 MiB | Public screenshots, bundled fonts/licenses, manifest and selected member artwork | Keep. Browser-delivered assets. |
| `tests/` — 0.36 MiB | Existing Playwright workflow/permission/accessibility tests | Keep. These tests are part of integration verification. |
| `infra/` — 0.32 MiB | Local startup, Compose, containers, hosting and recovery tooling | Keep. Used by startup/build/deployment scripts. |
| `scripts/` — 0.01 MiB | [Canonical landing capture script](../scripts/capture-landing.mjs) | Keep. It captures real fictional-demo screens; it is not an abandoned alternate app. |
| `models/` — 4.4 GiB | Tracked service/schema/import/handoff/research code plus ignored base weights, adapter, datasets and notebooks | Keep code and provenance. Review optional local heavyweight artifacts separately; do not delete the folder. |
| `evaluation/` — 0.38 MiB | Synthetic evaluation and explainable-model tooling, including checks invoked by npm | Keep. Separate from operational lending and required for recorded evaluation work. |
| `docs/` — 94 MiB | Product/architecture/design evidence, historical screenshots, task records and ignored private cooperative/research material | Keep authorities and evidence. Public versus private/local content needs a preservation-aware archive policy. |
| `design-library/` — 39 MiB | Accepted source artwork, manifests, specimens and prototypes | Keep. [GabayReveal](../src/features/landing/GabayReveal.tsx) and [Turnaround](../src/features/landing/Turnaround.tsx) import its assets. Public member-asset provenance also references it. Reference prototypes are not a second live application. |
| `.github/` | Verification workflow and contributor automation | Keep. |
| `.21st/`, `.impeccable/` | Tracked context pointers and historical design-review captures | Retain metadata; old captures may be consolidated through a reviewed evidence move. They are not all regenerable caches. |
| `node_modules/` — 382 MiB | Installed dependencies | Regenerable with the lockfile; retain for the current local setup and hide from normal browsing. |
| `dist/`, `dist-api/` — about 5.3 MiB combined | Generated frontend/API outputs | Cleanup candidates when no preview/API process is serving them. `api:start` explicitly consumes `dist-api`; rebuild before use. |
| `playwright-report/`, `test-results/` — about 2.6 MiB combined | Generated browser reports/traces | Cleanup candidates after retaining any needed failure evidence. |
| `.platform-test/` — 8.2 MiB | Generated fictional test files, fixtures, temporary sessions and captures | Cleanup candidate after test/capture processes stop. Browser/capture scripts depend on files here during execution. |
| `.worktrees/` — about 4.2 GiB | 21 linked task checkouts in the baseline | Retire individually using Git after preserving local-only files. See inventory below. |
| `.backups/` — 1.2 MiB | Local recovery copies from prior consolidation | Preserve pending backup/recovery-owner review; age does not make them disposable. |
| `output/` — 0.34 MiB | Three tracked Playwright screenshots | Archive/consolidation candidate. Searches found no active tracked reference, but all three are unique among tracked images. Move preserved bytes to a suitable `docs/screenshots/` history location rather than treating them as duplicate cache. |
| `.vscode/` | Existing untracked editor configuration | Preserve user's local work. Any Explorer exclusions should be merged explicitly, not overwrite it. |
| `.agents/`, `.codex/`, `.aws/` | Environment/tool/credential-related surfaces | Preserve; do not infer uselessness from an empty or restricted listing. Credentials are not application source or public archive inputs. |
| `.git/` | Repository objects, refs, worktree metadata and backup history | Keep. Only the verified stale temporary-pack subset is a proposed cleanup target. |

## 3. Linked worktree findings

Of the baseline's 21 linked worktrees, **17 have no tracked/untracked changes reported by ordinary Git status and their HEAD is already an ancestor of main**. This is a retirement shortlist, not a declaration that ignored contents are valueless. Several contain ignored dependencies, fixtures, build outputs and traces; one includes a nested ignored `.worktrees/` directory. Check those before removing any checkout. Keep task branches unless branch retirement is separately agreed.

The 17 candidates are:

```text
benedict-dec-01-phase1                 benedict-dec-01-phase2
benedict-dec-01-phase3                 benedict-dec-01-phase3-plan
benedict-implementation-plan           benedict-pay-01-phase4-plan
benedict-pay-01-phase4-rules            benedict-pay-01-phase5
benedict-qwn-dataset-prep               benedict-qwn-phase6
benedict-qwn-phase7                    connected-lending-cl0
connected-lending-cl1                  connected-lending-cl2
connected-lending-cl3                  cooperative-site-plan-20261123
policy-proxy-20261123
```

Preserve these four until their specific work is resolved:

| Worktree | Observed reason |
| --- | --- |
| `benedict-qwn-evaluation-candidates` | Untracked `models/qwen/phase-f-candidates/`, including ignored review material. |
| `benedict-qwn-experiment-e-data` | Untracked `models/qwen/experiment-e-grounding/`. |
| `connected-lending-plan-20261105` | Untracked connected-lending implementation plan. |
| `connected-lending-cl4` | Clean ordinary status, but two commits are not in main; its HEAD is also 38 commits behind main. No merge authorization or redundancy conclusion is supplied by this audit. |

Git distinguishes removing an existing checkout from pruning stale administrative entries. At inspection all baseline worktrees were present, with no `prunable` entries. `git worktree prune` alone will not retire these existing directories. Use the [documented worktree lifecycle](https://git-scm.com/docs/git-worktree) and avoid force-removal of another owner's checkout.

## 4. Root files and research storage

There are **29 ignored root files beyond `.env` and the TypeScript build cache**. They include experiment exports, reviewer packets/completed work, templates, local instructions, a historical owner brief and protected/blind review material. Git ignores keep them out of normal commits; they do not make the files unused or expendable.

The root's visual clutter can be reduced by transferring these to the agreed private research/artifact location with a path inventory, hashes, restrictive access and confirmed owner/script/provenance references. Do not commit them into a new public `archive/` directory, combine blinded data with its private key, rewrite completed annotations or delete them as generated output. Ignore rules and deployment-context exclusions must continue to protect the chosen location. No such transfer was performed.

`AGAP_Partner_Review_Proposal.docx` is tracked and linked from the [partner validation brief](AGAP_Partner_Validation_Brief.md). It can be moved under an appropriate source/history directory with the link updated and exact bytes retained; it cannot be classified as unreferenced trash. Existing root authority/configuration files remain appropriate at the root. Consolidating additional documents should preserve checksum-bound historical artifacts and all current links.

## 5. Recommended cleanup sequence

1. **Git maintenance:** recheck locks/processes and take a fresh manifest of the 50 stale temporary packs, including path, file type, inode/size/mtime. Confirm Git still classifies each as stale and `fsck` succeeds. Remove only that verified subset, then repeat integrity/status checks and measure actual space recovered. Expected candidate recovery is 16.11 GiB. No history rewrite, branch deletion or broad object pruning is needed for this target. The [Git prune dry-run](https://git-scm.com/docs/git-prune) also proposed 219 other object/removal entries; that wider operation is outside this narrow cleanup recommendation.
2. **Generated files:** after checking active preview/API/test/capture use, retain needed diagnostic evidence and remove explicitly listed generated reports, build outputs and caches. Keep `.env`, dependencies needed by the current session, local databases/documents, model artifacts and research files. Do not use a blanket ignored-file wipe: [Git clean's `-x` behavior](https://git-scm.com/docs/git-clean) includes ignored files, which here includes valuable local material.
3. **Retired checkouts:** confirm each candidate's branch/commit relation and local-only/ignored inventory, retain required artifacts, and remove reviewed merged checkouts one at a time without force. Preserve the four worktrees above and the pre-remote-repair backup branch. Record what was retired; do not delete `.worktrees/` wholesale.
4. **Archive/document consolidation:** move the three `output/playwright` captures and root proposal only through a tracked, byte-preserving change with relevant links/manifests updated. Agree a protected destination for local research exports with their owners. Preserve source artwork, accepted-design manifests and historical verification images.
5. **Explorer and future layout:** hide generated/dependency/worktree directories through agreed editor settings. Retain `src/`, `apps/`, `packages/`, `public/`, `tests/`, `infra/`, `docs/`, `models/`, `evaluation/`, `design-library/` and `scripts/` as purposeful boundaries. [DCCPEC's new `apps/coop-site/`](AGAP_Cooperative_Website_Plan.md) remains planned. Moving the existing frontend into `apps/web/` is an optional later refactor requiring import/build/test/Docker/hosting updates and full regression; it is not necessary to add DCCPEC's public site.

The first pass should target storage hygiene and root clutter while retaining the current application boundaries. Backend, finance and model code are not removal candidates merely because the public landing does not import them.

## 6. Verification and limits

Read-only checks performed: top-level/depth-two disk inventory; tracked versus ignored inventory; source/script/container/configuration references; all baseline worktree ordinary and ignored status plus commit ancestry; image checksums for `output/` against other tracked images; Git object counts, full integrity check and prune dry run. No private packet, environment or credential contents were needed or exposed. Process/file-handle observations are limited to the visible execution environment and must be repeated before cleanup.

The audit's temporary documentation worktree is separate from the baseline inventory and will be retired after publishing the report. Documentation-only verification uses introduced local links/anchors, scope/status consistency and `git diff --check`; application tests or new UI screenshots are not claimed. Graft and Graphify are unavailable; indexed navigation/graph refresh cannot be claimed. [Assignment](../Assignment.md) and [verification](AGAP_Verification.md#repository-structure-audit--23-november-2026) record the audit and distinguish proposed cleanup from executed work.

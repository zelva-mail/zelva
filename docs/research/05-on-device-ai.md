# 05 · On-device AI

| | |
|---|---|
| Status | Research snapshot taken 2026-11-23. Not a living document |
| Method | Research agent reading model cards, registry APIs, release pages, vendor documentation and device benchmarks |
| Labels | **V** read on the primary page on the day · **U** search summary, secondary source or the agent's own estimate |
| Precedence | Where this note conflicts with `docs/decisions/0001-pre-prd-product-decisions.md`, the decision log wins |

Decisions that build on this note: DEC-021 to DEC-027 (AI design, tiering and delivery), DEC-053 (no platform models in v1).

---


**Labels:** **V** = read on the primary page today. **U** = search-engine summary or secondary source only, or my own estimate. Search summaries were unreliable (one invented GGUF sizes and a "TheBloke" repo), so every V number was checked on the model card, registry or docs page.

## Corrections to the brief

- **`llama-cpp-credal`**: not found. The crates.io API returns 404 and no GitHub repo matches (U that it does not exist). The live binding is `llama-cpp-2`.
- **Gemma license**: Gemma 4 is Apache-2.0. The prohibited-use policy applies to Gemma 3 (V for Gemma 4, U for Gemma 3).
- **Missing generations**: I found no Phi-5 or SmolLM4 (U). The current small models are Phi-4-mini (MIT) and SmolLM3-3B (Apache-2.0).

## 1. Inference engines

| Engine | License | State | Platforms / backends | Fit |
|---|---|---|---|---|
| [llama.cpp](https://github.com/ggml-org/llama.cpp/releases) + [`llama-cpp-2`](https://docs.rs/llama-cpp-2/latest/llama_cpp_2/) | MIT/Apache-2.0 | 0.1.161 (2026-11-03), released every 1–2 weeks, no semver (V) | Upstream b12651 ships an iOS XCFramework and Android arm64 builds. Metal, Vulkan, OpenCL-Adreno, Hexagon, CUDA, OpenVINO, WebGPU (V) | Primary engine |
| mistral.rs (candle) | U (MIT) | Crate 0.8.1 (2026-04-02); README already advertises v0.9.5 (V) | CUDA and Metal; no iOS/Android target documented | Not for mobile |
| candle | Apache-2.0 (U) | 0.11.1 (2026-10-31) (V) | You implement the model | Fine for a classifier or embeddings |
| burn | MIT/Apache-2.0 | wgpu incl. Wasm; ONNX importer supports a limited operator set (V) | Wasm, Metal, Vulkan | Not for generative LLMs |
| [`ort`](https://raw.githubusercontent.com/pykeio/ort/main/ort-sys/build/download/dist.tsv) | U | 2.0.0-rc.15 (2026-10-19), still RC, on ONNX Runtime 1.31 (V) | Prebuilts for iOS (+sim, CoreML), Android (NNAPI), Windows x64/arm64 (DirectML), macOS, Linux. No wasm32 entry. WebGPU EP experimental (V) | Classifier and embeddings |
| ratchet | MIT | "Active development", zero releases, models limited to Whisper/Phi/Moonlight (V) | Browser only | Unusable |
| [wllama](https://github.com/ngxson/wllama) (web) | MIT | V4 (V) | CPU WASM SIMD plus WebGPU; OPFS cache with resumable downloads; multi-threading needs COOP/COEP (V) | Web generative |
| [transformers.js](https://github.com/huggingface/transformers.js/releases) (web) | Apache-2.0 (U) | 4.3.2 (Oct 28); v4 rewrote the WebGPU runtime in C++; supports Qwen3.5, Gemma 4, LFM3; WebGPU on Safari 26+ (V) | WebGPU and wasm | Web classifier and embeddings |

- **ort prebuilt baseline:** x86-64 builds require x86-64-v3 (Haswell 2013 or later). The maintainers say this excludes cheaper Intel chips such as Pentiums ([docs](https://ort.pyke.io/misc/prebuilt-binaries)) (V).
- **Tauri iOS linking:** the link step is driven by `src-tauri/gen/apple`, and frameworks a C dependency needs are not added automatically. One documented case had to add a framework in Xcode by hand ([thread](https://users.rust-lang.org/t/tauri-rodio-and-ios-cross-compiling-and-linking-c-dependencies-for-ios/124563)) (V). Expect the same for Metal and Accelerate.
- **Android:** `llama-cpp-2` compiles llama.cpp in its build script, so standard NDK cross-compilation applies (V for mechanism, U for a Zelva-specific build).
- **Binary size:** CPU-only ggml about 2–5 MB, Vulkan several MB more, ONNX Runtime 10–25 MB per execution-provider set (U, estimates).

| Platform model | Availability | Custom task model? | Verdict |
|---|---|---|---|
| Apple Foundation Models ([docs](https://developer.apple.com/tutorials/data/documentation/foundationmodels.json)) | iOS/macOS 26+, Apple Intelligence devices only: iPhone 15 Pro or later, M1 or later Macs ([list](https://www.apple.com/apple-intelligence/)). Swift-only (V) | No. The system model is fixed; you can plug your own model in as a `LanguageModelExecutor` (V) | Fallback only; excludes iPhone 13–15 |
| Android ML Kit GenAI ([docs](https://developers.google.com/ml-kit/genai)) | Gemini Nano via AICore on Pixel 9–11, Galaxy S25/S26 and recent flagships. Foreground app only, per-app quotas (V) | No (V) | Fallback only |
| Windows Phi Silica ([docs](https://learn.microsoft.com/en-us/windows/ai/apis/)) | NPU (Copilot+) or RTX 30 / RX 9060 GPU with Developer Mode. No CPU support. Being replaced by "Aion Instruct" from Dec 2026 (V) | Partial: LoRA adapters, but trained in Azure on A100s and rejected if incompatible ([docs](https://learn.microsoft.com/en-us/windows/ai/apis/phi-silica-lora)) (V) | Not viable |
| Chrome built-in AI ([docs](https://developer.chrome.com/docs/ai/built-in-apis), [requirements](https://developer.chrome.com/docs/ai/get-started)) | Summarizer stable since Chrome 138; Prompt stable on web from Chrome 148; Writer and Rewriter still developer trial. Desktop only (V) | No alternative model documented (V) | Optional web fallback |

Chrome's model needs more than 4 GB VRAM, or 16 GB RAM and 4 cores, and 22 GB free disk before the first download. It downloads only after user activation (V).

**Conclusion:** none of the four accepts a model trained by Zelva, and none covers every target device. They can only be an optional fallback.

## 2. Tiny generative models

| Model | License | Context | Q4_K_M GGUF | Notes |
|---|---|---|---|---|
| Qwen3.5-0.8B ([card](https://huggingface.co/Qwen/Qwen3.5-0.8B)) | Apache-2.0 | 262K | 533 MB ([unsloth](https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF)) | IFEval 52.1, MMLU-Pro 29.7 (non-thinking). Vendor says prototyping and task fine-tuning; prone to thinking loops (V) |
| Qwen3.5-2B ([card](https://huggingface.co/Qwen/Qwen3.5-2B)) | Apache-2.0 | 262K | 1.28 GB (V) | IFEval 61.2, MMLU-Pro 55.3 non-thinking; 78.6 and 66.5 with thinking (V) |
| Qwen3.5-4B ([card](https://huggingface.co/Qwen/Qwen3.5-4B)) | Apache-2.0 | 262K | 2.78 GB (V) | IFEval 89.8, MMLU-Pro 79.1. Thinks by default; disable via chat-template flag (V) |
| Gemma 4 E2B-it ([card](https://huggingface.co/google/gemma-4-E2B-it)) | Apache-2.0 | 128K | 3.11 GB (V) | 2.3B effective but 5.1B with embeddings; MMLU-Pro 60.0; 35+ languages (V) |
| Gemma 4 E4B-it ([card](https://huggingface.co/google/gemma-4-E4B-it)) | Apache-2.0 | 128K | U | MMLU-Pro 69.4 (V) |
| LFM3-1.7B ([card](https://huggingface.co/LiquidAI/LFM3-1.7B)) | LFM Open License v1.0: no commercial use at US$10M or more annual revenue ([license](https://huggingface.co/LiquidAI/LFM3-1.7B/raw/main/LICENSE)) | 256K | about 1 GB (vendor) | 16 languages. Vendor IFEval of 96.66 is implausible for this size (U) |
| MiniCPM5-2B ([card](https://huggingface.co/openbmb/MiniCPM5-2B)) | Apache-2.0 | 131K | U | Thinking by default; English and Chinese; IFEval 86.7 (V) |
| Phi-4-mini ([API](https://huggingface.co/api/models/microsoft/Phi-4-mini-instruct)) | MIT | 128K (U) | about 2.3 GB (V) | 3.84B, 24 languages, Feb 2025 (V) |
| SmolLM3-3B ([API](https://huggingface.co/api/models/HuggingFaceTB/SmolLM3-3B)) | Apache-2.0 | U | about 1.8 GB (V) | 3.08B, 6 languages (V) |
| Nemotron-3-Nano-4B ([API](https://huggingface.co/api/models/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16)) | NVIDIA Open Model License | U | U | 3.97B, English (V) |

Measured speed (pp = prompt processing, tg = generation, tokens per second):

| Device | Model | Result | Source |
|---|---|---|---|
| iPhone 17 Pro, llama.cpp | Qwen3.5-2B Q4 | 39.1 tg, 1.48 GB peak; MLX 61.2 | [benchmark](https://dev.to/john-rocky/on-device-llm-on-iphone-which-runtime-is-fastest-mlx-vs-llamacpp-vs-litert-lm-vs-coreml-1b42) (V) |
| iPhone 17 Pro, llama.cpp | Gemma 4 E2B | 37.8 tg, 3.16 GB peak | same (V) |
| vivo X300 flagship, Arm-tuned CPU | Qwen3.5-2B Q4 | 22.1 tg, 2.52 GB | [Arm](https://developer.arm.com/ai/models/hugging-face/Arm/qwen3-5-2b-q4-k-m-ggml-llama-cpp-vivo-x300/qwen3.5-2b-q4_k_m-gguf) (V) |
| OnePlus 10 Pro, Pixel 8 Pro, POCO F3, CPU | 1B / 1.7B / 3B / 4B | 15–17 / 10–12 / 6–7 / 4.5–5 tg; pp 45–62 / 40–60 / n/a / 12–18 | [phoneborg](https://github.com/dzaczek/phoneborg/blob/main/docs/BENCHMARKS.md) (V) |
| Snapdragon 845 (2018) | 1B / 4B | 7 tg / "unusable" | same (V) |
| Apple M4 16 GB | Qwen3.5-4B Q4 | 18–32 tg; M4 Max 85 | [llamaperf](https://llamaperf.com/model/qwen3-5) (V) |
| Radeon 890M iGPU (AMD Loom runtime) | Qwen3.5-4B Q4 | 31 tg, 996 pp | same (V) |
| Ryzen 7 8745H, CPU only | Qwen3.5-9B | 8.1 tg | same (V) |
| Browser, M1 Max, WebGPU | Qwen3.5-0.8B q4 | about 45 tg | [README](https://github.com/tantara/transformers.js-chrome) (V) |

- **Gaps:** I found no measurements for A15–A16 iPhones, 6–8 GB Android phones, or laptop CPUs on the 0.8B–4B sizes (U).
- **Prefill is the binding constraint on phones (analysis):** at 45–60 tok/s, a 3,000-token thread costs 50–70 seconds before the first output token on a 2022–23 flagship. Strip quoted text and summarize incrementally.
- **Smallest acceptable model (analysis, no published email-summarization eval found):** 2B is the floor for short, tone-constrained replies. 0.8B suits single-message gists and JSON classification. 4B is needed for drafts.
- **Two-model strategy:** yes. Keep one family (Qwen3.5) for one tokenizer and chat template. Use 0.8B below 6 GB RAM, 2B on phones, 4B on desktop.

## 3. Spam and phishing classifier

- **Encoders beat small LLMs:** quantised LLMs reach above 80% accuracy but "underperform compared to ML and DL methods" ([arXiv 2507.07406](https://arxiv.org/abs/2507.07406)). About 3B-parameter LLMs need explanation-augmented fine-tuning and ensembling to approach larger models ([arXiv 2505.00034](https://arxiv.org/abs/2505.00034)) (V for abstracts).
- **DeBERTa-v3 vs ModernBERT:** DeBERTa-v3 wins on accuracy and sample efficiency; ModernBERT's speed claim is GPU-derived (U).
- **Off-the-shelf:** [`cybersectony/phishing-email-detection-distilbert_v2.4.1`](https://huggingface.co/cybersectony/phishing-email-detection-distilbert_v2.4.1) is DistilBERT, 67M parameters, Apache-2.0, trained on 200k examples, 99.58 accuracy on its own split, 311k downloads (V). It also classifies URLs, so it likely keys on URL presence, and no limitations are documented.
- **URL models:** `ealvaradob/bert-phishing-url` and `bert-phishing-text`. One paper reports 0.625 accuracy out of distribution against 0.945 elsewhere (U).
- **Datasets:** the Nazario corpus is still updated; `phishing-2025` was added 2026-02-19 ([index](https://monkey.org/~jose/phishing/)) (V). A Kaggle set of about 82.5k emails exists (U). SpamAssassin and CEAS_08 are used in the papers above (V). Enron, Lingspam and SMS Spam current hosting is U.
- **Size:** DistilBERT is about 67 MB int8; DeBERTa-v3-base about 185 MB (U). No published int8 CPU latency table exists; I estimate 10–50 ms per message on a laptop for DistilBERT (U).

**Recommendation (analysis):** v1 is off-the-shelf plus heuristics. Re-validate the model on your own time-split set first. In-house fine-tuning waits, because public scores do not transfer and false positives on legitimate mail are the main cost. When you do it:

1. Start with SetFit, which works from about 8 labels per class (U).
2. Fine-tune on Nazario, CEAS_08, SpamAssassin and opt-in labels.
3. Calibrate, then set thresholds on the legitimate false-positive rate.
4. Never move mail on a model score alone.

## 4. Deterministic heuristics

| Client | Warning and trigger | Label |
|---|---|---|
| Gmail | Question mark beside the sender when not authenticated. Unauthenticated does not mean spam ([support](https://support.google.com/mail/answer/180707)) | V |
| Gmail | "Be careful with this message" variants and employee-name spoofing protection | U |
| Outlook | "?" on the sender photo when SPF/DKIM fail and DMARC or composite authentication fails; "via" tag when the From domain differs from DKIM or MAIL FROM; first-contact tip; "<Sender> appears similar to someone who previously sent you email"; unexpected-characters tip ([docs](https://learn.microsoft.com/en-us/defender-office-365/anti-phishing-policies-about)) | V |
| Proton | PhishGuard flags potentially spoofed addresses ([page](https://proton.me/mail/security)) | V |
| Fastmail | Treats authentication "as a signal and not a cause to block"; no banner documented ([help](https://www.fastmail.help/hc/en-us/articles/15976191806223-Why-did-I-get-an-email-from-myself)) | V |
| Yahoo, Apple Mail | Nothing primary found | U |

- **Techniques (standard, analysis):**
  - UTS#39 confusable skeleton and mixed-script checks on the registrable domain.
  - Edit distance against contacts' domains and a curated brand list.
  - Display-name versus local-part mismatch.
  - Reply-To, Return-Path and From organizational-domain mismatch.
  - Brand display name on a freemail address.
  - Subdomain tricks, shorteners, and link text differing from href.
- **Crates (V):**
  - [`mail-auth`](https://github.com/stalwartlabs/mail-auth): Apache-2.0/MIT; DKIM, DKIM2, SPF, DMARC, ARC; runs on WASM with its pure-Rust crypto and DNS-over-HTTPS features.
  - [`mail-parser`](https://github.com/stalwartlabs/mail-parser): same license.
  - [`psl`](https://docs.rs/psl/latest/psl/) 2.1.261 (2026-11-22) and [`publicsuffix`](https://docs.rs/publicsuffix/latest/publicsuffix/) 2.3.0: MIT/Apache-2.0.
  - [`unicode-security`](https://docs.rs/unicode-security/latest/unicode_security/) 0.1.3: MIT/Apache-2.0, but old (U that it is unmaintained).
- **Crates (U, not re-checked):** `strsim`, `idna`, `url`. The `rqrr` URL I tried returned 404.

**RDAP (my assessment, no dedicated study found):** a client-side lookup tells the registry or RDAP provider which sender domains appear in a user's mailbox, along with IP and timing. There is no standard encrypted variant, and ccTLD coverage is uneven. Make it opt-in and batched, and prefer passive signals such as "first time this domain appears in this mailbox".

## 5. Embeddings

- **fastembed 7** ([repo](https://github.com/Anush008/fastembed-rs)): Apache-2.0, built on `ort`, defaults to bge-small-en-v1.5, has quantised variants and multilingual options. Wasm is not mentioned (V).
- **Qwen3-Embedding-0.6B** ([card](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B)): Apache-2.0, 32K context, 100+ languages, 1.19 GB in BF16 (V).
- **sqlite-vec** ([repo](https://github.com/asg017/sqlite-vec)): pre-v1, "expect breaking changes" (V).

**Verdict (analysis):** not in v1. Sender rules and headers classify newsletters, receipts and social mail at near-zero cost. In v2, brute force over up to about 100k vectors of 384 dimensions takes milliseconds in Rust, so no index extension is needed.

## 6. Web feasibility

- **WebGPU support** ([gpuweb](https://github.com/gpuweb/gpuweb/wiki/Implementation-Status), edited 2026-10-02) (V):
  - Chrome and Edge: desktop since 113, Android since 121. Most Linux GPUs still need flags.
  - Firefox: Windows since 141; Apple-silicon Mac since 145. Linux and Android are not shipped.
  - Safari 26: on by default on macOS 26 and iOS 26.
- **Memory:** Firefox WebGPU has limited GPU memory, and "models 0.8B+ (including Qwen3.5-0.8B) may fail" (V).
- **Caching:** wllama uses OPFS; WebLLM offers Cache API, IndexedDB and OPFS (V).

**Realistic web offer (analysis):**
- Heuristics, authentication results and the int8 classifier in WASM for everyone.
- Optional single-message summary with a 0.5–0.8B model on desktop Chrome, Edge and Safari 26.
- Chrome's Summarizer API as a zero-download option.
- No drafts or digests in v1.

## 7. Operations and policy

- **Distribution:** Hugging Face Hub with Xet gives chunk-level deduplication and cryptographic hashing ([docs](https://huggingface.co/docs/hub/xet/security)) (V). Cloudflare R2 is $0.015 per GB-month with no egress fee (U). Sign your own manifest regardless and pin by commit hash (analysis).
- **iOS background limits:** `BGAppRefreshTask` about 30 seconds, `BGProcessingTask` minutes, neither guaranteed. Use a background `URLSession` for downloads (U).
- **Store policy:** Apple 2.5.2 and Play's "Device and Network Abuse" rule ban downloaded code (dex, JAR, `.so`). Weights are generally treated as data if the runtime ships in the bundle (U; community reading, not an official statement).
- **EU AI Act:** Article 50 has applied since 2026-08-02 (U). The Digital Omnibus (Regulation (EU) 2026/1744) delayed high-risk rules and left Article 50 unchanged (U).
  - The 50(1) disclosure duty targets systems that interact directly with people; label summaries as AI anyway.
  - The 50(2) marking duty has an assistive "standard editing" carve-out ([guide](https://artificialintelligenceact.eu/transparency-rules-article-50)) (V).
  - Spam filters are treated as minimal risk (U).
  - This is not legal advice.

## 8. Improving models without user data leaving

- **Apple:** devices match against synthetic candidates and return a differentially private aggregate. Contents never leave the device ([post](https://machinelearning.apple.com/research/differential-privacy-aggregate-trends), 2025-04-14) (V). The post names Genmoji and email summaries, gives no epsilon, and does not mention Mail categorization (U that it does).
- **Proton:** PhishGuard flags spoofed addresses. I found no evidence of on-device or federated learning (U).
- **Federated learning:** Flower 1.44.0 shipped 2026-11-18 ([releases](https://github.com/flwrlabs/flower/releases)), but it still needs a server, client orchestration and enough concurrent users. Apple's pfl is "not intended to be used for third-party FL deployments" ([repo](https://github.com/apple/pfl-research)) (V). Impractical for a solo founder at v1.
- **Recommendation (analysis):** use an explicit opt-in that sends only a label and hashed features, never body text, rate-limited with a minimum cohort before anything is uploaded.

## 9. Recommended architecture

1. **Baseline (free, no model):** `mail-auth` for SPF/DKIM/DMARC/ARC, identity and lookalike heuristics, tracker blocking. Shown as badges: "Unverified sender", "Lookalike of X", "Reply goes elsewhere".
2. **Detection (free):** an int8 encoder through `ort` on CPU, on every platform including WASM. About 70 MB.
3. **Generative (Pro):** `llama-cpp-2` with Qwen3.5 GGUF.

| Platform | Model | On disk |
|---|---|---|
| Windows, Linux, macOS | Qwen3.5-4B Q4_K_M (Metal, Vulkan or OpenCL-Adreno) | 2.78 GB |
| iOS | Qwen3.5-2B Q4_K_M | 1.28 GB |
| Android 6 GB or more | 2B, or 0.8B when RAM is tight | 1.28 / 0.53 GB |
| Web | Optional 0.8B; Chrome Summarizer as fallback | 0.53 GB |

4. **Platform models:** optional fallback only, disclosed when used.
5. **Model manager:** consent prompt, then a signed manifest, resumable download into the app container, hash verification, load on demand. "Delete AI model" removes the files and derived summaries.
6. **Assist-only:** filter suggestions render as a diff the user confirms.

## 10. Top risks

1. **Mobile prefill latency and battery:** thread summaries on mid-range Android may take a minute or more.
2. **False positives on legitimate mail:** forwarded lists, `p=none` domains and small senders. Suppress with contact history; warn, do not move.
3. **Engine churn:** llama.cpp breaks its API weekly and `ort` is still RC. Pin versions behind your own trait.
4. **Toolchain friction:** iOS framework linking under Tauri, and `ort`'s x86-64-v3 baseline excluding older Intel laptops.
5. **Quality of small-model summaries and drafts:** show source snippets and require edit-before-send.
6. **"Ships without models":** the 70 MB classifier must also be downloaded after consent, or the promise is broken.
7. **Policy:** Article 50 labeling, store review of downloaded content, and platform models conflicting with the "asked before any model is downloaded" promise.
8. **Licenses:** the LFM revenue cap and Nemotron's custom license.
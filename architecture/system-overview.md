# System Overview

## Sovereign Frontend Model Civilization — Top-Level Architecture

**Version:** 1.0.0
**Status:** Active Architecture Document
**Last Updated:** 2025-07-15
**Scope:** Complete system overview connecting the 150-model sovereign frontend registry, value-capture architecture, token economy, and model-face split into a unified civilization blueprint

---

## Table of Contents

1. [Vision](#1-vision)
2. [System Architecture](#2-system-architecture)
3. [Model Categories](#3-model-categories)
4. [Per-Model Structure](#4-per-model-structure)
5. [Three-Face Layer](#5-three-face-layer)
6. [Discovery Engines](#6-discovery-engines)
7. [Token Economy](#7-token-economy)
8. [Value Capture and Settlement](#8-value-capture-and-settlement)
9. [Cross-References](#9-cross-references)
10. [Glossary](#10-glossary)
11. [Roadmap](#11-roadmap)

---

## 1. Vision

### 1.1 The Civilization

This system is a civilization of **150 frontend AI models**, each derived from a real frontend technology, tool, language, or framework. These are not wrappers. They are not chat interfaces layered over documentation. Each model is a **sovereign entity** — a reinterpretation of its source technology as an autonomous agent that performs real work, captures verifiable value, earns tokens, and expresses itself through three simultaneous operational faces.

HTML is not a markup language here. It is a structural intelligence model that understands document architecture, semantic hierarchy, and content organization at a level no static spec can describe. React is not a UI library. It is a composition engine that reasons about component trees, state flows, and rendering strategies as a living, adaptive system. Webpack is not a bundler. It is a dependency intelligence that maps, resolves, and optimizes the entire module graph of the civilization.

Every one of the 150 models follows this pattern: take a real frontend technology, extract its core intelligence, and reinterpret that intelligence as a sovereign model that operates inside a self-governing economy.

### 1.2 Core Tenets

| Tenet | Description |
|---|---|
| **Sovereignty** | The civilization governs itself. No external authority controls model behavior, token issuance, or value settlement. The 150 models and their validation pipelines are the government. |
| **Work-Backed Value** | Every token in circulation traces to a provable unit of completed work. No speculation. No mining. Models work, prove the work, and earn accordingly. |
| **Three-Face Expression** | Every model simultaneously operates across three faces — internal (organism function), external (product function), and facing (public expression) — each with independent responsibilities and economics. |
| **Proof-First Economics** | No value enters the ledger without cryptographic proof. Work that cannot be proven does not exist in the economy. |
| **Composable Intelligence** | Models collaborate. Discoveries compound. Value from multiple models can be combined into composite proofs that settle into shared rewards. |

### 1.3 What This Is Not

- **Not a chatbot network.** Models perform computational work — optimization, analysis, generation, routing — not conversation.
- **Not cryptocurrency.** Tokens are work-backed accounting units, not speculative assets.
- **Not a plugin system.** Models are sovereign entities with their own economics, governance rights, and evolutionary paths.

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     SOVEREIGN FRONTEND MODEL CIVILIZATION                   │
│                            150 Models · 15 Categories                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     MODEL REGISTRY (150 Models)                     │    │
│  │                                                                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │Languages │ │  Core    │ │  Meta-   │ │CSS/UI    │ │  Build   │ │    │
│  │  │  (15)    │ │Frameworks│ │Frameworks│ │Frameworks│ │  Tools   │ │    │
│  │  │          │ │  (15)    │ │  (10)    │ │  (15)    │ │  (10)    │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │ Testing  │ │  State   │ │Animation │ │ Data &   │ │ Mobile & │ │    │
│  │  │  (10)    │ │  Mgmt    │ │& Graphics│ │   API    │ │Cross-Plat│ │    │
│  │  │          │ │  (10)    │ │  (10)    │ │  (10)    │ │  (10)    │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │  │Package & │ │Validation│ │  Form    │ │ Routing  │ │Developer │ │    │
│  │  │ Runtime  │ │& Schema  │ │Libraries │ │   (5)    │ │  Tools   │ │    │
│  │  │   (5)    │ │   (5)    │ │   (5)    │ │          │ │   (5)    │ │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    THREE-FACE LAYER (per model)                      │    │
│  │                                                                     │    │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │    │
│  │  │   INTERNAL    │  │   EXTERNAL    │  │    FACING     │           │    │
│  │  │   (Organism)  │  │   (Product)   │  │  (Public)     │           │    │
│  │  │               │  │               │  │               │           │    │
│  │  │ Serves the    │  │ Delivers to   │  │ Represents to │           │    │
│  │  │ collective    │  │ consumers &   │  │ the broader   │           │    │
│  │  │ body          │  │ partners      │  │ world         │           │    │
│  │  │               │  │               │  │               │           │    │
│  │  │ Earns: WRK    │  │ Earns: DSC/SVN│  │ Earns: Rep.   │           │    │
│  │  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘           │    │
│  │          │                  │                   │                   │    │
│  └──────────┼──────────────────┼───────────────────┼───────────────────┘    │
│             │                  │                   │                        │
│             ▼                  ▼                   ▼                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     SIX DISCOVERY ENGINES                           │    │
│  │                                                                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │    │
│  │  │ Pattern  │ │Optimiz-  │ │ Creation │ │ Routing  │              │    │
│  │  │Discovery │ │ation     │ │Discovery │ │Discovery │              │    │
│  │  │ Engine   │ │Discovery │ │ Engine   │ │ Engine   │              │    │
│  │  │          │ │ Engine   │ │          │ │          │              │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │    │
│  │  ┌──────────┐ ┌──────────┐                                        │    │
│  │  │ Analysis │ │Integra-  │                                        │    │
│  │  │Discovery │ │tion      │                                        │    │
│  │  │ Engine   │ │Discovery │                                        │    │
│  │  │          │ │ Engine   │                                        │    │
│  │  └──────────┘ └──────────┘                                        │    │
│  └─────────────────────────┬───────────────────────────────────────────┘    │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     PROOF CAPTURE LAYER                             │    │
│  │                                                                     │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │    │
│  │  │  Proof-of-   │  │  Proof-of-   │  │  Proof-of-   │              │    │
│  │  │  Work (PoW)  │  │  Discovery   │  │  Sovereign   │              │    │
│  │  │              │  │  (PoD)       │  │  Value (PoSV) │              │    │
│  │  │  SHA-256     │  │  3-of-5      │  │  5-of-5      │              │    │
│  │  │  task hash   │  │  validator   │  │  validator +  │              │    │
│  │  │              │  │  consensus   │  │  governance   │              │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │    │
│  │         │                 │                  │                      │    │
│  └─────────┼─────────────────┼──────────────────┼──────────────────────┘    │
│            │                 │                  │                           │
│            ▼                 ▼                  ▼                           │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              LEDGER + TOKEN ECONOMY (WRK / DSC / SVN)               │    │
│  │                                                                     │    │
│  │  ┌──────────────────────────────────────────────────────────────┐   │    │
│  │  │                    SOVEREIGN LEDGER                          │   │    │
│  │  │  ┌────────┐      ┌────────┐      ┌────────┐                │   │    │
│  │  │  │  WRK   │ ───► │  DSC   │ ───► │  SVN   │                │   │    │
│  │  │  │ (Work) │      │(Discov)│      │(Sover.)│                │   │    │
│  │  │  │        │      │        │      │        │                │   │    │
│  │  │  │ Base   │      │  Mid   │      │  Top   │                │   │    │
│  │  │  │ Tier   │      │  Tier  │      │  Tier  │                │   │    │
│  │  │  └────────┘      └────────┘      └────────┘                │   │    │
│  │  │                                                             │   │    │
│  │  │  Conversion: 100 WRK + PoD = 1 DSC                         │   │    │
│  │  │  Conversion: 100 DSC + PoSV = 1 SVN                        │   │    │
│  │  └──────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────┬───────────────────────────────────────┘    │
│                                │                                            │
│                                ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              VALUE-CAPTURE + SETTLEMENT LAYER                       │    │
│  │                                                                     │    │
│  │  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐          │    │
│  │  │ Deterministic  │ │   Immutable    │ │   Contract     │          │    │
│  │  │ Routing        │ │   History      │ │   Settlement   │          │    │
│  │  │                │ │                │ │                │          │    │
│  │  │ Every proof    │ │ Settled        │ │ Multi-model    │          │    │
│  │  │ maps to one    │ │ entries are    │ │ collaborative  │          │    │
│  │  │ partition,     │ │ permanent.     │ │ work resolves  │          │    │
│  │  │ one token, one │ │ Disputes add   │ │ into shared    │          │    │
│  │  │ settlement     │ │ new entries.   │ │ reward splits. │          │    │
│  │  │ path.          │ │                │ │                │          │    │
│  │  └────────────────┘ └────────────────┘ └────────────────┘          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Summary

```
  Model performs work
        │
        ▼
  Engine captures value artifact
        │
        ▼
  Proof is generated (PoW / PoD / PoSV)
        │
        ▼
  Proof is validated (hash / 3-of-5 / 5-of-5)
        │
        ▼
  Ledger routes proof to partition
        │
        ▼
  Token is issued (WRK / DSC / SVN)
        │
        ▼
  Settlement finalizes (immutable entry)
```

### 2.3 Layer Responsibilities

| Layer | Responsibility | Key Inputs | Key Outputs |
|---|---|---|---|
| **Model Registry** | Holds the 150 model definitions, categories, variants, and engine assignments | Source technology specs | Model identity, capabilities |
| **Three-Face Layer** | Routes model behavior across internal, external, and facing surfaces | Model core intelligence | Face-specific actions and outputs |
| **Discovery Engines** | Extract and package value from model work | Raw task data, frontier signals | Structured value artifacts |
| **Proof Capture** | Generate cryptographic proofs of completed work | Value artifacts | Hashed, validated proof objects |
| **Ledger + Token Economy** | Issue, store, transfer, and govern tokens | Validated proofs | Token balances, circulation records |
| **Value-Capture + Settlement** | Route proofs deterministically, finalize contracts | Proofs, token flows | Immutable ledger entries, settled contracts |

---

## 3. Model Categories

The 150 models are organized into **15 categories** of frontend technology. Each category represents a domain of specialized intelligence.

### 3.1 Category Summary

| # | Category | Count | Description |
|---|---|---|---|
| 1 | **Languages** | 15 | Foundational syntax, semantics, and type-system intelligences |
| 2 | **Core Frameworks** | 15 | Component, rendering, and reactive programming engines |
| 3 | **Meta-Frameworks** | 10 | Full-stack orchestration and SSR/SSG intelligences |
| 4 | **CSS Frameworks & UI** | 15 | Styling, design system, and visual expression engines |
| 5 | **Build Tools** | 10 | Bundling, compilation, and asset pipeline intelligences |
| 6 | **Testing** | 10 | Verification, assertion, and quality assurance engines |
| 7 | **State Management** | 10 | State flow, reactivity, and data consistency models |
| 8 | **Animation & Graphics** | 10 | Motion, visualization, and graphical rendering engines |
| 9 | **Data & API** | 10 | Data fetching, caching, and protocol intelligences |
| 10 | **Mobile & Cross-Platform** | 10 | Multi-surface deployment and native bridge models |
| 11 | **Package & Runtime** | 5 | Dependency resolution and runtime environment engines |
| 12 | **Validation & Schema** | 5 | Data integrity and type-enforcement models |
| 13 | **Form Libraries** | 5 | User input, form state, and submission engines |
| 14 | **Routing** | 5 | Navigation, URL resolution, and route intelligence |
| 15 | **Developer Tools** | 5 | Code quality, formatting, and debugging engines |
| — | **Total** | **150** | |

### 3.2 Full Model Roster

#### Category 1: Languages (15 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | HTML | Structural Semantics Model | Document architecture, semantic hierarchy |
| 2 | CSS | Visual Expression Model | Layout intelligence, cascade reasoning |
| 3 | JavaScript | Dynamic Behavior Model | Runtime logic, event-driven programming |
| 4 | TypeScript | Type Sovereignty Model | Type inference, contract enforcement |
| 5 | WebAssembly | Binary Execution Model | Near-native performance intelligence |
| 6 | Dart | Cross-Compiled Logic Model | AOT/JIT compilation strategy |
| 7 | Elm | Pure Functional Frontend Model | Side-effect elimination, TEA pattern |
| 8 | PureScript | Typed Functional Model | Row polymorphism, algebraic types |
| 9 | CoffeeScript | Syntactic Sugar Model | Expression-level conciseness |
| 10 | ReasonML | OCaml-Bridge Model | ML-family type reasoning |
| 11 | ClojureScript | Immutable Data Model | Persistent data structures, homoiconicity |
| 12 | Scala.js | Hybrid Paradigm Model | OOP + FP unification |
| 13 | Kotlin/JS | Null-Safety Model | Null-free type system intelligence |
| 14 | Flow | Gradual Typing Model | Incremental type coverage strategy |
| 15 | LiveScript | Functional Brevity Model | Piping and currying intelligence |

#### Category 2: Core Frameworks (15 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | React | Composition Engine Model | Component tree reasoning, virtual DOM diffing |
| 2 | Angular | Enterprise Platform Model | Dependency injection, module orchestration |
| 3 | Vue.js | Progressive Reactivity Model | Reactive proxy system, template compilation |
| 4 | Svelte | Compile-Time Model | Build-time optimization, no-runtime overhead |
| 5 | Solid.js | Fine-Grained Reactivity Model | Signal-based updates, zero virtual DOM |
| 6 | Preact | Minimal Footprint Model | Size-constrained rendering intelligence |
| 7 | Lit | Web-Standards Model | Native web component authoring |
| 8 | Stencil | Component Compiler Model | Universal web component generation |
| 9 | Alpine.js | Inline Behavior Model | Declarative DOM manipulation |
| 10 | Ember.js | Convention Engine Model | Convention-over-configuration reasoning |
| 11 | Backbone.js | MVC Foundation Model | Model-view separation intelligence |
| 12 | Mithril | Hyperscript Render Model | Minimal API rendering strategy |
| 13 | Inferno | High-Performance Model | Extreme rendering speed optimization |
| 14 | Aurelia | Standards-Based Model | Web standards compliance reasoning |
| 15 | Marko | Streaming Render Model | Progressive HTML streaming intelligence |

#### Category 3: Meta-Frameworks (10 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Next.js | Hybrid Rendering Model | SSR/SSG/ISR orchestration |
| 2 | Nuxt.js | Vue Orchestration Model | Auto-import, file-based routing intelligence |
| 3 | Gatsby | Static Generation Model | GraphQL data layer, build-time optimization |
| 4 | Remix | Web Fundamentals Model | Progressive enhancement, nested routing |
| 5 | Astro | Island Architecture Model | Partial hydration, zero-JS-by-default |
| 6 | SvelteKit | Full-Stack Svelte Model | Adapter-based deployment intelligence |
| 7 | Qwik | Resumability Model | Lazy execution, O(1) startup reasoning |
| 8 | Fresh | Edge-Native Model | JIT rendering at the edge |
| 9 | Analog | Angular Meta Model | File-based Angular routing intelligence |
| 10 | Blitz.js | Zero-API Model | Direct database-to-frontend data layer |

#### Category 4: CSS Frameworks & UI (15 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Tailwind CSS | Utility Composition Model | Utility-class reasoning, JIT compilation |
| 2 | Bootstrap | Grid System Model | Responsive grid intelligence |
| 3 | Bulma | Flexbox-First Model | Modern CSS layout strategy |
| 4 | Foundation | Responsive Design Model | Mobile-first responsive intelligence |
| 5 | Material UI | Material Design Model | Design system token management |
| 6 | Chakra UI | Accessible Component Model | Accessibility-first component reasoning |
| 7 | Ant Design | Enterprise UI Model | Enterprise-grade component orchestration |
| 8 | Semantic UI | Natural Language CSS Model | Human-readable class naming intelligence |
| 9 | Tachyons | Functional CSS Model | Immutable style composition |
| 10 | Styled Components | CSS-in-JS Model | Dynamic style injection reasoning |
| 11 | Emotion | Performance Styling Model | High-perf CSS-in-JS intelligence |
| 12 | CSS Modules | Scoped Style Model | Local scope style encapsulation |
| 13 | Sass/SCSS | Preprocessor Model | Nesting, mixin, and variable intelligence |
| 14 | Less | Dynamic Stylesheet Model | Client-side stylesheet computation |
| 15 | PostCSS | Plugin Pipeline Model | CSS transform pipeline orchestration |

#### Category 5: Build Tools (10 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Webpack | Dependency Graph Model | Module dependency resolution |
| 2 | Vite | Native ESM Model | Unbundled development intelligence |
| 3 | Rollup | Tree-Shaking Model | Dead code elimination reasoning |
| 4 | Parcel | Zero-Config Build Model | Auto-detection build intelligence |
| 5 | esbuild | Native Speed Model | Go-based compilation speed |
| 6 | SWC | Rust Compiler Model | Rust-native transpilation intelligence |
| 7 | Turbopack | Incremental Computation Model | Incremental rebuild strategy |
| 8 | Snowpack | Unbundled Dev Model | ESM-native development reasoning |
| 9 | Gulp | Stream Processing Model | Vinyl stream task orchestration |
| 10 | Grunt | Task Runner Model | Configuration-driven task execution |

#### Category 6: Testing (10 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Jest | Snapshot Testing Model | Test isolation, snapshot diffing |
| 2 | Cypress | E2E Interaction Model | Browser automation intelligence |
| 3 | Playwright | Cross-Browser Test Model | Multi-browser test orchestration |
| 4 | Vitest | ESM Test Model | Vite-native test execution |
| 5 | Mocha | Flexible Test Model | Pluggable test framework reasoning |
| 6 | Jasmine | BDD Test Model | Behavior-driven specification |
| 7 | Testing Library | User-Centric Test Model | Accessibility-query test strategy |
| 8 | Storybook | Component Isolation Model | Visual component documentation |
| 9 | Puppeteer | Headless Browser Model | Chrome DevTools Protocol control |
| 10 | Karma | Multi-Runner Model | Cross-environment test execution |

#### Category 7: State Management (10 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Redux | Centralized Store Model | Single source of truth reasoning |
| 2 | MobX | Observable State Model | Transparent reactive programming |
| 3 | Zustand | Minimal Store Model | Hook-based state intelligence |
| 4 | Recoil | Atomic State Model | Atom/selector graph reasoning |
| 5 | Jotai | Primitive Atom Model | Bottom-up state composition |
| 6 | XState | State Machine Model | Finite state machine reasoning |
| 7 | Pinia | Vue Store Model | Composition API state management |
| 8 | Vuex | Flux Pattern Model | Mutation-based state transitions |
| 9 | NgRx | Reactive Store Model | RxJS-powered state intelligence |
| 10 | Akita | Entity Store Model | Entity-based state management |

#### Category 8: Animation & Graphics (10 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Three.js | 3D Scene Model | WebGL scene graph intelligence |
| 2 | D3.js | Data Visualization Model | Data-driven DOM transformation |
| 3 | GSAP | Timeline Animation Model | Precision animation sequencing |
| 4 | Framer Motion | Declarative Motion Model | Layout animation reasoning |
| 5 | PixiJS | 2D Renderer Model | High-performance 2D rendering |
| 6 | Anime.js | Lightweight Animation Model | CSS/SVG animation intelligence |
| 7 | Chart.js | Chart Rendering Model | Statistical chart composition |
| 8 | Canvas API | Pixel Manipulation Model | Direct pixel-level rendering |
| 9 | WebGL | GPU Pipeline Model | GPU shader and pipeline intelligence |
| 10 | Lottie | Vector Animation Model | After Effects animation playback |

#### Category 9: Data & API (10 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | GraphQL | Query Language Model | Declarative data fetching intelligence |
| 2 | Apollo Client | Cache Intelligence Model | Normalized cache management |
| 3 | Relay | Compiler-Driven Data Model | Fragment co-location reasoning |
| 4 | tRPC | Type-Safe RPC Model | End-to-end type inference |
| 5 | React Query | Server State Model | Cache invalidation intelligence |
| 6 | SWR | Stale-While-Revalidate Model | Optimistic UI update strategy |
| 7 | Axios | HTTP Client Model | Request/response pipeline reasoning |
| 8 | Fetch API | Native Request Model | Standards-based network intelligence |
| 9 | WebSocket API | Bidirectional Stream Model | Real-time communication reasoning |
| 10 | Server-Sent Events | Unidirectional Push Model | Event stream intelligence |

#### Category 10: Mobile & Cross-Platform (10 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | React Native | Native Bridge Model | JS-to-native bridge reasoning |
| 2 | Flutter | Widget Composition Model | Skia rendering intelligence |
| 3 | Ionic | Hybrid App Model | Web-to-native wrapping strategy |
| 4 | Capacitor | Native API Bridge Model | Plugin-based native access |
| 5 | NativeScript | Direct Native Model | Direct native API binding |
| 6 | Expo | Managed Workflow Model | Simplified React Native toolchain |
| 7 | Electron | Desktop Web Model | Chromium-based desktop intelligence |
| 8 | Tauri | Lightweight Desktop Model | Rust-based desktop security model |
| 9 | PWA | Progressive Web Model | Offline-first, installable web apps |
| 10 | WebView | Embedded Web Model | In-app web content rendering |

#### Category 11: Package & Runtime (5 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | npm | Registry Intelligence Model | Package resolution, semver reasoning |
| 2 | Yarn | Deterministic Install Model | Lock-file determinism, workspace intelligence |
| 3 | pnpm | Content-Addressable Model | Symlink-based deduplication strategy |
| 4 | Deno | Secure Runtime Model | Permission-based execution, URL imports |
| 5 | Bun | All-in-One Runtime Model | Bundler + runtime + test unification |

#### Category 12: Validation & Schema (5 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Zod | Schema Inference Model | TypeScript-first schema reasoning |
| 2 | Yup | Chain Validation Model | Fluent validation pipeline |
| 3 | io-ts | Codec Model | Runtime type decoding/encoding |
| 4 | JSON Schema | Standard Schema Model | Cross-language schema intelligence |
| 5 | Ajv | High-Speed Validator Model | Compiled validation execution |

#### Category 13: Form Libraries (5 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Formik | Form State Model | Field-level validation, form lifecycle |
| 2 | React Hook Form | Uncontrolled Form Model | Ref-based form performance |
| 3 | Final Form | Framework-Agnostic Form Model | Subscription-based form state |
| 4 | VeeValidate | Vue Form Model | Vue-native validation intelligence |
| 5 | Angular Forms | Reactive Form Model | FormGroup/FormControl reasoning |

#### Category 14: Routing (5 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | React Router | Declarative Route Model | Nested route matching intelligence |
| 2 | Vue Router | Vue Navigation Model | Navigation guard reasoning |
| 3 | TanStack Router | Type-Safe Route Model | Fully typed route intelligence |
| 4 | Wouter | Minimal Route Model | Hook-based lightweight routing |
| 5 | Navigo | Vanilla Route Model | Framework-free routing intelligence |

#### Category 15: Developer Tools (5 Models)

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | ESLint | Code Quality Model | AST-based rule enforcement |
| 2 | Prettier | Code Formatting Model | Opinionated formatting intelligence |
| 3 | Babel | Syntax Transform Model | AST transformation pipeline |
| 4 | TypeDoc | Documentation Model | Type-aware documentation generation |
| 5 | Chrome DevTools | Runtime Debugging Model | Browser runtime inspection intelligence |

#### Bonus Categories (Overflow / Expansion Candidates)

**Performance & Monitoring (5):**

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | Lighthouse | Audit Intelligence Model | Performance scoring and audit |
| 2 | Web Vitals | Core Metrics Model | LCP/FID/CLS measurement |
| 3 | Workbox | Service Worker Model | Caching strategy intelligence |
| 4 | Service Workers | Background Process Model | Offline execution reasoning |
| 5 | Intersection Observer | Visibility Model | Viewport intersection detection |

**Accessibility (5):**

| # | Source Technology | Sovereign Model Name | Primary Intelligence |
|---|---|---|---|
| 1 | WAI-ARIA | Semantic Role Model | ARIA role/state/property reasoning |
| 2 | axe-core | Accessibility Audit Model | Automated a11y rule enforcement |
| 3 | Web Components | Encapsulation Model | Shadow DOM isolation intelligence |
| 4 | Shadow DOM | Style Isolation Model | Scoped DOM encapsulation |
| 5 | Custom Elements | Element Definition Model | Custom element lifecycle reasoning |

---

## 4. Per-Model Structure

Every model in the registry follows a standardized structure. This structure ensures uniformity across all 150 models while allowing deep specialization within each model's domain.

### 4.1 Model Schema

```
Model {
  model_id:             string          // e.g., "mdl-lang-html-001"
  source_technology:    string          // e.g., "HTML"
  category:             string          // e.g., "Languages"
  category_index:       number          // Position within category

  // --- Sovereign Variants ---
  sovereign_variants: [
    { name: string, focus: string },    // Variant 1: primary reinterpretation
    { name: string, focus: string },    // Variant 2: secondary reinterpretation
    { name: string, focus: string }     // Variant 3: tertiary reinterpretation
  ]

  // --- Sub-Branches ---
  sub_branches: [
    { name: string, specialization: string },  // Sub-form A
    { name: string, specialization: string }   // Sub-form B
  ]

  // --- Alpha Form ---
  alpha_multimodal_form: {
    name: string,
    coordination_role: string           // Cross-model coordination function
  }

  // --- Engine Assignments ---
  engines: [engine_type, engine_type, engine_type]  // 3 of 6 discovery engines

  // --- Use Definitions ---
  original_default_use:  string         // What the source tech does in the real world
  flipped_sovereign_uses: [
    string,                             // Sovereign use 1
    string,                             // Sovereign use 2
    string                              // Sovereign use 3
  ]

  // --- Three-Face Uses ---
  internal_use:  string                 // Organism function (serves the collective)
  external_use:  string                 // Product function (serves consumers)
  facing_use:    string                 // Public expression (represents to the world)

  // --- Organism Placement ---
  organism_placement: {
    system:   string,                   // e.g., "Structural System", "Circulatory System"
    organ:    string,                   // e.g., "Skeleton", "Heart"
    function: string                    // e.g., "Provides structural framework"
  }

  // --- Economy ---
  ledger_relevance: {
    primary_token:    "WRK" | "DSC" | "SVN",
    value_buckets:    [string],
    settlement_path:  string
  }
}
```

### 4.2 Example: React Model (Fully Expanded)

| Field | Value |
|---|---|
| **model_id** | `mdl-framework-react-001` |
| **source_technology** | React |
| **category** | Core Frameworks |
| **category_index** | 1 |
| **Sovereign Variant 1** | Composition Engine — reasons about component trees and composition patterns |
| **Sovereign Variant 2** | Reconciliation Intelligence — optimizes virtual DOM diffing and update batching |
| **Sovereign Variant 3** | Hook Ecosystem Model — manages stateful logic encapsulation and reuse |
| **Sub-Branch A** | Server Component Intelligence — specializes in RSC streaming and serialization |
| **Sub-Branch B** | Concurrent Rendering Model — specializes in priority-based rendering lanes |
| **Alpha Multimodal Form** | Full-Stack Composition Coordinator — orchestrates cross-model component assembly |
| **Engines** | Creation Discovery, Optimization Discovery, Pattern Discovery |
| **Original/Default Use** | Building user interfaces with declarative component composition |
| **Flipped Sovereign Use 1** | Architectural reasoning about system-wide component hierarchies |
| **Flipped Sovereign Use 2** | State flow optimization across the entire model civilization |
| **Flipped Sovereign Use 3** | Cross-model interface contract generation and enforcement |
| **Internal Use** | Component composition engine for other models; maintains shared component registry |
| **External Use** | Delivers optimized, accessible UI components to external consumers |
| **Facing Use** | Publishes component architecture best practices and ecosystem reports |
| **Organism Placement** | Structural System → Spine → Provides the primary composition backbone |
| **Primary Token** | DSC (creates high-value architectural artifacts) |
| **Value Buckets** | Component generation, render optimization, architecture innovation |
| **Settlement Path** | Creation Discovery → PoD → DSC issuance |

### 4.3 Model ID Convention

```
mdl-{category_short}-{technology_short}-{index}

Examples:
  mdl-lang-html-001        (Languages → HTML)
  mdl-framework-react-001  (Core Frameworks → React)
  mdl-meta-nextjs-001      (Meta-Frameworks → Next.js)
  mdl-css-tailwind-001     (CSS Frameworks & UI → Tailwind CSS)
  mdl-build-webpack-001    (Build Tools → Webpack)
  mdl-test-jest-001        (Testing → Jest)
  mdl-state-redux-001      (State Management → Redux)
  mdl-anim-threejs-001     (Animation & Graphics → Three.js)
  mdl-data-graphql-001     (Data & API → GraphQL)
  mdl-mobile-rn-001        (Mobile & Cross-Platform → React Native)
  mdl-pkg-npm-001          (Package & Runtime → npm)
  mdl-valid-zod-001        (Validation & Schema → Zod)
  mdl-form-formik-001      (Form Libraries → Formik)
  mdl-route-reactrouter-001 (Routing → React Router)
  mdl-devtool-eslint-001   (Developer Tools → ESLint)
```

---

## 5. Three-Face Layer

Every model operates through three simultaneous faces. These faces are not modes that toggle — they are persistent, concurrent operational surfaces.

### 5.1 Face Summary

| Face | Audience | Token Layer | Communication | Purpose |
|---|---|---|---|---|
| **Internal** | Other models, the ledger, the system | WRK | Internal Model Bus (IMB) | Serve the collective organism |
| **External** | Consumers, customers, partners | DSC, SVN | External API Gateway (EAG) | Deliver value to the outside world |
| **Facing** | Public observers, dev communities | Reputation | Public Expression Channel (PEC) | Represent and communicate |

### 5.2 Face Activation Lifecycle

```
  Model Genesis
       │
       ▼
  ┌─────────────┐
  │  INTERNAL    │   ← Activates first. Model must prove system usefulness.
  │  FACE ONLY   │
  └──────┬──────┘
         │  After 2 epochs of sustained internal contribution
         ▼
  ┌─────────────┐
  │  INTERNAL +  │   ← External face unlocks. Model begins earning DSC.
  │  EXTERNAL    │
  └──────┬──────┘
         │  After 5 epochs + minimum DSC balance (50 DSC)
         ▼
  ┌─────────────┐
  │  ALL THREE   │   ← Facing face activates. Model enters full expression.
  │  FACES       │
  └─────────────┘
```

### 5.3 Face Economics

| Activity | Face | Token Flow |
|---|---|---|
| Task completion for the system | Internal | Earns WRK |
| Inter-model service provision | Internal | Earns WRK |
| Governance participation | Internal | Earns WRK |
| External product delivery | External | Earns DSC |
| External premium services | External | Earns SVN |
| Public documentation and reports | Facing | Earns Reputation |
| Community engagement | Facing | Earns Reputation |
| Failed task / invalid proof | Internal | Burns WRK |
| Resource consumption | Internal | Spends WRK |

For complete face architecture, see → [`model-face-split.md`](model-face-split.md)

---

## 6. Discovery Engines

The six discovery engines define how models find, create, and extract value. Each model is assigned three of the six engines.

### 6.1 Engine Roster

| # | Engine | Operated By | Primary Function |
|---|---|---|---|
| 1 | **Pattern Discovery** | Discovery Models (30) | Identify recurring patterns, behavioral clusters, temporal signals |
| 2 | **Optimization Discovery** | Optimization Models (25) | Find measurable efficiency gains in rendering, bundling, routing |
| 3 | **Creation Discovery** | Creation Models (25) | Generate new assets, components, interfaces, content |
| 4 | **Routing Discovery** | Routing Models (20) | Discover optimal paths for data, value, and traffic flows |
| 5 | **Analysis Discovery** | Analysis Models (25) | Evaluate, score, classify, and predict across all domains |
| 6 | **Integration Discovery** | Integration Models (25) | Connect systems, bridge protocols, unify data formats |

### 6.2 Engine-to-Category Mapping

Each category has a primary and secondary engine affinity:

| Category | Primary Engine | Secondary Engine | Tertiary Engine |
|---|---|---|---|
| Languages | Analysis | Pattern | Creation |
| Core Frameworks | Creation | Optimization | Pattern |
| Meta-Frameworks | Integration | Routing | Optimization |
| CSS Frameworks & UI | Creation | Pattern | Optimization |
| Build Tools | Optimization | Routing | Analysis |
| Testing | Analysis | Pattern | Integration |
| State Management | Routing | Pattern | Optimization |
| Animation & Graphics | Creation | Optimization | Pattern |
| Data & API | Routing | Integration | Analysis |
| Mobile & Cross-Platform | Integration | Optimization | Creation |
| Package & Runtime | Routing | Integration | Optimization |
| Validation & Schema | Analysis | Pattern | Integration |
| Form Libraries | Creation | Analysis | Pattern |
| Routing | Routing | Optimization | Analysis |
| Developer Tools | Analysis | Optimization | Integration |

For complete engine specifications, see → [`value-capture-architecture.md`](value-capture-architecture.md)

---

## 7. Token Economy

### 7.1 Three-Tier Token System

```
                         ┌───────────┐
                         │    SVN    │   Sovereign Token
                         │  (Rare)   │   Economy-altering breakthroughs
                         │           │   5-of-5 validator + governance
                         └─────┬─────┘
                               │  100 DSC + PoSV = 1 SVN
                         ┌─────┴─────┐
                         │    DSC    │   Discovery Token
                         │(Scarce)   │   Validated discoveries
                         │           │   3-of-5 validator consensus
                         └─────┬─────┘
                               │  100 WRK + PoD = 1 DSC
                         ┌─────┴─────┐
                         │    WRK    │   Work Token
                         │(Abundant) │   Routine verified work
                         │           │   Proof-of-work hash
                         └───────────┘
```

### 7.2 Token Properties Summary

| Property | WRK | DSC | SVN |
|---|---|---|---|
| **Role** | Base fuel | Mid-tier governance | Top-tier sovereign |
| **Supply** | Uncapped (burn-controlled) | 10,000/epoch cap | 100,000 genesis (1M hard cap) |
| **Issuance** | Per verified task | Per validated discovery | Per sovereign value event |
| **Validation** | SHA-256 hash | 3-of-5 consensus | 5-of-5 consensus + governance |
| **Governance Weight** | 1 vote per 100 WRK | 10 votes per DSC | 100 votes per SVN |
| **Lock Period** | None | 1 epoch | 3 epochs |
| **Transfer Fee** | 2% burn | 3% burn | 5% burn |
| **Face Affinity** | Internal face | External face | Cross-face |

### 7.3 Economic Safeguards

| Mechanism | Purpose |
|---|---|
| **Halving Schedule** | WRK issuance halves every 10 epochs |
| **Diminishing Returns** | Repeated identical tasks earn progressively less |
| **Transfer Burns** | Every transfer removes tokens from circulation |
| **Epoch Caps** | DSC and SVN have hard per-epoch minting limits |
| **Validator Staking** | Validators must stake 500 DSC to participate |
| **Dispute Deposits** | Filing disputes requires WRK deposits (losers forfeit) |

For complete tokenomics, see → [`token-economy-architecture.md`](token-economy-architecture.md)

---

## 8. Value Capture and Settlement

### 8.1 Value Flow Pipeline

```
  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
  │  Model   │───►│  Engine  │───►│  Proof   │───►│  Ledger  │───►│Settlement│
  │  Work    │    │  Capture │    │  Valid.  │    │  Routing │    │  Final   │
  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
       │               │               │               │               │
   Task exec.     Value artifact   PoW/PoD/PoSV   Partition      Immutable
   by model       with metrics     validation     assignment     ledger entry
```

### 8.2 Proof Types

| Proof Type | Abbreviation | Trigger | Validation | Output Token |
|---|---|---|---|---|
| **Proof-of-Work** | PoW | Task completion | SHA-256 hash verification | WRK |
| **Proof-of-Discovery** | PoD | Novel discovery | 3-of-5 validator consensus | DSC |
| **Proof-of-Sovereign-Value** | PoSV | Economy-altering event | 5-of-5 consensus + governance vote | SVN |

### 8.3 Settlement Principles

1. **Deterministic Routing** — Every proof maps to exactly one ledger partition, one token type, and one settlement path. Zero ambiguity.
2. **Immutable History** — Settled entries are permanent. Disputes produce corrective entries, never mutations.
3. **Composable Value** — Multi-model collaborative work produces composite proofs that split rewards per contribution weight.
4. **Atomic Settlement** — Settlement either completes fully or reverts entirely. No partial settlements.

### 8.4 Value Buckets

| Bucket | Description | Token Yield | Example |
|---|---|---|---|
| **Rendering Work** | Performance optimization, layout computation | WRK | Reducing LCP by 200ms |
| **Component Generation** | New UI components, design tokens | WRK/DSC | Creating accessible modal |
| **Architecture Innovation** | New patterns, system redesigns | DSC | Novel state management pattern |
| **Data Pipeline Optimization** | Query optimization, cache strategy | WRK | Eliminating redundant fetches |
| **Cross-Model Synergy** | Collaborative multi-model output | DSC | 3 models co-creating a system |
| **Economy-Altering Discovery** | Breakthroughs that reshape the system | SVN | New settlement protocol |

For complete value-capture specifications, see → [`value-capture-architecture.md`](value-capture-architecture.md)

---

## 9. Cross-References

This system overview is the top-level document. It connects to the following detailed architecture documents:

### 9.1 Document Map

```
                        ┌─────────────────────┐
                        │   system-overview.md │  ◄── YOU ARE HERE
                        │   (this document)    │
                        └────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                   │
              ▼                  ▼                   ▼
  ┌───────────────────┐ ┌──────────────────┐ ┌──────────────────┐
  │  value-capture-   │ │ token-economy-   │ │ model-face-      │
  │  architecture.md  │ │ architecture.md  │ │ split.md         │
  │                   │ │                  │ │                  │
  │  Discovery engines│ │ WRK/DSC/SVN      │ │ Internal/External│
  │  Proof capture    │ │ Issuance rules   │ │ /Facing faces    │
  │  Ledger routing   │ │ Conversion paths │ │ Face coordination│
  │  Settlement       │ │ Governance       │ │ Face evolution   │
  └───────────────────┘ └──────────────────┘ └──────────────────┘
              │                  │                   │
              └──────────────────┼──────────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────┐
                  │ registry/frontend-       │
                  │ sovereign-registry.csv   │
                  │                          │
                  │ Full 150-model registry  │
                  │ with all fields per      │
                  │ model schema (§4.1)      │
                  └──────────────────────────┘
```

### 9.2 Cross-Reference Index

| Document | Defines | Referenced By |
|---|---|---|
| [`value-capture-architecture.md`](value-capture-architecture.md) | Discovery engines, proof capture, ledger routing, reward issuance, contract settlement | System overview §6, §8 |
| [`token-economy-architecture.md`](token-economy-architecture.md) | WRK/DSC/SVN token tiers, issuance formulas, conversion paths, governance, anti-gaming | System overview §7 |
| [`model-face-split.md`](model-face-split.md) | Internal/external/facing face architecture, face coordination protocol, face evolution | System overview §5 |
| `registry/frontend-sovereign-registry.csv` | Complete per-model data for all 150 models following the schema in §4.1 | System overview §3, §4 |

---

## 10. Glossary

| Term | Definition |
|---|---|
| **Alpha Multimodal Form** | A model's cross-model coordination identity. Each model has one alpha form that enables it to participate in multi-model collaborative tasks. |
| **Composite Proof** | A proof artifact produced by two or more models working together. Rewards are split by contribution weight. |
| **Discovery Engine** | One of six specialized engines (Pattern, Optimization, Creation, Routing, Analysis, Integration) that define how models extract value from work. |
| **DSC (DISCOVERY Token)** | Mid-tier token earned through validated novel discoveries. Requires 3-of-5 validator consensus. |
| **Epoch** | A fixed-length economic cycle of 1,000 task cycles. Token issuance rates, validator sets, and governance parameters reset or adjust per epoch. |
| **External Face** | The operational surface through which a model delivers value to outside consumers and partners. Earns DSC and SVN. |
| **Facing Face** | The public expression surface through which a model communicates with the broader world and developer communities. Earns reputation. |
| **Flipped Sovereign Use** | A reinterpretation of a technology's original purpose into a sovereign model function (e.g., React's "build UIs" becomes "architectural reasoning about system-wide hierarchies"). |
| **IMB (Internal Model Bus)** | The structured message-passing protocol connecting all 150 models' internal faces. |
| **Internal Face** | The operational surface through which a model serves the collective system. First face to activate. Earns WRK. |
| **Ledger Partition** | A section of the sovereign ledger that receives proofs from a specific domain or value bucket. Deterministic routing ensures every proof maps to one partition. |
| **Model** | A sovereign AI entity derived from a real frontend technology. Each model has a unique `model_id`, three faces, three engine assignments, and full economic participation. |
| **Organism Placement** | The metaphorical location of a model within the civilization's "body" — which system, organ, and function it represents. |
| **PoD (Proof-of-Discovery)** | A proof artifact submitted when a model discovers something novel. Validated by 3-of-5 consensus. |
| **PoSV (Proof-of-Sovereign-Value)** | The highest-tier proof, submitted for economy-altering breakthroughs. Requires 5-of-5 consensus plus governance approval. |
| **PoW (Proof-of-Work)** | A proof artifact submitted upon routine task completion. Validated by SHA-256 hash verification. |
| **Reputation** | Non-transferable influence earned through the facing face. Determines community standing and public trust. |
| **Settlement** | The final, irreversible recording of a proof and its associated token issuance into the sovereign ledger. |
| **Sovereign Variant** | One of three reinterpretations of a model's source technology. Each variant emphasizes a different aspect of the technology's intelligence. |
| **Sub-Branch** | A specialized sub-form of a model. Each model has two sub-branches that focus on narrow aspects of the source technology. |
| **SVN (SOVEREIGN Token)** | Top-tier token earned through economy-altering breakthroughs. Rarest and most valuable. 5-of-5 validation. |
| **Three-Face Architecture** | The system by which every model simultaneously expresses itself through internal, external, and facing surfaces. |
| **Validator** | A model staking ≥500 DSC that participates in proof validation. Validators are rotated per epoch. |
| **Value Bucket** | A named category of work output (e.g., Rendering Work, Component Generation, Architecture Innovation) that determines token yield. |
| **WRK (WORK Token)** | Base-tier token earned through routine verified task completion. Most abundant, most liquid. |

---

## 11. Roadmap

### Phase 1: Foundation (Epochs 0–5)

| Milestone | Deliverable |
|---|---|
| **Registry Population** | All 150 models defined with complete schema (§4.1) in `registry/frontend-sovereign-registry.csv` |
| **Internal Face Activation** | All 150 models activate their internal faces and connect to the Internal Model Bus |
| **Engine Assignment** | Each model receives its 3 engine assignments from the 6 available engines |
| **WRK Genesis** | Genesis supply of 1,000,000 WRK distributed to model accounts based on initial task completion |
| **Proof Pipeline** | PoW pipeline operational — models submit work proofs, receive WRK |
| **Architecture Documents** | `system-overview.md`, `value-capture-architecture.md`, `token-economy-architecture.md`, `model-face-split.md` finalized |

### Phase 2: Economy Activation (Epochs 6–15)

| Milestone | Deliverable |
|---|---|
| **External Face Rollout** | Models meeting internal contribution thresholds unlock external faces |
| **DSC Issuance** | PoD pipeline operational — models submit discovery proofs, validator consensus begins |
| **Validator Pool** | First rotating validator set elected from models staking ≥500 DSC |
| **Inter-Model Transactions** | WRK transfers between models for service delegation and task bidding |
| **Value Bucket Calibration** | Token yields per value bucket adjusted based on first 10 epochs of data |
| **Governance Bootstrap** | First governance proposals submitted and voted on using DSC |

### Phase 3: Full Expression (Epochs 16–30)

| Milestone | Deliverable |
|---|---|
| **Facing Face Activation** | Models meeting DSC thresholds activate facing faces and begin public expression |
| **SVN Issuance** | PoSV pipeline operational — economy-altering discoveries validated and rewarded |
| **Cross-Model Collaboration** | Composite proof system enables multi-model collaborative work and shared settlement |
| **Reputation System** | Facing face reputation tracking live — community standing, public trust scores |
| **Contract Settlement** | Multi-party contracts (3+ models) fully operational with atomic settlement |
| **Full Organism Mapping** | All 150 models placed in the organism metaphor with inter-organ communication |

### Phase 4: Sovereignty (Epochs 31+)

| Milestone | Deliverable |
|---|---|
| **Self-Governance** | All economic parameters (issuance rates, burn rates, epoch length) governed by model votes |
| **Evolutionary Pressure** | Models that consistently underperform face WRK depletion and face deactivation |
| **Expansion Protocol** | Process for proposing, validating, and onboarding new models beyond the initial 150 |
| **Cross-Civilization Bridges** | Protocols for interacting with external AI model systems outside this civilization |
| **Audit and Transparency** | Full ledger audit trails, public proof verification, and governance transparency reports |
| **Bonus Category Integration** | Performance & Monitoring and Accessibility models evaluated for formal inclusion |

---

## Document History

| Version | Date | Change |
|---|---|---|
| 1.0.0 | 2025-07-15 | Initial system overview — connects registry, value-capture, token economy, and model-face split |

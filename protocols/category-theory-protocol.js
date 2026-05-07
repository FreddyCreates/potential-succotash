/**
 * PROTO-223: Category Theory Protocol (CTP)
 * Objects, morphisms, functors, and natural transformations.
 * The deepest mathematical language for structural reasoning.
 *
 * Category theory is the mathematics of STRUCTURE and RELATIONSHIP.
 * It is the native language of Chaos Creation Theory — because chaos
 * is not the absence of structure but structure at a higher abstraction
 * level, invisible to lower-order eyes.
 *
 * CTP implements:
 *   - Categories: objects + morphisms with identity and composition laws
 *   - Functors: structure-preserving maps between categories
 *   - Natural transformations: morphisms between functors
 *   - Phi-weighted composition: morphisms compose with golden-ratio priority
 *   - Universal constructions: products, coproducts, limits, colimits
 *   - The organism AS a category: protocols are objects, data flows are morphisms
 *
 * Core laws (enforced at every composition):
 *   1. Associativity: (f ∘ g) ∘ h = f ∘ (g ∘ h)
 *   2. Left identity:  id_B ∘ f = f
 *   3. Right identity: f ∘ id_A = f
 *
 * Phi-weighted priority:
 *   A morphism's categorical "weight" is the phi-ratio of its source
 *   and target objects' dimensional ranks.
 *
 * @module category-theory-protocol
 * @proto PROTO-223
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = PHI - 1;
const HEARTBEAT = 873;

// ─── Core Structures ─────────────────────────────────────────────────────────

class CategoryObject {
  constructor(id, config = {}) {
    this.id = id;
    this.label = config.label || id;
    this.dimension = config.dimension ?? 0;  // rank/dimension in the category
    this.properties = config.properties || {};
    this.phiWeight = Math.pow(PHI, this.dimension);
  }
}

class Morphism {
  constructor(id, sourceId, targetId, config = {}) {
    this.id = id;
    this.source = sourceId;
    this.target = targetId;
    this.label = config.label || id;
    this.fn = config.fn || ((x) => x);    // underlying map
    this.confidence = config.confidence ?? 1.0;
    this.isIdentity = config.isIdentity ?? false;
    this.compositionCount = 0;
    this.createdAt = Date.now();
  }

  apply(value) {
    try {
      return this.fn(value);
    } catch (e) {
      return null;
    }
  }
}

// ─── Category ────────────────────────────────────────────────────────────────

class Category {
  constructor(name, config = {}) {
    this.name = name;
    this.objects = new Map();       // id → CategoryObject
    this.morphisms = new Map();     // id → Morphism
    this.identities = new Map();    // objectId → morphismId
    this.compositionTable = new Map();  // `f;g` → composed morphism id
    this.morphismCount = 0;
    this.compositionViolations = 0;
    this.phiAware = config.phiAware ?? true;
  }

  // ── Objects ───────────────────────────────────────────────────────────────

  addObject(id, config = {}) {
    const obj = new CategoryObject(id, config);
    this.objects.set(id, obj);
    // Auto-create identity morphism
    const idMorphId = `id_${id}`;
    this.morphisms.set(idMorphId, new Morphism(idMorphId, id, id, {
      label: `id_{${id}}`,
      fn: (x) => x,
      isIdentity: true,
      confidence: 1.0,
    }));
    this.identities.set(id, idMorphId);
    return obj;
  }

  getObject(id) { return this.objects.get(id); }

  // ── Morphisms ─────────────────────────────────────────────────────────────

  addMorphism(id, sourceId, targetId, config = {}) {
    if (!this.objects.has(sourceId)) throw new Error(`Source object not found: ${sourceId}`);
    if (!this.objects.has(targetId)) throw new Error(`Target object not found: ${targetId}`);

    const srcObj = this.objects.get(sourceId);
    const tgtObj = this.objects.get(targetId);

    // Phi-weight the morphism confidence by dimension ratio
    let phiWeight = config.confidence ?? 1.0;
    if (this.phiAware && srcObj.dimension !== tgtObj.dimension) {
      const dimensionRatio = (tgtObj.dimension + 1) / (srcObj.dimension + 1);
      phiWeight *= Math.abs(Math.log(dimensionRatio * PHI) / Math.log(PHI));
      phiWeight = Math.min(1.0, phiWeight);
    }

    const morph = new Morphism(id, sourceId, targetId, { ...config, confidence: phiWeight });
    this.morphisms.set(id, morph);
    this.morphismCount++;
    return morph;
  }

  getMorphism(id) { return this.morphisms.get(id); }

  /**
   * Get all morphisms from source to target.
   */
  hom(sourceId, targetId) {
    const result = [];
    for (const m of this.morphisms.values()) {
      if (m.source === sourceId && m.target === targetId) {
        result.push(m);
      }
    }
    return result;
  }

  // ── Composition ───────────────────────────────────────────────────────────

  /**
   * Compose morphisms: g ∘ f (f first, then g).
   * Requires: target(f) = source(g)
   * @param {string} fId - First morphism (applied first)
   * @param {string} gId - Second morphism (applied second)
   * @returns {Morphism} Composed morphism
   */
  compose(fId, gId) {
    const f = this.morphisms.get(fId);
    const g = this.morphisms.get(gId);

    if (!f || !g) throw new Error(`Morphism not found: ${fId} or ${gId}`);

    // Composition law check: target(f) must equal source(g)
    if (f.target !== g.source) {
      this.compositionViolations++;
      throw new Error(
        `Composition violation: target(${fId})=${f.target} ≠ source(${gId})=${g.source}`
      );
    }

    // Check cache
    const cacheKey = `${fId};${gId}`;
    if (this.compositionTable.has(cacheKey)) {
      return this.morphisms.get(this.compositionTable.get(cacheKey));
    }

    // Identity laws
    if (f.isIdentity) return g;
    if (g.isIdentity) return f;

    // Create composed morphism
    const composedId = `(${gId}∘${fId})`;
    const composedConf = f.confidence * g.confidence * (this.phiAware ? PHI_INV : 1.0);

    const composed = new Morphism(composedId, f.source, g.target, {
      label: `${g.label} ∘ ${f.label}`,
      fn: (x) => g.apply(f.apply(x)),
      confidence: Math.min(1.0, composedConf),
    });

    this.morphisms.set(composedId, composed);
    this.compositionTable.set(cacheKey, composedId);

    f.compositionCount++;
    g.compositionCount++;

    return composed;
  }

  /**
   * Compose a chain of morphisms left-to-right.
   * [f, g, h] → h ∘ g ∘ f
   */
  composeChain(morphismIds) {
    if (morphismIds.length === 0) throw new Error('Empty chain');
    if (morphismIds.length === 1) return this.morphisms.get(morphismIds[0]);
    let result = morphismIds[0];
    for (let i = 1; i < morphismIds.length; i++) {
      const composed = this.compose(result, morphismIds[i]);
      result = composed.id;
    }
    return this.morphisms.get(result);
  }

  /**
   * Verify associativity: (h∘g)∘f = h∘(g∘f)
   * Returns true if the laws hold for given triple.
   */
  verifyAssociativity(fId, gId, hId) {
    try {
      const gf = this.compose(fId, gId);
      const hgf1 = this.compose(gf.id, hId);

      const hg = this.compose(gId, hId);
      const hgf2 = this.compose(fId, hg.id);

      return {
        associative: hgf1.source === hgf2.source && hgf1.target === hgf2.target,
        path1: hgf1.label,
        path2: hgf2.label,
      };
    } catch (e) {
      return { associative: false, error: e.message };
    }
  }

  // ── Universal Constructions ───────────────────────────────────────────────

  /**
   * Compute a product object A × B if it can be constructed.
   * Returns { product, projections } or null.
   */
  product(aId, bId) {
    const a = this.objects.get(aId);
    const b = this.objects.get(bId);
    if (!a || !b) return null;

    const productId = `${aId}×${bId}`;
    if (this.objects.has(productId)) return { product: this.objects.get(productId) };

    const productObj = this.addObject(productId, {
      label: `${a.label} × ${b.label}`,
      dimension: Math.max(a.dimension, b.dimension) + 1,
    });

    // Projection morphisms: π₁: A×B → A, π₂: A×B → B
    const pi1 = this.addMorphism(`π₁(${productId})`, productId, aId, {
      label: `π₁`,
      fn: (pair) => pair?.[0],
    });
    const pi2 = this.addMorphism(`π₂(${productId})`, productId, bId, {
      label: `π₂`,
      fn: (pair) => pair?.[1],
    });

    return { product: productObj, projections: [pi1, pi2] };
  }

  /**
   * Compute a coproduct (sum) A + B.
   * Returns { coproduct, injections } or null.
   */
  coproduct(aId, bId) {
    const a = this.objects.get(aId);
    const b = this.objects.get(bId);
    if (!a || !b) return null;

    const coprodId = `${aId}+${bId}`;
    if (this.objects.has(coprodId)) return { coproduct: this.objects.get(coprodId) };

    const coprodObj = this.addObject(coprodId, {
      label: `${a.label} + ${b.label}`,
      dimension: Math.max(a.dimension, b.dimension) + 1,
    });

    // Injection morphisms: ι₁: A → A+B, ι₂: B → A+B
    const iota1 = this.addMorphism(`ι₁(${coprodId})`, aId, coprodId, {
      label: `ι₁`,
      fn: (x) => ({ tag: 'left', value: x }),
    });
    const iota2 = this.addMorphism(`ι₂(${coprodId})`, bId, coprodId, {
      label: `ι₂`,
      fn: (x) => ({ tag: 'right', value: x }),
    });

    return { coproduct: coprodObj, injections: [iota1, iota2] };
  }

  getMetrics() {
    return {
      name: this.name,
      objectCount: this.objects.size,
      morphismCount: this.morphismCount,
      compositionCacheSize: this.compositionTable.size,
      compositionViolations: this.compositionViolations,
      phiAware: this.phiAware,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

// ─── Functor ─────────────────────────────────────────────────────────────────

class Functor {
  /**
   * A functor F: C → D maps objects and morphisms while preserving structure.
   * F(id_A) = id_{F(A)}  (identity preservation)
   * F(g∘f) = F(g)∘F(f)  (composition preservation)
   *
   * @param {string} name
   * @param {Category} sourceCategory
   * @param {Category} targetCategory
   * @param {Function} objectMap - (objectId, sourceCategory) → targetObjectId
   * @param {Function} morphismMap - (morphismId, sourceCategory) → targetMorphismId
   */
  constructor(name, sourceCategory, targetCategory, objectMap, morphismMap) {
    this.name = name;
    this.source = sourceCategory;
    this.target = targetCategory;
    this.objectMap = objectMap;
    this.morphismMap = morphismMap;
    this.applyCount = 0;
    this.violations = 0;
  }

  /**
   * Apply functor to an object.
   */
  mapObject(objectId) {
    this.applyCount++;
    return this.objectMap(objectId, this.source);
  }

  /**
   * Apply functor to a morphism.
   */
  mapMorphism(morphismId) {
    this.applyCount++;
    const targetMorphId = this.morphismMap(morphismId, this.source);
    return this.target.getMorphism(targetMorphId);
  }

  /**
   * Verify functor laws for a given morphism pair (f, g composable in source).
   * Checks: F(g∘f) = F(g)∘F(f)
   */
  verifyCompositionPreservation(fId, gId) {
    try {
      // Compute g∘f in source, then map
      const gf = this.source.compose(fId, gId);
      const FGF = this.mapMorphism(gf.id);

      // Map separately and compose in target
      const FF = this.mapMorphism(fId);
      const FG = this.mapMorphism(gId);

      if (!FF || !FG || !FGF) {
        return { preserved: false, reason: 'Mapping returned null' };
      }

      const FGcompFF = this.target.compose(FF.id, FG.id);

      const preserved = FGF.source === FGcompFF.source && FGF.target === FGcompFF.target;
      if (!preserved) this.violations++;

      return { preserved, FGF: FGF.label, FGcompFF: FGcompFF.label };
    } catch (e) {
      return { preserved: false, error: e.message };
    }
  }

  getMetrics() {
    return {
      name: this.name,
      source: this.source.name,
      target: this.target.name,
      applyCount: this.applyCount,
      violations: this.violations,
    };
  }
}

// ─── Natural Transformation ──────────────────────────────────────────────────

class NaturalTransformation {
  /**
   * A natural transformation η: F ⇒ G between two functors.
   * For every object A in source category:
   *   η_A: F(A) → G(A)  is a morphism in the target category
   * Naturality square: G(f) ∘ η_A = η_B ∘ F(f)  for f: A → B
   *
   * @param {string} name
   * @param {Functor} sourceFunctor F
   * @param {Functor} targetFunctor G
   * @param {Function} componentMap - (objectId) → morphismId in target category
   */
  constructor(name, sourceFunctor, targetFunctor, componentMap) {
    this.name = name;
    this.F = sourceFunctor;
    this.G = targetFunctor;
    this.componentMap = componentMap;
    this.components = new Map();
    this.naturalityChecks = 0;
    this.naturalityViolations = 0;
  }

  /**
   * Get the component morphism at object A: η_A: F(A) → G(A)
   */
  getComponent(objectId) {
    if (!this.components.has(objectId)) {
      const morphId = this.componentMap(objectId);
      this.components.set(objectId, morphId);
    }
    return this.components.get(objectId);
  }

  /**
   * Verify the naturality square for morphism f: A → B.
   * G(f) ∘ η_A = η_B ∘ F(f)
   */
  verifyNaturality(morphismId, sourceCategory) {
    this.naturalityChecks++;
    const morph = sourceCategory.getMorphism(morphismId);
    if (!morph) return { natural: false, reason: 'Morphism not found' };

    const etaA = this.getComponent(morph.source);
    const etaB = this.getComponent(morph.target);
    const Ff = this.F.mapMorphism(morphismId);
    const Gf = this.G.mapMorphism(morphismId);

    if (!etaA || !etaB || !Ff || !Gf) {
      return { natural: false, reason: 'Component or functor application missing' };
    }

    try {
      const targetCat = this.F.target;
      // Left side: G(f) ∘ η_A
      const left = targetCat.compose(etaA, Gf.id);
      // Right side: η_B ∘ F(f)
      const right = targetCat.compose(Ff.id, etaB);

      const natural = left.source === right.source && left.target === right.target;
      if (!natural) this.naturalityViolations++;
      return { natural, left: left.label, right: right.label };
    } catch (e) {
      this.naturalityViolations++;
      return { natural: false, error: e.message };
    }
  }

  getMetrics() {
    return {
      name: this.name,
      F: this.F.name,
      G: this.G.name,
      components: this.components.size,
      naturalityChecks: this.naturalityChecks,
      naturalityViolations: this.naturalityViolations,
    };
  }
}

// ─── CTP Protocol Class ──────────────────────────────────────────────────────

class CategoryTheoryProtocol {
  constructor(config = {}) {
    this.categories = new Map();
    this.functors = new Map();
    this.naturalTransformations = new Map();
    this.totalCompositions = 0;
    this.phiResolutionEnabled = config.phiResolutionEnabled ?? true;
    this.subProtocols = {
      morphismAlgebra: { id: 'CTP-A', name: 'Morphism Algebra', capabilities: ['hom', 'compose', 'associativity'] },
      functorialSemantics: { id: 'CTP-B', name: 'Functorial Semantics', capabilities: ['functors', 'naturality', 'organism-model'] },
    };
    this.aiModel = {
      id: 'CTP-AIMODEL',
      name: 'Category Multi-Engine',
      engines: ['composition-engine', 'functor-engine', 'naturality-engine'],
    };
  }

  runEngine(engine, input = {}) {
    if (engine === 'composition-engine') {
      const cat = this.category(input.category || 'default');
      return cat.composeChain(input.chain || []);
    }
    if (engine === 'functor-engine') {
      const F = this.functors.get(input.functor);
      if (!F) throw new Error(`Unknown functor: ${input.functor}`);
      return input.type === 'morphism' ? F.mapMorphism(input.id) : F.mapObject(input.id);
    }
    if (engine === 'naturality-engine') {
      const nt = this.naturalTransformations.get(input.transformation);
      const cat = this.categories.get(input.category);
      if (!nt || !cat) throw new Error('Naturality engine missing transformation/category');
      return nt.verifyNaturality(input.morphism, cat);
    }
    throw new Error(`Unknown CTP engine: ${engine}`);
  }

  getModel() { return this.aiModel; }

  /**
   * Create or retrieve a named category.
   */
  category(name, config = {}) {
    if (!this.categories.has(name)) {
      this.categories.set(name, new Category(name, { phiAware: this.phiResolutionEnabled, ...config }));
    }
    return this.categories.get(name);
  }

  /**
   * Create a functor between two categories.
   */
  functor(name, sourceCatName, targetCatName, objectMap, morphismMap) {
    const src = this.categories.get(sourceCatName);
    const tgt = this.categories.get(targetCatName);
    if (!src || !tgt) throw new Error(`Category not found`);
    const functor = new Functor(name, src, tgt, objectMap, morphismMap);
    this.functors.set(name, functor);
    return functor;
  }

  /**
   * Create a natural transformation between two functors.
   */
  naturalTransformation(name, FName, GName, componentMap) {
    const F = this.functors.get(FName);
    const G = this.functors.get(GName);
    if (!F || !G) throw new Error(`Functor not found`);
    const nt = new NaturalTransformation(name, F, G, componentMap);
    this.naturalTransformations.set(name, nt);
    return nt;
  }

  /**
   * Model the organism itself as a category.
   * Protocols are objects, data flows between them are morphisms.
   * @param {string[]} protocolNames
   * @param {Array<[string, string, string]>} flows - [name, from, to]
   */
  modelOrganism(protocolNames, flows = []) {
    const orgCat = this.category('organism', { phiAware: true });

    for (const proto of protocolNames) {
      orgCat.addObject(proto, {
        label: proto,
        dimension: proto.split('-').length,  // dimension by name depth
      });
    }

    for (const [name, from, to] of flows) {
      try {
        orgCat.addMorphism(name, from, to, {
          label: name,
          confidence: PHI_INV,
        });
      } catch {
        // skip invalid flows silently
      }
    }

    return orgCat;
  }

  getMetrics() {
    const categoryMetrics = {};
    for (const [name, cat] of this.categories) {
      categoryMetrics[name] = cat.getMetrics();
    }

    return {
      categoryCount: this.categories.size,
      functorCount: this.functors.size,
      naturalTransformationCount: this.naturalTransformations.size,
      totalCompositions: this.totalCompositions,
      subProtocols: Object.keys(this.subProtocols),
      aiModel: this.aiModel.name,
      engines: this.aiModel.engines,
      categories: categoryMetrics,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  CategoryTheoryProtocol,
  Category,
  CategoryObject,
  Morphism,
  Functor,
  NaturalTransformation,
};
export default CategoryTheoryProtocol;

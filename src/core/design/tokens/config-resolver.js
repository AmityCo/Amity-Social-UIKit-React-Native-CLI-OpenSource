/**
 * config-resolver.js — REFERENCE IMPLEMENTATION for the design-token theming model.
 *
 * Implements two resolvers against the committed storage model (schema_version 3, 2026-07-06):
 *
 *   - resolveTheme12: the EXISTING legacy 12-key cascade (unchanged behavior).
 *   - resolveToken:   the NEW semantic/alias/theme cascade against the SDK-vendored
 *                     table artifact.
 *
 * resolveToken chain (highest to lowest):
 *   1. cell = table.semantic[tokenPath][mode]. Absent -> missing.
 *   2. cell is a strict 6/8-digit hex -> literal, used as-is (uppercased).
 *   3. Else cell must parse as "{Name}" with an optional "@alpha:<0..1>" suffix.
 *      Unparseable -> missing.
 *   4. ref = table.alias[Name]. Absent -> missing. ref must be the strict shape
 *      "{theme.<key>}" (no further alias chaining) -> anything else is missing.
 *   5. resolveThemeKey walks the SAME scope cascade as resolveTheme12 (exact scope,
 *      then wildcard-component, then wildcard-page, then global), reading
 *      customizations[<candidate>].theme[mode][key] at each level. A value that
 *      fails the strict hex check is skipped (falls through to the next level).
 *   6. Apply @alpha (if present) to the resolved hex.
 *   7. Output hex is always uppercased.
 *
 * Environment-agnostic: works as a browser <script> (attaches window.ConfigResolver)
 * and as a Node/CommonJS module (module.exports). Zero dependencies.
 *
 * Scope ids are 3-segment strings "page/component/element" (each segment may be
 * a literal name or the wildcard "*"), matching the keys of config.customizations.
 */

(function (root) {
  'use strict';

  var MISSING_COLOR = '#FF00FF';
  var warnedOnce = {}; // keyed by an arbitrary warning id: warn once per distinct id, not per call.

  /**
   * Warn via console.warn exactly once per distinct `id`.
   * @private
   */
  function warnOnce(id, message) {
    if (warnedOnce[id]) return;
    warnedOnce[id] = true;
    /* eslint-disable no-console */
    console.warn('[config-resolver] ' + message);
    /* eslint-enable no-console */
  }

  /**
   * Split a scope id into its 3 segments.
   * @param {string} scopeId
   * @returns {string[3]}
   */
  function splitScope(scopeId) {
    var parts = (scopeId || '').split('/');
    return [parts[0] || '*', parts[1] || '*', parts[2] || '*'];
  }

  /**
   * Build the ordered list of cascade candidate scope keys for a given scope id,
   * most-specific first: exact -> "wildcard-component" ("*"+"/component/"+"*") ->
   * "wildcard-page" (page+"/*"+"/*") -> global (null key).
   * This is the ONE canonical cascade order used by BOTH resolvers in this file.
   * @param {string} scopeId
   * @returns {string[]} candidate customization keys, followed by null for "global"
   */
  function cascadeCandidates(scopeId) {
    var seg = splitScope(scopeId);
    var page = seg[0], component = seg[1], element = seg[2];
    var exact = page + '/' + component + '/' + element;
    var byComponent = '*/' + component + '/*';
    var byPage = page + '/*/*';
    var candidates = [exact];
    if (byComponent !== exact) candidates.push(byComponent);
    if (byPage !== exact && byPage !== byComponent) candidates.push(byPage);
    candidates.push(null); // global
    return candidates;
  }

  /**
   * Legacy 12-key theme cascade: page/component, then wildcard-component, then
   * wildcard-page, then global, then null.
   * Wildcard-aware, per-key partial merge (iOS semantics): each of the 12 keys is
   * resolved independently, taking the value from the most specific level that defines it.
   * @param {object} config - full config object (theme, customizations, ...)
   * @param {string} scopeId - "page/component/element"
   * @param {string} mode - "light" | "dark"
   * @returns {Object<string,{value:(string|null), source:string}>}
   */
  function resolveTheme12(config, scopeId, mode) {
    var candidates = cascadeCandidates(scopeId);
    var globalTheme = (config.theme && config.theme[mode]) || {};
    var keys = {};
    var i, key;
    for (key in globalTheme) keys[key] = true;
    for (i = 0; i < candidates.length; i++) {
      var cId = candidates[i];
      if (cId === null) continue;
      var cust = config.customizations && config.customizations[cId];
      var themeBlock = cust && cust.theme && cust.theme[mode];
      if (themeBlock) {
        for (key in themeBlock) keys[key] = true;
      }
    }

    var result = {};
    for (key in keys) {
      result[key] = resolveOneLegacyKey(config, candidates, globalTheme, mode, key);
    }
    return result;
  }

  /**
   * Resolve a single legacy key by walking the cascade candidates, per-key.
   * @private
   */
  function resolveOneLegacyKey(config, candidates, globalTheme, mode, key) {
    for (var i = 0; i < candidates.length; i++) {
      var cId = candidates[i];
      if (cId === null) {
        if (Object.prototype.hasOwnProperty.call(globalTheme, key)) {
          return { value: globalTheme[key], source: 'global' };
        }
        return { value: null, source: 'global' };
      }
      var cust = config.customizations && config.customizations[cId];
      var themeBlock = cust && cust.theme && cust.theme[mode];
      if (themeBlock && Object.prototype.hasOwnProperty.call(themeBlock, key)) {
        return { value: themeBlock[key], source: cId };
      }
    }
    return { value: null, source: 'global' };
  }

  /**
   * Parse a ref string "{Name}" with optional "@alpha:<0..1>" suffix.
   * Raw hex strings (not wrapped in braces) are not refs.
   * @param {string} s
   * @returns {?{name:string, alpha:(number|null)}}
   */
  function parseRef(s) {
    if (typeof s !== 'string') return null;
    var m = /^\{([^}]+)\}(?:@alpha:([0-9]*\.?[0-9]+))?$/.exec(s);
    if (!m) return null;
    return { name: m[1], alpha: m[2] !== undefined ? parseFloat(m[2]) : null };
  }

  /**
   * Apply an alpha modifier to a 6-digit hex color, producing 8-digit #RRGGBBAA.
   * If the color already carries an alpha channel (8-digit) it is overwritten.
   * @param {string} hex - "#RRGGBB" or "#RRGGBBAA"
   * @param {?number} alpha - 0..1, or null for "no modifier"
   * @returns {string}
   */
  function applyAlpha(hex, alpha) {
    if (alpha === null || alpha === undefined) return hex;
    if (alpha < 0 || alpha > 1) {
      warnOnce('alpha-range:' + alpha, '@alpha:' + alpha + ' is outside [0,1] — clamping (likely a typo).');
    }
    var base = hex.length >= 7 ? hex.slice(0, 7) : hex;
    var a = Math.max(0, Math.min(1, alpha));
    var byte = Math.round(a * 255);
    var hh = byte.toString(16).toUpperCase();
    if (hh.length === 1) hh = '0' + hh;
    return base + hh;
  }

  /**
   * Is `value` a hex color literal (strict 6- or 8-digit #RRGGBB[AA])?
   * @private
   */
  function isHex(value) {
    return typeof value === 'string' && /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(value);
  }

  /**
   * backfillThemeDefaults — build the EFFECTIVE config to resolve against.
   *
   * On iOS/Android a customer's injected config REPLACES the SDK's bundled config
   * wholesale, so a customer shipping their own (older/partial) config can be
   * missing some of the 35 theme keys. This fills any global theme key absent from
   * `config` with the value from `defaults` (the SDK's bundled default config),
   * per mode. Customer-set values always win; `customizations` is left untouched
   * (so a scope the customer deliberately dropped does not resurface). After this,
   * no semantic token can resolve to MISSING merely because the customer shipped a
   * partial config. Platforms call this once at load, then resolve against the
   * result. Pure — returns a new object, mutates nothing.
   *
   * @param {object} config - the customer config (possibly partial)
   * @param {object} defaults - the SDK's bundled default config (full 35 keys)
   * @returns {object} clone of `config` with theme.light/dark backfilled
   */
  function backfillThemeDefaults(config, defaults) {
    if (!config || !defaults || !defaults.theme) return config;
    function hasOwn(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
    var out = {};
    for (var ck in config) { if (hasOwn(config, ck)) out[ck] = config[ck]; }
    var srcTheme = config.theme || {};
    out.theme = {};
    for (var tk in srcTheme) { if (hasOwn(srcTheme, tk)) out.theme[tk] = srcTheme[tk]; }
    ['light', 'dark'].forEach(function (mode) {
      var merged = {};
      var d = (defaults.theme && defaults.theme[mode]) || {};
      var c = srcTheme[mode] || {};
      for (var dk in d) { if (hasOwn(d, dk)) merged[dk] = d[dk]; }
      for (var uk in c) { if (hasOwn(c, uk)) merged[uk] = c[uk]; }
      out.theme[mode] = merged;
    });
    return out;
  }

  /**
   * resolveThemeKey — walk the legacy cascade candidates for `key`, reading
   * customizations[<candidate>].theme[mode][key] (or config.theme[mode][key] for
   * the global/null candidate). A value present but failing the strict hex check
   * is skipped (warn once) rather than returned, falling through to the next
   * cascade level.
   *
   * @param {object} config
   * @param {string} scopeId - "page/component/element"
   * @param {string} mode - "light" | "dark"
   * @param {string} key - theme key, e.g. "primary_color" or "secondary_shade6_color"
   * @returns {{value:string, source:string}} source is "theme:<key>@global" or
   *   "theme:<key>@scope:<matchedPattern>", or {value:MISSING_COLOR, source:'missing'}
   */
  function resolveThemeKey(config, scopeId, mode, key) {
    var candidates = cascadeCandidates(scopeId);
    for (var i = 0; i < candidates.length; i++) {
      var cId = candidates[i];
      var themeBlock;
      if (cId === null) {
        themeBlock = (config.theme && config.theme[mode]) || {};
      } else {
        var cust = config.customizations && config.customizations[cId];
        themeBlock = cust && cust.theme && cust.theme[mode];
      }
      if (themeBlock && Object.prototype.hasOwnProperty.call(themeBlock, key)) {
        var v = themeBlock[key];
        if (isHex(v)) {
          var source = cId === null ? 'theme:' + key + '@global' : 'theme:' + key + '@scope:' + cId;
          return { value: v.toUpperCase(), source: source };
        }
        warnOnce(
          'bad-theme-value:' + key + ':' + (cId === null ? 'global' : cId),
          'theme.' + mode + '.' + key + ' at ' + (cId === null ? 'global' : cId) +
          ' is not a valid hex value (' + JSON.stringify(v) + ') — skipping to next cascade level.'
        );
      }
    }
    return { value: MISSING_COLOR, source: 'missing' };
  }

  /**
   * resolveToken — the semantic/alias/theme cascade, resolved against the
   * SDK-vendored table artifact. See file header for the full chain.
   *
   * Signature: resolveToken(config, table, scopeId, mode, tokenPath)
   *
   * @param {object} config - full config object (theme, customizations, ...)
   * @param {object} table - the SDK-vendored table artifact { alias, semantic }.
   * @param {string} scopeId - "page/component/element"
   * @param {string} mode - "light" | "dark"
   * @param {string} tokenPath - semantic token path, e.g. "Surface/Tab/Pill/Active"
   * @returns {{value:string, source:string}}
   */
  function resolveToken(config, table, scopeId, mode, tokenPath) {
    table = table || {};

    // Step 1: semantic cell lookup.
    var entry = table.semantic && table.semantic[tokenPath];
    var cell = entry && entry[mode];
    if (cell === undefined || cell === null) {
      return { value: MISSING_COLOR, source: 'missing' };
    }

    // Step 2: strict hex literal cell -> literal, no alpha applies (no ref parsed).
    if (isHex(cell)) {
      return { value: cell.toUpperCase(), source: 'literal' };
    }

    // Step 3: parse "{Name}(@alpha:<num>)?".
    var ref = parseRef(cell);
    if (!ref) {
      return { value: MISSING_COLOR, source: 'missing' };
    }

    // Step 4: alias lookup; must be strictly "{theme.<key>}".
    var aliasTarget = table.alias && table.alias[ref.name];
    if (aliasTarget === undefined || aliasTarget === null) {
      warnOnce('unknown-alias:' + ref.name, 'alias "' + ref.name + '" referenced by "' + tokenPath + '" is not defined in table.alias.');
      return { value: MISSING_COLOR, source: 'missing' };
    }
    var keyMatch = /^\{theme\.([a-z0-9_]+)\}(?:@alpha:([0-9]*\.?[0-9]+))?$/.exec(aliasTarget);
    if (!keyMatch) {
      warnOnce('bad-alias-shape:' + ref.name, 'alias "' + ref.name + '" = ' + JSON.stringify(aliasTarget) + ' is not a valid "{theme.<key>}(@alpha:x)?" reference.');
      return { value: MISSING_COLOR, source: 'missing' };
    }
    var themeKey = keyMatch[1];
    var aliasAlpha = keyMatch[2] !== undefined ? parseFloat(keyMatch[2]) : null;

    // Step 5: resolve the theme key through the scope cascade.
    var resolved = resolveThemeKey(config, scopeId, mode, themeKey);
    if (resolved.source === 'missing') {
      return resolved;
    }

    // Step 6: apply @alpha. Alpha lives on the ALIAS for transparent roles; a semantic-level
    // @alpha (rare) takes precedence if both are present.
    var effAlpha = ref.alpha != null ? ref.alpha : aliasAlpha;
    var finalValue = applyAlpha(resolved.value, effAlpha);

    // Step 7: always uppercased (applyAlpha/resolveThemeKey already uppercase, this is belt-and-braces).
    return { value: finalValue.toUpperCase(), source: resolved.source };
  }

  /**
   * Embedded minimal fixture + self-test.
   * @returns {{passed:number, failed:number, cases:Array<{name:string, pass:boolean}>}}
   */
  function runSelfTest() {
    var cases = [];
    var passed = 0, failed = 0;

    function assertCase(name, cond, detail) {
      var pass = !!cond;
      cases.push({ name: name, pass: pass, detail: detail });
      if (pass) { passed++; } else { failed++; }
      console.assert(pass, '[config-resolver selftest] FAILED: ' + name + (detail ? ' -- ' + detail : ''));
    }

    // ---- Fixture table ----
    var table = {
      alias: {
        'Primary/500': '{theme.primary_color}',
        'Secondary/800': '{theme.secondary_shade6_color}',
        'Signal/Alert/500': '{theme.alert_color}',
        'Broken/NotThemeRef': '{Blue/500}',      // invalid shape (not {theme.*})
        'Broken/PlainString': 'not-a-ref-at-all'  // invalid shape
      },
      semantic: {
        'Surface/Tab/Pill/Active': { light: '{Primary/500}', dark: '{Primary/500}' },
        'Text/ChatBubble/Receiver/Default': { light: '{Secondary/800}', dark: '{Secondary/800}' },
        'Surface/Background/Transparent/Dim': { light: '{Primary/500}@alpha:0.5', dark: '{Primary/500}@alpha:0.5' },
        'Surface/Direct/Hex': { light: '#123456', dark: '#654321' },
        'Surface/Direct/Hex8': { light: '#12345678', dark: '#87654321' },
        'Signal/Alert/Text': { light: '{Signal/Alert/500}', dark: '{Signal/Alert/500}' },
        'Broken/UnknownAlias': { light: '{Nowhere/500}', dark: '{Nowhere/500}' },
        'Broken/AliasNotThemeRef': { light: '{Broken/NotThemeRef}', dark: '{Broken/NotThemeRef}' },
        'Broken/AliasPlainString': { light: '{Broken/PlainString}', dark: '{Broken/PlainString}' },
        'Broken/Unparseable': { light: 'garbage{{not a ref', dark: 'garbage{{not a ref' },
        'Alpha/OnHex8': { light: '{Secondary/800}@alpha:0.25', dark: '{Secondary/800}@alpha:0.25' },
        'Alpha/OutOfRange': { light: '{Primary/500}@alpha:1.5', dark: '{Primary/500}@alpha:1.5' },
        'Case/MixedTheme': { light: '{Primary/500}', dark: '{Primary/500}' }
      }
    };

    // ---- Fixture config (customer config shape) ----
    var fixture = {
      theme: {
        light: {
          primary_color: '#1054de',   // mixed-case, should uppercase
          base_color: '#292B32',
          alert_color: '#FA4D30',
          secondary_shade6_color: '#2E2E2E'
        },
        dark: {
          primary_color: '#1054DE',
          base_color: '#EBECEF',
          alert_color: '#FA4D30',
          secondary_shade6_color: '#CFCFCF'
        }
      },
      customizations: {
        'live_chat/*/*': {
          theme: { light: { primary_color: '#D02000' } }
        },
        '*/message_composer/*': {
          theme: { light: { secondary_shade6_color: '#111111' } }
        },
        'bad_hex_scope/*/*': {
          theme: { light: { primary_color: '#GGGGGG' } } // invalid hex, should fall through
        }
      }
    };

    // 1. Literal cell (direct hex, 6-digit).
    var r1 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Surface/Direct/Hex');
    assertCase('literal 6-digit hex cell', r1.value === '#123456' && r1.source === 'literal', JSON.stringify(r1));

    // 2. Literal cell (direct hex, 8-digit) passthrough.
    var r2 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Surface/Direct/Hex8');
    assertCase('literal 8-digit hex cell passthrough', r2.value === '#12345678' && r2.source === 'literal', JSON.stringify(r2));

    // 3. Ref -> theme global (light).
    var r3 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Surface/Tab/Pill/Active');
    assertCase('ref resolves to theme global (light)', r3.value === '#1054DE' && r3.source === 'theme:primary_color@global', JSON.stringify(r3));

    // 4. Ref -> theme global (dark).
    var r4 = resolveToken(fixture, table, 'random_page/foo/bar', 'dark', 'Surface/Tab/Pill/Active');
    assertCase('ref resolves to theme global (dark)', r4.value === '#1054DE' && r4.source === 'theme:primary_color@global', JSON.stringify(r4));

    // 5. Scope override beats global.
    var r5 = resolveToken(fixture, table, 'live_chat/x/y', 'light', 'Surface/Tab/Pill/Active');
    assertCase('scope override beats global', r5.value === '#D02000' && r5.source === 'theme:primary_color@scope:live_chat/*/*', JSON.stringify(r5));

    // 6. Wildcard precedence: exact scope beats component beats page beats global.
    var fixtureWild = JSON.parse(JSON.stringify(fixture));
    fixtureWild.customizations['some_page/message_composer/some_el'] = {
      theme: { light: { secondary_shade6_color: '#EXACT1' } } // deliberately invalid hex to prove exact wins/falls correctly below
    };
    // First prove component tier beats page tier when no exact match:
    var r6a = resolveToken(fixture, table, 'some_page/message_composer/x', 'light', 'Text/ChatBubble/Receiver/Default');
    assertCase('wildcard precedence: */component/* beats page/*/* and global',
      r6a.value === '#111111' && r6a.source === 'theme:secondary_shade6_color@scope:*/message_composer/*', JSON.stringify(r6a));
    // Then prove page/*/* is used when no component match:
    var r6b = resolveToken(fixture, table, 'some_page/unrelated_component/x', 'light', 'Text/ChatBubble/Receiver/Default');
    assertCase('wildcard precedence: page/*/* applies when no component match',
      r6b.value === '#2E2E2E' && r6b.source === 'theme:secondary_shade6_color@global', JSON.stringify(r6b));
    // Then prove exact scope beats component tier:
    var fixtureExact = JSON.parse(JSON.stringify(fixture));
    fixtureExact.customizations['some_page/message_composer/some_el'] = {
      theme: { light: { secondary_shade6_color: '#ABCDEF' } }
    };
    var r6c = resolveToken(fixtureExact, table, 'some_page/message_composer/some_el', 'light', 'Text/ChatBubble/Receiver/Default');
    assertCase('wildcard precedence: exact scope beats */component/*',
      r6c.value === '#ABCDEF' && r6c.source === 'theme:secondary_shade6_color@scope:some_page/message_composer/some_el', JSON.stringify(r6c));

    // 7. NEW-style key (secondary_shade6_color) resolves correctly (covered above, dedicated case too).
    var r7 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Text/ChatBubble/Receiver/Default');
    assertCase('NEW-style key secondary_shade6_color resolves', r7.value === '#2E2E2E' && r7.source === 'theme:secondary_shade6_color@global', JSON.stringify(r7));

    // 8. 8-digit hex value passthrough already covered in case 2; add alias-resolved 8-digit alpha case instead (case 10).

    // 9. @alpha application on a 6-digit resolved theme value.
    var r9 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Surface/Background/Transparent/Dim');
    assertCase('@alpha applies to 6-digit resolved value -> 8-digit RRGGBBAA', r9.value === '#1054DE80', JSON.stringify(r9));

    // 10. @alpha application on top of an already-8-digit-producing chain (alpha always recomputes the tail byte).
    var r10 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Alpha/OnHex8');
    assertCase('@alpha:0.25 applied to resolved theme value', r10.value === '#2E2E2E40', JSON.stringify(r10));

    // 11. @alpha out-of-range clamps (and warns once — not asserted here, just the clamp behavior).
    var r11 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Alpha/OutOfRange');
    assertCase('@alpha:1.5 out-of-range clamps to 1.0 -> FF alpha byte', r11.value === '#1054DEFF', JSON.stringify(r11));

    // 12. Unknown token path -> missing.
    var r12 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Nonexistent/Token/Path');
    assertCase('unknown token path -> missing', r12.value === MISSING_COLOR && r12.source === 'missing', JSON.stringify(r12));

    // 13. Unknown alias -> missing.
    var r13 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Broken/UnknownAlias');
    assertCase('unknown alias -> missing', r13.value === MISSING_COLOR && r13.source === 'missing', JSON.stringify(r13));

    // 14. Alias value not "{theme.*}" shape -> missing (ref-shaped but wrong target).
    var r14 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Broken/AliasNotThemeRef');
    assertCase('alias value not {theme.*} shape -> missing', r14.value === MISSING_COLOR && r14.source === 'missing', JSON.stringify(r14));

    // 14b. Alias value a plain string (not even ref-shaped) -> missing.
    var r14b = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Broken/AliasPlainString');
    assertCase('alias value plain string -> missing', r14b.value === MISSING_COLOR && r14b.source === 'missing', JSON.stringify(r14b));

    // 14c. Unparseable cell string -> missing.
    var r14c = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Broken/Unparseable');
    assertCase('unparseable cell -> missing', r14c.value === MISSING_COLOR && r14c.source === 'missing', JSON.stringify(r14c));

    // 15. Bad hex at scope level falls through to global.
    var r15 = resolveToken(fixture, table, 'bad_hex_scope/x/y', 'light', 'Surface/Tab/Pill/Active');
    assertCase('bad hex at scope level falls through to global', r15.value === '#1054DE' && r15.source === 'theme:primary_color@global', JSON.stringify(r15));

    // 16. Bad hex at global (and nowhere valid) -> missing.
    var fixtureBadGlobal = JSON.parse(JSON.stringify(fixture));
    fixtureBadGlobal.theme.light.primary_color = '#GGGGGG';
    delete fixtureBadGlobal.customizations['live_chat/*/*']; // remove the valid scope override too
    var r16 = resolveToken(fixtureBadGlobal, table, 'random_page/foo/bar', 'light', 'Surface/Tab/Pill/Active');
    assertCase('bad hex at global with nothing else valid -> missing', r16.value === MISSING_COLOR && r16.source === 'missing', JSON.stringify(r16));

    // 17. Mixed-case theme value is uppercased in output.
    var r17 = resolveToken(fixture, table, 'random_page/foo/bar', 'light', 'Case/MixedTheme');
    assertCase('mixed-case theme value uppercased', r17.value === '#1054DE', JSON.stringify(r17));

    // 18-20. resolveTheme12 legacy behavior still intact.
    var t1 = resolveTheme12(fixture, 'live_chat/message_composer/x', 'light');
    assertCase('resolveTheme12: page-level primary_color wins over global',
      t1.primary_color && t1.primary_color.value === '#D02000' && t1.primary_color.source === 'live_chat/*/*',
      JSON.stringify(t1.primary_color));
    assertCase('resolveTheme12: component-level secondary_shade6_color wins over global (per-key partial merge)',
      t1.secondary_shade6_color && t1.secondary_shade6_color.value === '#111111' && t1.secondary_shade6_color.source === '*/message_composer/*',
      JSON.stringify(t1.secondary_shade6_color));
    assertCase('resolveTheme12: alert_color falls through to global (not overridden anywhere)',
      t1.alert_color && t1.alert_color.value === '#FA4D30' && t1.alert_color.source === 'global',
      JSON.stringify(t1.alert_color));
    var t2 = resolveTheme12(fixture, 'nowhere/nothing/nada', 'dark');
    assertCase('resolveTheme12: unmatched scope falls back fully to global (dark)',
      t2.primary_color.value === '#1054DE' && t2.primary_color.source === 'global' &&
      t2.base_color.value === '#EBECEF' && t2.base_color.source === 'global',
      JSON.stringify(t2));

    // backfillThemeDefaults: partial customer config gets missing keys filled from bundled default.
    var bfDefaults = { theme: { light: { primary_color: '#111111', secondary_shade6_color: '#222222' }, dark: { primary_color: '#333333', secondary_shade6_color: '#444444' } } };
    var bfCustomer = { theme: { light: { primary_color: '#AA0000' }, dark: {} }, customizations: { 'live_chat/*/*': { theme: { light: { primary_color: '#FF0000' } } } } };
    var bfEff = backfillThemeDefaults(bfCustomer, bfDefaults);
    assertCase('backfill: customer-set key wins over default', bfEff.theme.light.primary_color === '#AA0000', JSON.stringify(bfEff.theme.light));
    assertCase('backfill: key missing from customer is filled from default (light)', bfEff.theme.light.secondary_shade6_color === '#222222', JSON.stringify(bfEff.theme.light));
    assertCase('backfill: dark mode filled from default too', bfEff.theme.dark.primary_color === '#333333' && bfEff.theme.dark.secondary_shade6_color === '#444444', JSON.stringify(bfEff.theme.dark));
    assertCase('backfill: customizations left untouched', bfEff.customizations['live_chat/*/*'].theme.light.primary_color === '#FF0000', JSON.stringify(bfEff.customizations));
    assertCase('backfill: original customer config not mutated', bfCustomer.theme.light.secondary_shade6_color === undefined, JSON.stringify(bfCustomer.theme.light));

    return { passed: passed, failed: failed, cases: cases };
  }

  var ConfigResolver = {
    resolveTheme12: resolveTheme12,
    resolveToken: resolveToken,
    resolveThemeKey: resolveThemeKey,
    backfillThemeDefaults: backfillThemeDefaults,
    runSelfTest: runSelfTest
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigResolver;
  }
  if (typeof root !== 'undefined') {
    root.ConfigResolver = ConfigResolver;
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));

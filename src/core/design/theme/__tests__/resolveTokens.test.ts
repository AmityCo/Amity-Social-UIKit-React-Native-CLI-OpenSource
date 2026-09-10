// Validates the theming layer's core: that the RN resolution path (config-resolver.js +
// the vendored config template + AmityColorToken) resolves every token to a concrete,
// web-matching hex, and that mode derivation follows the config-driven rules.

import designTokens from '../../tokens/amity-uikit-design-tokens.json';
import baseConfig from '../../tokens/amity-uikit-config.json';
import { AmityColorToken } from '../../tokens/amity-color-tokens';
import type { TokenConfig, TokenTable } from '../../tokens/config-resolver';
import {
  resolveAllTokens,
  deriveMode,
  effectiveConfig,
} from '../resolveTokens';

const TABLE = designTokens as unknown as TokenTable;
const CONFIG = baseConfig as unknown as TokenConfig;
const TOKEN_COUNT = Object.keys(AmityColorToken).length;

describe('resolveAllTokens', () => {
  const light = resolveAllTokens(CONFIG, TABLE, 'light', '*/*/*');
  const dark = resolveAllTokens(CONFIG, TABLE, 'dark', '*/*/*');

  it('resolves every token (no MISSING #FF00FF) in both modes', () => {
    expect(Object.keys(light)).toHaveLength(TOKEN_COUNT);
    expect(Object.keys(dark)).toHaveLength(TOKEN_COUNT);
    expect(Object.values(light).filter((v) => v === '#FF00FF')).toHaveLength(0);
    expect(Object.values(dark).filter((v) => v === '#FF00FF')).toHaveLength(0);
  });

  it('resolves to web-matching shipping colours', () => {
    const bg = AmityColorToken.SurfacePageBackgroundDefault.path;
    const primary =
      AmityColorToken.SurfaceMainButtonDefaultFilledPrimaryEnabled.path;
    expect(light[bg]).toBe('#FFFFFF');
    expect(dark[bg]).toBe('#191919');
    expect(light[primary]).toBe('#1054DE');
    expect(dark[primary]).toBe('#1054DE');
  });

  it('produces uppercased hex strings', () => {
    for (const v of Object.values(light)) {
      expect(v).toMatch(/^#[0-9A-F]{6}([0-9A-F]{2})?$/);
    }
  });
});

describe('deriveMode', () => {
  it('explicit mode wins over everything', () => {
    expect(
      deriveMode({ mode: 'dark', preferredTheme: 'light', scheme: 'light' })
    ).toBe('dark');
  });
  it('honours preferredTheme light/dark', () => {
    expect(deriveMode({ preferredTheme: 'dark', scheme: 'light' })).toBe(
      'dark'
    );
    expect(deriveMode({ preferredTheme: 'light', scheme: 'dark' })).toBe(
      'light'
    );
  });
  it("'default' follows the OS scheme, falling back to light", () => {
    expect(deriveMode({ preferredTheme: 'default', scheme: 'dark' })).toBe(
      'dark'
    );
    expect(deriveMode({ preferredTheme: 'default', scheme: 'light' })).toBe(
      'light'
    );
    expect(deriveMode({ preferredTheme: 'default', scheme: null })).toBe(
      'light'
    );
  });
});

describe('effectiveConfig', () => {
  it('returns the base config when no customer overrides', () => {
    expect(effectiveConfig(CONFIG)).toBe(CONFIG);
  });
  it('lets a customer override a theme key while keeping the rest', () => {
    const custom = {
      theme: { light: { primary_color: '#123456' }, dark: {} },
    } as unknown as TokenConfig;
    const merged = effectiveConfig(CONFIG, custom);
    expect(merged.theme.light.primary_color).toBe('#123456');
    // a key the customer did NOT override is backfilled from base
    expect(merged.theme.light.background_color).toBe(
      CONFIG.theme.light.background_color
    );
  });
});

# Amity Social UIKit – React Native (CLI / Open Source)

## Component & Feature Creation Standards

### Top-Level Source Structure

```md
src/
├── core/ # Shared infrastructure (hooks, providers, stores, utils, types)
├── social/
│ ├── components/ # Reusable UI components (moderate complexity, used across features)
│ ├── elements/ # Atomic, single-responsibility UI pieces
│ ├── screens/ # Full-page / screen-level components (navigation destinations)
│ └── features/ # Business-logic + UI grouped by domain (post, user, community, …)
└── chat/ # The chat UIKit — same internal buckets as social/
├── components/
├── elements/
├── features/ # conversation, group, shared
├── hooks/
├── pages/ # navigation destinations (AmityChatHomePage, AmityChatPage, …)
└── utils/
```

`chat/` sits alongside `social/` rather than under `social/features/`: it is a
separate UIKit surface (its own entry point, `AmityUiKitChat`), not one social
domain among many. Both draw on `core/`, and `social/` never imports from
`chat/`. Two leftovers point the other way — chat borrows
`social/components/Toast` and `social/hooks/useImagePicker`. Prefer `core/` for
anything new that both surfaces need; don't add more chat → social edges.

Place new code in the most specific bucket:

| Bucket               | Use when                                                     |
| -------------------- | ------------------------------------------------------------ |
| `elements/`          | Atomic, nearly stateless (buttons, badges, action rows)      |
| `components/`        | Composed of multiple elements, no business logic             |
| `features/<domain>/` | Feature sub-views that combine UI + data-fetching/state      |
| `screens/`           | Full navigation pages (typically wrap a feature entry-point) |

---

## Folder & File Conventions

### Minimal component / element

```md
ComponentName/
├── ComponentName.tsx ← main implementation
├── index.tsx ← barrel export
└── styles.ts ← useStyles hook
```

### Feature sub-view (medium complexity)

```md
FeatureName/
├── FeatureName.tsx
├── index.ts
├── styles.ts
├── components/
│ ├── SubComponent/
│ │ ├── SubComponent.tsx
│ │ ├── index.ts
│ │ └── styles.ts
│ └── index.ts ← re-exports all sub-components
└── elements/
├── ActionButton/
│ ├── ActionButton.tsx
│ └── index.ts
└── index.ts ← re-exports all elements
```

### Feature sub-view (high complexity, with hooks and types)

```md
FeatureName/
├── FeatureName.tsx
├── index.ts
├── styles.ts
├── hooks/
│ ├── useFeatureName.ts ← primary feature hook
│ └── index.ts
├── types/
│ └── index.ts
├── components/
│ ├── SubComponent/
│ │ ├── SubComponent.tsx
│ │ ├── index.ts
│ │ ├── styles.ts
│ │ └── hooks/
│ │ └── useSubComponent.ts
│ └── index.ts
└── elements/
├── ElementName/
│ ├── ElementName.tsx
│ ├── index.ts
│ └── styles.ts
└── index.ts
```

### Screen (full navigation page)

```text
ScreenName/
├── index.tsx           ← entry point (often wraps a feature component)
├── styles.ts
```

---

## File Naming Rules

| File                    | Convention                                            |
| ----------------------- | ----------------------------------------------------- |
| Component / screen file | `ComponentName.tsx` — PascalCase, matches folder name |
| Barrel export           | `index.tsx` when it exports JSX; `index.ts` otherwise |
| Styles                  | `styles.ts` — always lowercase, always `.ts`          |
| Hooks                   | `use<Name>.ts` — camelCase with `use` prefix          |
| Types                   | `types/index.ts` inside the feature folder            |

---

## Barrel Export Patterns

Always use name export

**Named export:**

```typescript
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName';
```

**Star export (aggregator):**

```typescript
export * from './Header';
export * from './Feed';
export * from './TopBar';
```

---

## Component File Structure

```typescript
// 1. React / RN imports
import { View } from 'react-native';

// 2. Third-party imports
import { useTheme } from 'react-native-paper';

// 3. Internal imports (relative)
import { useStyles } from './styles';

// 4. Types
type ComponentNameProps = {
  requiredProp: string;
  pageId: PageID;
  componentId?: ComponentID;
  dark?: boolean;
};

// 5. Named function component (not arrow function)
export function ComponentName({ requiredProp, dark }: ComponentNameProps) {
  const { styles, theme } = useStyles();

  return <View style={styles.container} />;
}

// 6. Compound variants (optional)
ComponentName.Variant = VariantComponent;
```

---

## styles.ts Pattern

Always export a `useStyles` hook. Return both `styles` and `theme` when theme values are needed in the component.

**Theme-aware (standard):**

```typescript
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { MyMD3Theme } from '../../core/providers/AmityUIKitProvider';

export const useStyles = () => {
  const theme = useTheme<MyMD3Theme>();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });

  return { styles, theme };
};
```

**No theme dependency:**

```typescript
import { StyleSheet } from 'react-native';

export const useStyles = () => {
  return StyleSheet.create({
    container: { flex: 1 },
  });
};
```

---

## Naming Conventions

| Suffix / Pattern                            | Used for                                                   |
| ------------------------------------------- | ---------------------------------------------------------- |
| `Action`                                    | Interactive row actions — `CopyLinkAction`, `ShareAction`  |
| `Button`                                    | Standalone touchable buttons — `BackButton`, `CloseButton` |
| `Badge`                                     | Decorative labels — `ModeratorBadge`, `BrandBadge`         |
| Compound (`Avatar.User`, `Avatar.Category`) | Variants of a base component                               |

---

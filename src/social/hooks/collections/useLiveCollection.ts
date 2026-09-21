// Re-export shim: useLiveCollection moved to core/hooks/collections so that
// both the social and chat surfaces can share it (chat must not import from
// social). Existing social imports keep resolving through this path.
export { useLiveCollection } from '../../../core/hooks/collections/useLiveCollection';

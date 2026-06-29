// Ambient type declarations for runtime dependencies that ship without their
// own TypeScript types. Without these, `bob build` / `tsc --noEmit` fails with
// "Cannot find module ... or its corresponding type declarations" on a clean
// install (the packages resolve at runtime but have no .d.ts).

// react-native-modalbox@2.0.2 ships no types. It is used as a basic component
// that accepts arbitrary props (style, isOpen, position, swipeToClose, etc.)
// and children, plus a ref with open()/close().
declare module 'react-native-modalbox' {
  import { Component } from 'react';

  export interface ModalRef {
    open: () => void;
    close: () => void;
  }

  // Props are loosely typed on purpose — the library has no published types and
  // exposes a large, untyped surface.
  export default class Modal extends Component<any> {
    open: () => void;
    close: () => void;
  }
}

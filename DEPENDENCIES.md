# Dependencies

> Last updated: 2026-06-11

A complete inventory of every dependency declared in the root [`package.json`](./package.json), with the version range the UIKit pins. Version ranges shown are exactly what is declared — where a package appears in more than one section with different ranges, both are listed as `peer / dev`.

## Summary

| Category           | Count |
| ------------------ | ----- |
| Unique packages    | 79    |
| `dependencies`     | 26    |
| `devDependencies`  | 53    |
| `peerDependencies` | 27    |

`Type` legend: `dep` = `dependencies`, `dev` = `devDependencies`, `peer` = `peerDependencies`. A package can carry more than one type (e.g. `dev+peer`).

---

## All dependencies

| Package                                         | Type         | Version                        |
| ----------------------------------------------- | ------------ | ------------------------------ |
| `@amityco/ts-sdk-react-native`                  | dev+peer     | 7.18.1-72bd324a.0              |
| `@babel/plugin-transform-export-namespace-from` | dev          | ^7.27.1                        |
| `@commitlint/config-conventional`               | dev          | ^17.0.2                        |
| `@devvie/bottom-sheet`                          | dep          | ^0.3.0                         |
| `@evilmartians/lefthook`                        | dev          | ^1.2.2                         |
| `@fawazahmed/react-native-read-more`            | dep          | ^3.0.4                         |
| `@hookform/resolvers`                           | dep          | ^5.2.1                         |
| `@livekit/react-native`                         | dev+peer     | ^2.9.6                         |
| `@livekit/react-native-webrtc`                  | dev+peer     | ^137.0.2                       |
| `@react-native-async-storage/async-storage`     | dev+peer     | ^1.19.3 (peer) / ^2.2.0 (dev)  |
| `@react-native-clipboard/clipboard`             | dev+peer     | ^1.16.3                        |
| `@react-native-community/datetimepicker`        | dev          | ^8.4.4                         |
| `@react-native-community/eslint-config`         | dev          | ^3.0.2                         |
| `@react-native-community/netinfo`               | dev+peer     | ^11.3.1 (peer) / ^11.4.1 (dev) |
| `@react-native-firebase/app`                    | dev+peer     | ^20.1.0                        |
| `@react-native-firebase/messaging`              | dev+peer     | ^20.1.0                        |
| `@react-native/babel-preset`                    | dev          | 0.82.1                         |
| `@react-navigation/native`                      | dev+peer     | ^7.1.8                         |
| `@react-navigation/native-stack`                | dev+peer     | ^7.3.12                        |
| `@react-navigation/stack`                       | dev+peer     | ^7.3.1                         |
| `@reduxjs/toolkit`                              | dep          | ^1.9.7                         |
| `@release-it/conventional-changelog`            | dev          | ^5.0.0                         |
| `@tanstack/react-query`                         | dep          | ^5.85.5                        |
| `@types/jest`                                   | dev          | ^29.5.13                       |
| `@types/react`                                  | dev          | ^19.1.1                        |
| `@types/react-dom`                              | dep          | ^19.1.0                        |
| `@types/react-native`                           | dev          | 0.73.0                         |
| `@types/react-native-video`                     | dev          | ^5.0.18                        |
| `babel-plugin-module-resolver`                  | dev          | ^5.0.0                         |
| `commitlint`                                    | dev          | ^17.0.2                        |
| `dayjs`                                         | dep          | ^1.11.10                       |
| `del-cli`                                       | dev          | ^5.0.0                         |
| `eslint`                                        | dev          | ^8.19.0                        |
| `eslint-config-prettier`                        | dev          | ^8.5.0                         |
| `eslint-plugin-prettier`                        | dev          | ^4.0.0                         |
| `html-entities`                                 | dep          | ^2.5.2                         |
| `husky`                                         | dev          | ^8.0.0                         |
| `i18next`                                       | dep          | 22.4.10                        |
| `jest`                                          | dev          | ^29.6.3                        |
| `lint-staged`                                   | dev          | ^15.2.0                        |
| `livekit-client`                                | dev+peer     | ^2.17.0                        |
| `mime`                                          | dep          | ^4.1.0                         |
| `pod-install`                                   | dev          | ^0.1.0                         |
| `polished`                                      | dep          | ^4.3.1                         |
| `prettier`                                      | dev          | 2.8.8                          |
| `react`                                         | dev+peer     | \* (peer) / 19.1.1 (dev)       |
| `react-content-loader`                          | dep          | ^6.2.1                         |
| `react-hook-form`                               | dep          | ^7.49.3                        |
| `react-i18next`                                 | dep          | 12.1.5                         |
| `react-native`                                  | dev+peer     | \* (peer) / 0.82.1 (dev)       |
| `react-native-builder-bob`                      | dev          | ^0.20.0                        |
| `react-native-compressor`                       | dev+peer     | ^1.13.0                        |
| `react-native-controlled-mentions`              | dep          | ^3.1.0                         |
| `react-native-fs`                               | dev+peer     | 2.20.0                         |
| `react-native-gesture-handler`                  | dev+peer     | ^2.28.0                        |
| `react-native-get-random-values`                | dev+peer     | ^1.11.0                        |
| `react-native-haptic-feedback`                  | dev+peer     | ^2.3.3                         |
| `react-native-image-picker`                     | dev+peer     | ^8.2.1                         |
| `react-native-image-viewing`                    | dep          | ^0.2.2                         |
| `react-native-insta-story`                      | dep          | ^1.1.9                         |
| `react-native-linear-gradient`                  | dep+dev+peer | ^2.8.3                         |
| `react-native-modal-selector`                   | dep          | ^2.1.2                         |
| `react-native-netinfo`                          | peer         | ^1.1.0                         |
| `react-native-orientation-locker`               | dep          | ^1.5.0                         |
| `react-native-paper`                            | dep          | ^5.10.6                        |
| `react-native-progress`                         | dep          | ^5.0.0                         |
| `react-native-radio-buttons-group`              | dep          | ^3.0.2                         |
| `react-native-safe-area-context`                | dev+peer     | ^5.6.2                         |
| `react-native-screens`                          | dev+peer     | ^4.18.0                        |
| `react-native-svg`                              | dev+peer     | ^15.15.1                       |
| `react-native-video`                            | dev+peer     | ^6.18.0                        |
| `react-native-video-controls`                   | dev          | ^2.8.1                         |
| `react-native-vision-camera`                    | dev+peer     | ^4.7.3                         |
| `react-redux`                                   | dep          | ^9.1.2                         |
| `redux`                                         | dep          | ^4.2.1                         |
| `release-it`                                    | dev          | ^15.0.0                        |
| `turbo`                                         | dev          | ^1.10.7                        |
| `typescript`                                    | dev          | ^5.8.3                         |
| `zod`                                           | dep          | ^4.1.1                         |

---

## Peer dependencies (what host apps must install)

These are the packages a consuming app needs to provide. See [MIGRATION.md](./MIGRATION.md) for what changed in this release.

| Package                                     | Version           |
| ------------------------------------------- | ----------------- |
| `@amityco/ts-sdk-react-native`              | 7.18.1-72bd324a.0 |
| `@livekit/react-native`                     | ^2.9.6            |
| `@livekit/react-native-webrtc`              | ^137.0.2          |
| `@react-native-async-storage/async-storage` | ^1.19.3           |
| `@react-native-clipboard/clipboard`         | ^1.16.3           |
| `@react-native-community/netinfo`           | ^11.3.1           |
| `@react-native-firebase/app`                | ^20.1.0           |
| `@react-native-firebase/messaging`          | ^20.1.0           |
| `@react-navigation/native`                  | ^7.1.8            |
| `@react-navigation/native-stack`            | ^7.3.12           |
| `@react-navigation/stack`                   | ^7.3.1            |
| `livekit-client`                            | ^2.17.0           |
| `react`                                     | \*                |
| `react-native`                              | \*                |
| `react-native-compressor`                   | ^1.13.0           |
| `react-native-fs`                           | 2.20.0            |
| `react-native-gesture-handler`              | ^2.28.0           |
| `react-native-get-random-values`            | ^1.11.0           |
| `react-native-haptic-feedback`              | ^2.3.3            |
| `react-native-image-picker`                 | ^8.2.1            |
| `react-native-linear-gradient`              | ^2.8.3            |
| `react-native-netinfo`                      | ^1.1.0            |
| `react-native-safe-area-context`            | ^5.6.2            |
| `react-native-screens`                      | ^4.18.0           |
| `react-native-svg`                          | ^15.15.1          |
| `react-native-video`                        | ^6.18.0           |
| `react-native-vision-camera`                | ^4.7.3            |

---

## Type legend

| Type   | Description                                |
| ------ | ------------------------------------------ |
| `dep`  | Production dependency (`dependencies`)     |
| `dev`  | Development dependency (`devDependencies`) |
| `peer` | Peer dependency (`peerDependencies`)       |

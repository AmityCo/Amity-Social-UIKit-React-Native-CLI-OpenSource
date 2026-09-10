// Web re-exports Header + SearchChannelList + SearchMessageList here. In the RN
// port the two result lists live under chat/components (AmitySearchChannelResults
// / AmitySearchMessageResults per the parity manifest), so this barrel exports
// only the search Header.
export { Header } from './Header';

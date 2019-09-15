/**
 * @module @edtr-io/core
 */
/** Comment needed because of https://github.com/christopherthielen/typedoc-plugin-external-module-name/issues/337 */
export { SubDocument } from './document'
export { Document, Editor, EditorProps, EditorProvider } from './editor'
export {
  ScopeContext,
  EditorContext,
  Provider,
  useDispatch,
  useSelector,
  useStore,
  useScopedDispatch,
  useScopedSelector,
  useScopedStore
} from './store'
export { OverlayContext, OverlayContextValue } from './overlay'
export { PreferenceContext, setDefaultPreference } from './preference-context'

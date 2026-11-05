/**
 * Lets section empty states open the owner toolbar's add dialog without
 * threading callbacks through ClientPage. FloatingAddButton listens.
 */
export type AddDialogType = "social" | "feature" | "project"

const EVENT = "presssence:open-add-dialog"

export function openAddDialog(type: AddDialogType) {
  window.dispatchEvent(new CustomEvent<AddDialogType>(EVENT, { detail: type }))
}

export function onOpenAddDialog(handler: (type: AddDialogType) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<AddDialogType>).detail)
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}

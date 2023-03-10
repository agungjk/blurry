import { storage, storageKey } from "~config"

chrome.action.onClicked.addListener(async () => {
  const isEnabled = await storage.get(storageKey)
  await storage.set(storageKey, !isEnabled)
})

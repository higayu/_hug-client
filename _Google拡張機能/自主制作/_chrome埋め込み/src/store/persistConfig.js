export const persistKey = 'hug_chrome_embed_v1'

export const persistedStateKeys = [
  'attendance',
  'chat',
  'correction',
  'facility',
  'hugPersonalRecord',
  'personalRecord',
  'ui',
]

export const persistConfig = {
  key: persistKey,
  whitelist: persistedStateKeys,
}

export default persistConfig

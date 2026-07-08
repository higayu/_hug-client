export const toBooleanFlag = (value, defaultValue = true) => {
    if (value === true || value === 'true') return true
    if (value === false || value === 'false') return false
    return defaultValue
  }
  
  export const toIniBooleanString = (value, defaultValue = true) => {
    return String(toBooleanFlag(value, defaultValue))
  }
  
  export const toId = (value) => String(value ?? '').trim()
  
  export const isNotDeleted = (value) => {
    return Number(value ?? 0) !== 1
  }

  export const cloneObject = (value) => {
    return JSON.parse(JSON.stringify(value || {}))
  }
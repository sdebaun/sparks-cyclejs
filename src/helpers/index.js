export const log = label => emitted => console.log(label,':',emitted)

export const isObservable = obs => typeof obs.subscribe === 'function'

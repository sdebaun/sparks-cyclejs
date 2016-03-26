require('./styles.scss')

import {img} from 'cycle-snabbdom'

const ProfileAvatar = sources => ({
  DOM: sources.src$.map(src =>
    img({class: {avatar: true}, attrs: {src}})
  ),
})

const LargeProfileAvatar = sources => ({
  DOM: sources.src$.map(src =>
    img({class: {avatar: true, large: true}, attrs: {src}})
  ),
})

export {LargeProfileAvatar, ProfileAvatar}

require('./styles.scss')

import {Observable} from 'rx'
const {just, combineLatest} = Observable

import {img} from 'cycle-snabbdom'

const CLASSES = {avatar: true}
const MEDIUM = {medium: true}
const LARGE = {large: true}

const Avatar = sources => ({
  DOM: combineLatest(
    sources.classes$ || just({}),
    sources.src$,
    (classes, src) => img({class: {...CLASSES, ...classes}, attrs: {src}})
  ),
})

const MediumAvatar = ({classes$, ...sources}) => Avatar({...sources,
  classes$: classes$ ? classes$.map(c => ({...MEDIUM, ...c})) : just(MEDIUM),
})

const LargeAvatar = ({classes$, ...sources}) => Avatar({...sources,
  classes$: classes$ ? classes$.map(c => ({...LARGE, ...c})) : just(LARGE),
})

export {
  Avatar,
  MediumAvatar,
  LargeAvatar,
}

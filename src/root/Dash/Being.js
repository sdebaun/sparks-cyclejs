import {LargeProfileAvatar} from 'components/profile'

export default sources => {
  const portraitUrl$ = sources.userProfile$.map(up => up && up.portraitUrl)

  return {
    DOM: LargeProfileAvatar({...sources, src$: portraitUrl$}).DOM,
  }
}

import {Observable} from 'rx';
import {div, img} from 'cycle-snabbdom';
import AdjectiveInput from './AdjectiveInput';
import Sentence from './Sentence';


function App(sources) {

  const adjectiveInputComponent = AdjectiveInput({DOM: sources.DOM});
  const adjectiveInputVTree$ = adjectiveInputComponent.DOM;
  const adjectiveInputValue$ = adjectiveInputComponent.inputValue$;

  const sentenceSources = {DOM: sources.DOM, prop$: {adjectiveInputValue$}};
  const sentenceComponent = Sentence(sentenceSources);
  const sentenceVTree$ = sentenceComponent.DOM;

  const vTree$ = Observable.just( div('Foo') )

  const sinks = {
    DOM: vTree$
  };

  return sinks;
}


export default App;

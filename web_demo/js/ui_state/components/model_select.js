import Component from '../lib/component.js';
import store from '../store/index.js';

const seed_names = {
    bipedal: ['Joe', 'Alice', 'Bob', 'Susan'],
    chimpanzee: ['Tarzan', 'Kong', 'Caesar', 'Rafiki'],
    fish: ['Nemo', 'Dory', 'Oscar', 'Bubbles']
};

export default class ModelSelect extends Component {
    constructor() {
        super({
            store,
            element: document.querySelector('#models')
        });
    }
    render() {
        this.element.innerHTML = store.state.morphologies
            .filter(m => m.morphology == store.state.currentMorphology)
            .flatMap(morphology => morphology.seeds)
            //.map((seedEntry, index) => `<option value="${seedEntry.path}">${store.state.currentMorphology}_${seedEntry.seed}</option>`)
            .map((seedEntry, index) => {
                let name = seed_names[store.state.currentMorphology][index];
                return `<option value="${seedEntry.path}">${name}</option>`;
            })
            .join('');
        this.element.selectedIndex = store.state.currentSeedIdx;
    }
};
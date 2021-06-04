import Component from '../lib/component.js';
import store from '../store/index.js';

const thumbnails_path = "images/agents_thumbnails/";

const seed_names = {
    bipedal: ['Joe', 'Alice', 'Bob', 'Susan'],
    chimpanzee: ['Tarzan', 'Kong', 'Caesar', 'Rafiki'],
    fish: ['Nemo', 'Dory', 'Oscar', 'Bubbles']
};

const bodyTypeMapping = new Map();
bodyTypeMapping.set("bipedal", "classic_bipedal");
bodyTypeMapping.set("chimpanzee", "climbing_profile_chimpanzee");
bodyTypeMapping.set("fish", "fish");

function strUcFirst(a){
    return (a+'').charAt(0).toUpperCase()+a.substr(1);
}

export default class MorphologySelect extends Component {
    constructor() {
        super({
            store,
            element: document.querySelector('#agentsSelection')
        });
    }
    render() {

        this.element.innerHTML = store.state.morphologies.map(m => {
            return `<li name="morph-list-item" class="list-group-item d-flex justify-content-between align-items-center px-2 py-1">
                        
                        <img name="morphology_thumbnail" src=${thumbnails_path + m.morphology + "_thumbnail.png"} 
                         alt=${m.morphology + "_thumbnail"}
                         width="20%">
                        <label for="morphology_thumbnail"><strong>${strUcFirst(m.morphology)}</strong></label>                 

                        <div name="select_button" class="input-group mt-1 w-50">                          
                            <select name="models" class="form-select"></select>
                            <div class="input-group-append">
                                <button name="addAgentButton" class="btn btn-warning"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </li>`
        }).join('');

        this.element.querySelectorAll('li[name="morph-list-item"]').forEach((span, index) => {
            if (store.state.drawingModeState.drawing) {
                span.classList.add('disabled');
            }
        });

        this.element.querySelectorAll('select[name="models"]').forEach((span, index) => {
            span.innerHTML = store.state.morphologies
                .filter(m => m.morphology == store.state.morphologies[index].morphology)
                .flatMap(morphology => morphology.seeds)
                //.map((seedEntry, index) => `<option value="${seedEntry.path}">${store.state.currentMorphology}_${seedEntry.seed}</option>`)
                .map((seedEntry, idx) => {
                    let name = seed_names[store.state.morphologies[index].morphology][idx];
                    return `<option value="${seedEntry.path}">${name}</option>`;
                })
                .join('');

            span.addEventListener('input', evt => {
                store.dispatch('selectSeedIdx', {morphology: store.state.morphologies[index].morphology, index: span.selectedIndex});
            });

            span.selectedIndex = store.state.currentSeedsIdx[store.state.morphologies[index].morphology];
        });

        this.element.querySelectorAll('button[name="addAgentButton"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                let morph = store.state.morphologies[index];
                store.dispatch('addAgent', {
                    morphology: bodyTypeMapping.get(morph.morphology),
                    name: seed_names[morph.morphology][store.state.currentSeedsIdx[morph.morphology]],
                    path: morph.seeds[store.state.currentSeedsIdx[morph.morphology]].path,
                });
            });
        });
    }
};
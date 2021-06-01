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

export default class MorphologySelect extends Component {
    constructor() {
        super({
            store,
            element: document.querySelector('#agent-sel-config')
        });
    }
    render() {

        let agents_div = this.element.querySelector('#agentsSelection');

        agents_div.innerHTML = store.state.morphologies.map(m => {
            return `<div class="col col-4">
                        <img name="morphology_thumbnail" src=${thumbnails_path + m.morphology + "_thumbnail.png"} 
                             alt=${m.morphology + "_thumbnail"}
                             width="25%">
                        <br>
                       <label for="morphology_thumbnail">${m.morphology}</label>
                       
                        <br>
                        <label for="select_button">Choose an agent to add:</label>
                        <!--<div name="select_button" class="row justify-content-md-left mt-1">-->
                        <div name="select_button" class="input-group mt-1 w-50">                          
                            <select name="models" class="form-select"></select>
                            <div class="input-group-append">
                                <button name="addAgentButton" class="btn btn-warning"><i class="fas fa-plus"></i></button>
                            </div>
                        </div>
                    </div>`
        }).join('');

        agents_div.querySelectorAll('select[name="models"]').forEach((span, index) => {
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

        agents_div.querySelectorAll('button[name="addAgentButton"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                let morph = store.state.morphologies[index];
                store.dispatch('addAgent', {
                    morphology: bodyTypeMapping.get(morph.morphology),
                    name: seed_names[morph.morphology][store.state.currentSeedsIdx[morph.morphology]],
                    path: morph.seeds[store.state.currentSeedsIdx[morph.morphology]].path});
            });
        });

        /*let morphologySelector = this.element.querySelector('#morphology');
        morphologySelector.innerHTML = store.state.morphologies.map(m => `<option>${m.morphology}</option>`).join('');
        morphologySelector.value = store.state.currentMorphology;*/
    }
};
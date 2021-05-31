import Component from '../lib/component.js';
import store from '../store/index.js';

//const thumbnails_path = "../../../images/agents_thumbnails/";
const thumbnails_path = "images/agents_thumbnails/";

export default class MorphologySelect extends Component {
    constructor() {
        super({
            store,
            element: document.querySelector('#agent-sel-config')
        });
    }
    render() {

        /*let agents_div = this.element.querySelector('#agentsSelection');
        while (agents_div.firstChild) {
            agents_div.removeChild(agents_div.firstChild);
        }

        for(let m of store.state.morphologies){
            let div = document.createElement('div');
            div.className = 'col col-4';
            div.appendChild(document.createTextNode(m.morphology));
            let thumbnail = document.createElement('img');
            thumbnail.addEventListener('load', () => {});
            thumbnail.src = thumbnails_path + m.morphology + "_thumbnail";
            div.appendChild(thumbnail);
            agents_div.appendChild(div);
        }*/

        let morphologySelector = this.element.querySelector('#morphology');
        morphologySelector.innerHTML = store.state.morphologies.map(m => `<option>${m.morphology}</option>`).join('');
        morphologySelector.value = store.state.currentMorphology;
    }
};
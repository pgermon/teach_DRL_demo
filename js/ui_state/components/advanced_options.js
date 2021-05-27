import Component from '../lib/component.js';
import store from '../store/index.js';
export default class AdvancedOptions extends Component {
    constructor() {
        super({
            store,
            element: document.querySelector('#advancedOptions')
        });
    }
    render() {

        const state = store.state.advancedOptionsState;

        this.element.querySelector('#drawJointsSwitch').checked = state.drawJoints;
        this.element.querySelector('#drawLidarsSwitch').checked = state.drawLidars;
        this.element.querySelector('#drawNamesSwitch').checked = state.drawNames;

        let circleAssetButton = this.element.querySelector('#circleAssetButton');
        if(state.assets.circle){
            circleAssetButton.className = "btn btn-asset";
        }
        else{
            circleAssetButton.className = "btn btn-outline-asset";
        }
    }
};
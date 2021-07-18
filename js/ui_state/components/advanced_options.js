import Component from '../lib/component.js';
import store from '../store/index.js';

/**
 * @classdesc UI component for advanced options.
 */
export default class AdvancedOptions extends Component {

    /**
     * @constructor
     */
    constructor() {
        super({
            store,
            element: document.querySelector('#advancedOptions'),
            eventName: 'advancedOptionsChange'
        });
    }

    /**
     * Renders the advanced options UI elements.
     */
    render() {

        const state = store.state.advancedOptionsState;

        let dict = window.lang_dict[store.state.language]['advancedOptions'];

        /* Rendering Options */
        this.element.querySelector('#renderingOptionsTitle').innerHTML = dict['renderingOptions'];

        // Checks the draw switches
        this.element.querySelector('#drawJointsSwitch').checked = state.drawJoints;
        this.element.querySelector('#drawLidarsSwitch').checked = state.drawLidars;
        this.element.querySelector('#drawNamesSwitch').checked = state.drawNames;

        // Switches labels
        this.element.querySelector('#drawJointsLabel').innerText = dict['drawJoints'];
        this.element.querySelector('#drawLidarsLabel').innerText = dict['drawLidars'];
        this.element.querySelector('#drawNamesLabel').innerText = dict['drawNames'];
        this.element.querySelector('#drawObservationLabel').innerText = dict['drawObservation'];
        this.element.querySelector('#drawRewardLabel').innerText = dict['drawReward'];

        /* Assets */

        this.element.querySelector('#assetsTitle').innerHTML = dict['assetsTitle'];
        this.element.querySelector('#assetsText').innerText = dict['assetsText'];

        // Renders the assets buttons
        let circleAssetButton = this.element.querySelector('#circleAssetButton');
        circleAssetButton.innerHTML = dict['circle'];
        if(state.assets.circle){
            circleAssetButton.className = "btn btn-asset";
        }
        else{
            circleAssetButton.className = "btn btn-outline-asset";
        }
    }
};
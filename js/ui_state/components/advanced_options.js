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

        // Checks the draw switches
        this.element.querySelector('#drawJointsSwitch').checked = state.drawJoints;
        this.element.querySelector('#drawLidarsSwitch').checked = state.drawLidars;
        this.element.querySelector('#drawNamesSwitch').checked = state.drawNames;

        // Renders the assets buttons
        let circleAssetButton = this.element.querySelector('#circleAssetButton');
        if(state.assets.circle){
            circleAssetButton.className = "btn btn-asset";
        }
        else{
            circleAssetButton.className = "btn btn-outline-asset";
        }
    }
};
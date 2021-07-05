import Component from '../lib/component.js';
import store from '../store/index.js';

/**
 * @classdesc UI component for the main buttons.
 */
export default class MainButtons extends Component {

    /**
     * @constructor
     */
    constructor() {
        super({
            store,
            element: document.querySelector('#runButtons'),
            eventName: 'runButtonsChange'
        });
    }

    /**
     * Renders the run, reset and save buttons.
     */
    render() {
        const status = store.state.simulationState.status;

        let runButton = this.element.querySelector("#runButton");
        let resetButton = this.element.querySelector("#resetButton");
        let saveEnvButton = this.element.querySelector('#saveEnvButton');

        // Disables buttons while drawing
        if(store.state.drawingModeState.drawing){
            runButton.className = "btn btn-success disabled";
            runButton.title = "Run the simulation";
            resetButton.className = "btn btn-danger disabled";
            saveEnvButton.className = "btn btn-primary mx-3 disabled";
        }

        // Enables buttons when not drawing
        else{
            // Turns run button into pause button while running
            if (status == 'running') {
                runButton.className = "btn btn-warning";
                runButton.childNodes[0].classList.add("fa-pause");
                runButton.childNodes[0].classList.remove("fa-play");
                runButton.title = "Pause the simulation";
            }

            // Turns pause button into run button when not running
            else {
                runButton.className = "btn btn-success";
                runButton.childNodes[0].classList.remove("fa-pause");
                runButton.childNodes[0].classList.add("fa-play");
                runButton.title = "Run the simulation";
            }

            resetButton.className = "btn btn-danger";
            saveEnvButton.className = "btn btn-primary mx-3";
        }

        /* Initializes tooltips */
        this.element.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el, index) => {
            return new bootstrap.Tooltip(el, {
                trigger: 'hover'
            });
        });
    }
};
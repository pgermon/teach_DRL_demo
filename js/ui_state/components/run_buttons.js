import Component from '../lib/component.js';
import store from '../store/index.js';
export default class RunButtons extends Component {
    constructor() {
        super({
            store,
            element: document.querySelector('#runButtons')
        });
    }
    render() {
        const status = store.state.simulationState.status;

        let runButton = this.element.querySelector("#runButton");
        let resetButton = this.element.querySelector("#resetButton");
        let saveEnvButton = this.element.querySelector('#saveEnvButton');

        // Run and reset buttons disabled while drawing
        if(store.state.drawingModeState.drawing){
            runButton.className = "btn btn-success disabled";
            runButton.title = "Run the simulation";
            resetButton.className = "btn btn-danger disabled";
            saveEnvButton.className = "btn btn-primary mx-3 disabled";
        }
        else{
            if (status == 'running') {
                runButton.className = "btn btn-warning";
                runButton.childNodes[0].classList.add("fa-pause");
                runButton.childNodes[0].classList.remove("fa-play");
                runButton.title = "Pause the simulation";
            } else if (status == 'paused') {
                runButton.className = "btn btn-success";
                runButton.childNodes[0].classList.remove("fa-pause");
                runButton.childNodes[0].classList.add("fa-play");
                runButton.title = "Run the simulation";

            } else { // init
                runButton.className = "btn btn-success";
                runButton.childNodes[0].classList.remove("fa-pause");
                runButton.childNodes[0].classList.add("fa-play");
                runButton.title = "Run the simulation";
            }
            resetButton.className = "btn btn-danger";
            saveEnvButton.className = "btn btn-primary mx-3";
        }

        this.element.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el, index) => {
            return new bootstrap.Tooltip(el, {
                trigger: 'hover'
            });
        });
    }
};
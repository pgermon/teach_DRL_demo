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
        let addAgentButton = document.querySelector('#addAgentButton');

        // Run and reset buttons disabled while drawing
        if(store.state.mode == 'drawing' && store.state.drawingModeState.drawing){
            runButton.className = "btn btn-success disabled";
            resetButton.className = "btn btn-danger disabled";
            addAgentButton.className = "btn btn-warning disabled";
        }
        else{
            if (status == 'running') {
                runButton.className = "btn btn-warning";
                //runButton.innerHTML = <i class="fas fa-play"></i>;
                runButton.innerText = "Pause";
            } else if (status == 'paused') {
                runButton.className = "btn btn-success";
                runButton.innerText = "Resume";
            } else { // init
                runButton.className = "btn btn-success";
                //runButton.innerText = '<i class="fas fa-play"></i> Start';
                runButton.innerText = "Start";
            }
            resetButton.className = "btn btn-danger";
            addAgentButton.className = "btn btn-warning";
        }
    }
};
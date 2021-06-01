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

        // Run and reset buttons disabled while drawing
        if(store.state.drawingModeState.drawing){
            runButton.className = "btn btn-success disabled";
            resetButton.className = "btn btn-danger disabled";
        }
        else{
            if (status == 'running') {
                runButton.className = "btn btn-warning";
                runButton.childNodes[0].classList.add("fa-pause");
                runButton.childNodes[0].classList.remove("fa-play");
            } else if (status == 'paused') {
                runButton.className = "btn btn-success";
                runButton.childNodes[0].classList.remove("fa-pause");
                runButton.childNodes[0].classList.add("fa-play");
                //runButton.innerText = "Resume";

            } else { // init
                runButton.className = "btn btn-success";
                runButton.childNodes[0].classList.remove("fa-pause");
                runButton.childNodes[0].classList.add("fa-play");
            }
            resetButton.className = "btn btn-danger";
        }
    }
};
import Component from '../lib/component.js';
import store from '../store/index.js';

const thumbnails_path = "images/agents_thumbnails/";

const bodyTypeMapping = new Map();
bodyTypeMapping.set("classic_bipedal", "bipedal");
bodyTypeMapping.set("climbing_profile_chimpanzee", "chimpanzee");
bodyTypeMapping.set("fish", "fish");

/**
 * @classdesc UI component for the list of running agents.
 */
export default class AgentsList extends Component {
    constructor() {
        super({
            store,
            element: document.querySelector('#agentsList'),
            eventName: 'agentsListChange'
        });
    }

    /**
     * Renders the list of running agents and adds event listeners to the different elements.
     */
    render() {
        this.element.innerHTML = store.state.agents.map(agent => {
            // Creates a list item for each agent
            return `<li name="agent-list-item" class="list-group-item d-flex justify-content-between align-items-center px-0 py-1">

                    <!-- Thumbnail of the morphology -->
                    <img src=${thumbnails_path + bodyTypeMapping.get(agent.morphology) + "_thumbnail.png"} 
                             alt=${agent.morphology + "_thumbnail"}
                             width="8%"
                             class="mx-1"
                             data-bs-toggle="tooltip" title=${strUcFirst(bodyTypeMapping.get(agent.morphology))}>
                             
                    <!-- Text field of the name of the agent -->
                    <div class="form-group">
                        <input name="agentNameArea" type="text" class="form-control w-75 mx-1" placeholder=${agent.name}>
                    </div>
                    
                    <!-- Follow switch -->         
                    <label class="form-check-label" for="followSwitch">Follow</label>         
                    <div class="form-check form-switch mx-1">
                        <input name="followSwitch" class="form-check-input" type="checkbox" data-bs-toggle="tooltip" title="Center the viewport on the agent">
                    </div>

                    <!-- Save and reset position buttons -->
                    <div name="positionButtonsGroup" class="btn-group" role="group">
                        <button name="savePositionButton" type="button" class="btn btn-primary btn-sm" 
                        data-bs-toggle="tooltip" title="Save the agent's position">
                            <i class="far fa-save fa-lg"></i>
                        </button>
                        <button name="resetPositionButton" type="button" class="btn btn-primary btn-sm"
                        data-bs-toggle="tooltip" title="Reset the agent's position">
                            <i class="fas fa-undo-alt"></i>
                        </button> 
                    </div>
                    
                    <!-- Delete button -->
                    <button name="deleteButton" type="button" class="btn btn-danger btn-sm mx-1"
                    data-bs-toggle="tooltip" title="Delete the agent">
                        <i class="fa fa-trash"></i>
                    </button>
                </li>`;
        }).join('');

        // Renders the list items differently when drawing or if the agent is selected
        this.element.querySelectorAll('li[name="agent-list-item"]').forEach((span, index) => {
            if(store.state.drawingModeState.drawing){
                span.classList.add('disabled');
            }
            else{
                if(store.state.agents[index] == store.state.simulationState.agentSelected){
                    span.classList.add("active");
                }
                else{
                    span.classList.remove("active");
                }
            }
        });

        /* EVENT LISTENERS */

        // Deletes the agent
        this.element.querySelectorAll('button[name="deleteButton"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                store.dispatch('deleteAgent', {index: index});
            });
        });

        // Saves the agent's current position as initial position
        this.element.querySelectorAll('button[name="savePositionButton"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                let pos = window.game.env.agents[index].agent_body.reference_head_object.GetPosition().Clone();
                store.dispatch('setAgentInitPos', {index: index, init_pos: pos})
            });
        });

        // Resets the agent's initial position
        this.element.querySelectorAll('button[name="resetPositionButton"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                let agent = window.game.env.agents[index];
                agent.init_pos = null;
            });
        });

        // Follows the agent
        this.element.querySelectorAll('input[name="followSwitch"]').forEach((span, index) => {
            span.addEventListener('input', () => {
                store.dispatch('followAgent', {index: span.checked ? index : -1});
            });
            span.checked = store.state.simulationState.agentFollowed == store.state.agents[index];
        });

        // Renames the agent
        this.element.querySelectorAll('input[name="agentNameArea"]').forEach((span, index) => {
            span.addEventListener('keydown', (event) => {
                if(event.keyCode == '13'){
                    store.dispatch('renameAgent', {index: index, value: span.value});
                }
            });
        });

        /* Initializes tooltips */
        this.element.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el, index) => {
            return new bootstrap.Tooltip(el, {
                trigger: 'hover'
            });
        });
    }
};
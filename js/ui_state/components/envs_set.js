import Component from '../lib/component.js';
import store from '../store/index.js';

export default class EnvsSet extends Component{
    constructor() {
        super({
            store,
            element: document.querySelector('#getting-started')
        });
    }

    render(){
        // Base envs set
        let baseEnvs = this.element.querySelector('#baseEnvsSet');
        baseEnvs.innerHTML = store.state.baseEnvsSet.map(e => {
            return `<div class="col" name="env-set-item">
                        <div class="card bg-light h-100">
                            <img name="env_thumbnail" class="card-image-top" src=${e.image} alt=${e.description.name}>
                            <div class="card-body">
                                <h1 class="card-title"><strong>${e.description.name}</strong></h1>
                                <p class="card-text">${e.description.text}</p>
                            </div>
                            <div class="card-footer">
                                <button name="selectEnvBtn" class="btn btn-outline-success mx-1" type="button"> Select </button>
                            </div>  
                        </div>
                    </div>`
        }).join('');

        baseEnvs.querySelectorAll('button[name="selectEnvBtn"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                store.dispatch('loadEnv', store.state.baseEnvsSet[index]);
            })
        });

        // Custom envs set
        let customEnvs = this.element.querySelector('#customEnvsSet');
        let uploadCard = `<div class="col mb-3">
                            <div class="card h-100">
                                <img class="card-image-top" src="images/plus-solid.svg">                              
                                <div class="card-footer">
                                    <div class="input-group my-3">
                                        <div class="input-group-prepend">
                                            <button id="uploadEnvBtn" class="btn btn-warning" type="button"><i class="fas fa-upload"></i></button>
                                        </div>
                                        <div class="custom-file">
                                            <input id="uploadEnvFile" type="file" class="custom-file-input" accept=".json">
                                        </div>
                                    </div>
                                    <!--<button name="uploadEnvBtn" class="btn btn-warning" type="button">Upload an environment</button>-->
                                </div>
                            </div>
                        </div>`;
        let envCards = store.state.customEnvsSet.map((e, index) => {
            return `<div class="col mb-3" name="env-set-item">
                        <div class="card bg-light h-100">
                            <img name="env_thumbnail" class="card-image-top" src=${e.image} alt=${e.description.name}>
                            <div class="card-body">
                                <h1 class="card-title"><strong>${e.description.name}</strong></h1>
                                <p class="card-text">${e.description.text}</p>
                            </div>
                            <div class="card-footer">
                                <button name="selectEnvBtn" class="btn btn-outline-success mx-1" type="button"> Select </button>
                                <button name="downloadEnvBtn" class="btn btn-primary mx-1" type="button" data-toggle="tooltip" data-placement="top" title="Download the environment">
                                <i class="fas fa-download"></i></button>
                                <button name="deleteEnvBtn" class="btn btn-danger mx-1" type="button" data-toggle="tooltip" data-placement="top" title="Delete the environment">
                                <i class="fa fa-trash"></i></button>
                            </div>  
                        </div>
                    </div>`
        }).join('');

        customEnvs.innerHTML = [uploadCard, envCards].join('');

        customEnvs.querySelectorAll('button[name="selectEnvBtn"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                store.dispatch('loadEnv', store.state.customEnvsSet[index]);
            })
        });

        customEnvs.querySelectorAll('button[name="downloadEnvBtn"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                downloadObjectAsJson(store.state.customEnvsSet[index], store.state.customEnvsSet[index].description.name.split(' ').join('_'));
            })
        });

        customEnvs.querySelectorAll('button[name="deleteEnvBtn"]').forEach((span, index) => {
            span.addEventListener('click', () => {
                store.dispatch('deleteEnv', index);
            })
        });


    }
};
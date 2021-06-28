import store from './js/ui_state/store/index.js';
import MorphologySelect from './js/ui_state/components/morphology.js';
import AgentsList from './js/ui_state/components/agents_list.js';
import RunButtons from './js/ui_state/components/run_buttons.js';
import TerrainConfig from './js/ui_state/components/terrain_config.js';
import CreepersConfig from './js/ui_state/components/creepers_config.js';
import DrawingMode from "./js/ui_state/components/drawing_mode.js";
import AdvancedOptions from "./js/ui_state/components/advanced_options.js";
import EnvsSet from "./js/ui_state/components/envs_set.js";

// Save env modal setup

// Open the modal
window.openModal = (modal) => {
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = "block";
    modal.classList.add('show');
}

// Close the modal and clear the text fields
window.closeModal = (modal) => {
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.querySelectorAll('.text-field').forEach((span, index) => {
       span.value = "";
    });

}

const saveEnvModal = document.querySelector('#saveEnvModal');
const saveEnvButton = document.querySelector('#saveEnvButton');
saveEnvButton.addEventListener('click', () => {
    openModal(saveEnvModal);
});
saveEnvModal.querySelectorAll('.btn').forEach((span, index) => {
    span.addEventListener('click', () => {

        // if the confirm button is clicked
        if(span.getAttribute('id') == "save-confirm-btn"){

            // Get the name and description values
            let name = saveEnvModal.querySelector('#env-name').value;
            if(name == ""){
                name = "Custom Environment " + store.state.customEnvsSet.length;
            }
            let description = saveEnvModal.querySelector('#env-description').value;

            // Save the current pos of the agents
            for(let i = 0; i < store.state.agents.length; i++){
                store.dispatch('setAgentInitPos', {index: i, init_pos: window.game.env.agents[i].agent_body.reference_head_object.GetPosition().Clone()});
            }

            // Adjust the zoom and scroll to capture the thumbnail
            let previous_zoom = window.zoom;
            let previous_scroll = [...window.scroll];
            window.game.env.set_zoom(THUMBNAIL_ZOOM);
            window.game.env.set_scroll(null, THUMBNAIL_SCROLL_X, 0);
            window.game.env.render();

            // Create the state of the current env
            let env = {
                terrain: {
                    ground: [...window.ground],
                    ceiling: [...window.ceiling],
                    parkourConfig: Object.assign({}, store.state.parkourConfig),
                    creepersConfig: Object.assign({}, store.state.creepersConfig)
                },
                agents: [...store.state.agents],
                description: {
                    name: name,
                    text: description
                },
                // Capture the canvas to create the thumbnail of the env
                image: window.canvas.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
            };

            // Add the env to the custom set
            store.dispatch('addEnv',{set: 'custom', env: env});

            // Set back the zoom and scroll to the previous values
            window.game.env.set_zoom(previous_zoom);
            window.game.env.set_scroll(null, previous_scroll[0], previous_scroll[1]);
            window.game.env.render();
        }

        closeModal(saveEnvModal);
    });
});

// Morphology list setup
const morphologySelectInstance = new MorphologySelect();
morphologySelectInstance.render();

// Agents list setup
const agentListInstance = new AgentsList();
agentListInstance.render();

// Environments set setup
const envsSetInstance = new EnvsSet();
envsSetInstance.render();

// Run/Reset buttons setup
const runButton = document.querySelector("#runButton");
runButton.addEventListener('click', () => {
    store.dispatch('toggleRun', {});
});
const resetButton = document.querySelector("#resetButton");
resetButton.addEventListener('click', () => {
    store.dispatch('resetSimulation', {});
});
const runButtonsInstance = new RunButtons();
runButtonsInstance.render();

// Terrain sliders setup
const dim1SliderElement = document.querySelector("#dim1Slider")
dim1SliderElement.addEventListener('input', () => {
    store.dispatch('changeCppnCongfig', {
        name: "dim1",
        value: parseFloat(dim1SliderElement.value)
    });
});
const dim2SliderElement = document.querySelector("#dim2Slider")
dim2SliderElement.addEventListener('input', () => {
    store.dispatch('changeCppnCongfig', {
        name: "dim2",
        value: parseFloat(dim2SliderElement.value)
    });
});
const dim3SliderElement = document.querySelector("#dim3Slider")
dim3SliderElement.addEventListener('input', () => {
    store.dispatch('changeCppnCongfig', {
        name: "dim3",
        value: parseFloat(dim3SliderElement.value)
    });
});
const smoothingSliderElement = document.querySelector("#smoothingSlider")
smoothingSliderElement.addEventListener('input', () => {
    store.dispatch('changeCppnCongfig', {
        name: "smoothing",
        value: parseFloat(smoothingSliderElement.value)
    });
});
const waterSliderElement = document.querySelector("#waterSlider")
waterSliderElement.addEventListener('input', () => {
    store.dispatch('changeCppnCongfig', {
        name: "waterLevel",
        value: parseFloat(waterSliderElement.value)
    });
});

// Creepers setup
const creepersWidthSlider = document.querySelector("#creepersWidthSlider");
creepersWidthSlider.addEventListener('input', () => {
    store.dispatch('changeCreepersConfig', {
        name: "width",
        value: parseFloat(creepersWidthSlider.value)
    });
});
const creepersHeightSlider = document.querySelector("#creepersHeightSlider");
creepersHeightSlider.addEventListener('input', () => {
    store.dispatch('changeCreepersConfig', {
        name: "height",
        value: parseFloat(creepersHeightSlider.value)
    });
});
const creepersSpacingSlider = document.querySelector("#creepersSpacingSlider");
creepersSpacingSlider.addEventListener('input', () => {
    store.dispatch('changeCreepersConfig', {
        name: "spacing",
        value: parseFloat(creepersSpacingSlider.value)
    });
});
const creepersTypeSelect = document.querySelector("#creepersType");
creepersTypeSelect.addEventListener('input', () => {
    store.dispatch('changeCreepersConfig', {
        name: "type",
        value: creepersTypeSelect.value
    });
});

const terrainConfigInstance = new TerrainConfig();
terrainConfigInstance.render();
//const creepersConfigInstance = new CreepersConfig();
//creepersConfigInstance.render()

// Tabs buttons setup
const gettingStartedBtn = document.querySelector('#getting-started-tab');
gettingStartedBtn.addEventListener('click', () => {
    store.dispatch('switchTab', 'getting_started');
})
const parkourCustomTab = document.querySelector('#parkour-custom-btn');
parkourCustomTab.addEventListener('click', () => {
    // Show the "Draw Yourself!" subtab when opening the "Parkour Customization" tab
    if(store.state.activeTab != 'parkour_custom'){
        let drawTabBtn = document.querySelector('#draw-tab-btn');
        let drawYourselfTab = new bootstrap.Tab(drawTabBtn);
        drawYourselfTab.show();
        store.dispatch('switchTab', 'parkour_custom');
    }
});
const drawYourselfBtn = document.querySelector('#draw-tab-btn');
drawYourselfBtn.addEventListener('click', () => {
    store.dispatch('switchTab', 'draw_yourself');
});
const procGenBtn = document.querySelector('#proc-gen-tab-btn');
procGenBtn.addEventListener('click', () => {
    store.dispatch('switchTab', 'proc_gen');
});
const advancedOptionsBtn = document.querySelector('#advanced-options-tab');
advancedOptionsBtn.addEventListener('click', () => {
    store.dispatch('switchTab', 'advanced_options');
});

// Drawing Mode setup
const drawGroundButton = document.querySelector('#drawGroundButton');
drawGroundButton.addEventListener('click', () => {
    store.dispatch('drawGround', !store.state.drawingModeState.drawing_ground);
});
const drawCeilingButton = document.querySelector('#drawCeilingButton');
drawCeilingButton.addEventListener('click', () => {
    store.dispatch('drawCeiling', !store.state.drawingModeState.drawing_ceiling);
});
const eraseButton = document.querySelector('#eraseButton');
eraseButton.addEventListener('click', () => {
    store.dispatch('erase', !store.state.drawingModeState.erasing);
});
const clearButton = document.querySelector('#clearButton');
clearButton.addEventListener('click', () => {
    store.dispatch('clear', {});
});
const generateTerrainButton = document.querySelector('#generateTerrainButton');
generateTerrainButton.addEventListener('click', () => {
    store.dispatch('generateTerrain', store.state.drawingModeState.drawing);
});
const drawingModeInstance = new DrawingMode();
drawingModeInstance.render();

// Advanced Options setup
const drawJointsSwitch = document.querySelector("#drawJointsSwitch");
drawJointsSwitch.addEventListener('input', () => {
    store.dispatch('toggleSwitch', {name: 'drawJoints', value: drawJointsSwitch.checked} );
});
const drawLidarsSwitch = document.querySelector("#drawLidarsSwitch");
window.draw_lidars = true;
drawLidarsSwitch.addEventListener('input', () => {
    store.dispatch('toggleSwitch', {name: 'drawLidars', value: drawLidarsSwitch.checked});
});
const drawNamesSwitch = document.querySelector("#drawNamesSwitch");
window.draw_names = true;
drawNamesSwitch.addEventListener('input', () => {
    store.dispatch('toggleSwitch', {name: 'drawNames', value: drawNamesSwitch.checked});
});
const circleAssetButton = document.querySelector('#circleAssetButton');
circleAssetButton.addEventListener('click', () => {
    store.dispatch('drawAsset', {name: 'circle', value: !store.state.advancedOptionsState.assets.circle});
});
const advancedOptionsInstance = new AdvancedOptions();
advancedOptionsInstance.render();

// fetch morphologies
fetch('./policies.json')
    .then(resp => resp.text().then(body => {
        window.agent_policies = JSON.parse(body);
        return window.agent_policies;
    }))
    .then(types => {
        types.forEach(type => {
            type["morphologies"].forEach(morphology => {
                store.dispatch('addMorphology', {
                    morphology: morphology["morphology"],
                    seeds: morphology["seeds"].map((seed, index) => {
                        seed["idx"] = index;
                        return seed;
                    })
                });
            });
        });
    });
    /*.then(done => {
        store.dispatch('addDefaultAgent', {});
    });*/

// fetch environments set
fetch('./base_envs_set.json')
    .then(resp => resp.text().then(body => {
        return JSON.parse(body);
    }))
    .then(data => data['filenames'].forEach(filename => {
        fetch('./base_envs_set/' + filename)
            .then(resp => resp.text().then(body => {
                let env = JSON.parse(body);
                store.dispatch('addEnv',{set: 'base', env: env});
            }))
    }));

// interaction with index.js
window.cancelAgentFollow = () => {
    store.dispatch('followAgent', {index: -1, value: false});
}

window.is_drawing = function() {
    return store.state.drawingModeState.drawing;
}

window.is_drawing_ground = () => {
    return store.state.drawingModeState.drawing_ground;
}

window.is_drawing_ceiling = () => {
    return store.state.drawingModeState.drawing_ceiling;
}

window.is_erasing = () => {
    return store.state.drawingModeState.erasing;
}

window.is_drawing_circle = () => {
    return store.state.advancedOptionsState.assets.circle;
}

window.loadDefaultEnv = () => {
    // Load the Flat Parkour by default
    store.dispatch('loadEnv', store.state.baseEnvsSet.find(env => env.description.name.split(" ")[0] == "Flat"));
}

window.addDefaultAgent = () => {
    store.dispatch('addDefaultAgent', 'bipedal'); // 'bipedal', 'chimpanzee', 'fish
}

/*window.markCppnInitialized = () => {
    store.dispatch('markCppnInitialized', {});
}*/

window.clickOutsideCanvas = () => {
    store.dispatch('clickOutsideCanvas', {});
}

window.set_agent_selected = (index) => {
    let payload = {value: index != null, index: index}
    store.dispatch('selectAgent', payload);
}

window.delete_agent = (agent) => {
    store.dispatch('deleteAgent', {index: window.game.env.agents.indexOf(agent)});
}

window.downloadObjectAsJson = (exportObj, exportName) => {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

window.strUcFirst = (a) => {
    return (a+'').charAt(0).toUpperCase()+a.substr(1);
}

window.draw_forbidden_area = () => {
    forbidden_canvas.clear();
    forbidden_canvas.stroke("#FF0000");
    forbidden_canvas.strokeWeight(3);
    forbidden_canvas.fill(255, 50, 0, 75);
    let w = convertPosEnvToCanvas((INITIAL_TERRAIN_STARTPAD - 1) * TERRAIN_STEP, 0).x;
    forbidden_canvas.rect(0, 0, w, RENDERING_VIEWER_H + 2 * SCROLL_MAX);
}
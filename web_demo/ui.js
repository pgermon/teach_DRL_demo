import store from './js/ui_state/store/index.js';
import MorphologiesList from './js/ui_state/components/morphologies_list.js';
import AgentsList from './js/ui_state/components/agents_list.js';
import MainButtons from './js/ui_state/components/main_buttons.js';
import ParkourConfig from './js/ui_state/components/parkour_config.js';
import DrawingMode from "./js/ui_state/components/drawing_mode.js";
import AdvancedOptions from "./js/ui_state/components/advanced_options.js";
import EnvsSet from "./js/ui_state/components/envs_set.js";

/**
 * Opens the given modal.
 * @param modal {HTMLDivElement}
 */
window.openModal = (modal) => {
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.display = "block";
    modal.classList.add('show');
}

/**
 * Closes the given modal and clears the text fields.
 * @param modal {HTMLDivElement}
 */
window.closeModal = (modal) => {
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.querySelectorAll('.text-field').forEach((span, index) => {
       span.value = "";
    });
}

// Save env modal setup
const saveEnvModal = document.querySelector('#saveEnvModal');
saveEnvModal.querySelectorAll('.btn').forEach((span, index) => {
    span.addEventListener('click', () => {

        // If the confirm button is clicked
        if(span.getAttribute('id') == "save-confirm-btn"){

            // Gets the name and description values
            let name = saveEnvModal.querySelector('#env-name').value;
            if(name == ""){
                name = "Custom Environment " + store.state.envsSets.customEnvsSet.length;
            }
            let description = saveEnvModal.querySelector('#env-description').value;

            // Saves the current position of the agents
            for(let i = 0; i < store.state.agents.length; i++){
                store.dispatch('setAgentInitPos', {index: i, init_pos: window.game.env.agents[i].agent_body.reference_head_object.GetPosition().Clone()});
            }

            // Adjusts the zoom and scroll to capture the thumbnail
            let previous_zoom = window.game.env.zoom;
            let previous_scroll = [...window.game.env.scroll];
            window.game.env.set_zoom(THUMBNAIL_ZOOM);
            window.game.env.set_scroll(null, THUMBNAIL_SCROLL_X, 0);
            window.game.env.render();

            // Creates the state of the current env
            let env = {
                terrain: {
                    ground: [...window.ground],
                    ceiling: [...window.ceiling],
                    parkourConfig: Object.assign({}, store.state.parkourConfig.terrain),
                    creepersConfig: Object.assign({}, store.state.parkourConfig.creepers)
                },
                agents: [...store.state.agents],
                description: {
                    name: name,
                    text: description
                },
                // Captures the canvas to create the thumbnail of the env
                image: window.canvas.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")
            };

            // Adds the env to the custom set
            store.dispatch('addEnv',{set: 'custom', env: env});

            // Sets back the zoom and scroll to the previous values
            window.game.env.set_zoom(previous_zoom);
            window.game.env.set_scroll(null, previous_scroll[0], previous_scroll[1]);
            window.game.env.render();
        }

        closeModal(saveEnvModal);
    });
});

// Main buttons setup
const runButton = document.querySelector("#runButton");
runButton.addEventListener('click', () => {
    store.dispatch('toggleRun', {});
});
const resetButton = document.querySelector("#resetButton");
resetButton.addEventListener('click', () => {
    store.dispatch('resetSimulation', {});
});
const saveEnvButton = document.querySelector('#saveEnvButton');
saveEnvButton.addEventListener('click', () => {
    openModal(saveEnvModal);
});
const mainButtonsInstance = new MainButtons();
mainButtonsInstance.render();

// Morphologies list setup
const morphologiesListInstance = new MorphologiesList();
morphologiesListInstance.render();

// Agents list setup
const agentListInstance = new AgentsList();
agentListInstance.render();

// Environments set setup
const envsSetInstance = new EnvsSet();
envsSetInstance.render();

// Parkour config parameters setup
const dim1SliderElement = document.querySelector("#dim1Slider")
dim1SliderElement.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "dim1",
        value: parseFloat(dim1SliderElement.value)
    });
});
const dim2SliderElement = document.querySelector("#dim2Slider")
dim2SliderElement.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "dim2",
        value: parseFloat(dim2SliderElement.value)
    });
});
const dim3SliderElement = document.querySelector("#dim3Slider")
dim3SliderElement.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "dim3",
        value: parseFloat(dim3SliderElement.value)
    });
});
const smoothingSliderElement = document.querySelector("#smoothingSlider")
smoothingSliderElement.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "smoothing",
        value: parseFloat(smoothingSliderElement.value)
    });
});
const waterSliderElement = document.querySelector("#waterSlider")
waterSliderElement.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "waterLevel",
        value: parseFloat(waterSliderElement.value)
    });
});
const creepersWidthSlider = document.querySelector("#creepersWidthSlider");
creepersWidthSlider.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "width",
        value: parseFloat(creepersWidthSlider.value)
    });
});
const creepersHeightSlider = document.querySelector("#creepersHeightSlider");
creepersHeightSlider.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "height",
        value: parseFloat(creepersHeightSlider.value)
    });
});
const creepersSpacingSlider = document.querySelector("#creepersSpacingSlider");
creepersSpacingSlider.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "spacing",
        value: parseFloat(creepersSpacingSlider.value)
    });
});
const creepersTypeSelect = document.querySelector("#creepersType");
creepersTypeSelect.addEventListener('input', () => {
    store.dispatch('changeParkourConfig', {
        name: "type",
        value: creepersTypeSelect.value
    });
});
const parkourConfigInstance = new ParkourConfig();
parkourConfigInstance.render();

// Tabs buttons setup
const gettingStartedBtn = document.querySelector('#getting-started-btn');
gettingStartedBtn.addEventListener('click', () => {
    store.dispatch('switchTab', 'getting_started');
})
const parkourCustomTab = document.querySelector('#parkour-custom-btn');
parkourCustomTab.addEventListener('click', () => {
    // Shows the "Draw Yourself!" subtab when opening the "Parkour Customization" tab
    if(store.state.activeTab != 'draw_yourself' && store.state.activeTab != 'proc_gen'){
        let drawTabBtn = document.querySelector('#draw-tab-btn');
        let drawYourselfTab = new bootstrap.Tab(drawTabBtn);
        drawYourselfTab.show();
        store.dispatch('switchTab', 'draw_yourself');
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
const advancedOptionsBtn = document.querySelector('#advanced-options-btn');
advancedOptionsBtn.addEventListener('click', () => {
    store.dispatch('switchTab', 'advanced_options');
});
const aboutDRLBtn = document.querySelector('#about-drl-btn');
aboutDRLBtn.addEventListener('click', () => {
    store.dispatch('switchTab', 'about_drl');
});

// Drawing Mode buttons setup
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

/*
 * Fetches the available morphologies and policies from the JSON file
 */
fetch('./policies.json')
    .then(resp => resp.text().then(body => {
        window.agent_policies = JSON.parse(body);
        return window.agent_policies;
    }))
    .then(types => {
        types.forEach(type => {
            type["morphologies"].forEach(morphology => {

                // Adds the morphology with its compatible policies to the list of morphologies
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

/*
 * Fetches the base environments from the JSON file.
 * The JSON file must contain a list of the names of all the files contained in the 'base_envs_set' folder.
 */
fetch('./base_envs_set.json')
    .then(resp => resp.text().then(body => {
        return JSON.parse(body);
    }))
    .then(data => data['filenames'].forEach(filename => {

        // Fetches each JSON env file and parses them to get the corresponding environment
        fetch('./base_envs_set/' + filename)
            .then(resp => resp.text().then(body => {
                let env = JSON.parse(body);

                // Adds the environment contained in the JSON file to the base set
                store.dispatch('addEnv',{set: 'base', env: env});
            }))
    }));

/* Utility functions that require access to 'store' */

/**
 * Wrapper for init_game() with default parameters.
 */
window.init_default = () => {
    let terrainConfig = store.state.parkourConfig.terrain;
    let creepersConfig = store.state.parkourConfig.creepers;
    init_game(
        [terrainConfig.dim1, terrainConfig.dim2, terrainConfig.dim3],
        terrainConfig.waterLevel,
        creepersConfig.width,
        creepersConfig.height,
        creepersConfig.spacing,
        terrainConfig.smoothing,
        creepersConfig.type == 'Swingable',
        window.ground,
        window.ceiling,
        window.align_terrain
    );
}

/**
 * Indicates whether the drawing is active.
 * @returns {boolean}
 */
window.is_drawing = () => {
    return store.state.drawingModeState.drawing;
}

/**
 * Indicates whether the drawing_ground is active.
 * @returns {boolean}
 */
window.is_drawing_ground = () => {
    return store.state.drawingModeState.drawing_ground;
}

/**
 * Indicates whether the drawing_ceiling is active.
 * @returns {boolean}
 */
window.is_drawing_ceiling = () => {
    return store.state.drawingModeState.drawing_ceiling;
}

/**
 * Indicates whether the erasing is active.
 * @returns {boolean}
 */
window.is_erasing = () => {
    return store.state.drawingModeState.erasing;
}

/**
 * Indicates whether the drawing_circle is active.
 * @returns {boolean}
 */
window.is_drawing_circle = () => {
    return store.state.advancedOptionsState.assets.circle;
}

/**
 * Generates the terrain from the drawing (true) or vice-versa (false).
 * @param payload {boolean}
 */
window.generateTerrain = (payload) => {
    store.dispatch('generateTerrain', payload);
}

/**
 * Loads the default environment (Flat Parkour).
 */
window.loadDefaultEnv = () => {
    let defaultEnv = store.state.envsSets.baseEnvsSet.find(env => env.description.name.split(" ")[0] == "Flat");
    store.dispatch('loadEnv', defaultEnv != null ? defaultEnv : store.state.envsSets.baseEnvsSet[0]);
}

/**
 * Handles mouse clicks outside the canvas.
 */
window.clickOutsideCanvas = () => {
    store.dispatch('clickOutsideCanvas', {});
}

/**
 * Handles agent selection according to the given index.
 * @param index {number} - Index of the agent to select in the list of agents
 */
window.set_agent_selected = (index) => {
    store.dispatch('selectAgent', {index: index});
}

/**
 * Handles agent following according to the given index.
 * @param index {number} - Index of the agent to select in the list of agents
 */
window.set_agent_followed = (index) => {
    store.dispatch('followAgent', {index: index});
}

/**
 * Handles agent deletion.
 * @param agent {Object} - Agent to delete
 */
window.delete_agent = (agent) => {
    store.dispatch('deleteAgent', {index: window.game.env.agents.indexOf(agent)});
}

/**
 * Exits intro tour.
 */
window.exit_intro_tour = () => {
    store.dispatch('exitIntroTour', {});
}
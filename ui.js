import store from './js/ui_state/store/index.js';
import MorphologySelect from './js/ui_state/components/morphology.js';
import AgentsList from './js/ui_state/components/agents_list.js';
import RunButtons from './js/ui_state/components/run_buttons.js';
import TerrainConfig from './js/ui_state/components/terrain_config.js';
import CreepersConfig from './js/ui_state/components/creepers_config.js';
import DrawingMode from "./js/ui_state/components/drawing_mode.js";
import AdvancedOptions from "./js/ui_state/components/advanced_options.js";
import EnvsSet from "./js/ui_state/components/envs_set.js";

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

const saveEnvButton = document.querySelector('#saveEnvButton');
saveEnvButton.addEventListener('click', () => {

    // Save the current pos of the agents
    for(let i = 0; i < store.state.agents.length; i++){
        store.dispatch('setAgentInitPos', {index: i, init_pos: window.game.env.agents[i].agent_body.reference_head_object.GetPosition().Clone()});
    }

    let env = {
        terrain: {
            ground: [...window.ground],
            ceiling: [...window.ceiling],
            parkourConfig: Object.assign({}, store.state.parkourConfig),
            creepersConfig: Object.assign({}, store.state.creepersConfig)
        },
        agents: [...store.state.agents],
        description: {
            name: 'Custom Parkour ' + store.state.customEnvsSet.length,
            text: 'My custom parkour.'
        },
        image: 'images/envs_thumbnails/flat_parkour_bipedal.png'
    };
    store.dispatch('addEnv',{set: 'custom', env: env});
});

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
const terrainConfigInstance = new TerrainConfig();
terrainConfigInstance.render();

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
const creepersConfigInstance = new CreepersConfig();
creepersConfigInstance.render()

// Tabs buttons setup
const gettingStartedBtn = document.querySelector('#getting-started-tab');
gettingStartedBtn.addEventListener('click', () => {
    store.dispatch('switchTab', 'getting_started');
})
const parkourCustomTab = document.querySelector('#parkour-custom-btn');
parkourCustomTab.addEventListener('click', () => {
    if(store.state.activeTab.main != 'parkour_custom'){
        let drawTabBtn = document.querySelector('#draw-tab-btn');
        let drawYourselfTab = new bootstrap.Tab(drawTabBtn);
        drawYourselfTab.show();
    }
    store.dispatch('switchTab', 'parkour_custom'); // true for "Parkour Customization" and "Draw Yourself!" tab, else false
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

/*const loadEnvButton = document.querySelector('#loadEnvButton');
loadEnvButton.addEventListener('click', () => {
    let file = document.querySelector('#loadEnvFile').files[0]
    store.dispatch('loadEnv', {});
});*/
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
    })
    .then(done => {
        store.dispatch('addDefaultAgent', {});
    });

// fetch environments set
let env0 = {
    terrain: {
        ground: [
            {x: INITIAL_TERRAIN_STARTPAD * TERRAIN_STEP, y: TERRAIN_HEIGHT},
            {x: (INITIAL_TERRAIN_STARTPAD + TERRAIN_LENGTH) * TERRAIN_STEP, y: TERRAIN_HEIGHT}
            ],
        ceiling: [
            {x: INITIAL_TERRAIN_STARTPAD * TERRAIN_STEP, y: TERRAIN_HEIGHT + 200 / 10},
            {x: (INITIAL_TERRAIN_STARTPAD + TERRAIN_LENGTH) * TERRAIN_STEP, y: TERRAIN_HEIGHT + 200 / 10}
            ],
        parkourConfig: {
            dim1: 0,
            dim2: 0,
            dim3: 0,
            smoothing: 10,
            waterLevel: 0,
        },
        creepersConfig: {
            width: 0.2,
            height: 0.2,
            spacing: 5,
            type: 'Rigid'
        }
    },
    agents: [
        {
            morphology: 'bipedal',
            name: 'Joe',
            path: 'policy_models/walker/bipedal/16-02_old_walker_parkour_student_sac_v0.1.1_teacher_ALP-GMM_s1',
            init_pos: null,
        }
    ],
    description: {
        name: 'Flat parkour + bipedal',
        text: 'This parkour is completely flat, perfect for bipedal walkers.'
    },
    image: "images/envs_thumbnails/flat_parkour_bipedal.png"
};

let env1 = {
    terrain: {
        ground: [],
        ceiling: [],
        parkourConfig: {
            dim1: 1,
            dim2: 0.95,
            dim3: 0,
            smoothing: 25,
            waterLevel: 0,
        },
        creepersConfig: {
            width: 0.3,
            height: 2.5,
            spacing: 1,
            type: 'Swingable'
        }
    },
    agents: [
        {
            morphology: 'chimpanzee',
            name: 'Tarzan',
            path: 'policy_models/climber/chimpanzee/25-01_test_easy_climbing_parkour_CPPN_input_space_small_max_water_level_0.2_walker_type_climbing_profile_chimpanzee_teacher_Random_s11',
            init_pos: null,
        }
    ],
    description: {
        name: 'Easy parkour + chimpanzee',
        text: 'This parkour features creepers hanging from the ceiling and allowing a chimpanzee to swing from one to another.'
    },
    image: "images/envs_thumbnails/easy_parkour_chimpanzee.png"
};

let env2 = {
    terrain: {
        ground: [],
        ceiling: [],
        parkourConfig: {
            dim1: 0,
            dim2: -1,
            dim3: 0,
            smoothing: 10,
            waterLevel: 1
        },
        creepersConfig: {
            width: 0.2,
            height: 0.2,
            spacing: 5,
            type: 'Swingable'
        }
    },
    agents: [
        {
            morphology: 'fish',
            name: 'Nemo',
            path: 'policy_models/swimmer/fish/04-01_benchmark_parkour_RIAC_walker_type_fish_s12',
            init_pos: null,
        }
    ],
    description: {
        name: 'Water parkour + fish',
        text: 'This parkour is totally underwater, allowing fish to evolve in it.'
    },
    image: "images/envs_thumbnails/water_parkour_fish.png"
};
store.dispatch('addEnv', {set: 'base', env: env0});
store.dispatch('addEnv', {set: 'base', env: env1});
store.dispatch('addEnv', {set: 'base', env: env2});

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

window.addDefaultAgent = () => {
    store.dispatch('addDefaultAgent', 'bipedal'); // 'bipedal', 'chimpanzee', 'fish
}

window.markCppnInitialized = () => {
    store.dispatch('markCppnInitialized', {});
}

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
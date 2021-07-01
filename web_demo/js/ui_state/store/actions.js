// Mapping for the morphology names
const bodyTypeMapping = new Map();
bodyTypeMapping.set("bipedal", "classic_bipedal");
bodyTypeMapping.set("classic_bipedal", "classic_bipedal");
bodyTypeMapping.set("chimpanzee", "climbing_profile_chimpanzee");
bodyTypeMapping.set("climbing_profile_chimpanzee", "climbing_profile_chimpanzee");
bodyTypeMapping.set("fish", "fish");

// Names for the different policies of each morphology
const seed_names = {
    bipedal: ['Joe', 'Alice', 'Bob', 'Susan'],
    chimpanzee: ['Tarzan', 'Kong', 'Caesar', 'Rafiki'],
    fish: ['Nemo', 'Dory', 'Oscar', 'Bubbles']
};

// All available actions
export default {
    addEnv(context, payload){
        context.commit('addEnv', payload);
    },
    deleteEnv(context, payload){
        context.commit('deleteEnv', payload);
    },
    loadEnv(context, payload){
        drawing_canvas.clear();
        window.terrain = {
            ground: [],
            ceiling: []
        };
        window.ground = [...payload.terrain.ground];
        window.ceiling = [...payload.terrain.ceiling];

        // Updates the values of the terrain sliders
        for(let param in payload.terrain.parkourConfig){
            context.commit('updateParkourConfig', {name: param, value: payload.terrain.parkourConfig[param]});
        }
        for(let param in payload.terrain.creepersConfig){
            context.commit('updateParkourConfig', {name: param, value: payload.terrain.creepersConfig[param]});
        }

        // Replaces previous agents by the ones of the env
        while (context.state.agents.length > 0){
            context.commit('deleteAgent', {index: 0});
        }
        for(let agent of payload.agents){
            context.commit('addAgent', {
                morphology: bodyTypeMapping.get(agent.morphology),
                name: agent.name,
                path: agent.path,
                init_pos: agent.init_pos
            });
        }
        context.commit('init_default', {});

    },
    changeParkourConfig(context, payload){

        // Case one of the cppn dims is changed : aligns the terrain with the startpad
        if(['dim1', 'dim2', 'dim3'].indexOf(payload.name) != -1){

            window.ground = [];
            window.ceiling = [];
            window.align_terrain = {
                align: true,
                ceiling_offset: null, // aligns the ceiling with the startpad
                ground_offset: null, // aligns the ground with the startpad
                smoothing: window.game.env.TERRAIN_CPPN_SCALE // previous smoothing
            };
        }
        // Case smoothing, water_level or creepers is changed
        else{
            window.align_terrain = {
                align: true,
                ceiling_offset: window.align_terrain.ceiling_offset, // keeps the same
                ground_offset: window.align_terrain.ground_offset, // keeps the same
                smoothing: window.game.env.TERRAIN_CPPN_SCALE // previous smoothing
            };
        }

        context.commit('updateParkourConfig', payload);

        if(context.state.drawingModeState.drawing){
            context.commit('generateTerrain', true);
        }
        drawing_canvas.clear();
        window.terrain = {
            ground: [],
            ceiling: []
        };
        context.commit('resetSimulation', {keepPositions: true});
    },
    toggleSwitch(context, payload) {
        switch (payload.name) {
            case 'drawJoints':
                context.commit('drawJoints', payload.value);
                break;
            case 'drawLidars':
                context.commit('drawLidars', payload.value);
                break;
            case 'drawNames':
                context.commit('drawNames', payload.value);
                break;
        }
    },
    toggleRun(context, payload) {
        const status = context.state.simulationState.status;
        switch (status) {
            case 'init':
                context.commit('startSimulation', {});
                break;
            case 'running':
                context.commit('pauseSimulation', {});
                break;
            case 'paused':
                context.commit('startSimulation', {});
                break;
        }
    },
    resetSimulation(context, payload) {
        window.align_terrain = {
            align: true, // aligns the terrain with the startpad
            ceiling_offset: window.ceiling.length > 0 ? window.game.env.ceiling_offset - window.ceiling[0].y : null,
            ground_offset: window.ground.length > 0 ? window.ground[0].y : null, // first ground y value
            smoothing: window.game.env.TERRAIN_CPPN_SCALE // smoothing of the current terrain
        };
        context.commit('resetSimulation', {keepPositions: false});
    },
    addAgent(context, payload) {
        if (context.state.simulationState.status == 'running') {
            context.commit('pauseSimulation', {});
        }
        context.commit('addAgent', payload);
    },
    deleteAgent(context, payload) {
        context.commit('deleteAgent', payload);
    },
    setAgentInitPos(context, payload){
        context.commit('setAgentInitPos', payload);
    },
    selectAgent(context, payload){
        context.commit('selectAgent', payload);
    },
    followAgent(context, payload) {
        context.commit('followAgent', payload);
    },
    renameAgent(context, payload){
        context.commit('renameAgent', payload);
    },
    selectSeedIdx(context, payload) {
        context.commit('selectSeedIdx', payload);
    },
    addMorphology(context, payload) {
        context.commit('addMorphology', payload);
    },
    switchTab(context, payload) {
        if(context.state.activeTab == 'parkour_custom'){
            if(payload != 'parkour_custom'){
                if(context.state.drawingModeState.drawing && payload != 'draw_yourself'){
                    context.commit('generateTerrain', true);
                }
                else if(payload == 'draw_yourself'){
                    drawing_canvas.clear();
                    window.terrain = {
                        ground: [],
                        ceiling: []
                    };
                    context.commit('generateTerrain', false);
                }
            }
        }
        else if(payload == 'parkour_custom'){
            context.commit('generateTerrain', false);
            payload = 'draw_yourself';
        }
        context.commit('switchTab', payload);
    },
    drawGround(context, payload) {
        context.commit('drawGround', payload);
    },
    drawCeiling(context, payload) {
        context.commit('drawCeiling', payload);
    },
    erase(context, payload) {
        context.commit('erase', payload);
    },
    clear(context, payload) {
        context.commit('clear', payload);
    },
    generateTerrain(context, payload){
        context.commit('generateTerrain', payload);
    },
    clickOutsideCanvas(context, payload){
      context.commit('deselectDrawingTools', payload);
    },
    drawAsset(context, payload){
        switch (payload.name){
            case 'circle':
                context.commit('drawCircle', payload.value);
                break;
        }
    },
};
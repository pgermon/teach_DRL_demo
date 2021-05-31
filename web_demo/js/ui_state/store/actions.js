const bodyTypeMapping = new Map();
bodyTypeMapping.set("bipedal", "classic_bipedal");
bodyTypeMapping.set("chimpanzee", "climbing_profile_chimpanzee");
bodyTypeMapping.set("fish", "fish");

const seed_names = {
    bipedal: ['Joe', 'Alice', 'Bob', 'Susan'],
    chimpanzee: ['Tarzan', 'Kong', 'Caesar', 'Rafiki'],
    fish: ['Nemo', 'Dory', 'Oscar', 'Bubbles']
};

export default {
    markCppnInitialized(context, payload) {
        context.commit('markCppnInitialized', payload);
    },
    addDefaultAgent(context, payload) {
        const state = context.state;

        if (state.cppnInitialized && state.morphologies.length != 0 && !state.defaultAgentAdded) {
            context.commit('disableDefaultAgent', payload);
            const morphology = bodyTypeMapping.get(context.state.currentMorphology);
            const currentSeed = context.state.morphologies
                .filter(m => m.morphology == context.state.currentMorphology)
                .flatMap(morphology => morphology.seeds)
                .find(seed => seed.idx == context.state.currentSeedIdx);
            //const name = context.state.currentMorphology + "_" + currentSeed.seed;
            const name = seed_names[context.state.currentMorphology][context.state.currentSeedIdx];
            const path = currentSeed.path;
            context.commit('addAgent', {
                morphology: morphology,
                name: name,
                path: path,
            });
        }
    },
    changeCreepersConfig(context, payload) {
        context.commit('updateCreepersConfig', payload);
        context.commit('resetSimulation', {keepPositions: true});
    },
    changeCppnCongfig(context, payload) {
        context.commit('updateCppnConfig', payload);
        if(['dim1', 'dim2', 'dim3'].indexOf(payload.name) != -1){
            window.ground = [];
            window.ceiling = [];
            window.align_terrain = {
                align: true,
                ceiling_offset: null,
                ground_offset: null,
                smoothing: window.game.env.TERRAIN_CPPN_SCALE
            };
        }
        else{
            window.align_terrain = {
                align: true,
                ceiling_offset: window.align_terrain.ceiling_offset,
                ground_offset: window.align_terrain.ground_offset,
                smoothing: window.game.env.TERRAIN_CPPN_SCALE
            };
        }
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
                // read the draw switches state;
                context.commit('drawJoints', context.state.advancedOptionsState.drawJoints);
                context.commit('drawLidars', context.state.advancedOptionsState.drawLidars);
                context.commit('drawNames', context.state.advancedOptionsState.drawNames);
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
        context.commit('resetSimulation', {keepPositions: false});
    },
    addAgent(context, payload) {
        if (context.state.simulationState.status == 'running') {
            context.commit('pauseSimulation', {});
        }

        const morphology = bodyTypeMapping.get(context.state.currentMorphology);
        const currentSeed = context.state.morphologies
            .filter(m => m.morphology == context.state.currentMorphology)
            .flatMap(morphology => morphology.seeds)
            .find(seed => seed.idx == context.state.currentSeedIdx);
        //const name = context.state.currentMorphology + "_" + currentSeed.seed;
        const name = seed_names[context.state.currentMorphology][context.state.currentSeedIdx];
        const path = currentSeed.path;
        context.commit('addAgent', {
            morphology: morphology,
            name: name,
            path: path,
        });
    },
    deleteAgent(context, payload) {
        context.commit('deleteAgent', payload);
    },
    followAgent(context, payload) {
        context.commit('followAgent', payload);
    },
    renameAgent(context, payload){
        context.commit('renameAgent', payload);
    },
    selectMorphology(context, payload) {
        context.commit('selectMorphology', payload);
    },
    selectSeedIdx(context, payload) {
        context.commit('selectSeedIdx', payload);
    },
    addMorphology(context, payload) {
        context.commit('addMorphology', payload);
    },
    switchTab(context, payload) {
        // If a tab other than "Draw Yourself!" is selected during the drawing is activated, the terrain is generated
        if(!payload && context.state.drawingModeState.drawing){
            context.commit('generateTerrain', false);
        }
        // If the "Draw Yourself!" tab is selected during the drawing is not activated, the drawings are cleared
        else if(payload && !context.state.drawingModeState.drawing){
            drawing_canvas.clear();
            window.terrain = {
                ground: [],
                ceiling: []
            };
        }
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
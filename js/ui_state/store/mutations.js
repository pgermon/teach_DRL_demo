export default {
    addEnv(state, payload){
        if(payload.set == 'base'){
            state.baseEnvsSet.push(payload.env);
        }
        else if(payload.set == 'custom'){
            state.customEnvsSet.push(payload.env);
        }
      return state;
    },
    deleteEnv(state, payload){
        state.customEnvsSet.splice(payload, 1);
        return state;
    },
    markCppnInitialized(state, payload) {
        state.cppnInitialized = true;
        return state;
    },
    disableDefaultAgent(state, payload) {
        state.defaultAgentAdded = true;
        return state;
    },
    updateCreepersConfig(state, payload) {
        switch (payload.name) {
            case 'width':
                state.creepersConfig.width = payload.value;
                break;
            case 'height':
                state.creepersConfig.height = payload.value;
                break;
            case 'spacing':
                state.creepersConfig.spacing = payload.value;
                break;
            case 'type':
                state.creepersConfig.type = payload.value;
                break;
        }
        return state;
    },
    updateCppnConfig(state, payload) {
        switch (payload.name) {
            case 'dim1':
                state.parkourConfig.dim1 = payload.value;
                break;
            case 'dim2':
                state.parkourConfig.dim2 = payload.value;
                break;
            case 'dim3':
                state.parkourConfig.dim3 = payload.value;
                break;
            case 'smoothing':
                state.parkourConfig.smoothing = payload.value;
                break;
            case 'waterLevel':
                state.parkourConfig.waterLevel = payload.value;
                break;
        }
        return state;
    },
    init_default(state, payload){
        state.simulationState.status = 'init';
        window.align_terrain = {
            align: false, // no alignment
            ceiling_offset: window.ceiling.length > 0 ? window.game.env.ceiling_offset - window.ceiling[0].y : null,
            ground_offset: window.ground.length > 0 ? window.ground[0].y : null, // first ground y value
            smoothing: window.game.env.TERRAIN_CPPN_SCALE // current smoothing
        };
        window.init_default();
        return state;
    },
    startSimulation(state, payload) {
        state.simulationState.status = 'running';
        window.game.run();
        return state;
    },
    pauseSimulation(state, payload) {
        window.game.pause();
        state.simulationState.status = 'paused';
        return state;
    },
    resetSimulation(state, payload) {
        state.simulationState.status = 'init';
        const morphologies = state.agents.map(a => a.morphology);
        const policies = state.agents.map(a => { 
            return {
                name: a.name, 
                path: a.path
            };
        });
        let positions;
        if (payload.keepPositions) {
            positions = [...state.agents.map((agent, index) => window.game.env.agents[index].agent_body.reference_head_object.GetPosition())];
        } else {
            positions = [...state.agents.map((agent, index) => window.game.env.agents[index].init_pos)];
        }

        const parkourConfig = state.parkourConfig;
        const creepersConfig = state.creepersConfig;

        window.align_terrain = {
            align: true, // align the terrain with the startpad
            ceiling_offset: window.align_terrain.ceiling_offset, // keep the same
            ground_offset: window.align_terrain.ground_offset, // keep the same
            smoothing: window.game.env.TERRAIN_CPPN_SCALE // smoothing of the current terrain
        };

        window.game.reset(
            morphologies,
            policies,
            positions,
            [parkourConfig.dim1,parkourConfig.dim2,parkourConfig.dim3],
            parkourConfig.waterLevel,
            creepersConfig.width,
            creepersConfig.height,
            creepersConfig.spacing,
            parkourConfig.smoothing,
            creepersConfig.type == "Swingable",
            window.ground,
            window.ceiling,
            window.align_terrain);
        window.agent_selected = null;
        window.game.env.set_zoom(window.zoom);
        window.game.env.set_scroll(window.agent_selected, window.scroll[0], window.scroll[1]);
        window.game.env.render();
        return state;
    },
    addAgent(state, payload) {
        state.agents.push(payload);
        window.game.env.add_agent(payload.morphology, { name: payload.name, path: payload.path}, payload.init_pos);
        window.game.env.render();
        return state;
    },
    deleteAgent(state, payload) {
        state.agents.splice(payload.index, 1);
        window.game.env.delete_agent(payload.index);
        window.game.env.render();
        return state;
    },
    setAgentInitPos(state, payload){
        window.game.env.agents[payload.index].init_pos = payload.init_pos;
        state.agents[payload.index].init_pos = payload.init_pos;
        return state;
    },
    selectAgent(state, payload) {
        if(payload.value){
            window.agent_selected = window.game.env.agents[payload.index];
            state.simulationState.agentSelected = state.agents[payload.index];
        }
        else{
            window.agent_selected = null;
            state.simulationState.agentSelected = null;
        }
        return state;
    },
    followAgent(state, payload) {
        if(payload.value){
            window.follow_agent = payload.value;
            window.agent_selected = window.game.env.agents[payload.index];
            state.simulationState.agentFollowed = window.agent_selected;
        }
        else {
            window.follow_agent = false;
            window.agent_selected = null;
            state.simulationState.agentFollowed = null;
        }
        window.game.env.render();
        return state;
    },
    renameAgent(state, payload) {
        state.agents[payload.index].name = payload.value;
        window.game.env.agents[payload.index].name = payload.value;
        window.game.env.render();
        return state;
    },
    selectSeedIdx(state, payload) {
        //state.currentSeedIdx = payload.index;
        state.currentSeedsIdx[payload.morphology] = payload.index;
        return state;
    },
    addMorphology(state, payload) {
        state.morphologies.push(payload);
        state.currentSeedsIdx[payload.morphology] = 0;
        return state;
    },
    drawGround(state, payload){
        state.drawingModeState.drawing_ground = payload;
        state.drawingModeState.drawing_ceiling = false;
        state.drawingModeState.erasing = false;
        state.advancedOptionsState.assets.circle = false;
        return state;
    },
    drawCeiling(state, payload){
        state.drawingModeState.drawing_ground = false;
        state.drawingModeState.drawing_ceiling = payload;
        state.drawingModeState.erasing = false;
        state.advancedOptionsState.assets.circle = false;
        return state;
    },
    erase(state, payload){
        state.drawingModeState.drawing_ground = false;
        state.drawingModeState.drawing_ceiling = false;
        state.drawingModeState.erasing = payload;
        state.advancedOptionsState.assets.circle = false;
        return state;
    },
    clear(state, payload){
        state.drawingModeState.drawing = true;
        background("#E6F0FF");
        drawing_canvas.clear();
        window.ground = [];
        window.ceiling = [];
        window.terrain = {
            ground: [],
            ceiling: []
        };
        state.simulationState.status = 'init';
        window.game.env.set_zoom(INIT_ZOOM);
        window.game.env.set_scroll(null, INIT_SCROLL_X, 0);
        window.init_default();
        return state;
    },
    switchTab(state, payload) {
        if(payload == 'draw_yourself' || payload == 'proc_gen'){
            state.activeTab.main = 'parkour_custom';
            state.activeTab.sub = payload;
        }
        else{
            state.activeTab.main = payload;
            state.activeTab.sub = null;
        }
        return state;
    },
    generateTerrain(state, payload){
        state.drawingModeState.drawing = !payload;
        state.simulationState.status = 'init';

        window.game.env.set_zoom(INIT_ZOOM);
        window.game.env.set_scroll(null, -0.05 * RENDERING_VIEWER_W, 0);

        // Generate the terrain from the shapes drawn
        if(payload) {

            state.drawingModeState.drawing_ground = false;
            state.drawingModeState.drawing_ceiling = false;
            state.drawingModeState.erasing = false;
            state.advancedOptionsState.assets.circle = false;

            // Sort drawing values for ground and ceiling
            window.terrain.ground.sort(function (a, b) {
                return a.x - b.x;
            });
            window.ground = [...window.terrain.ground];

            window.terrain.ceiling.sort(function (a, b) {
                return a.x - b.x;
            });
            window.ceiling = [...window.terrain.ceiling];

            window.align_terrain = {
                align: false, // no alignment
                ceiling_offset: window.ceiling.length > 0 ? window.game.env.ceiling_offset - window.ceiling[0].y : null,
                ground_offset: window.ground.length > 0 ? window.ground[0].y : null, // first ground y value
                smoothing: window.game.env.TERRAIN_CPPN_SCALE // current smoothing
            };
            window.init_default();
        }

        // Return to drawing
        else {

            // Case no ground has been drawn yet
            if(window.terrain.ground.length == 0 && window.ground.length > 0){

                for(let i = 0; i < window.ground.length - 1; i++){
                    let p = window.ground[i];
                    let p2 = window.ground[i + 1];
                    let p_pos = convertPosEnvToCanvas(p.x, p.y);
                    let p2_pos = convertPosEnvToCanvas(p2.x, p2.y);

                    drawing_canvas.stroke("#66994D");
                    drawing_canvas.strokeWeight(4);
                    drawing_canvas.line(
                        p_pos.x,
                        p_pos.y + SCROLL_MAX - window.game.env.scroll[1],
                        p2_pos.x,
                        p2_pos.y + SCROLL_MAX - window.game.env.scroll[1]
                    )

                    window.terrain.ground.push({x: p.x, y: p.y});
                }
                let p = window.ground[window.ground.length - 1];
                window.terrain.ground.push({x: p.x, y: p.y});
            }

            // Case no ceiling has been drawn yet
            if(window.terrain.ceiling.length == 0 && window.ceiling.length > 0){

                for(let i = 0; i < window.ceiling.length - 1; i++){
                    let p = window.ceiling[i];
                    let p2 = window.ceiling[i + 1];
                    let p_pos = convertPosEnvToCanvas(p.x, p.y);
                    let p2_pos = convertPosEnvToCanvas(p2.x, p2.y);

                    drawing_canvas.stroke("#808080");
                    drawing_canvas.strokeWeight(4);
                    drawing_canvas.line(
                        p_pos.x,
                        p_pos.y + SCROLL_MAX - window.game.env.scroll[1],
                        p2_pos.x,
                        p2_pos.y + SCROLL_MAX - window.game.env.scroll[1]
                    )

                    window.terrain.ceiling.push({x: p.x, y: p.y});
                }
                let p = window.ceiling[window.ceiling.length - 1];
                window.terrain.ceiling.push({x: p.x, y: p.y});
            }

            window.ground = [];
            window.ceiling = [];
            window.init_default();
            image(drawing_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
        }
        return state;
    },
    deselectDrawingTools(state, payload){
        state.drawingModeState.drawing_ground = false;
        state.drawingModeState.drawing_ceiling = false;
        state.drawingModeState.erasing = false;
        state.advancedOptionsState.assets.circle = false;
        return state;
    },
    drawJoints(state, payload) {
        state.advancedOptionsState.drawJoints = payload;
        window.draw_joints = payload;
        window.game.env.render();
        return state;
    },
    drawLidars(state, payload) {
        state.advancedOptionsState.drawLidars = payload;
        window.draw_lidars = payload;
        window.game.env.render();
        return state;
    },
    drawNames(state, payload) {
        state.advancedOptionsState.drawNames = payload;
        window.draw_names = payload;
        window.game.env.render();
        return state;
    },
    drawCircle(state, payload){
        state.advancedOptionsState.assets.circle = payload;
        return state;
    }
};
export default {
    baseEnvsSet: [],
    customEnvsSet: [],
    morphologies: [],
    currentSeedsIdx: {},
    agents: [],
    simulationState: {
        status: 'init', // 'running', 'paused'
        agentFollowed: null,
        agentSelected: null,
    },
    activeTab:'getting_started', // 'getting_started', 'parkour_custom, 'advanced_options'
    parkourConfig: {
        dim1: 1.0,
        dim2: 0.95,
        dim3: 0,
        smoothing: 25,
        waterLevel: 0
    },
    creepersConfig: {
        width: 0.3,
        height: 2.5,
        spacing: 1,
        type: 'Swingable' // 'Rigid'
    },
    drawingModeState: {
        drawing: false,
        drawing_ground: false,
        drawing_ceiling: false,
        erasing: false,
    },
    advancedOptionsState: {
        drawJoints: false,
        drawLidars: true,
        drawNames: true,
        assets: {
            circle: false,
        },
    },
    //defaultAgentAdded: false,
    //cppnInitialized: false,
};
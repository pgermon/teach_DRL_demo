export default {
    morphologies: [],
    currentMorphology: "bipedal",
    currentSeedIdx: "0",
    agents: [],
    simulationState: {
        status: 'init', // 'running', 'paused'
        agentFollowed: null,
    },
    parkourConfig: {
        dim1: 1.0,
        dim2: 0.95,
        dim3: 0,
        smoothing: 20,
        waterLevel: 0
    },
    creepersConfig: {
        width: 0.3,
        height: 3,
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
    defaultAgentAdded: false,
    cppnInitialized: false,
};
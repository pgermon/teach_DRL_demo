import Component from '../lib/component.js';
import store from '../store/index.js';
export default class TerrainConfig extends Component {
    constructor() {
        super({
            store,
            element: document.querySelector('#parkour-custom-tab')
        });
    }
    render() {

        // TERRAIN CONFIG
        const parkourConfig = store.state.parkourConfig;

        this.element.querySelector("#dim1Slider").value = parkourConfig.dim1;
        this.element.querySelector("#dim2Slider").value = parkourConfig.dim2;
        this.element.querySelector("#dim3Slider").value = parkourConfig.dim3;
        this.element.querySelector("#smoothingSlider").value = parkourConfig.smoothing;
        this.element.querySelector("#waterSlider").value = parkourConfig.waterLevel;

        this.element.querySelector("#dim1Value").innerText = parkourConfig.dim1;
        this.element.querySelector("#dim2Value").innerText = parkourConfig.dim2;
        this.element.querySelector("#dim3Value").innerText = parkourConfig.dim3;
        this.element.querySelector("#smoothingValue").innerText = parkourConfig.smoothing;
        this.element.querySelector("#waterValue").innerText = parkourConfig.waterLevel;

        // CREEPERS CONFIG
        const creepersConfig = store.state.creepersConfig;

        this.element.querySelector("#creepersWidthSlider").value = creepersConfig.width;
        this.element.querySelector("#creepersHeightSlider").value = creepersConfig.height;
        this.element.querySelector("#creepersSpacingSlider").value = creepersConfig.spacing;

        this.element.querySelector("#creepersWidthValue").innerText = creepersConfig.width;
        this.element.querySelector("#creepersHeightValue").innerText = creepersConfig.height;
        this.element.querySelector("#creepersSpacingValue").innerText = creepersConfig.spacing;

        this.element.querySelector("#creepersType").value = creepersConfig.type;

    }
};
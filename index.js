
const body_type_mapping = new Map();

body_type_mapping.set("bipedal", "old_classic_bipedal");
body_type_mapping.set("chimpanzee", "climbing_profile_chimpanzee");

function init(agent_body_type, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type) {
    let canvas_id = 'main_screen2';

    const supported_body_type = body_type_mapping.get(agent_body_type);

    window.game = new ParkourGame(config, canvas_id, supported_body_type, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type);
    window.game.env.set_zoom(parseFloat(zoomSlider.value) * parseFloat(resizeCanvasSlider.value));
    window.game.env.set_scroll(hScrollSlider.value, vScrollSlider.value);
    window.game.env.render();
}

function init_default() {
    init(morphologyDropdown.value,
        [dim1Slider.value, dim2Slider.value, dim3Slider.value],
        waterSlider.value,
        creepersWidthSlider.value,
        creepersHeightSlider.value,
        creepersSpacingSlider.value,
        smoothingSlider.value,
        getCreepersType());
}

function createSelectOptGroup(group_name) {
    //const x = document.getElementById("models");
    const group = document.createElement("optgroup");
    group.label = group_name;
    group.text = group_name;
    //x.appendChild(group);
    return group;
}

function createSelectOption(option_name, path = null) {
    const option = document.createElement("option");
    option.text = option_name;
    if (path != null) {
        option.value = path;
    }
    return option;
}

function addAgentModel(modelName) {
    const x = document.getElementById("models");
    const option = document.createElement("option");
    option.text = modelName;
    x.add(option);
}

async function testAgentModelSelector() {
    fetch('./policies.json')
        .then(resp => resp.text().then(body => {
            window.agent_policies = JSON.parse(body);
            return window.agent_policies;
        }))
        .then(types => {
            const select_models = document.getElementById("models");
            const select_morphology = document.getElementById("morphology");

            types.forEach(type => {
                //console.log(type["type"]);
                //let type_group = createSelectOptGroup(type["type"]);
                //select.add(type_group);

                type["morphologies"].forEach(morphology => {
                    //console.log(morphology["morphology"]);
                    //let morph_group = createSelectOptGroup(morphology["morphology"]);
                    select_morphology.appendChild(createSelectOption(morphology["morphology"]));

                    if (morphologyDropdown.value == morphology["morphology"]) {
                        morphology["seeds"].forEach(seed => {
                            //console.log(seed["seed"] + ":" + seed["path"]);
                            //morph_group.appendChild(createSelectOption(type["type"] + " > " + morphology["morphology"] + " > " + seed["seed"]));
                            select_models.appendChild(createSelectOption(morphology["morphology"] + "_" + seed["seed"],
                                seed["path"]));
                        });
                    }
                    //type_group.appendChild(morph_group);
                });
                //select.appendChild(type_group);
            });

        });
}

let morphologyDropdown = document.getElementById("morphology");
morphologyDropdown.oninput = function () {
    init_default();
    let modelsDropdown = document.getElementById("models");
    let length = modelsDropdown.options.length;
    for (let i = length - 1; i >= 0; i--) {
        modelsDropdown.options[i] = null;
    }
    for (let type of window.agent_policies) {
        for (let morphology of type["morphologies"]) {
            if (morphology["morphology"] == this.value) {
                for (let seed of morphology["seeds"]) {
                    modelsDropdown.appendChild(createSelectOption(morphology["morphology"] + "_" + seed["seed"], seed["path"]));
                }
            }
        }
    }
}

async function renderAgentModelSelector() {
    fetch(`./models.csv`)
        .then(resp => resp.text().then(body => body.split(",")))
        .then(models => {
            models.forEach(model => {
                addAgentModel(model);
            });
        })
}

async function loadModel() {
    await testAgentModelSelector();
    //await renderAgentModelSelector();
    window.cppn_model = await tf.loadGraphModel('./js/CPPN/weights/same_ground_ceiling_cppn/tfjs_model/model.json');
    init(morphologyDropdown.value,
        [dim1Slider.value, dim2Slider.value, dim3Slider.value],
        waterSlider.value,
        creepersWidthSlider.value,
        creepersHeightSlider.value,
        creepersSpacingSlider.value,
        smoothingSlider.value,
        getCreepersType());
}


window.addEventListener("load", loadModel, false);

/* BUTTONS AND SLIDERS */

let runButton = document.getElementById("runButton");
runButton.onclick = function () {
    //const policy = document.getElementById("models").value;
    const policy = document.getElementById("models").value;
    window.game.run(policy).then(text => this.innerText = text);
}

let resetButton = document.getElementById("resetButton");
resetButton.onclick = function () {
    runButton.innerText = "Start";
    const supported_body_type = body_type_mapping.get(morphologyDropdown.value);
    window.game.reset(supported_body_type,
        [dim1Slider.value, dim2Slider.value, dim3Slider.value],
        waterSlider.value,
        creepersWidthSlider.value,
        creepersHeightSlider.value,
        creepersSpacingSlider.value,
        smoothingSlider.value,
        getCreepersType());
    window.game.env.set_zoom(parseFloat(zoomSlider.value) * parseFloat(resizeCanvasSlider.value));
    window.game.env.set_scroll(hScrollSlider.value, vScrollSlider.value);
    window.game.env.render();
}

let jointsButton = document.getElementById("jointsButton");
window.draw_joints = false;
jointsButton.onclick = function () {
    window.draw_joints = !window.draw_joints;
    window.game.env.render();
}

let lidarsButton = document.getElementById("lidarsButton");
window.draw_lidars = true;
lidarsButton.onclick = function () {
    window.draw_lidars = !window.draw_lidars;
    window.game.env.render();
}

let sensorsButton = document.getElementById("sensorsButton");
window.draw_sensors = false; // todo: fix the sensor rendering before enabling this
sensorsButton.onclick = function () {
    window.draw_sensors = !window.draw_sensors;
    window.game.env.render();
}

let followAgentButton = document.getElementById("followAgentButton");
followAgentButton.onclick = function () {
    window.follow_agent = !window.follow_agent;
    if (window.follow_agent) {
        window.game.env.set_scroll(0, 0);
    }
    window.game.env.render();
}

let resizeCanvasSlider = document.getElementById("resizeCanvasSlider");
resizeCanvasSlider.step = 0.01;
resizeCanvasSlider.value = 0.8;
resizeCanvasSlider.oninput = function () {
    //window.game.env._SET_RENDERING_VIEWPORT_SIZE(VIEWPORT_W * 2 * parseFloat(this.value), RENDERING_VIEWER_H, true);
    window.game.env._SET_RENDERING_VIEWPORT_SIZE(window.innerWidth * parseFloat(this.value), RENDERING_VIEWER_H, true);
    window.game.env.set_zoom(parseFloat(this.value) * parseFloat(zoomSlider.value));
    resizeCanvas(RENDERING_VIEWER_W, RENDERING_VIEWER_H);
}

/* SCROLL AND ZOOM */

// Horizontal scroll slider
let hScrollSlider = document.getElementById("hScrollSlider");
hScrollSlider.step = 0.1;
//let hScrollValue = document.getElementById("hScrollValue");
//hScrollValue.innerHTML = hScrollSlider.value; // Display the default slider value
hScrollSlider.oninput = function () {
    //hScrollValue.innerHTML = this.value;
    window.follow_agent = false;
    window.game.env.set_scroll(this.value, vScrollSlider.value);
    window.game.env.render();
}
let resetHScroll = document.getElementById("resetHScroll");
resetHScroll.onclick = function () {
    hScrollSlider.value = 0;
    //hScrollValue.innerHTML = "0";
    window.follow_agent = false;
    window.game.env.set_scroll(0, vScrollSlider.value);
    window.game.env.render();
}

// Vertical scroll slider
let vScrollSlider = document.getElementById("vScrollSlider");
vScrollSlider.step = 0.1;
//let vScrollValue = document.getElementById("vScrollValue");
//vScrollValue.innerHTML = vScrollSlider.value; // Display the default slider value
vScrollSlider.oninput = function () {
    //vScrollValue.innerHTML = this.value;
    window.follow_agent = false;
    window.game.env.set_scroll(hScrollSlider.value, this.value);
    window.game.env.render();
}
let resetVScroll = document.getElementById("resetVScroll");
resetVScroll.onclick = function () {
    vScrollSlider.value = 0;
    // vScrollValue.innerHTML = "0";
    window.follow_agent = false;
    window.game.env.set_scroll(hScrollSlider.value, 0);
    window.game.env.render();
}

// Zoom slider
let zoomSlider = document.getElementById("zoomSlider");
zoomSlider.step = 0.01;
zoomSlider.value = 1;
let zoomValue = document.getElementById("zoomValue");
zoomValue.innerHTML = "x" + zoomSlider.value; // Display the default slider value
zoomSlider.oninput = function () {
    zoomValue.innerHTML = "x" + this.value;
    window.game.env.set_zoom(parseFloat(this.value) * parseFloat(resizeCanvasSlider.value));
    window.game.env.set_scroll(hScrollSlider.value, vScrollSlider.value);
    window.game.env.render();
}
let resetZoom = document.getElementById("resetZoom");
resetZoom.onclick = function () {
    zoomSlider.value = 1;
    zoomValue.innerHTML = "x1";
    window.game.env.set_zoom(1 * parseFloat(resizeCanvasSlider.value));
    window.game.env.set_scroll(hScrollSlider.value, vScrollSlider.value);
    window.game.env.render();
}

/* CPPN ENCODING */

// dim1 slider
initializeSlider("dim1", 0.01, 0);

// dim2 slider
initializeSlider("dim2", 0.01, 0);

// dim3 slider
initializeSlider("dim3", 0.01, 0);

// water slider
initializeSlider("water", 0.01, 0);

// creepersWidth slider
initializeSlider("creepersWidth", 0.01, 0.3);

// creepersHeight slider
initializeSlider("creepersHeight", 0.01, 3);

// creepersSpacing slider
initializeSlider("creepersSpacing", 0.01, 1);

// smoothing slider
initializeSlider("smoothing", 0.01, 20);


function getCreepersType() {
    return document.getElementById("creepersType").value == 'Swingable';
}

// Creeper Type form
let creepersTypeSelect = document.getElementById("creepersType");
creepersType.onclick = function () {
    init_default();
}


function initializeSlider(id, step, value) {
    const slider = document.getElementById(`${id}Slider`);
    slider.step = step;
    slider.value = value;
    const sliderValue = document.getElementById(`${id}Value`);
    sliderValue.innerHTML = slider.value; // Display the default slider value
    slider.oninput = function () {
        sliderValue.innerHTML = this.value;
        runButton.innerText = "Start";
        init_default();
    }
}

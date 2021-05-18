
const body_type_mapping = new Map();
body_type_mapping.set("bipedal", "classic_bipedal");
body_type_mapping.set("chimpanzee", "climbing_profile_chimpanzee");

function init(cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling) {

    if(window.game != null){
        window.game.pause();
    }
    window.game = new ParkourGame([], [], [], cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling);
    window.agent_selected = null;
    window.game.env.set_zoom(parseFloat(zoomSlider.value) /* * parseFloat(resizeCanvasSlider.value)*/);
    window.game.env.set_scroll(window.agent_selected, parseFloat(hScrollSlider.value), parseFloat(vScrollSlider.value));
    window.game.env.render();
}

function init_default() {
    init([parseFloat(dim1Slider.value), parseFloat(dim2Slider.value), parseFloat(dim3Slider.value)],
        parseFloat(waterSlider.value),
        parseFloat(creepersWidthSlider.value),
        parseFloat(creepersHeightSlider.value),
        parseFloat(creepersSpacingSlider.value),
        parseFloat(smoothingSlider.value),
        getCreepersType(),
        window.ground,
        window.ceiling);
}

async function loadModel() {
    window.agent_selected = null;
    window.cppn_model = await tf.loadGraphModel('./js/CPPN/weights/same_ground_ceiling_cppn/tfjs_model/model.json');
    init_default();
}


window.addEventListener("load", loadModel, false);

/* SCROLL AND ZOOM */

// Horizontal scroll slider
let hScrollSlider = document.getElementById("hScrollSlider");
hScrollSlider.step = 0.1;
hScrollSlider.value = 15;
hScrollSlider.oninput = function () {
    window.cancelAgentFollow();
    window.game.env.set_scroll(window.agent_selected, parseFloat(this.value), parseFloat(vScrollSlider.value));
    window.game.env.render();
}
let resetHScroll = document.getElementById("resetHScroll");
resetHScroll.onclick = function () {
    hScrollSlider.value = 0;
    window.cancelAgentFollow();
    window.game.env.set_scroll(window.agent_selected, 0, parseFloat(vScrollSlider.value));
    window.game.env.render();
}

// Vertical scroll slider
let vScrollSlider = document.getElementById("vScrollSlider");
vScrollSlider.step = 0.1;
vScrollSlider.oninput = function () {
    window.cancelAgentFollow();
    window.game.env.set_scroll(window.agent_selected, parseFloat(hScrollSlider.value), parseFloat(this.value));
    window.game.env.render();
}
let resetVScroll = document.getElementById("resetVScroll");
resetVScroll.onclick = function () {
    vScrollSlider.value = 0;
    window.cancelAgentFollow();
    window.game.env.set_scroll(window.agent_selected, parseFloat(hScrollSlider.value), 0);
    window.game.env.render();
}

// Zoom slider
let zoomSlider = document.getElementById("zoomSlider");
zoomSlider.step = 0.01;
zoomSlider.value = 0.35;
let zoomValue = document.getElementById("zoomValue");
zoomValue.innerHTML = "x" + zoomSlider.value; // Display the default slider value
zoomSlider.oninput = function () {
    zoomValue.innerHTML = "x" + this.value;
    window.game.env.set_zoom(parseFloat(this.value)/* * parseFloat(resizeCanvasSlider.value)*/);
    window.game.env.set_scroll(window.agent_selected, parseFloat(hScrollSlider.value), parseFloat(vScrollSlider.value));
    window.game.env.render();
}
let resetZoom = document.getElementById("resetZoom");
resetZoom.onclick = function () {
    zoomSlider.value = 1;
    zoomValue.innerHTML = "x1";
    window.game.env.set_zoom(1/* * parseFloat(resizeCanvasSlider.value)*/);
    window.game.env.set_scroll(window.agent_selected, parseFloat(hScrollSlider.value), parseFloat(vScrollSlider.value));
    window.game.env.render();
}

/* CPPN ENCODING */

function getCreepersType() {
    return document.getElementById("creepersType").value == 'Swingable';
}




/* DRAWING BUTTONS */
/*
window.drawing_mode = false;
window.drawing = false;

const drawingModeSwitch = document.querySelector("#drawingModeSwitch");
drawingModeSwitch.addEventListener('input', () => {
    background("#E6F0FF");
    drawing_canvas.clear();
    window.ground = [];
    window.ceiling = [];
    window.terrain = {
        ground: [],
        ceiling: []
    };

    runButton.className = "btn btn-success";
    runButton.innerText = "Start";

    if(drawingModeSwitch.checked){
        window.drawing_mode = true;
        window.drawing = true;

        runButton.classList.add("disabled");
        resetButton.classList.add("disabled");
        addAgentButton.classList.add("disabled");
        //deleteAgentButton.classList.add("disabled");

        drawGroundButton.classList.remove("disabled");
        drawCeilingButton.classList.remove("disabled");
        eraseButton.classList.remove("disabled");
        clearButton.classList.remove("disabled");
        generateTerrainButton.classList.remove("disabled");
    }
    else{
        window.drawing_mode = false;
        window.drawing = false;
        window.drawing_ground = false;

        runButton.classList.remove("disabled");
        resetButton.classList.remove("disabled");
        addAgentButton.classList.remove("disabled");
        //deleteAgentButton.classList.remove("disabled");

        drawGroundButton.className = "btn btn-outline-primary";
        drawGroundButton.classList.add("disabled");
        window.drawing_ceiling = false;
        drawCeilingButton.className = "btn btn-outline-primary";
        drawCeilingButton.classList.add("disabled");
        window.erasing = false;
        eraseButton.className = "btn btn-outline-warning";
        eraseButton.classList.add("disabled");
        clearButton.classList.add("disabled");
        generateTerrainButton.className = "btn btn-success";
        generateTerrainButton.classList.add("disabled");
        generateTerrainButton.innerText = "Generate terrain";
    }

    window.game.env.set_zoom(0.35);
    window.game.env.set_scroll(null, 15, 0);
    init_default();
});



let drawGroundButton = document.getElementById("drawGroundButton");
window.drawing_ground = false;
drawGroundButton.onclick = function () {
    window.drawing_ground = !window.drawing_ground;
    if(window.drawing_ground){
        this.className = "btn btn-primary";
    }
    else{
        this.className = "btn btn-outline-primary";
    }
    window.drawing_ceiling = false;
    drawCeilingButton.className = "btn btn-outline-primary";
    window.erasing = false;
    eraseButton.className = "btn btn-outline-warning";
}

let drawCeilingButton = document.getElementById("drawCeilingButton");
window.drawing_ceiling = false;
drawCeilingButton.onclick = function () {
    window.drawing_ceiling = !window.drawing_ceiling;
    if(window.drawing_ceiling){
        this.className = "btn btn-primary";
    }
    else{
        this.className = "btn btn-outline-primary";
    }
    window.drawing_ground = false;
    drawGroundButton.className = "btn btn-outline-primary";
    window.erasing = false;
    eraseButton.className = "btn btn-outline-warning";
}

let eraseButton = document.getElementById("eraseButton");
window.erasing = false;
window.erasing_radius = 15;
eraseButton.onclick = function (){
    window.erasing = !window.erasing;
    if(window.erasing){
        this.className = "btn btn-warning";
    }
    else{
        this.className = "btn btn-outline-warning";
    }
    window.drawing_ground = false;
    drawGroundButton.className = "btn btn-outline-primary";
    window.drawing_ceiling = false;
    drawCeilingButton.className = "btn btn-outline-primary";
}

let clearButton = document.getElementById("clearButton");
clearButton.onclick = function () {
    background("#E6F0FF");
    drawing_canvas.clear();
    window.ground = [];
    window.ceiling = [];
    window.terrain = {
        ground: [],
        ceiling: []
    };

    window.game.env.set_zoom(0.35);
    window.game.env.set_scroll(null, 15, 0);

    window.drawing = true;
    generateTerrainButton.className = "btn btn-success";
    generateTerrainButton.innerText = "Generate terrain";
    drawGroundButton.classList.remove("disabled");
    drawCeilingButton.classList.remove("disabled");
    eraseButton.classList.remove("disabled");

    runButton.classList.add("disabled");
    resetButton.classList.add("disabled");
    addAgentButton.classList.add("disabled");
    //deleteAgentButton.classList.add("disabled");

    init_default();
}


let generateTerrainButton = document.getElementById("generateTerrainButton");
generateTerrainButton.onclick = function () {

    window.game.env.set_zoom(0.35);
    window.game.env.set_scroll(null, 15, 0);

    // Generate the terrain from the shapes drawn
    if(window.drawing){

        // Sort drawing values for ground and ceiling
        window.terrain.ground.sort(function (a, b){
            return a.x - b.x;
        });
        for(let p of window.terrain.ground){
            window.ground.push({x: p.x / (window.game.env.scale * window.game.env.zoom), y: (RENDERING_VIEWER_H - p.y) / (window.game.env.scale * window.game.env.zoom)})
        }

        window.terrain.ceiling.sort(function (a, b){
            return a.x - b.x;
        });
        for(let p of window.terrain.ceiling){
            window.ceiling.push({x: p.x / (window.game.env.scale * window.game.env.zoom), y: (RENDERING_VIEWER_H - p.y) / (window.game.env.scale * window.game.env.zoom)})
        }

        init_default();
        window.drawing_ground = false;
        drawGroundButton.className = "btn btn-outline-primary";
        drawGroundButton.classList.add("disabled");
        window.drawing_ceiling = false;
        drawCeilingButton.className = "btn btn-outline-primary";
        drawCeilingButton.classList.add("disabled");
        window.erasing = false;
        eraseButton.className = "btn btn-outline-warning";
        eraseButton.classList.add("disabled");

        runButton.classList.remove("disabled");
        resetButton.classList.remove("disabled");
        addAgentButton.classList.remove("disabled");
        //deleteAgentButton.classList.remove("disabled");

        this.className = "btn btn-primary";
        this.innerText = "Return to draw";
    }
    else{
        window.ground = [];
        window.ceiling = [];
        init_default();
        image(drawing_canvas, 0, 0);
        this.className = "btn btn-success";
        this.innerText = "Generate terrain";
        drawGroundButton.classList.remove("disabled");
        drawCeilingButton.classList.remove("disabled");
        eraseButton.classList.remove("disabled");

        runButton.classList.add("disabled");
        resetButton.classList.add("disabled");
        addAgentButton.classList.add("disabled");
        //deleteAgentButton.classList.add("disabled");
    }

    window.drawing = !window.drawing;
}*/






// Get the position of the mouse cursor in the environment scale
function getMousePosToEnvScale(){
    //let x = Math.max(0, Math.min(mouseX, window.canvas.width));
    let x = Math.max(-window.canvas.width * 0.01, Math.min(mouseX, window.canvas.width * 1.01));
    let y = Math.max(0, Math.min(mouseY, window.canvas.height));

    x +=  window.game.env.scroll[0];
    y = -(y - window.game.env.scroll[1]);

    x = x / (window.game.env.scale * window.game.env.zoom);
    y = y / (window.game.env.scale * window.game.env.zoom);

    y += (1 - window.game.env.scale * window.game.env.zoom) * RENDERING_VIEWER_H/(window.game.env.scale * window.game.env.zoom)
        + (window.game.env.zoom - 1) * (window.game.env.ceiling_offset)/window.game.env.zoom * 1/3 + RENDERING_VIEWER_H;

    return {x: x, y: y};
}

window.erasing_radius = 15;

// Select an agent in the canvas if the mouse is clicked over its body
function mousePressed(){
    if(mouseX >= 0 && mouseX <= window.canvas.width
        && mouseY >= 0 && mouseY <= window.canvas.height){
        if(window.is_drawing()){
            window.prevMouseX = mouseX;
            window.prevMouseY = mouseY;
        }
        else{
            let mousePos = getMousePosToEnvScale();

            for(let agent of window.game.env.agents){

                // Check if the agent is touched by the mouse
                let is_agent_touched = agent.agent_body.isMousePosInside(mousePos);

                // If the agent is touched and not selected yet, it is now selected and all other agents are deselected
                if(!agent.is_selected && is_agent_touched){
                    agent.is_selected = true;
                    window.agent_selected = agent;
                    for(let other_agent of window.game.env.agents){
                        if(other_agent != agent){
                            other_agent.is_selected = false;
                        }
                    }
                    break;
                }
                // If the agent is not touched it is deselected
                else if(!is_agent_touched){
                    agent.is_selected = false;
                }
            }

            let selected = false;
            for(let agent of window.game.env.agents){
                if(agent.is_selected){
                    window.agent_selected = agent;
                    selected = true;
                    break;
                }
            }
            if(!selected){
                window.agent_selected = null;
            }

            window.game.env.render();
        }
    }
}


window.ground = [];
window.ceiling = [];
window.terrain = {
    ground: [],
    ceiling: []
};

function mouseDragged(){

    if(mouseX >= 0 && mouseX <= window.canvas.width
        && mouseY >= 0 && mouseY <= window.canvas.height) {

        // DRAWING
        if(window.is_drawing()) {
            if(window.is_drawing_ground()){
                drawing_canvas.push();
                drawing_canvas.stroke('green');
                drawing_canvas.strokeWeight(5);
                drawing_canvas.line(mouseX, mouseY, window.prevMouseX, window.prevMouseY);
                drawing_canvas.pop();
                window.terrain.ground.push({x: mouseX, y: mouseY});
            }
            else if(window.is_drawing_ceiling()){
                drawing_canvas.push();
                drawing_canvas.stroke('grey');
                drawing_canvas.strokeWeight(5);
                drawing_canvas.line(mouseX, mouseY, window.prevMouseX, window.prevMouseY);
                drawing_canvas.pop();
                window.terrain.ceiling.push({x: mouseX, y: mouseY});
            }
            else if(window.is_erasing()){
                erasing_canvas.clear();
                erasing_canvas.noStroke();
                erasing_canvas.fill(255);
                erasing_canvas.circle(mouseX, mouseY, window.erasing_radius * 2);
                if(window.terrain.ground.length > 0 || window.terrain.ceiling.length > 0){

                    // Remove the points that are within the circle radius from the ground and ceiling lists
                    window.terrain.ground = window.terrain.ground.filter(function(point, index, array){
                        return Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2) > Math.pow(window.erasing_radius, 2);
                    });
                    window.terrain.ceiling = window.terrain.ceiling.filter(function(point, index, array){
                        return Math.pow(point.x - mouseX, 2) + Math.pow(point.y - mouseY, 2) > Math.pow(window.erasing_radius, 2);
                    });

                    drawing_canvas.erase();
                    drawing_canvas.circle(mouseX, mouseY, window.erasing_radius * 2);
                    drawing_canvas.noErase();
                }
            }

            window.game.env.render();
            image(drawing_canvas, 0, 0);
            image(erasing_canvas, 0, 0);
            window.prevMouseX = mouseX;
            window.prevMouseY = mouseY;
        }

        // DRAGGING AGENT
        else{
            for (let agent of window.game.env.agents) {

                if (agent.is_selected) {
                    let mousePos = getMousePosToEnvScale();
                    let x;
                    if (agent.agent_body.body_type == BodyTypesEnum.CLIMBER) {
                        x = mousePos.x / window.game.env.terrain_ceiling[window.game.env.terrain_ceiling.length - 1].x;
                    } else if (agent.agent_body.body_type == BodyTypesEnum.WALKER) {
                        x = mousePos.x / window.game.env.terrain_ground[window.game.env.terrain_ground.length - 1].x;
                    }

                    x = Math.max(0.02, Math.min(0.98, x));
                    window.game.env.set_agent_position(agent, x);
                    window.game.env.render();
                    window.is_dragging = true;
                }
            }
        }
    }

    // Mouse out of canvas + DRAWING
    else if(window.is_drawing()){
        window.prevMouseX = mouseX;
        window.prevMouseY = mouseY;
    }

    // Mouse horizontally out of canvas + dragging agent
    else if(window.is_dragging
        && mouseY >= 0 && mouseY < window.canvas.height){

        if(mouseX < 0){
            window.dragging_side = "left";
        }
        else if(mouseX > window.canvas.width){
            window.dragging_side = "right";
        }

        for (let agent of window.game.env.agents) {
            if(agent.is_selected){

                window.game.env.set_scroll(null);

                let mousePos = getMousePosToEnvScale();
                let x;
                if (agent.agent_body.body_type == BodyTypesEnum.CLIMBER) {
                    x = mousePos.x / window.game.env.terrain_ceiling[window.game.env.terrain_ceiling.length - 1].x;
                } else if (agent.agent_body.body_type == BodyTypesEnum.WALKER) {
                    x = mousePos.x / window.game.env.terrain_ground[window.game.env.terrain_ground.length - 1].x;
                }

                x = Math.max(0.02, Math.min(0.98, x));
                window.game.env.set_agent_position(agent, x);
                window.game.env.render();
            }
        }
    }
}

function mouseReleased(){
    window.is_dragging = false;
    window.dragging_side = null;
}

function mouseMoved(){
    if(window.is_drawing()){
        erasing_canvas.clear();
        if(window.is_erasing() &&
            mouseX >= 0 && mouseX <= window.canvas.width
            && mouseY >= 0 && mouseY <= window.canvas.height) {

            erasing_canvas.noStroke();
            erasing_canvas.fill(255, 180);
            erasing_canvas.circle(mouseX, mouseY, window.erasing_radius * 2);

            window.game.env.render();
            image(drawing_canvas, 0, 0);
            image(erasing_canvas, 0, 0);
        }

        else if(window.is_erasing() &&
            mouseX < 0 || mouseX > window.canvas.width
            || mouseY < 0 || mouseY > window.canvas.height) {
            window.game.env.render();
        }

        //window.game.env.render();
        image(drawing_canvas, 0, 0);
        image(erasing_canvas, 0, 0);
    }
}

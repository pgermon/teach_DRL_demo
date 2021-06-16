function init(cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling, align) {

    let morphologies = [];
    let policies = [];
    let positions = [];

    if(window.game != null){
        window.game.pause();
        morphologies = [...window.game.env.agents.map(a => a.morphology)];
        policies = [...window.game.env.agents.map(a => a.policy)];
        positions = [...window.game.env.agents.map(agent => agent.agent_body.reference_head_object.GetPosition())];
    }
    window.game = new ParkourGame(morphologies, policies, positions, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling, align);
    window.set_agent_selected(null);
    window.asset_selected = null;
    window.game.env.set_zoom(INIT_ZOOM);
    window.game.env.set_scroll(window.agent_selected, INIT_SCROLL_X, 0);
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
        window.ceiling,
        window.align_terrain);
}

async function loadModel() {
    window.set_agent_selected(null);
    window.cppn_model = await tf.loadGraphModel('./js/CPPN/weights/same_ground_ceiling_cppn/tfjs_model/model.json');
    init_default();
    window.loadDefaultEnv();
    /*window.markCppnInitialized();
    window.addDefaultAgent();*/
}
window.addEventListener("load", loadModel, false);

function getCreepersType() {
    return document.getElementById("creepersType").value == 'Swingable';
}

/* IN-CANVAS MOUSE INTERACTIONS */

// Get the position of the mouse cursor in the environment scale
function convertPosCanvasToEnv(x_pos, y_pos){
    let x = Math.max(-window.canvas.width * 0.01, Math.min(x_pos, window.canvas.width * 1.01));
    let y = Math.max(0, Math.min(y_pos, window.canvas.height));

    x +=  window.game.env.scroll[0];
    y = -(y - window.game.env.scroll[1]);

    x = x / (window.game.env.scale * window.game.env.zoom);
    y = y / (window.game.env.scale * window.game.env.zoom);

    y += (1 - window.game.env.scale * window.game.env.zoom) * RENDERING_VIEWER_H/(window.game.env.scale * window.game.env.zoom)
        + (window.game.env.zoom - 1) * (window.game.env.ceiling_offset)/window.game.env.zoom * 1/3 + RENDERING_VIEWER_H;

    return {x: x, y: y};
}

function convertPosEnvToCanvas(x_pos, y_pos){
    let x = x_pos * window.game.env.scale * window.game.env.zoom - window.game.env.scroll[0];
    let y = window.game.env.scroll[1] - (y_pos - RENDERING_VIEWER_H) * window.game.env.scale * window.game.env.zoom
        + (1 - window.game.env.scale * window.game.env.zoom) * RENDERING_VIEWER_H
        + (window.game.env.zoom - 1) * window.game.env.ceiling_offset * window.game.env.scale * 1/3;

    return {x: x, y: y};
}

function isMousePosInsideBody(pos, body){
    let shape = body.GetFixtureList().GetShape();

    if(shape.m_type == b2.Shape.e_circle){
        let center = body.GetWorldCenter();
        return Math.pow(center.x - pos.x, 2) + Math.pow(center.y - pos.y, 2) <= Math.pow(shape.m_radius, 2);
    }
}

window.erasing_radius = 15;
window.asset_size = 8;

function mousePressed(){
    if(mouseX >= 0 && mouseX <= window.canvas.width
        && mouseY >= 0 && mouseY <= window.canvas.height){

        window.prevMouseX = mouseX;
        window.prevMouseY = mouseY;

        if(window.is_drawing_circle()){
            let mousePos = convertPosCanvasToEnv(mouseX, mouseY);
            window.game.env.create_circle_asset(mousePos, window.asset_size * 2 / window.game.env.scale);
            window.game.env.render();
        }

        else if(!window.is_drawing()){
            let mousePos = convertPosCanvasToEnv(mouseX, mouseY);

            // Select an agent in the canvas if the mouse is clicked over its body
            let one_agent_touched = false;
            for(let i = 0; i < window.game.env.agents.length; i++){
                let agent = window.game.env.agents[i];

                // Check if the agent is touched by the mouse
                let is_agent_touched = agent.agent_body.isMousePosInside(mousePos);

                // If the agent is touched and not selected yet, it is now selected and all other agents are deselected
                if(is_agent_touched){
                    one_agent_touched = true;

                    if(!agent.is_selected) {
                        agent.is_selected = true;
                        window.set_agent_selected(i);
                        for (let other_agent of window.game.env.agents) {
                            if (other_agent != agent) {
                                other_agent.is_selected = false;
                            }
                        }
                    }
                    break;
                }
                // If the agent is not touched it is deselected
                else if(!is_agent_touched){
                    agent.is_selected = false;
                }
            }

            if(!one_agent_touched){
                window.set_agent_selected(null);
            }

            // Select an asset in the canvas if the mouse is clicked over its body
            for(let asset of window.game.env.assets_bodies){

                // Check if the asset is touched by the mouse
                let is_asset_touched = isMousePosInsideBody(mousePos, asset.body);

                // If the asset is touched and not selected yet, it is now selected and all other assets are deselected
                if(!asset.is_selected && is_asset_touched){
                    asset.is_selected = true;
                    window.asset_selected = asset;
                    for(let other_asset of window.game.env.assets_bodies){
                        if(other_asset != asset){
                            other_asset.is_selected = false;
                        }
                    }
                    break;
                }
                // If the asset is not touched it is deselected
                else if(!is_asset_touched){
                    asset.is_selected = false;
                }
            }

            window.game.env.render();
        }
    }
    else if(window.is_drawing() || window.is_drawing_circle()){
        window.clickOutsideCanvas();
    }
}


window.ground = [];
window.ceiling = [];
window.align_terrain = {
    align: true,
    ceiling_offset: null,
    ground_offset: null,
    smoothing: null
};
window.terrain = {
    ground: [],
    ceiling: []
};

function mouseDragged(){

    if(mouseX >= 0 && mouseX <= window.canvas.width
        && mouseY >= 0 && mouseY <= window.canvas.height) {

        // DRAWING
        if(window.is_drawing()) {
            //cursor('web_demo/pencil-cursor.png');
            //cursor(HAND);
            if(window.is_drawing_ground()){
                drawing_canvas.push();
                drawing_canvas.stroke("#66994D");
                drawing_canvas.strokeWeight(4);
                drawing_canvas.line(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.prevMouseX, window.prevMouseY + SCROLL_MAX - window.game.env.scroll[1]);
                drawing_canvas.pop();
                window.terrain.ground.push(convertPosCanvasToEnv(mouseX, mouseY));
            }
            else if(window.is_drawing_ceiling()){
                drawing_canvas.push();
                drawing_canvas.stroke("#808080");
                drawing_canvas.strokeWeight(4);
                drawing_canvas.line(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.prevMouseX, window.prevMouseY + SCROLL_MAX - window.game.env.scroll[1]);
                drawing_canvas.pop();
                window.terrain.ceiling.push(convertPosCanvasToEnv(mouseX, mouseY));
            }
            else if(window.is_erasing()){
                erasing_canvas.clear();
                erasing_canvas.noStroke();
                erasing_canvas.fill(255);
                erasing_canvas.circle(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.erasing_radius * 2);
                if(window.terrain.ground.length > 0 || window.terrain.ceiling.length > 0){
                    let mousePos = convertPosCanvasToEnv(mouseX, mouseY);

                    // Remove the points that are within the circle radius from the ground and ceiling lists
                    window.terrain.ground = window.terrain.ground.filter(function(point, index, array){
                        return Math.pow(point.x - mousePos.x, 2) + Math.pow(point.y - mousePos.y, 2) > Math.pow(window.erasing_radius / (window.game.env.scale * window.game.env.zoom), 2);
                    });
                    window.terrain.ceiling = window.terrain.ceiling.filter(function(point, index, array){
                        return Math.pow(point.x - mousePos.x, 2) + Math.pow(point.y - mousePos.y, 2) > Math.pow(window.erasing_radius / (window.game.env.scale * window.game.env.zoom), 2);
                    });

                    drawing_canvas.erase();
                    drawing_canvas.circle(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.erasing_radius * 2);
                    drawing_canvas.noErase();
                }
            }
            // Dragging to move
            else{
                cursor(MOVE);
                window.game.env.set_scroll(null, this.scroll[0] + window.prevMouseX - mouseX, this.scroll[1] + mouseY - prevMouseY);
            }

            window.game.env.render();
            image(drawing_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
            image(erasing_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
        }

        // DRAGGING
        else{
            cursor(MOVE);
            for (let agent of window.game.env.agents) {

                // Dragging an agent
                if (agent.is_selected) {
                    let mousePos = convertPosCanvasToEnv(mouseX, mouseY);
                    let terrain_length;
                    if (agent.agent_body.body_type == BodyTypesEnum.CLIMBER) {
                        terrain_length = window.game.env.terrain_ceiling[window.game.env.terrain_ceiling.length - 1].x;
                    } else if (agent.agent_body.body_type == BodyTypesEnum.WALKER) {
                        terrain_length = window.game.env.terrain_ground[window.game.env.terrain_ground.length - 1].x;
                    }
                    else if(agent.agent_body.body_type == BodyTypesEnum.SWIMMER){
                        terrain_length = Math.max(window.game.env.terrain_ground[window.game.env.terrain_ground.length - 1].x,
                                                    window.game.env.terrain_ceiling[window.game.env.terrain_ceiling.length - 1].x);
                    }
                    let x = mousePos.x / terrain_length;
                    x = Math.max(0.02, Math.min(0.98, x)) * terrain_length;
                    window.game.env.set_agent_position(agent, x, mousePos.y);
                    window.game.env.render();
                    window.is_dragging_agent = true;
                    break;
                }
            }

            for(let asset of window.game.env.assets_bodies){
                // Dragging an asset
                if (asset.is_selected) {
                    let mousePos = convertPosCanvasToEnv(mouseX, mouseY);
                    let terrain_length = Math.max(window.game.env.terrain_ground[window.game.env.terrain_ground.length - 1].x,
                                                    window.game.env.terrain_ceiling[window.game.env.terrain_ceiling.length - 1].x);
                    mousePos.x = mousePos.x / terrain_length;
                    mousePos.x = Math.max(0.02, Math.min(0.98, mousePos.x)) * terrain_length;
                    window.game.env.set_asset_position(asset, mousePos);
                    window.game.env.render();
                    window.is_dragging_asset = true;
                }
            }

            // Dragging to scroll
            if(!window.is_dragging_agent && !window.is_dragging_asset){
                if(window.follow_agent){
                    window.cancelAgentFollow();
                }
                window.game.env.set_scroll(null, this.scroll[0] + window.prevMouseX - mouseX, this.scroll[1] + mouseY - prevMouseY);
                window.game.env.render();
            }
        }
    }

    // Mouse horizontally out of canvas + dragging agent
    else if(window.is_dragging_agent
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

                let mousePos = convertPosCanvasToEnv(mouseX, mouseY);
                let terrain_length;
                if (agent.agent_body.body_type == BodyTypesEnum.CLIMBER) {
                    terrain_length = window.game.env.terrain_ceiling[window.game.env.terrain_ceiling.length - 1].x;
                }
                else if (agent.agent_body.body_type == BodyTypesEnum.WALKER) {
                    terrain_length = window.game.env.terrain_ground[window.game.env.terrain_ground.length - 1].x;
                }
                else if(agent.agent_body.body_type == BodyTypesEnum.SWIMMER){
                    terrain_length = Math.max(window.game.env.terrain_ground[window.game.env.terrain_ground.length - 1].x,
                                                window.game.env.terrain_ceiling[window.game.env.terrain_ceiling.length - 1].x);
                }
                let x = mousePos.x / terrain_length;
                x = Math.max(0.02, Math.min(0.98, x)) * terrain_length;
                window.game.env.set_agent_position(agent, x, mousePos.y);
                window.game.env.render();
            }
        }
        return false;
    }

    window.prevMouseX = mouseX;
    window.prevMouseY = mouseY;
}

function mouseReleased(){
    cursor();
    window.is_dragging_agent = false;
    window.is_dragging_asset = false;
    window.dragging_side = null;
}

function mouseMoved(){

    erasing_canvas.clear();
    assets_canvas.clear();

    if(window.is_drawing_circle()){
        if(mouseX >= 0 && mouseX <= window.canvas.width
            && mouseY >= 0 && mouseY <= window.canvas.height) {

            assets_canvas.noStroke();
            assets_canvas.fill(136, 92, 0, 180);
            assets_canvas.circle(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.asset_size * 4 * window.game.env.zoom);
        }

        window.game.env.render();
        image(assets_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);

    }
    else if(window.is_drawing()) {

        if (window.is_erasing()) {
            if (mouseX >= 0 && mouseX <= window.canvas.width
                && mouseY >= 0 && mouseY <= window.canvas.height) {

                erasing_canvas.noStroke();
                erasing_canvas.fill(255, 180);
                erasing_canvas.circle(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.erasing_radius * 2);
            }

            window.game.env.render();
            image(drawing_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
            image(erasing_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
        }
    }
}

function mouseWheel(event){
    if(mouseX >= 0 && mouseX <= window.canvas.width
        && mouseY >= 0 && mouseY <= window.canvas.height) {

        if(window.is_drawing_circle()){
            window.asset_size = Math.max(3, Math.min(window.asset_size - event.delta / 100, 30));
            return false;
        }
        else if (window.is_drawing()){
            if(window.is_erasing()){
                window.erasing_radius = Math.max(5, Math.min(window.erasing_radius - event.delta / 100, 30));
            }
            return false;
        }
        else {
            window.game.env.set_zoom(window.game.env.zoom - event.delta / 2000);
            window.game.env.set_scroll(null, this.scroll[0], this.scroll[1]);
            window.game.env.render();
            return false;
        }
    }
}

function keyPressed(){
    if(keyCode == DELETE){
        if(window.agent_selected != null){
            window.delete_agent(agent_selected);
            window.agent_selected(null);
            return false;
        }
        else if(window.asset_selected != null){
            window.game.env.delete_asset(window.asset_selected);
            window.asset_selected = null;
            window.game.env.render();
            return false;
        }
    }
}

function windowResized(){
    let canvas_container = document.querySelector('#canvas_container');
    RENDERING_VIEWER_W = canvas_container.offsetWidth;
    resizeCanvas(RENDERING_VIEWER_W, RENDERING_VIEWER_H);
    let coef = 1.05;
    //let coef = 0.99;
    INIT_ZOOM = RENDERING_VIEWER_W / ((TERRAIN_LENGTH + INITIAL_TERRAIN_STARTPAD) * coef * TERRAIN_STEP * SCALE);
}

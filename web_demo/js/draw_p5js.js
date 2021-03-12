p5.disableFriendlyErrors = true; // disables FES

let JOINTS_COLORS = {
    "hip": "#FF0000",
    "knee": "#0000FF",
    "creeper": "#00B400"
};

function setup() {
    let myCanvas = createCanvas(VIEWPORT_W, VIEWPORT_H);
    myCanvas.parent("canvas_container");
    background(220);
    noLoop();
    //frameRate(30);
}

function draw() {
    let parkour = window.game.env;

    push();
    parkour.render_change = false;
    drawParkour(parkour);
    drawAgent(parkour.agent_body);

    if(window.draw_joints){
        drawJoints(parkour.creepers_joints);
        drawJoints(parkour.agent_body.motors);
    }
    pop();
}

function drawJoints(joints){
    for(let i = 0; i < joints.length; i++){
        let posA = joints[i].m_bodyA.GetWorldPoint(joints[i].m_localAnchorA);
        let posB = joints[i].m_bodyB.GetWorldPoint(joints[i].m_localAnchorB);
        noStroke();
        let joint_type = joints[i].GetUserData().name;
        fill(JOINTS_COLORS[joint_type]);
        let radius = joint_type == "creeper" ? 4 : 7;
        circle(posA.x, VIEWPORT_H - posA.y, radius);
        circle(posB.x, VIEWPORT_H - posB.y, radius);

    }
}

function drawAgent(agent){
    let polys = agent.get_elements_to_render();
    for(let poly of polys){
        let shape = poly.GetFixtureList().GetShape();
        let vertices = [];
        for(let i = 0; i < shape.m_count; i++){
            let world_pos = poly.GetWorldPoint(shape.m_vertices[i]);
            vertices.push([world_pos.x, world_pos.y]);
        }
        strokeWeight(2);
        stroke(poly.color2);
        drawPolygon(vertices, poly.color1);

    }
}

function drawParkour(parkour){
    // Sky
    noStroke();
    drawPolygon(parkour.sky_poly.vertices, parkour.sky_poly.color);

    // Water
    let vertices = [
        [0, 0],
        [0, VIEWPORT_H/2 - VIEWPORT_H/2 * parkour.rendering_scale + parkour.water_level * VIEWPORT_H * parkour.rendering_scale],
        [VIEWPORT_W, VIEWPORT_H/2 - VIEWPORT_H/2 * parkour.rendering_scale + parkour.water_level * VIEWPORT_H * parkour.rendering_scale],
        [VIEWPORT_W, 0]
    ];
    /*let vertices = [
        [0, 0],
        [0, VIEWPORT_H/SCALE/2 - VIEWPORT_H/SCALE/2 + parkour.water_level * VIEWPORT_H/SCALE],
        [VIEWPORT_W, VIEWPORT_H/SCALE/2 - VIEWPORT_H/SCALE/2 + parkour.water_level * VIEWPORT_H/SCALE],
        [VIEWPORT_W, 0]
    ];*/
    drawPolygon(vertices, "#77ACE5");

    translate(- parkour.scroll_offset, 0);

    // Top and bottom strips to fill ground and ceiling
    //if(parkour.rendering_scale < 1){

        // ground
        vertices = [
            [0, 0],
            [(TERRAIN_LENGTH - 1) * TERRAIN_STEP * parkour.rendering_scale, 0],
            [(TERRAIN_LENGTH - 1) * TERRAIN_STEP * parkour.rendering_scale, VIEWPORT_H/2 - VIEWPORT_H/2/SCALE * parkour.rendering_scale],
            [0, VIEWPORT_H/2 - VIEWPORT_H/2/SCALE * parkour.rendering_scale]
        ];
        drawPolygon(vertices, "#66994D");

        // ceiling
        vertices = [
            [0, VIEWPORT_H],
            [(TERRAIN_LENGTH - 1) * TERRAIN_STEP * parkour.rendering_scale, VIEWPORT_H],
            [(TERRAIN_LENGTH - 1) * TERRAIN_STEP * parkour.rendering_scale, VIEWPORT_H/2 + VIEWPORT_H/2/SCALE * parkour.rendering_scale],
            [0, VIEWPORT_H/2 + VIEWPORT_H/2/SCALE * parkour.rendering_scale]
        ];
        drawPolygon(vertices, "#808080");
    //}

    // Vertical translation to place the environment at the center of the VIEWPORT according to SCALE
    translate(0, (- SCALE + 1) * VIEWPORT_H/SCALE/2);

    // Vertical translation and scale to handle zoom
    translate(0, (1/parkour.rendering_scale - 1) * VIEWPORT_H/2 * parkour.rendering_scale);
    scale(parkour.rendering_scale);

    // Draw all background elements
    for(let i = 0; i < parkour.background_polys.length; i++) {
        let poly = parkour.background_polys[i];
        let pos = poly.vertices[0][0] * parkour.rendering_scale - parkour.scroll_offset;
        if(pos >= -0.01 * VIEWPORT_W && pos < VIEWPORT_W){
            drawPolygon(poly.vertices, poly.color);
        }

    }

    // Draw all physical elements
    for(let i = 0; i < parkour.terrain_bodies.length; i++) {
        let poly = parkour.terrain_bodies[i];
        let shape = poly.body.GetFixtureList().GetShape();
        let vertices = [];

        /*let pos = poly.body.GetPosition();
        let w_pos = poly.body.GetWorldPoint(pos);
        let x_pos = w_pos.x/parkour.rendering_scale - parkour.scroll_offset;
        if(x_pos >= -0.01 * VIEWPORT_W && x_pos < VIEWPORT_W){*/
            if(poly.type == "creeper"){
                for(let i = 0; i < shape.m_count; i++){
                    let world_pos = poly.body.GetWorldPoint(shape.m_vertices[i]);
                    vertices.push([world_pos.x, world_pos.y]);
                }
                noStroke();
                drawPolygon(vertices, poly.color);
            }
            else{
                let v1 = poly.body.GetWorldPoint(shape.m_vertex1);
                let v2 = poly.body.GetWorldPoint(shape.m_vertex2);
                vertices = [[v1.x, v1.y], [v2.x, v2.y]];
                strokeWeight(1);
                drawLine(vertices, poly.color);
            }
        }
    //}
}

function drawPolygon(vertices, color){
    fill(color);
    beginShape();
    for(let v of vertices){
        vertex(v[0], VIEWPORT_H - v[1]);
    }
    endShape(CLOSE);
}

function drawLine(vertices, color){
    stroke(color);
    line(vertices[0][0], VIEWPORT_H - vertices[0][1], vertices[1][0], VIEWPORT_H - vertices[1][1]);
}
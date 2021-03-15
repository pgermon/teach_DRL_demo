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

/*
// TEST EXAMPLE IN P5.JS ONLINE EDITOR: https://editor.p5js.org/
function draw() {
  push()
  let w = 20;
  let s = 2;
  let z = 1.5;
  noFill()

  rect(width/2, height/2, w, w);
  scale(s)
  translate((1 - s) * width/s/2, (1 - s) * height/s/2)
  strokeWeight(1/s)
  stroke("#00B400")
  rect(width/2, height/2, w, w);

  scale(z)
  strokeWeight(1/z);
  stroke("#0000FF");
  translate((1 - z) * width/z/2, (1 - z) * height/2/z)
  rect(width/2, height/2, w, w);

  //translate(- width/2, 0)
  //rect(width/2 - w/2, height/2 - w/2, w, w);

  pop()

  push()
  stroke("#FF0000")
  line(width/2, 0, width/2, height)
  line(0, height/2, width, height/2)
  pop()
}
 */

function draw() {
    let parkour = window.game.env;

    push();
    parkour.render_change = false;
    drawParkour(parkour);
    drawAgent(parkour.agent_body, parkour.scale);

    if(window.draw_joints){
        drawJoints(parkour.creepers_joints, parkour.scale);
        drawJoints(parkour.agent_body.motors, parkour.scale);
    }
    pop();
    /*let vertices = [
        [-100, VIEWPORT_H/2],
        [VIEWPORT_W + 100, VIEWPORT_H/2]
    ];
    drawLine(vertices, "#FF0000");*/
}

function drawJoints(joints, scale){
    for(let i = 0; i < joints.length; i++){
        let posA = joints[i].m_bodyA.GetWorldPoint(joints[i].m_localAnchorA);
        let posB = joints[i].m_bodyB.GetWorldPoint(joints[i].m_localAnchorB);
        noStroke();
        let joint_type = joints[i].GetUserData().name;
        fill(JOINTS_COLORS[joint_type]);
        let radius = joint_type == "creeper" ? 4 : 7;
        circle(posA.x, VIEWPORT_H - posA.y, radius/scale);
        circle(posB.x, VIEWPORT_H - posB.y, radius/scale);

    }
}

function drawAgent(agent, scale){
    let polys = agent.get_elements_to_render();
    for(let poly of polys){
        let shape = poly.GetFixtureList().GetShape();
        let vertices = [];
        for(let i = 0; i < shape.m_count; i++){
            let world_pos = poly.GetWorldPoint(shape.m_vertices[i]);
            vertices.push([world_pos.x, world_pos.y]);
        }
        strokeWeight(2/scale);
        stroke(poly.color2);
        drawPolygon(vertices, poly.color1);

    }
}

function drawParkour(parkour){
    // Sky
    noStroke();
    drawPolygon(parkour.sky_poly.vertices, parkour.sky_poly.color);

    // Water
    /*let vertices = [
        [0, 0],
        [0, VIEWPORT_H/2 - VIEWPORT_H/2 * parkour.zoom + parkour.water_level * VIEWPORT_H * parkour.zoom],
        [VIEWPORT_W, VIEWPORT_H/2 - VIEWPORT_H/2 * parkour.zoom + parkour.water_level * VIEWPORT_H * parkour.zoom],
        [VIEWPORT_W, 0]
    ];*/

    /*let vertices = [
        [0, 0],
        [0, VIEWPORT_H/2 - VIEWPORT_H/parkour.scale/2 + parkour.water_level * VIEWPORT_H/parkour.scale],
        [VIEWPORT_W, VIEWPORT_H/2 - VIEWPORT_H/parkour.scale/2 + parkour.water_level * VIEWPORT_H/parkour.scale],
        [VIEWPORT_W, 0]
    ];*/

    /*let vertices = [
        [0, 0],
        [0, VIEWPORT_H/2 - VIEWPORT_H/2/parkour.scale * parkour.zoom + parkour.water_level * VIEWPORT_H/parkour.scale * parkour.zoom],
        [VIEWPORT_W, VIEWPORT_H/2 - VIEWPORT_H/2/parkour.scale * parkour.zoom + parkour.water_level * VIEWPORT_H/parkour.scale * parkour.zoom],
        [VIEWPORT_W, 0]
    ];*/
    //drawPolygon(vertices, "#77ACE5");


    translate(- parkour.scroll_offset, 0);

    // Top and bottom strips to fill ground and ceiling
    //if(parkour.zoom < 1){
    /*
        // ground
        vertices = [
            [0, 0],
            [(TERRAIN_LENGTH - 1) * TERRAIN_STEP * parkour.zoom, 0],
            [(TERRAIN_LENGTH - 1) * TERRAIN_STEP * parkour.zoom, VIEWPORT_H/2 - VIEWPORT_H/2/parkour.scale * parkour.zoom],
            [0, VIEWPORT_H/2 - VIEWPORT_H/2/parkour.scale * parkour.zoom]
        ];
        drawPolygon(vertices, "#66994D");

        // ceiling
        vertices = [
            [0, VIEWPORT_H],
            [(TERRAIN_LENGTH - 1) * TERRAIN_STEP * parkour.zoom, VIEWPORT_H],
            [(TERRAIN_LENGTH - 1) * TERRAIN_STEP * parkour.zoom, VIEWPORT_H/2 + VIEWPORT_H/2/parkour.scale * parkour.zoom],
            [0, VIEWPORT_H/2 + VIEWPORT_H/2/parkour.scale * parkour.zoom]
        ];
        drawPolygon(vertices, "#808080");
    //}
     */

    // Works for any scale but without zoom
    scale(parkour.scale);
    scale(parkour.zoom);

    translate(0, (1 - parkour.scale * parkour.zoom) * VIEWPORT_H/(parkour.scale * parkour.zoom));
    //translate(0, (1 - parkour.zoom) * VIEWPORT_H/parkour.zoom);

    // Works for scale = 1
    //translate(0, (1 - parkour.scale * parkour.zoom) * VIEWPORT_H/2/parkour.scale);
    //scale(parkour.scale * parkour.zoom);


    // Water
    let vertices = [
        [- VIEWPORT_W, 0],
        [- VIEWPORT_W, parkour.water_level * VIEWPORT_H/parkour.scale],
        [2 * VIEWPORT_W, parkour.water_level * VIEWPORT_H/parkour.scale],
        [2 * VIEWPORT_W, 0]
    ];
    drawPolygon(vertices, "#77ACE5");

    // Draw all background elements
    for(let i = 0; i < parkour.background_polys.length; i++) {
        let poly = parkour.background_polys[i];
        let pos = poly.vertices[0][0] * parkour.zoom - parkour.scroll_offset;
        //if(pos >= -0.01 * VIEWPORT_W && pos < VIEWPORT_W){
            drawPolygon(poly.vertices, poly.color);
        //}

    }

    // Draw all physical elements
    for(let i = 0; i < parkour.terrain_bodies.length; i++) {
        let poly = parkour.terrain_bodies[i];
        let shape = poly.body.GetFixtureList().GetShape();
        let vertices = [];

        /*let pos = poly.body.GetPosition();
        let w_pos = poly.body.GetWorldPoint(pos);
        let x_pos = w_pos.x/parkour.zoom - parkour.scroll_offset;
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
                strokeWeight(1/parkour.scale);
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
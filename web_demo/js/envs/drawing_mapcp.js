//region Constants

const FPS = 50
const SCALE  = 30 // affects how fast-paced the game is, forces should be adjusted as well
const VIEWPORT_W = 600
const VIEWPORT_H = 400

//let RENDERING_VIEWER_W = 2 * VIEWPORT_W
let RENDERING_VIEWER_W = 0.8 * window.innerWidth;
let RENDERING_VIEWER_H = VIEWPORT_H

const NB_LIDAR = 10
const LIDAR_RANGE = 160/SCALE

const INITIAL_RANDOM = 5

const TERRAIN_STEP   = 14/SCALE
const TERRAIN_LENGTH = 200     // in steps
const TERRAIN_HEIGHT = VIEWPORT_H/SCALE/4
const TERRAIN_END = 5;
const INITIAL_TERRAIN_STARTPAD = 20 // in steps
const FRICTION = 2.5
const WATER_DENSITY = 1.0
const CREEPER_UNIT = 1;
const NB_FIRST_STEPS_HANG = 5
const SCROLL_MAX = 300;

//endregion

class DrawingMAPCP {

    constructor(morphologies, policies, positions, input_CPPN_dim=3, terrain_cppn_scale=10,
                ceiling_offset=200, ceiling_clip_offset=0, water_clip=20,
                movable_creepers=false, ground, ceiling){

        // Seed and init Box2D
        //this.seed();
        this.scale = SCALE;
        this.zoom = 0.35;
        this.contact_listener = new ContactDetector(this);
        let gravity = new b2.Vec2(0, -10);
        this.world = new b2.World(gravity);
        this.world.SetContactListener(this.contact_listener);
        this.movable_creepers = movable_creepers;

        // Create agent
        this.agents = [];
        console.assert(morphologies.length == policies.length && morphologies.length == positions.length);

        for(let i = 0; i < morphologies.length; i++){
            this.create_agent(morphologies[i], policies[i], positions[i]);
        }
        this.agents_init_pos = positions;

        // Terrain and dynamics
        this.terrain_bodies = [];
        this.background_polys = []
        // TODO: handle kwargs
        this.water_dynamics = new WaterDynamics(this.world.m_gravity /*, max_push=water_clip*/);
        this.climbing_dynamics = new ClimbingDynamics();
        this.prev_shaping = null;
        this.episodic_reward = 0;
        this.creepers_joints = [];

        //if(this.agents[0].agent_body.AGENT_WIDTH / TERRAIN_STEP + 5 <= INITIAL_TERRAIN_STARTPAD){
          this.TERRAIN_STARTPAD = INITIAL_TERRAIN_STARTPAD;
        //}
        //else{
        //    this.TERRAIN_STARTPAD = this.agents[0].agent_body.AGENT_WIDTH / TERRAIN_STEP + 5;
        //}
        this.create_terrain_fixtures();

        // TODO: Cppn init
        this.input_CPPN_dim = input_CPPN_dim;
        this.terrain_CPPN = new CPPN(TERRAIN_LENGTH, input_CPPN_dim);
        this.set_terrain_cppn_scale(terrain_cppn_scale, ceiling_offset, ceiling_clip_offset);

        this.ground = ground;
        this.ceiling = ceiling;

        // Set info / action spaces
        //this._generate_agent(); // To get state / action sizes
        //let agent_action_size = this.agent_body.get_action_size();
        //this.action_space =

        //let agent_state_size = this.agent_body.get_state_size();
        // let high = // TODO
        // this.observation_space = // TODO
    }

    create_agent(morphology, policy, init_pos){

        let agent = {
            id: this.agents.length,
            name: policy.name,
            is_selected: false,
            morphology: morphology,
            policy: policy,
            init_pos: init_pos
        };

        if(morphology == "classic_bipedal") {
            agent.agent_body = new ClassicBipedalBody(SCALE, /*walker_args*/);
            agent.lidars_config = this.set_lidars_type("down");
        }
        else if(morphology == "climbing_profile_chimpanzee") {
            agent.agent_body = new ClimbingProfileCHimpanzee(SCALE);
            agent.lidars_config = this.set_lidars_type("up");
        }
        else if(morphology == "fish"){
            agent.agent_body = new FishBody(SCALE, 80, WATER_DENSITY, 600);
            agent.lidars_config = this.set_lidars_type("full");
        }
        else {
            agent.agent_body = new OldClassicBipedalBody(SCALE, /*walker_args*/);
            agent.lidars_config = this.set_lidars_type("down");
        }

        this.agents.push(agent);
    }

    seed(){
        let seed = "";
        for(let dim of this.CPPN_input_vector){
            seed += dim;
        }
        seed += this.water_level;
        seed += this.TERRAIN_CPPN_SCALE;
        seed += this.creepers_width;
        seed += this.creepers_height;
        seed += this.creepers_spacing;
        seed += this.movable_creepers;;

        //console.log("seed = " + seed);
        Math.seedrandom(seed);
        //console.log(Math.random());
    }

    set_lidars_type(lidars_type){
        // Use 'down' for walkers, 'up' for climbers and 'full' for swimmers.
        let lidar_config = {};
        if(lidars_type == "down") {
            lidar_config.lidar_angle = 1.5;
            lidar_config.lidar_y_offset = 0;
        }
        else if(lidars_type == "up") {
            lidar_config.lidar_angle = 2.3;
            lidar_config.lidar_y_offset = 1.5;
        }
        else if(lidars_type == "full") {
            lidar_config.lidar_angle = Math.PI;
            lidar_config.lidar_y_offset = 0;
        }
        return lidar_config;
    }

    set_terrain_cppn_scale(terrain_cppn_scale, ceiling_offset, ceiling_clip_offset){
        /*
         * Scale the terrain generated by the Cppn to be more suited to our embodiments.
         */
        console.assert(terrain_cppn_scale > 1);
        this.TERRAIN_CPPN_SCALE = terrain_cppn_scale;
        this.CEILING_LIMIT = 1000 / this.TERRAIN_CPPN_SCALE;
        this.GROUND_LIMIT = -1000 / this.TERRAIN_STARTPAD;
        this.ceiling_offset = ceiling_offset / this.TERRAIN_CPPN_SCALE;
        this.ceiling_clip_offset = ceiling_clip_offset / this.TERRAIN_CPPN_SCALE;
    }

    set_environment(input_vector, water_level, creepers_width=null,
                    creepers_height=null, creepers_spacing=0.1, terrain_cppn_scale=10, movable_creepers){
        /*
         * Set the parameters controlling the PCG algorithm to generate a task.
         * Call this method before `reset()`.
         */
        this.CPPN_input_vector = input_vector;
        this.water_level = water_level > 0 ? water_level : - 0.01;
        this.creepers_width = creepers_width;
        this.creepers_height = creepers_height;
        this.creepers_spacing = Math.max(0.01, creepers_spacing);
        this.movable_creepers = movable_creepers;
        this.set_terrain_cppn_scale(terrain_cppn_scale,
                        this.ceiling_offset * this.TERRAIN_CPPN_SCALE,
                                    this.ceiling_clip_offset * this.TERRAIN_CPPN_SCALE);
        this.seed();
    }

    _destroy(){
        this.world.SetContactListener(null);
        for(let t of this.terrain_bodies){
            this.world.DestroyBody(t.body);
        }
        this.terrain_bodies = [];
        this.creepers_joints = [];
        for(let agent of this.agents){
            agent.agent_body.destroy(this.world);
        }
    }

    reset(){
        this._destroy();
        this.contact_listener = new ContactDetector(this);
        this.world.SetContactListener(this.contact_listener);
        this.prev_shaping = null;
        this.scroll = [0, 0];
        this.water_y = this.GROUND_LIMIT;
        this.assets_bodies = [];

        for(let agent of this.agents){
            agent.nb_steps_outside_water = 0;
            agent.nb_steps_under_water = 0;
            agent.critical_contact = false;
        }

        this.generate_game();

        for(let agent of this.agents) {
            this.init_agent(agent);
        }

        let step_rets = this.step();
        let initial_states = [...step_rets.map(e => e[0])];
        return initial_states;
    }

    init_agent(agent){
        agent.lidars = [];
        for(let i = 0; i < NB_LIDAR; i++){
            agent.lidars.push(new LidarCallback(agent.agent_body.reference_head_object.GetFixtureList().GetFilterData().maskBits));
        }

        agent.actions = Array.from({length: agent.agent_body.get_action_size()}, () => 0);

        // If embodiment is a climber, make it start hanging on the ceiling using a few steps to let the Box2D solver handle positions.
        if(agent.agent_body.body_type == BodyTypesEnum.CLIMBER){
            this.init_climber_pos(agent);
        }

        agent.nb_steps_outside_water = 0;
        agent.nb_steps_under_water = 0;
        agent.episodic_reward = 0;
    }


    init_climber_pos(agent){
        // Init climber
        let y_diff = 0;
        for(let i = 0; i < agent.agent_body.sensors.length; i++){
            agent.actions[agent.actions.length - i - 1] = 1;
            // Hang sensor
            let sensor = agent.agent_body.sensors[agent.agent_body.sensors.length - i - 1];
            let sensor_position = sensor.GetPosition();
            //let idx = Math.round(sensor_position.x / ((TERRAIN_LENGTH + this.TERRAIN_STARTPAD) * TERRAIN_STEP) * (TERRAIN_LENGTH + this.TERRAIN_STARTPAD));
            let ceiling_y = find_best_y(sensor_position.x, this.terrain_ceiling);
            if(y_diff == 0){
                y_diff = ceiling_y - sensor_position.y;
                //y_diff = this.terrain_ceiling[idx].y - sensor_position.y;
                //y_diff = TERRAIN_HEIGHT + this.ceiling_offset - sensor_position.y;
            }
            sensor.SetTransform(new b2.Vec2(sensor_position.x, ceiling_y),
                sensor.GetAngle());
        }

        for(let body_part of agent.agent_body.body_parts){
            let body_part_pos = body_part.GetPosition();
            body_part.SetTransform(new b2Vec2(body_part_pos.x, body_part_pos.y + y_diff),
                body_part.GetAngle());
        }

        /*for(let i = 0; i < NB_FIRST_STEPS_HANG; i++){
            this.step(agent, actions);
        }*/
    }

    step(){
        // Check if agents are dead
        for(let agent of this.agents){
            if(agent.agent_body.body_type == BodyTypesEnum.SWIMMER){
                if(agent.nb_steps_outside_water > agent.agent_body.nb_steps_can_survive_outside_water){
                    agent.is_dead = true;
                    agent.actions = Array.from({length: agent.agent_body.get_action_size()}, () => 0);
                }
                else{
                    agent.is_dead = false;
                }
            }
            else{
                if(agent.nb_steps_under_water > agent.agent_body.nb_steps_can_survive_under_water){
                    agent.is_dead = true;
                    agent.actions = Array.from({length: agent.agent_body.get_action_size()}, () => 0);
                }
                else{
                    agent.is_dead = false;
                }
            }

            agent.agent_body.activate_motors(agent.actions);

            // Prepare climbing dynamics according to the actions (i.e. ready sensor to grasp or release sensor grip by destroying joint)
            if(agent.agent_body.body_type == BodyTypesEnum.CLIMBER){
                this.climbing_dynamics.before_step_climbing_dynamics(agent.actions, agent.agent_body, this.world);
            }
        }

        this.world.Step(1.0 / FPS, 6 * 30, 2 * 30);

        for(let agent of this.agents) {
            // Create joints between sensors ready to grasp if collision with graspable area was detected
            if(agent.agent_body.body_type == BodyTypesEnum.CLIMBER){
                this.climbing_dynamics.after_step_climbing_dynamics(this.world.m_contactManager.m_contactListener.climbing_contact_detector, this.world);
            }
        }

        // Calculate water physics
        this.world.m_contactManager.m_contactListener.water_contact_detector.fixture_pairs = this.world.m_contactManager.m_contactListener.water_contact_detector.fixture_pairs.filter(function(fp, index, array){

            return fp[0].GetShape() != null && fp[1].GetShape() != null;
        });
        //let fixture_pairs_shapes = [...this.world.m_contactManager.m_contactListener.water_contact_detector.fixture_pairs.flatMap(fp => [fp[0].GetShape(), fp[1].GetShape()])];
        //if(fixture_pairs_shapes.indexOf(null) == -1){
            this.water_dynamics.calculate_forces(this.world.m_contactManager.m_contactListener.water_contact_detector.fixture_pairs);
        //}

        let ret = [];
        for(let agent of this.agents) {
            let head = agent.agent_body.reference_head_object;
            let pos = head.GetPosition();
            let vel = head.GetLinearVelocity();

            this.update_lidars(agent);

            let is_under_water = pos.y <= this.water_y;
            if(!agent.is_dead){
                if(is_under_water){
                    agent.nb_steps_under_water += 1;
                    agent.nb_steps_outside_water = 0;
                }
                else{
                    agent.nb_steps_under_water = 0;
                    agent.nb_steps_outside_water += 1;
                }
            }

            let state = [
                head.GetAngle(), // Normal angles up to 0.5 here, but sure more is possible.
                2.0 * head.GetAngularVelocity() / FPS,
                0.3 * vel.x * (VIEWPORT_W / SCALE) / FPS, // Normalized to get [-1, 1] range
                0.3 * vel.y * (VIEWPORT_H / SCALE) / FPS,
                is_under_water ? 1.0 : 0.0,
                agent.is_dead ? 1.0 : 0.0
            ];

            // add leg-related state
            state = state.concat(agent.agent_body.get_motors_state());

            // add sensor-related state for climbers
            if(agent.agent_body.body_type == BodyTypesEnum.CLIMBER){
                state = state.concat(agent.agent_body.get_sensors_state());
            }

            // add lidar-related state with distance and surface detected
            let nb_of_water_detected = 0;
            let surface_detected = [];
            for(let lidar of agent.lidars){
                state.push(lidar.fraction);
                if(lidar.is_water_detected){
                    surface_detected.push(-1);
                    nb_of_water_detected += 1;
                }

                else if(lidar.is_creeper_detected){
                    surface_detected.push(1)
                }
                else{
                    surface_detected.push(0);
                }
            }
            state = state.concat(surface_detected)

            let shaping = 130 * pos.x / SCALE; // moving forward is a way to receive reward (normalized to get 300 on completion)
            // TODO: check if has attribute remove_reward_on_head_angle
            if(agent.agent_body.remove_reward_on_head_angle){
                shaping -= 5.0 * Math.abs(state[0]); // keep head straight, other than that and falling, any behavior is unpunished
            }

            let reward = 0;
            if(this.prev_shaping != null){
                reward = shaping - this.prev_shaping;
            }
            this.prev_shaping = shaping;

            for(let a of agent.actions){
                reward -= agent.agent_body.TORQUE_PENALTY * 80 * Math.max(0, Math.min(Math.abs(a), 1));
                // normalized to about -50.0 using heuristic, more optimal agent should spend less
            }

            // Ending conditions
            let done = false;
            if(agent.critical_contact || pos.x < 0){
                reward -= 100;
                done = true;
            }
            if(pos.x > (TERRAIN_LENGTH + this.TERRAIN_STARTPAD - TERRAIN_END) * TERRAIN_STEP){
                done = true;
            }
            agent.episodic_reward += reward;

            ret.push([state, reward, done, {"success": agent.episodic_reward > 230}]);
        }

        return ret;
    }

    update_lidars(agent){
        let pos = agent.agent_body.reference_head_object.GetPosition();
        for(let i = 0; i < NB_LIDAR; i++){
            agent.lidars[i].fraction = 1.0;
            agent.lidars[i].p1 = pos;
            agent.lidars[i].p2 = new b2.Vec2(
                pos.x + Math.sin(agent.lidars_config.lidar_angle * i / NB_LIDAR + agent.lidars_config.lidar_y_offset) * LIDAR_RANGE,
                pos.y - Math.cos(agent.lidars_config.lidar_angle * i / NB_LIDAR + agent.lidars_config.lidar_y_offset) * LIDAR_RANGE
            );
            this.world.RayCast(agent.lidars[i], agent.lidars[i].p1, agent.lidars[i].p2);
        }
    }

    close(){
        this.world.SetContactListener(null);
        this.contact_listener.Reset();
        this._destroy();
    }

    // region Rendering
    // ------------------------------------------ RENDERING ------------------------------------------

    render() {
        // call p5.js draw function once
        redraw();
    }

    _SET_RENDERING_VIEWPORT_SIZE(width, height=null, keep_ratio=true){
        RENDERING_VIEWER_W = width;
        if(keep_ratio || height == null){
            RENDERING_VIEWER_H = Math.floor(RENDERING_VIEWER_W / (2 * VIEWPORT_W / VIEWPORT_H));
        }
        else{
            RENDERING_VIEWER_H = height;
        }
    }
    //endregion

    //region Fixtures Initialization
    // ------------------------------------------ FIXTURES INITIALIZATION ------------------------------------------

    create_terrain_fixtures(){

        // Polygon fixture
        this.fd_polygon = new b2.FixtureDef();
        this.fd_polygon.shape = new b2.PolygonShape();
        let vertices = [
            new b2.Vec2(0, 0),
            new b2.Vec2(1, 0),
            new b2.Vec2(1, -1),
            new b2.Vec2(0, -1)];
        this.fd_polygon.shape.Set(vertices, 4);
        this.fd_polygon.friction = FRICTION;
        this.fd_polygon.filter.categoryBits = 0x1;
        this.fd_polygon.filter.maskBits = 0xFFFF;

        // Edge fixture
        this.fd_edge = new b2.FixtureDef();
        this.fd_edge.shape = new b2.EdgeShape();
        this.fd_edge.shape.Set(new b2.Vec2(0, 0), new b2.Vec2(1, 1));
        this.fd_edge.friction = FRICTION;
        this.fd_edge.filter.categoryBits = 0x1;
        this.fd_edge.filter.maskBits = 0xFFFF;

        // Water fixture
        this.fd_water = new b2.FixtureDef();
        this.fd_water.shape = new b2.PolygonShape();
        vertices = [
            new b2.Vec2(0, 0),
            new b2.Vec2(1, 0),
            new b2.Vec2(1, -1),
            new b2.Vec2(0, -1)];
        this.fd_water.shape.Set(vertices, 4);
        this.fd_water.density = WATER_DENSITY;
        this.fd_water.isSensor = true;

        // Creeper fixture
        this.fd_creeper = new b2.FixtureDef();
        this.fd_creeper.shape = new b2.PolygonShape();
        vertices = [
            new b2.Vec2(0, 0),
            new b2.Vec2(1, 0),
            new b2.Vec2(1, -1),
            new b2.Vec2(0, -1)];
        this.fd_creeper.shape.Set(vertices, 4);
        this.fd_creeper.density = 5.0;
        this.fd_creeper.isSensor = true;

        // Circle fixture
        this.fd_circle = new b2.FixtureDef();
        this.fd_circle.shape = new b2.CircleShape();
        this.fd_circle.density = 5.0;
        this.fd_circle.friction = FRICTION;
        this.fd_circle.filter.categoryBits = 0x1;
        this.fd_circle.filter.maskBits = 0xFFFF;

    }
    //endregion

    // region Game Generation
    // ------------------------------------------ GAME GENERATION ------------------------------------------

    generate_game(){
        this._generate_terrain(this.ground, this.ceiling);
        this._generate_clouds();

        for(let agent of this.agents){
            this._generate_agent(agent);
        }
    }

    clip_ceiling_values(row, clip_offset){
        if(row["ceiling"] >= row["ground"] + clip_offset){
            return row["ceiling"];
        }
        else{
            return row["ground"] + clip_offset;
        }
    }

    _generate_terrain(ground = [], ceiling = []){

        this.terrain_ground = [];
        this.terrain_ceiling = [];

        // Create startpad
        for(let i = 0; i < this.TERRAIN_STARTPAD; i++){
            this.terrain_ground.push({x: i * TERRAIN_STEP, y: TERRAIN_HEIGHT});
            this.terrain_ceiling.push({x: i * TERRAIN_STEP, y: TERRAIN_HEIGHT + this.ceiling_offset});
        }

        /* DRAWING GENERATION */
        if(window.get_mode() == 'drawing'){
            // Create ground terrain
            if(ground.length > 0){
                let ground_x_offset = 0//this.TERRAIN_STARTPAD * TERRAIN_STEP - ground[0].x;
                let ground_y_offset = 0//TERRAIN_HEIGHT - ground[0].y;
                for(let p of ground){
                    this.terrain_ground.push({x: p.x + ground_x_offset, y: p.y + ground_y_offset});
                }
            }

            // Create ceiling terrain
            if(ceiling.length > 0) {
                let ceiling_x_offset = 0//this.TERRAIN_STARTPAD * TERRAIN_STEP - ceiling[0].x;
                let ceiling_y_offset = 0//TERRAIN_HEIGHT + this.ceiling_offset - ceiling[0].y;
                for(let p of ceiling){
                    this.terrain_ceiling.push({x: p.x + ceiling_x_offset, y: p.y + ceiling_y_offset}); //TODO: clip ceiling height according to ground?
                }
            }
        }
        /* CPPN GENERATION */
        else{
            let cppn_y = this.terrain_CPPN.generate(this.CPPN_input_vector).arraySync();
            cppn_y = cppn_y.map(e => [e[0] / this.TERRAIN_CPPN_SCALE, e[1] / this.TERRAIN_CPPN_SCALE]);

            // Get y values for the ground and align them with the startpad
            let ground_offset = TERRAIN_HEIGHT - cppn_y[0][0];
            let cppn_ground_y = cppn_y.map(e => e[0] + ground_offset);

            // Get y values for the ceiling and align them with the startpad
            let ceiling_offset = TERRAIN_HEIGHT + this.ceiling_offset - cppn_y[0][1];
            let cppn_ceiling_y = cppn_y.map(e => e[1] + ceiling_offset);

            // Push the terrain values in the lists
            for(let i = 0; i < TERRAIN_LENGTH; i++){
                this.terrain_ground.push({x: (this.TERRAIN_STARTPAD + i) * TERRAIN_STEP, y: cppn_ground_y[i]});

                // Clip ceiling
                let ceiling_val = cppn_ground_y[i] + this.ceiling_clip_offset;
                if(cppn_ceiling_y[i] >= ceiling_val){
                    ceiling_val = cppn_ceiling_y[i];
                }
                this.terrain_ceiling.push({x: (this.TERRAIN_STARTPAD + i) * TERRAIN_STEP, y: ceiling_val});
            }
        }
        window.ground = [...this.terrain_ground];
        window.ground.splice(0, this.TERRAIN_STARTPAD);
        window.ceiling = [...this.terrain_ceiling];
        window.ceiling.splice(0, this.TERRAIN_STARTPAD);

        // Draw terrain
        this.terrain_bodies = [];
        this.background_polys = [];
        let poly;
        let poly_data;

        // Water
        this.min_ground_y = Math.min(...this.terrain_ground.map(p => p.y));
        this.air_max_distance = Math.max(...this.terrain_ceiling.map(p => p.y)) - this.min_ground_y;
        this.water_y = this.min_ground_y + this.water_level * this.air_max_distance;

        let water_poly = [
            [this.terrain_ground[0].x, this.GROUND_LIMIT],
            [this.terrain_ground[0].x, this.water_y],
            [this.terrain_ground[this.terrain_ground.length - 1].x, this.water_y],
            [this.terrain_ground[this.terrain_ground.length - 1].x, this.GROUND_LIMIT]
        ];

        this.fd_water.shape.Set([new b2.Vec2(water_poly[0][0], water_poly[0][1]),
                new b2.Vec2(water_poly[1][0], water_poly[1][1]),
                new b2.Vec2(water_poly[2][0], water_poly[2][1]),
                new b2.Vec2(water_poly[3][0], water_poly[3][1])],
            4);
        let body_def = new b2.BodyDef();
        body_def.type = b2.Body.b2_staticBody;
        let t = this.world.CreateBody(body_def);
        t.CreateFixture(this.fd_water);
        t.SetUserData(new CustomUserData("water", CustomUserDataObjectTypes.WATER));
        let color = "#77ACE5"; // [0.465, 0.676, 0.898];
        this.water_poly = {
            type : "water",
            color: color,
            vertices: water_poly,
            body : t
        };
        //this.terrain_bodies.push(water_poly);

        for(let i = 0; i < this.terrain_ground.length - 1; i++){
            // Ground
            poly = [
                [this.terrain_ground[i].x, this.terrain_ground[i].y],
                [this.terrain_ground[i + 1].x, this.terrain_ground[i + 1].y]
            ];
            this.fd_edge.shape.Set(new b2.Vec2(poly[0][0], poly[0][1]),
                new b2.Vec2(poly[1][0], poly[1][1]));
            let body_def = new b2.BodyDef();
            body_def.type = b2.Body.b2_staticBody;
            let t = this.world.CreateBody(body_def);
            t.CreateFixture(this.fd_edge);
            t.SetUserData(new CustomUserData("grass", CustomUserDataObjectTypes.TERRAIN));
            let color = i % 2 == 0 ? "#4dff4d" : "#4dcc4d"; // [0.3, 1.0, 0.3] : [0.3, 0.8, 0.3]
            poly_data = {
                type : "ground",
                color : color,
                body : t,
            }
            this.terrain_bodies.push(poly_data);

            // Visual poly to fill the ground
            if(i <= this.terrain_ground.length / 2){
                poly.push([poly[1][0] + 10 * TERRAIN_STEP, 2 * this.GROUND_LIMIT]);
                poly.push([poly[0][0], 2 * this.GROUND_LIMIT]);
            }
            else{
                poly.push([poly[1][0], 2 * this.GROUND_LIMIT]);
                poly.push([poly[0][0] - 10 * TERRAIN_STEP, 2 * this.GROUND_LIMIT]);
            }

            color = "#66994D"; //[0.4, 0.6, 0.3];
            poly_data = {
                type : "ground",
                color : color,
                vertices : poly,
            }
            this.background_polys.push(poly_data);
        }

        for(let i = 0; i < this.terrain_ceiling.length - 1; i++){
            // Ceiling
            poly = [
                [this.terrain_ceiling[i].x, this.terrain_ceiling[i].y],
                [this.terrain_ceiling[i + 1].x, this.terrain_ceiling[i + 1].y]
            ];
            this.fd_edge.shape.Set(new b2.Vec2(poly[0][0], poly[0][1]),
                new b2.Vec2(poly[1][0], poly[1][1]));
            body_def = new b2.BodyDef();
            body_def.type = b2.Body.b2_staticBody;
            t = this.world.CreateBody(body_def);
            t.CreateFixture(this.fd_edge);
            t.SetUserData(new CustomUserData("rock", CustomUserDataObjectTypes.GRIP_TERRAIN)); // TODO: CustomUserData
            color = "#004040"; // [0, 0.25, 0.25];
            poly_data = {
                type : "ceiling",
                color : color,
                body : t,
            }
            this.terrain_bodies.push(poly_data);

            // Visual poly to fill the ceiling
            if(i <= this.terrain_ceiling.length / 2){
                poly.push([poly[1][0] + 10 * TERRAIN_STEP, 2 * this.CEILING_LIMIT]);
                poly.push([poly[0][0], 2 * this.CEILING_LIMIT]);
            }
            else{
                poly.push([poly[1][0], 2 * this.CEILING_LIMIT]);
                poly.push([poly[0][0] - 10 * TERRAIN_STEP, 2 * this.CEILING_LIMIT]);
            }
            color = "#808080"; // [0.5, 0.5, 0.5];
            poly_data = {
                type : "ceiling",
                color : color,
                vertices : poly,
            }
            this.background_polys.push(poly_data);
        }

        // Creepers
        if(this.creepers_width != null && this.creepers_height != null){
            let creeper_width = Math.max(0.2, this.creepers_width);
            let nb_creepers = Math.floor(this.terrain_ceiling[this.terrain_ceiling.length - 1].x / (this.creepers_spacing + creeper_width));

            for(let i = 1; i < nb_creepers; i++){
                let creeper_height = Math.max(0.2, Math.random() * (0.1 - (- 0.1)) + this.creepers_height - 0.1);
                let creeper_x_init_pos = i * (this.creepers_spacing + creeper_width);
                let creeper_y_init_pos = find_best_y(creeper_x_init_pos, this.terrain_ceiling);

                if(this.movable_creepers){ // Break creepers in multiple objects linked by joints

                    // Create a static base to which the creeper is attached
                    this.fd_creeper.shape.SetAsBox(creeper_width/2, 0.2);
                    body_def = new b2.BodyDef();
                    body_def.type = b2.Body.b2_staticBody;
                    body_def.position.Set(creeper_x_init_pos, creeper_y_init_pos - 0.1);
                    t = this.world.CreateBody(body_def);
                    t.CreateFixture(this.fd_creeper);
                    t.SetUserData(new CustomUserData("creeper", CustomUserDataObjectTypes.SENSOR_GRIP_TERRAIN));
                    let previous_creeper_part = t;

                    // Cut the creeper in unit parts
                    for(let w = 0; w < Math.ceil(creeper_height); w++){
                        let h;
                        // last iteration: rest of the creeper
                        if(w == Math.floor(creeper_height / CREEPER_UNIT)){
                            h = Math.max(0.2, creeper_height % CREEPER_UNIT);
                        }
                        else{
                            h = CREEPER_UNIT;
                        }

                        this.fd_creeper.shape.SetAsBox(creeper_width/2, h/2);
                        body_def = new b2.BodyDef();
                        body_def.type = b2.Body.b2_dynamicBody;
                        body_def.position.Set(creeper_x_init_pos, creeper_y_init_pos - (w * CREEPER_UNIT) - h/2);
                        t = this.world.CreateBody(body_def);
                        t.CreateFixture(this.fd_creeper);
                        t.SetUserData(new CustomUserData("creeper", CustomUserDataObjectTypes.SENSOR_GRIP_TERRAIN));
                        color = "#6F8060"; // [0.437, 0.504, 0.375];
                        poly_data = {
                            type : "creeper",
                            color1 : color,
                            color2 : color,
                            body : t,
                        }
                        this.terrain_bodies.push(poly_data);

                        let rjd_def = new b2.RevoluteJointDef();
                        let anchor = new b2.Vec2(creeper_x_init_pos, creeper_y_init_pos - (w * CREEPER_UNIT));
                        rjd_def.Initialize(previous_creeper_part, t, anchor);
                        rjd_def.enableMotor = false;
                        rjd_def.enableLimit = true;
                        rjd_def.lowerAngle = -0.4 * Math.PI;
                        rjd_def.upperAngle = 0.4 * Math.PI;
                        let joint = this.world.CreateJoint(rjd_def);
                        joint.SetUserData(new CustomMotorUserData("creeper", 6, false));
                        this.creepers_joints.push(joint);
                        previous_creeper_part = t;
                    }
                }
                else{
                    this.fd_creeper.shape.SetAsBox(creeper_width/2, creeper_height/2);
                    body_def = new b2.BodyDef();
                    body_def.type = b2.Body.b2_staticBody;
                    body_def.position.Set(creeper_x_init_pos, creeper_y_init_pos - creeper_height/2);
                    t = this.world.CreateBody(body_def);
                    t.CreateFixture(this.fd_creeper);
                    t.SetUserData(new CustomUserData("creeper", CustomUserDataObjectTypes.SENSOR_GRIP_TERRAIN));
                    color = "#6F8060"; // [0.437, 0.504, 0.375];
                    poly_data = {
                        type : "creeper",
                        color1 : color,
                        body : t,
                    }
                    this.terrain_bodies.push(poly_data);
                }
            }
        }
    }

    _generate_clouds(){
        this.cloud_polys = [];
        for(let i = 0; i < Math.ceil(TERRAIN_LENGTH/20); i++){
          let x = (Math.random() * 3 * TERRAIN_LENGTH - TERRAIN_LENGTH) * TERRAIN_STEP;
          let y = Math.random() * RENDERING_VIEWER_H/SCALE + RENDERING_VIEWER_H/SCALE * 2/5;
          let poly = [];
          for(let a = 0; a < 10; a++){
            poly.push([
                x + 15 * TERRAIN_STEP * Math.sin(Math.PI * 2 * a / 5) + Math.random() * (0 - 5 * TERRAIN_STEP) + 5 * TERRAIN_STEP,
                y + 5 * TERRAIN_STEP * Math.cos(Math.PI * 2 * a / 5) + Math.random() * (0 - 5 * TERRAIN_STEP) + 5 * TERRAIN_STEP
            ])
          }
          let x1 = Math.min(...poly.map(p => p[0]));
          let x2 = Math.max(...poly.map(p => p[0]));
          this.cloud_polys.push({poly: poly, x1: x1, x2: x2});
        }
    }

    _generate_agent(agent, init_x=null, init_y=null, set_pos=false){

        if(init_x == null){
            // If an init_pos is given for the agent (reset due to terrain reshaping), init_y is computed accordingly for walkers
            if(agent.init_pos != null){
                init_x = agent.init_pos.x;

                if (agent.agent_body.body_type == BodyTypesEnum.WALKER) {
                    // Compute the best y value in terrain_ground corresponding to init_x
                    init_y = find_best_y(init_x, this.terrain_ground) + agent.agent_body.AGENT_CENTER_HEIGHT;
                }
                else if(agent.agent_body.body_type == BodyTypesEnum.SWIMMER){
                    let y_ground = find_best_y(init_x, this.terrain_ground, agent.agent_body.AGENT_WIDTH);
                    if(y_ground == null){
                        y_ground = -Infinity;
                    }
                    let y_ceiling = find_best_y(init_x, this.terrain_ceiling, agent.agent_body.AGENT_WIDTH);
                    if(y_ceiling == null){
                        y_ceiling = Infinity;
                    }
                    init_y = Math.max(y_ground + 4 * agent.agent_body.AGENT_CENTER_HEIGHT, Math.min(y_ceiling - 4 * agent.agent_body.AGENT_CENTER_HEIGHT, agent.init_pos.y));
                }
            }

            // If no init_pos is given (add agent), the agent is generated on the startpad
            else{
                init_x = TERRAIN_STEP * this.TERRAIN_STARTPAD / 2;
            }
        }

        if(init_y == null){
            init_y = TERRAIN_HEIGHT + agent.agent_body.AGENT_CENTER_HEIGHT; // set y position according to the agent
            if(agent.agent_body.body_type == BodyTypesEnum.SWIMMER){
                init_y = TERRAIN_HEIGHT + 4 * agent.agent_body.AGENT_CENTER_HEIGHT;
            }
        }

        agent.agent_body.draw(this.world, init_x, init_y, 0 /*Math.random() * 2 * INITIAL_RANDOM - INITIAL_RANDOM*/);
        agent.actions = Array.from({length: agent.agent_body.get_action_size()}, () => 0);

        if(set_pos && agent.agent_body.body_type == BodyTypesEnum.CLIMBER){
            this.init_climber_pos(agent);
        }
    }


    set_agent_position(agent, init_x, init_y) {
        agent.agent_body.destroy(this.world);

        if (agent.agent_body.body_type == BodyTypesEnum.CLIMBER) {
            init_y = null;
        }
        else if (agent.agent_body.body_type == BodyTypesEnum.WALKER) {
            // Compute the best y value in terrain_ground corresponding to init_x
            init_y = find_best_y(init_x, this.terrain_ground) + agent.agent_body.AGENT_CENTER_HEIGHT;
        }
        else if(agent.agent_body.body_type == BodyTypesEnum.SWIMMER){
            let y_ground = find_best_y(init_x, this.terrain_ground, agent.agent_body.AGENT_WIDTH);
            if(y_ground == null){
                y_ground = -Infinity;
            }
            let y_ceiling = find_best_y(init_x, this.terrain_ceiling, agent.agent_body.AGENT_WIDTH);
            if(y_ceiling == null){
                y_ceiling = Infinity;
            }
            init_y = Math.max(y_ground + 4 * agent.agent_body.AGENT_CENTER_HEIGHT, Math.min(y_ceiling - 4 * agent.agent_body.AGENT_CENTER_HEIGHT, init_y));
        }

        this._generate_agent(agent, init_x, init_y, true);
        this.update_lidars(agent);
    }

    set_scroll(agent=null, h=null, v=null){
        let terrain_length = Math.max(this.terrain_ground[this.terrain_ground.length - 1].x, this.terrain_ceiling[this.terrain_ceiling.length - 1].x);

        if(window.follow_agent){
            if(agent != null){
                let x = agent.agent_body.reference_head_object.GetPosition().x;
                let y = agent.agent_body.reference_head_object.GetPosition().y;

                this.scroll = [
                    x * this.scale * this.zoom - RENDERING_VIEWER_W/5,
                    y * this.scale * this.zoom - RENDERING_VIEWER_H * 2/5
                ];
            }
        }

        else if(window.is_dragging_agent){

            if(window.dragging_side == "left"){
                this.scroll[0] = window.agent_selected.agent_body.reference_head_object.GetPosition().x * this.scale * this.zoom - RENDERING_VIEWER_W * (0.1 + 0.05)
            }
            else if(window.dragging_side == "right" /*&& !(parseFloat(hScrollSlider.value) >= 100)*/){
                this.scroll[0] = window.agent_selected.agent_body.reference_head_object.GetPosition().x * this.scale * this.zoom - RENDERING_VIEWER_W * (0.85 + 0.05)
            }
        }
        else{
            /*this.scroll = [
                parseFloat(h)/100 * (terrain_length * this.scale * this.zoom - RENDERING_VIEWER_W * 0.9) - RENDERING_VIEWER_W * 0.05,
                parseFloat(v)/100 * this.air_max_distance/2 * this.scale * this.zoom
            ];*/
            this.scroll = [
                this.scroll[0] + h,
                this.scroll[1] + v
            ];
        }

        this.scroll = [
            Math.max(- 0.05 * RENDERING_VIEWER_W, Math.min(this.scroll[0], terrain_length * this.scale * this.zoom - RENDERING_VIEWER_W * 0.9)),
            Math.max(-SCROLL_MAX, Math.min(this.scroll[1], SCROLL_MAX))
        ];

        window.scroll = this.scroll;

        //hScrollSlider.value = 100 * ((this.scroll[0] + 0.05 * RENDERING_VIEWER_W) / (terrain_length * this.scale * this.zoom - RENDERING_VIEWER_W * 0.9));
        //vScrollSlider.value = 100 * this.scroll[1] / (this.air_max_distance/2 * this.scale * this.zoom);
    }

    drag_scroll(h, v){
        this.scroll = [
            this.scroll[0] + h,
            this.scroll[1] + v
        ];
        window.scroll = this.scroll;
    }

    set_zoom(zoom){
        this.zoom = Math.max(0.3, Math.min(parseFloat(zoom), 1.5));
        //zoomSlider.value = this.zoom;
        //zoomValue.innerText = this.zoom;
        window.zoom = this.zoom;
    }

    add_agent(morphology, policy){
        this.create_agent(morphology, policy, null);
        this._generate_agent(this.agents[this.agents.length - 1]);
        this.init_agent(this.agents[this.agents.length - 1]);
        let step_rets = this.step();
        window.game.obs.push([...step_rets.map(e => e[0])]);
    }

    delete_agent(agent_index){
        if(this.agents.length > 0 && agent_index < this.agents.length){

            let agent = this.agents[agent_index];
            this.agents.splice(agent_index, 1);
            agent.agent_body.destroy(this.world);
            //window.agent_selected = null;

            for(let agent of this.agents){
                agent.id = this.agents.indexOf(agent);
            }
        }

    }

    create_circle_asset(pos, radius){
        let y_ground = find_best_y(pos.x, this.terrain_ground, radius);
        if(y_ground == null){
            y_ground = -Infinity;
        }
        let y_ceiling = find_best_y(pos.x, this.terrain_ceiling, radius);
        if(y_ceiling == null){
            y_ceiling = Infinity;
        }
        let y = Math.max(y_ground + radius, Math.min(y_ceiling - radius, pos.y));

        this.fd_circle.shape.m_radius = radius;
        let body_def = new b2.BodyDef();
        body_def.type = b2.Body.b2_dynamicBody;
        body_def.position.Assign(new b2.Vec2(pos.x, y));
        let t = this.world.CreateBody(body_def);
        t.CreateFixture(this.fd_circle);
        t.SetUserData(new CustomUserData("circle", CustomUserDataObjectTypes.TERRAIN));
        let poly_data = {
            type : "circle",
            color1 : "#885C00", // [136, 92, 0];
            color2 : "#5F3D0E", // [95, 61, 14];
            body : t,
            is_selected: false
        }
        this.assets_bodies.push(poly_data);
    }

    set_asset_position(asset, pos){
        let shape = asset.body.GetFixtureList().GetShape();
        let radius;
        if(shape.m_type == b2.Shape.e_circle){
            radius = shape.m_radius;
        }

        let y_ground = find_best_y(pos.x, this.terrain_ground, radius);
        if(y_ground == null){
            y_ground = -Infinity;
        }
        let y_ceiling = find_best_y(pos.x, this.terrain_ceiling, radius);
        if(y_ceiling == null){
            y_ceiling = Infinity;
        }
        let y = Math.max(y_ground + radius, Math.min(y_ceiling - radius, pos.y));
        asset.body.SetTransform(new b2.Vec2(pos.x, y),
                                asset.body.GetAngle());
        asset.body.SetLinearVelocity(new b2.Vec2(0, -0.1));
    }

    delete_asset(asset){
        if(this.assets_bodies.length > 0){
            let index = this.assets_bodies.indexOf(asset);
            if(index != -1){
                this.assets_bodies.splice(index, 1);
                let pos = asset.body.GetWorldCenter();
                asset.body.SetTransform(new b2.Vec2(pos.x, pos.y + 1),
                    asset.body.GetAngle());
                this.world.DestroyBody(asset.body);
            }
        }
    }

    //endregion
}

// Find the best y value corresponding to x according to the points in array
function find_best_y(x, array, max_dist=null){
    // find the closest point to x in array according to the x-coordinate
    let p1 = array.reduce(function(prev, curr) {
        return (Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev);
    });

    // get the index of p1
    let i1 = array.indexOf(p1);
    let p2;

    // get p2 so that x in [p1.x, p2.x] or x in [p2.x, p1.x]
    // case x > p1.x --> x in [p1.x, p2.x]
    if(x > p1.x){
        if(i1 < array.length - 1){
            p2 = array[i1 + 1];
        }
        else{
            p2 = p1;
        }
    }
    //case x <= p1.x --> x in [p2.x, p1.x]
    else{
        if(i1 > 0){
            p2 = array[i1 - 1];
        }
        else{
            p2 = p1;
        }
    }

    let y = p1.y;
    // compute the equation of the line between p1 and p2 and find y corresponding to x
    if(p1.x != p2.x){
        let a = (p2.y - p1.y) / (p2.x - p1.x);
        let b = p1.y - a * p1.x;
        y = a * x + b;
    }
    else if(max_dist != null && Math.abs(x - p1.x) > max_dist){
            y = null;
    }
    return y;
}
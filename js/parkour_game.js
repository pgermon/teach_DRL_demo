class ParkourGame {
    constructor(agent_body_type, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type) {

        this.draw_fps = 60;
        this.obs = [];
        this.initWorld(agent_body_type, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type);

        this.nb_steps = 0;
        this.running = false;
    }

    initWorld(agent_body_type, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type) {

        this.env = new ParametricContinuousParkour(agent_body_type,
            3,
            10,
            200,
            25,
            20,
            creepers_type);

        this.env.set_environment(cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type);

        // Flat Parkour
        /*this.env = new ParametricContinuousFlatParkour(0.5, this.config);
        this.env.set_environment(null,
            5,
            2.5 * SCALE * CREEPER_UNIT,
            30);*/

        this.obs.push(this.env.reset());

        this.nb_actions = this.env.agent_body.get_action_size();
    }


    async run(policy){
        if(this.running){
            clearInterval(this.runtime);
            this.running = false;
            return "Resume";
        } else {

            console.log("loading policy", policy)
            
            //const model = await tf.loadGraphModel(`./models/${policy}/model.json`);
            const model = await tf.loadGraphModel(policy + '/model.json');

            this.runtime = setInterval(() => {
                this.play(model);
            }, 1000 / this.draw_fps);
            this.running = true;
            return "Pause"
        }
    }

    reset(agent_body_type, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type){
        clearInterval(this.runtime);
        this.running = false;
        this.initWorld(agent_body_type, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type);
        this.env.render();
    }

    /**
     * Play one step
     */
    play(model) {

        let state = this.obs[this.obs.length - 1];

        let envState = tf.tensor(state,[1, state.length]);

        let inputs = {
            "Placeholder_1:0": envState
        };

        let output = 'main/mul:0'

        let actions = model.execute(inputs, output).arraySync()[0];

        let ret = this.env.step(actions, 1);
        this.obs.push(ret[0]);
        this.env.render();
        this.nb_steps += 1;
    }
}

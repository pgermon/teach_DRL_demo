class ParkourGame {
    constructor(morphologies, policies, positions, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling) {

        this.draw_fps = 60;
        this.obs = [];
        this.initWorld(morphologies, policies, positions, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling);
        this.running = false;
    }

    initWorld(morphologies, policies, positions, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling) {

        this.env = new DrawingMAPCP(
            morphologies,
            policies,
            positions,
            3,
            10,
            200,
            90,
            20,
            creepers_type,
            ground,
            ceiling);

        this.env.set_environment(cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type);
        this.obs.push(this.env.reset());
    }

    pause(){
        clearInterval(this.runtime);
        this.running = false;
        return "Resume";
    }

    async run(){
        if(this.running){
            return this.pause();
        }
        else {

            // Load the policy for each agent
            for(let agent of window.game.env.agents){
                if(agent.policy.path != null){
                    agent.model = await tf.loadGraphModel(agent.policy.path + '/model.json');
                }
                else{
                    agent.model = null;
                }
            }

            this.runtime = setInterval(() => {
                this.play();
            }, 1000 / this.draw_fps);
            this.running = true;
            return "Pause"
        }
    }

    reset(morphologies, policies, positions, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling){
        clearInterval(this.runtime);
        this.running = false;
        this.initWorld(morphologies, policies, positions, cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing, smoothing, creepers_type, ground, ceiling);
        this.env.render();
    }

    /**
     * Play one step
     */
    play() {

        for(let agent of window.game.env.agents){
            let state = this.obs[this.obs.length - 1][agent.id];

            if(agent.model != null){
                let envState = tf.tensor(state,[1, state.length]);

                let inputs = {
                    "Placeholder_1:0": envState
                };

                let output = 'main/mul:0'

                agent.actions = agent.model.execute(inputs, output).arraySync()[0];
            }
            else if(agent.policy.name == "random"){
                agent.actions = Array.from({length: agent.agent_body.get_action_size()}, () => Math.random() * 2 - 1);
            }
            else{
                agent.actions = Array.from({length: agent.agent_body.get_action_size()}, () => 0);
            }


        }
        let step_rets = this.env.step();
        this.obs.push([...step_rets.map(e => e[0])]);

        this.env.render();
    }
}

# Deep Reinforcement Learning Interactive Demo

This project aims at designing a popular science experiment in the form of an in-browser interactive demonstration in order to showcase the capabilities of Deep Reinforcement
Learning agents, including their ability to generalize to unknown tasks. The demonstration is available online [here](https://pgermon.github.io/teach_DRL_demo/).

## Organization of the repository

The repository is organized as follows:

📦 teach_DRL_demo  
┣ 📂 policy_models -- *policies available for each morphology in the TF SavedModel format*       
┣ 📂 web_demo -- *web app main folder*    
┃ ┣ 📂 base_envs_set -- *set of basic environments in JSON files*  
┃ ┣ 📂 images  
┃ ┣ 📂 js -- *source code*  
┃ ┃ ┣ 📂 bodies -- *code for agents morphologies*  
┃ ┃ ┣ 📂 Box2D_dynamics -- *collisions handlers*  
┃ ┃ ┣ 📂 CPPN -- *weights and code of the CPPN used to generate terrain*  
┃ ┃ ┣ 📂 envs -- *available environments*  
┃ ┃ ┣ 📂 ui_state -- *UI state management*  
┃ ┃ ┣ 📂 utils -- *utility classes and functions*  
┃ ┃ ┣ 📜 box2d.js -- *full box2d code*  
┃ ┃ ┣ 📜 draw_p5.js -- *rendering functions*  
┃ ┃ ┗ 📜 game.js -- *handles simulation execution*  
┃ ┣ 📜 index.html  
┃ ┣ 📜 index.js  
┃ ┣ 📜 ui.js -- *sets up the different UI elements*  
┃ ┗ 📜 demo.css   
┣ 📜 list_base_envs.py -- *python script used to generate a JSON file which lists all the files in `web_demo/base_envs_set`*  
┗ 📜 policies_to_json.py -- *python script used to generate a JSON file which lists all the policies in `./policy_models`*  

## Installation

Follow these steps if you want to launch the demo locally.

1. Get the repository
```
git clone https://github.com/pgermon/teach_DRL_demo.git
cd teach_DRL_demo/
```

2. Install it, using Conda for example (use Python >= 3.6)
```
conda create --name teachMyAgent python=3.6
conda activate teachMyAgent
pip install tensorflowjs
```

3. Set it up   
    3.1. Convert all policy models in `./policy_models` to a web-friendly format in `web_demo/policy_models`
    ```
    ls -d policy_models/*/*/*/ | xargs -I"{}" tensorflowjs_converter --input_format=tf_saved_model [--output_node_names='parkour_walker'] --saved_model_tags=serve --skip_op_check {}tf1_save web_demo/{}
    ```
   3.2. Generate the list of policy models
   ```
   python3 policies_to_json.py
   ```
   3.3. Generate the list of files in `web_demo/base_envs_set`  
   ```
    python3 list_base_envs.py
   ```

4. Launch the web app
```
pushd web_demo/; python3 -m http.server 9999; popd;
```

## HOW TO tutorials
- Add a new policy model
- Add a new base environment

## Adding a new policy model
You can easily add a new policy model for a specific morphology to visualize its behaviour inside the demo.  

1. Train a policy  
You first need a saved policy model corresponding to one of the available morphologies. If you want to train a new policy on your own, follow the installation and launching steps of the [TeachMyAgent](http://developmentalsystems.org/TeachMyAgent/doc/#installation) repository.
This policy model must be in the **TensorFlow SavedModel** format and organized as follows:  
📂 policy_folder  
┣ 📂 tf1_save     
┃ ┣ 📂 variables   
┃ ┃ ┣ 📜 variables.data-00000-of-00001  
┃ ┃ ┗ 📜 variables.index  
┃ ┣ 📜 model_info.plk  
┃ ┗ 📜 saved_model.pb    


2. Add the policy to the demo  
Then you just need to add this `policy_folder` to the corresponding **morphology folder** in `teach_DRL_demo/policy_models` among the following:
📂 policy_models    
┣ 📂 climber       
┃ ┗ 📂 **chimpanzee**  
┣ 📂 swimmer  
┃ ┗ 📂 **fish**  
┣ 📂 walker  
┃ ┗ 📂 **bipedal**  

Your policy model will now automatically appear inside the demo, in the list of agents available for the corresponding morpholgy.   

3. [Optional] Set up for local launch  
   3.1. Convert your policy model to a web-friendly format
    ```
    ls -d policy_models/<type>/<morphology>/<policy_folder>/ | xargs -I"{}" tensorflowjs_converter --input_format=tf_saved_model [--output_node_names='parkour_walker'] --saved_model_tags=serve --skip_op_check {}tf1_save web_demo/{}
    ```
   3.2. Generate the list of policy models
   ```
   python3 policies_to_json.py
   ```
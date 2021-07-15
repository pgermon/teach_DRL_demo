/* GLOBAL VARIABLES */

window.erasing_radius = 15;
window.asset_size = 8;

// Lists of points {x, y} composing the terrain shapes
window.ground = [];
window.ceiling = [];

// Lists of raw points {x, y} drawn by the user for the terrain shapes
window.terrain = {
    ground: [],
    ceiling: []
};

// Parameters to handle the alignment of the terrain to the startpad according to the situation
window.align_terrain = {
    align: true,
    ceiling_offset: null,
    ground_offset: null,
    smoothing: null
};

// Internationalization dictionary
window.lang_dict = {
    'EN': {
        'introTour': {
            'nextLabel': "Next",
            'prevLabel': "Back",
            'doneLabel': "Done",
            'welcomeTitle': "Welcome!",
            'welcomeText': "Here you can play with a simulation where autonomously trained agents are trying to navigate through a 2D environment.",
            'viewportTitle': "Viewport simulation",
            'viewportText': "Here is the viewport where the simulation is rendered in real time. It allows you to see the environment and visualize live how the agents are dealing with it.<br><br> You can also interact with the simulation using the mouse in order to scroll, zoom or even drag and drop the agents.",
            'runTitle': "Run the simulation",
            'runText': 'Click the <span style="color: green"><i class="fas fa-play"></i></span> button to run the simulation. <br> Then, click the <span style="color: #FFC700"><i class="fas fa-pause"></i></span> button to pause it or the <span style="color: red"><i class="fas fa-undo-alt"></i></span> to reset it.',
            'baseEnvsTitle': "Some environments",
            'baseEnvsText': "Here are some basic environments that will let you become more familiar with the different morphologies of agents. <br> Try to load one of them into the simulation to visualize the behaviour of the different agents.",
            'morphologiesTitle': "Agents morphologies",
            'morphologiesText': "Here are all the morphologies available for the agents. You can select one of several agents for each morphology and add it to the simulation. <br><br> Each agent has been trained to learn an optimal behaviour to navigate through the environment according to its morphology. Try to compare them!",
            'agentsListTitle': "List of running agents",
            'agentsListText': "In this section you can find all the agents that are currently running in the simulation.",
            'customEnvsTitle': "Custom environments",
            'customEnvsText': "Here you can save and download your custom environments but also upload them from previously downloaded files. Try to share them with your friends!",
            'furtherTitle': "Going further...",
            'furtherText': "If you want to customize the environment, access more advanced options or learn more about Deep Reinforcement Learning, open these tabs. <br><br> Enjoy!",
        },

        'introHints': {
            'buttonLabel': "Got it",
            'tips': `<strong>Tips</strong>
                    <ul>
                        <li>You can scroll horizontally and vertically in the environment by dragging the mouse.</li>
                        <li>You can zoom in or out using the mouse wheel.</li>
                        <li>You can select an agent or an asset by clicking on it, and then delete it by pressing the delete key of your keyboard.</li>
                        <li>You can drag and drop an agent or an asset using the mouse.</li>
                        <li>You can change the eraser and assets radius using the mouse wheel.</li>
                    </ul>
                    <br>`
        },

        'agentsList': {
            'title': "List of running agents",
            'follow': "Follow",
            'followTooltip' : "Center the viewport on the agent",
            'savePosTooltip': "Save the agent's position",
            'resetPosTooltip': "Reset the agent's position",
            'deleteAgentTooltip': "Delete the agent",
        },

        'mainButtons':{
            'runBtnTooltip': "Run the simulation",
            'pauseBtnTooltip': "Pause the simulation",
            'resetBtnTooltip': "Reset the simulation",
            'saveBtnTooltip': "Save the current environment"
        },

        'drawingMode': {
            'text': `Here you can draw your own parkour! <br>
                    Select the <strong style="color: green"><i class="fas fa-pencil-alt"></i> Ground</strong> or <strong style="color: dimgrey"><i class="fas fa-pencil-alt"></i> Ceiling</strong> button to start drawing the corresponding terrain shape with the mouse.<br>
                    Be careful not to draw more than one line at different heights if you want the result to be optimal. <br>
                    You can use the <strong style="color: #FFC700"><i class="fas fa-eraser"></i> Erase</strong> button if you need to correct your drawing or the <strong style="color: red"><i class="fas fa-times"></i> Clear</strong> one to clear all your drawing.<br>
                    When you are satisfied with the result, just click the <strong style="color: green">Generate Terrain</strong> button.`,
            'ground': "Ground",
            'ceiling': "Ceiling",
            'erase': "Erase",
            'clear': "Clear",
            'generateTerrain': "Generate Terrain",
            'draw': "Draw",
        },

        'parkourConfig': {
            'terrainGeneration': "<strong>Terrain Generation</strong>",
            'generalParameters': "General Parameters",
            'creepers': "Creepers",
            'drawTabBtn': "Draw Yourself!",
            'procGenTabBtn': "Procedural Generation",
            'procGenText': `You can also use these three sliders to generate the <strong>terrain shapes</strong> automatically.`,
            'smoothing': "Smoothing",
            'waterLevel': "Water level",
            'creepersWidth': "Width",
            'creepersHeight': "Height",
            'creepersSpacing': "Spacing",
            'creepersType': "Type",
            'rigid': "Rigid",
            'swingable': "Swingable",
        },

        'morphologies': {
            'title': "<strong>Add an agent</strong>",
            'text': "Here you can add an agent to the simulation with the morphology of your choice.",
            'policySelectTooltip': "Select an agent",
            'addBtnTooltip': "Add the agent to the simulation",
            'bipedal': {
                'title': "Bipedal Walker",
                'description': "This morphology is composed of a head and two legs which allow it to walk on the floor."
            },
            'chimpanzee': {
                'title': "Chimpanzee",
                'description': "This morphology is composed of a head, a torso and two arms and legs. It can only move by climbing the ceiling and grasping the creepers.",
            },
            'fish': {
                'title': "Fish",
                'description': "This morphology is composed of a head, a tail and a fin, allowing it to swim in the water.",
            },
        },

        'envsSets': {
            'baseSetText': "To begin you can select one of the following environments to load it into the simulation.",
            'customSetText': `In this section you can store your own custom environments by saving them thanks to the <span style="color: blue"><i class="far fa-save fa-lg"></i></span> button above or by uploading them from a JSON file.`,
            'uploadCard': {
                'title': "Upload an environment",
                'text': `Choose a JSON file then click the <span style="color: orange;"><i class="fas fa-upload"></i></span> button below to save the corresponding environment in your collection.`,
                'uploadBtnTooltip': "Upload the environment from the selected file",
            },
            'downloadBtnTooltip': "Download the environment",
            'deleteBtnTooltip': "Delete the environment",
        },

        'advancedOptions': {
            'renderingOptions': `<strong> Rendering Options </strong>`,
            'drawJoints': "Draw joints",
            'drawLidars': "Draw lidars",
            'drawNames': "Draw names",
            'assetsTitle': `<strong> Assets </strong>`,
            'assetsText': "Here you can find several types of assets, which are objects that you can add to the simulation using the mouse.",
            'circle': `<i class="fas fa-circle"></i> Ball`,
        },

        'globalElements': {
            'demoTitle': "Deep Reinforcement Learning Interactive Demo",
            'gettingStarted': "Getting Started",
            'parkourCustomization': "Parkour Customization",
            'advancedOptions': "Advanced Options",
            'aboutDeepRL': "About DeepRL",
            'saveEnvModal': {
                'title': `Please enter a name and a description for the current environment.`,
                'text': "This environment will be saved in your collection of custom environments so that you could reload it later or download it to share it.",
                'nameLabel': "Name",
                'descriptionLabel': "Description",
                'cancelBtn': "Cancel",
                'confirmBtn': "Save",
            },
        }
    },

    'FR': {
        'introTour': {
            'nextLabel': "Suivant",
            'prevLabel': "Précédent",
            'doneLabel': "Fermer",
            'welcomeTitle': "Bienvenue !",
            'welcomeText': "Ici tu peux jouer avec une simulation dans laquelle des agents entraînés de manière autonome essayent de se déplacer au travers d'un environnement 2D.",
            'viewportTitle': "Fenêtre d'affichage",
            'viewportText': "C'est dans cet espace que la simulation est affichée en temps réel. Cela va te permettre de visualiser en direct comment les agents essayent de s'adapter à leur environment.<br><br> Tu peux aussi interagir avec la simulation à l'aide de la souris pour faire défiler l'environnement, zoomer ou encore déplacer les agents.",
            'runTitle': "Lancer la simulation",
            'runText': 'Clique sur le bouton <span style="color: green"><i class="fas fa-play"></i></span> pour lancer la simulation. <br> Tu peux ensuite cliquer sur le bouton <span style="color: #FFC700"><i class="fas fa-pause"></i></span> pour la mettre en pause ou sur le bouton <span style="color: red"><i class="fas fa-undo-alt"></i></span> pour la réinitialiser.',
            'baseEnvsTitle': "Quelques environnements",
            'baseEnvsText': "Voici quelques environnements de base qui t'aideront à te familiariser avec les différentes morphologies d'agents. <br> Essaye de les charger dans la simulation pour voir les comportements des différents agents.",
            'morphologiesTitle': "Les différentes morphologies d'agents",
            'morphologiesText': "Voici toutes les morphologies disponibles pour les agents. Tu peux choisir parmi plusieurs agents différents pour chaque morphologie et l'ajouter à la simulation. <br><br> Chaque agent a été entraîné pour apprendre un comportement efficace pour se déplacer à travers l'environnement en fonction de sa morphologie. Essaye de les comparer !",
            'agentsListTitle': "List des agents actifs",
            'agentsListText': "Dans cette section sont affichés tous les agents actuellement présents dans la simulation.",
            'customEnvsTitle': "Environnements personnalisés",
            'customEnvsText': "Ici tu peux sauvegarder et télécharger tes environnements personnalisés mais aussi en importer depuis des fichiers précédemment téléchargés. Essaye de les échanger avec tes amis !",
            'furtherTitle': "Pour aller plus loin...",
            'furtherText': "Si tu veux personnaliser ton propre environnement, accéder à des options avancées ou en apprendre davantage à propos du Deep Reinforcement Learning, ouvre ces onglets. <br><br> Amuse-toi bien !",
        },

        'introHints': {
            'buttonLabel': "Ok",
            'tips': `<strong>Astuces</strong>
                    <ul>
                        <li>Tu peux faire défiler l'environnement horizontalement et verticalement à l'aide de la souris.</li>
                        <li>Tu peux zoomer ou dézoomer avec la molette de la souris.</li>
                        <li>Tu peux sélectionner un agent ou un objet en cliquant dessus, puis le supprimer en appuyant sur la touche suppr de ton clavier.</li>
                        <li>Tu peux déplacer un agent ou un objet en le faisant glisser avec la souris.</li>
                        <li>Tu peux changer le rayon de la gomme ou la taille des objets avec la molette de la souris.</li>
                    </ul>
                    <br>`
        },

        'agentsList': {
            'title': "Liste des agents actifs",
            'follow': "Suivre",
            'followTooltip' : "Centrer la fenêtre d'affichage sur l'agent",
            'savePosTooltip': "Sauvegarder la position de l'agent",
            'resetPosTooltip': "Réinitiliaser la position de l'agent",
            'deleteAgentTooltip': "Supprimer l'agent",
        },

        'mainButtons':{
            'runBtnTooltip': "Lancer la simulation",
            'pauseBtnTooltip': "Mettre la simulation en pause",
            'resetBtnTooltip': "Réinitialiser la simulation",
            'saveBtnTooltip': "Sauvegarder l'environnement actuel"
        },

        'drawingMode': {
            'text': `Ici tu peux dessiner ton propre parkour ! <br>
                    Selectionne les boutons <strong style="color: green"><i class="fas fa-pencil-alt"></i> Sol</strong> ou <strong style="color: dimgrey"><i class="fas fa-pencil-alt"></i> Plafond</strong> pour commencer à dessiner l'élément du terrain correspondant avec la souris.<br>
                    Fais attention à ne pas superposer plusieurs traits à différentes hauteurs pour obtenir un résultat optimal. <br>
                    Tu peux utiliser le bouton <strong style="color: #FFC700"><i class="fas fa-eraser"></i> Gommer</strong> pour corriger ton dessin ou le bouton <strong style="color: red"><i class="fas fa-times"></i> Effacer</strong> pour tout effacer.<br>
                    Une fois que tu es satisfait du résultat, clique sur le bouton <strong style="color: green"> Générer le terrain</strong>.`,
            'ground': "Sol",
            'ceiling': "Plafond",
            'erase': "Gommer",
            'clear': "Effacer",
            'generateTerrain': "Générer le terrain",
            'draw': "Dessiner",
        },

        'parkourConfig': {
            'terrainGeneration': "<strong>Génération du terrain</strong>",
            'generalParameters': "Paramètres Généraux",
            'creepers': "Lianes",
            'drawTabBtn': "Dessine par toi-même !",
            'procGenTabBtn': "Génération procédurale",
            'procGenText': `Tu peux aussi utiliser ces trois curseurs pour générer <strong>les formes du terrain</strong> de manière automatique.`,
            'smoothing': "Lissage",
            'waterLevel': "Niveau d'eau",
            'creepersWidth': "Largeur",
            'creepersHeight': "Hauteur",
            'creepersSpacing': "Espacement",
            'creepersType': "Type",
            'rigid': "Rigide",
            'swingable': "Flexible",
        },

        'morphologies': {
            'title': "<strong>Ajouter un agent</strong>",
            'text': "Ici tu peux ajouter un agent à la simulation avec la morphologie de ton choix.",
            'policySelectTooltip': "Sélectionner un agent",
            'addBtnTooltip': "Ajouter l'agent à la simulation",
            'bipedal': {
                'title': "Bipède",
                'description': "Cette morphologie est composée d'une tête et de deux jambes qui lui permettent de marcher sur le sol."
            },
            'chimpanzee': {
                'title': "Chimpanzé",
                'description': "Cette morphologie est composée d'une tête, d'un corps ainsi que de deux bras et deux jambes. Elle peut uniquement se déplacer en s'accrochant au plafond ou en se balançant de lianes en lianes.",
            },
            'fish': {
                'title': "Poisson",
                'description': "Cette morphologie est composée d'une tête, d'une queue et d'une nageoire, ce qui lui permet de nager dans l'eau.",
            },
        },

        'envsSets': {
            'baseSetText': "Pour commencer tu peux sélectionner un des environnments suivants en cliquant dessus pour le charger dans la simulation.",
            'customSetText': `Dans cette section tu peux stocker tes propres environnements personnalisés en les sauvegardant grâce au bouton <span style="color: blue"><i class="far fa-save fa-lg"></i></span> ci-dessus ou en les important depuis un fichier JSON.`,
            'uploadCard': {
                'title': "Importer un environnement",
                'text': `Choisis un fichier JSON puis clique sur le bouton <span style="color: orange;"><i class="fas fa-upload"></i></span> ci-dessous pour importer l'environnement correspondant dans ta collection.`,
                'uploadBtnTooltip': "Importer l'environnement depuis le fichier sélectionné",
            },
            'downloadBtnTooltip': "Télécharger l'environnement",
            'deleteBtnTooltip': "Supprimer l'environnement",
        },

        'advancedOptions': {
            'renderingOptions': `<strong> Options d'affichage </strong>`,
            'drawJoints': "Afficher les joints",
            'drawLidars': "Afficher les lidars",
            'drawNames': "Afficher les noms",
            'assetsTitle': `<strong> Objets </strong>`,
            'assetsText': "Ici tu peux trouver plusieurs types d'objets que tu peux ajouter à la simulation avec la souris.",
            'circle': `<i class="fas fa-circle"></i> Boule`,
        },

        'globalElements': {
            'demoTitle': "Démo Interactive de Deep Reinforcement Learning",
            'gettingStarted': "Commencer",
            'parkourCustomization': "Personnalisation du parkour",
            'advancedOptions': "Options avancées",
            'aboutDeepRL': "À propos du DeepRL",
            'saveEnvModal': {
                'title': `Saisis un nom et une description pour l'environnement actuel`,
                'text': "Cet environnement sera sauvegardé dans ta collection d'environnements personnalisés pour que tu puisses le recharger plus tard ou le télécharger pour le partager.",
                'nameLabel': "Nom",
                'descriptionLabel': "Description",
                'cancelBtn': "Annuler",
                'confirmBtn': "Sauvegarder",
            },
        }
    }
}

/* INIT FUNCTIONS */

/**
 * Initializes the game.
 * @param cppn_input_vector {Array} - 3-dimensional array that encodes the CPPN
 * @param water_level {number}
 * @param creepers_width {number}
 * @param creepers_height {number}
 * @param creepers_spacing {number}
 * @param smoothing {number}
 * @param creepers_type {boolean}
 * @param ground {Array} - List of points {x, y} composing the ground
 * @param ceiling {Array} - List of points {x, y} composing the ceiling
 * @param align {Object}
 */
function init_game(cppn_input_vector, water_level, creepers_width, creepers_height, creepers_spacing,
              smoothing, creepers_type, ground, ceiling, align) {

    let agents = {
        morphologies: [],
        policies: [],
        positions: []
    }

    // Pauses the game if it already exists and gets the information about the running agents
    if(window.game != null){
        window.game.pause();
        agents.morphologies = [...window.game.env.agents.map(a => a.morphology)];
        agents.policies = [...window.game.env.agents.map(a => a.policy)];
        agents.positions = [...window.game.env.agents.map(agent => agent.agent_body.reference_head_object.GetPosition())];
    }
    window.game = new Game(agents, cppn_input_vector, water_level, creepers_width, creepers_height,
                            creepers_spacing, smoothing, creepers_type, ground, ceiling, align);
    window.set_agent_selected(-1);
    window.asset_selected = null;
    window.game.env.set_zoom(INIT_ZOOM);
    window.game.env.set_scroll(window.agent_selected, INIT_SCROLL_X, 0);
    window.game.env.render();
}

/**
 * Indicates if the creepers type is 'Swingable' or not.
 * @returns {boolean}
 */
function getCreepersType() {
    return document.getElementById("creepersType").value == 'Swingable';
}

/**
 * First function called after the code is entirely loaded.
 * Loads the model of the CPPN, initializes the game by default, loads the default environmnent and starts the language selection.
 * @returns {Promise<void>}
 */
async function onLoadInit() {
    window.cppn_model = await tf.loadGraphModel('./js/CPPN/weights/same_ground_ceiling_cppn/tfjs_model/model.json');
    window.init_default();
    window.loadDefaultEnv();
    window.langIntroSetUp();
}

// Calls onLoadInit() when all the files are loaded
window.addEventListener("load", onLoadInit, false);

/* IN-CANVAS MOUSE INTERACTIONS */

/**
 * Converts the given position relative to the canvas to the environment scale.
 * @param x_pos {number} - X-coordinate inside the canvas.
 * @param y_pos {number} - Y-coordinate inside the canvas.
 * @returns {{x: number, y: number}} - Position inside the environment.
 */
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

/**
 * Converts the given position relative to the environment to the canvas scale.
 * @param x_pos {number} - X-coordinate inside the environment.
 * @param y_pos {number} - Y-coordinate inside the environment.
 * @returns {{x: number, y: number}} - Position inside the canvas.
 */
function convertPosEnvToCanvas(x_pos, y_pos){
    let x = x_pos * window.game.env.scale * window.game.env.zoom - window.game.env.scroll[0];
    let y = window.game.env.scroll[1] - (y_pos - RENDERING_VIEWER_H) * window.game.env.scale * window.game.env.zoom
        + (1 - window.game.env.scale * window.game.env.zoom) * RENDERING_VIEWER_H
        + (window.game.env.zoom - 1) * window.game.env.ceiling_offset * window.game.env.scale * 1/3;

    return {x: x, y: y};
}

/**
 * Checks if the given position is inside the given body.
 * Used for clicking on assets.
 * @param pos {{x: number, y: number}}
 * @param body {b2Body} - A Box2D body
 * @returns {boolean}
 */
function isPosInsideBody(pos, body){
    let shape = body.GetFixtureList().GetShape();

    if(shape.m_type == b2.Shape.e_circle){
        let center = body.GetWorldCenter();
        return Math.pow(center.x - pos.x, 2) + Math.pow(center.y - pos.y, 2) <= Math.pow(shape.m_radius, 2);
    }
}

/**
 * Handles actions when mouse is pressed.
 */
function mousePressed(){

    // Hides all the tooltips when mouse pressed
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el, index) => {
        let tooltip = bootstrap.Tooltip.getInstance(el);
        tooltip.hide();
    });

    // Case mouse is pressed inside the canvas
    if(mouseX >= 0 && mouseX <= window.canvas.width
        && mouseY >= 0 && mouseY <= window.canvas.height){

        // Stores the current position of the mouse, used when dragging
        window.prevMouseX = mouseX;
        window.prevMouseY = mouseY;

        // Creates a circle asset at the mouse position and render the environment
        if(window.is_drawing_circle()){
            let mousePos = convertPosCanvasToEnv(mouseX, mouseY);
            window.game.env.create_circle_asset(mousePos, window.asset_size * 2 / window.game.env.scale);

            if(window.agent_selected != null){
                window.agent_selected.is_selected = false;
                window.set_agent_selected(-1);
            }
            window.game.env.render();
        }

        // Handles agents and assets selection
        else if(!window.is_drawing()){
            let mousePos = convertPosCanvasToEnv(mouseX, mouseY);

            // Selects an agent in the canvas if the mouse is clicked over its body
            let one_agent_touched = false;
            for(let i = 0; i < window.game.env.agents.length; i++){
                let agent = window.game.env.agents[i];

                // Checks if the agent is touched by the mouse
                let is_agent_touched = agent.agent_body.isPosInside(mousePos);

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
                else {
                    agent.is_selected = false;
                }
            }

            // If no agent is touched, the selected agent is set to null
            if(!one_agent_touched && window.agent_selected != null){
                window.set_agent_selected(-1);
            }

            // Selects an asset in the canvas if the mouse is clicked over its body and no agent has been touched
            if(!one_agent_touched){
                let one_asset_touched = false;
                for(let asset of window.game.env.assets_bodies){

                    // Checks if the asset is touched by the mouse
                    let is_asset_touched = isPosInsideBody(mousePos, asset.body);

                    // If the asset is touched and not selected yet, it is now selected and all other assets are deselected
                    if(is_asset_touched){
                        one_asset_touched = true;

                        if(!asset.is_selected){
                            asset.is_selected = true;
                            window.asset_selected = asset;
                            for(let other_asset of window.game.env.assets_bodies){
                                if(other_asset != asset){
                                    other_asset.is_selected = false;
                                }
                            }
                            break;
                        }
                    }
                    // If the asset is not touched it is deselected
                    else if(!is_asset_touched){
                        asset.is_selected = false;
                    }
                }

                // If no asset is touched, the selected asset is set to null
                if(!one_asset_touched && window.asset_selected != null){
                    window.asset_selected = null;
                }
            }

            window.game.env.render();
        }
    }

    // Handles clicks outside canvas when drawing (deselect drawing buttons)
    else if(window.is_drawing() || window.is_drawing_circle()){
        window.clickOutsideCanvas();
    }
}

/**
 * Handles actions when mouse is dragged.
 * @returns {boolean}
 */
function mouseDragged(){

    // Case mouse is dragged inside the canvas
    if(mouseX >= 0 && mouseX <= window.canvas.width
        && mouseY >= 0 && mouseY <= window.canvas.height) {

        // DRAWING
        if(window.is_drawing()) {

            // Gets the position of the mouse in the environment scale
            let mousePos = convertPosCanvasToEnv(mouseX, mouseY);

            // Vertical offset to shift the drawing, trace and forbidden canvas in order to align them to the environment
            let y_offset = SCROLL_MAX - window.game.env.scroll[1];

            // Drawing ground to the right of the terrain startpad
            if(window.is_drawing_ground() && mousePos.x > INITIAL_TERRAIN_STARTPAD * TERRAIN_STEP){
                drawing_canvas.push();
                drawing_canvas.stroke("#66994D");
                drawing_canvas.strokeWeight(4);
                // Draws a ground line between the current and previous positions of the mouse
                drawing_canvas.line(mouseX, mouseY + y_offset, window.prevMouseX, window.prevMouseY + y_offset);
                drawing_canvas.pop();
                window.terrain.ground.push(mousePos);
            }

            // Drawing ceiling to the right of the terrain startpad
            else if(window.is_drawing_ceiling() && mousePos.x > INITIAL_TERRAIN_STARTPAD * TERRAIN_STEP){
                drawing_canvas.push();
                drawing_canvas.stroke("#808080");
                drawing_canvas.strokeWeight(4);
                // Draws a ceiling line between the current and previous positions of the mouse
                drawing_canvas.line(mouseX, mouseY + y_offset, window.prevMouseX, window.prevMouseY + y_offset);
                drawing_canvas.pop();
                window.terrain.ceiling.push(mousePos);
            }

            // Erasing to the right of the terrain startpad
            else if(window.is_erasing() && mousePos.x > INITIAL_TERRAIN_STARTPAD * TERRAIN_STEP){

                // Draws a circle trace at the mouse position to show the erasing radius
                trace_canvas.clear();
                trace_canvas.noStroke();
                trace_canvas.fill(255);
                trace_canvas.circle(mouseX, mouseY + y_offset, window.erasing_radius * 2);

                // Removes the points that are within the circle's radius from the ground and ceiling lists
                window.terrain.ground = window.terrain.ground.filter(function(point, index, array){
                    return Math.pow(point.x - mousePos.x, 2) + Math.pow(point.y - mousePos.y, 2) > Math.pow(window.erasing_radius / (window.game.env.scale * window.game.env.zoom), 2);
                });
                window.terrain.ceiling = window.terrain.ceiling.filter(function(point, index, array){
                    return Math.pow(point.x - mousePos.x, 2) + Math.pow(point.y - mousePos.y, 2) > Math.pow(window.erasing_radius / (window.game.env.scale * window.game.env.zoom), 2);
                });

                // Erases the drawing canvas inside the circle's radius
                drawing_canvas.erase();
                drawing_canvas.circle(mouseX, mouseY + y_offset, window.erasing_radius * 2);
                drawing_canvas.noErase();
            }

            // Dragging to move vertically
            else{
                cursor(MOVE);
                window.game.env.set_scroll(null, window.game.env.scroll[0] + window.prevMouseX - mouseX, window.game.env.scroll[1] + mouseY - prevMouseY);
                y_offset = SCROLL_MAX - window.game.env.scroll[1];
            }

            // Renders the environment and displays the off-screen canvas on top of it
            window.game.env.render();
            image(drawing_canvas, 0, -y_offset);
            image(trace_canvas, 0, -y_offset);
            image(forbidden_canvas, 0, -y_offset);
        }

        // DRAGGING
        else{
            cursor(MOVE);

            // Dragging an agent
            for (let agent of window.game.env.agents) {

                // Drags the selected agent
                if (agent.is_selected) {

                    // Computes the terrain's length according to the agent's morphology
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

                    // Gets the mouse position inside the environment and clamps it horizontally to the edges of the terrain
                    let mousePos = convertPosCanvasToEnv(mouseX, mouseY);
                    let x = Math.max(0.02, Math.min(0.98, mousePos.x / terrain_length)) * terrain_length;

                    // Sets the position of the agent to the mouse position
                    window.game.env.set_agent_position(agent, x, mousePos.y);
                    window.game.env.render();
                    window.is_dragging_agent = true;
                    break;
                }
            }

            // Dragging an asset
            for(let asset of window.game.env.assets_bodies){

                // Drags the selected asset
                if (asset.is_selected && !window.is_dragging_agent) {
                    let terrain_length = Math.max(window.game.env.terrain_ground[window.game.env.terrain_ground.length - 1].x,
                                                    window.game.env.terrain_ceiling[window.game.env.terrain_ceiling.length - 1].x);

                    // Gets the mouse position inside the environment and clamps it horizontally to the edges of the terrain
                    let mousePos = convertPosCanvasToEnv(mouseX, mouseY);
                    mousePos.x = Math.max(0.02, Math.min(0.98, mousePos.x / terrain_length)) * terrain_length;

                    // Sets the position of the asset to the mouse position
                    window.game.env.set_asset_position(asset, mousePos);
                    window.game.env.render();
                    window.is_dragging_asset = true;
                }
            }

            // Dragging to scroll
            if(!window.is_dragging_agent && !window.is_dragging_asset){

                // Scrolling manually cancels agent following
                if(window.agent_followed != null){
                    window.set_agent_followed(-1);
                }
                window.game.env.set_scroll(null, window.game.env.scroll[0] + window.prevMouseX - mouseX, window.game.env.scroll[1] + mouseY - prevMouseY);
                window.game.env.render();
            }
        }
    }

    // Dragging an agent horizontally out of canvas
    else if(window.is_dragging_agent
        && mouseY >= 0 && mouseY < window.canvas.height){

        if(mouseX < 0){
            window.dragging_side = "left";
        }
        else if(mouseX > window.canvas.width){
            window.dragging_side = "right";
        }

        cursor(MOVE);

        // Dragging an agent
        for (let agent of window.game.env.agents) {

            // Drags the selected agent
            if (agent.is_selected) {

                // Scrolls horizontally according to the dragging side to follow the agent
                window.game.env.set_scroll(null);

                // Computes the terrain's length according to the agent's morphology
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

                // Gets the mouse position inside the environment and clamps it horizontally to the edges of the terrain
                let mousePos = convertPosCanvasToEnv(mouseX, mouseY);
                let x = Math.max(0.02, Math.min(0.98, mousePos.x / terrain_length)) * terrain_length;

                // Sets the position of the agent to the mouse position
                window.game.env.set_agent_position(agent, x, mousePos.y);
                window.game.env.render();
                //window.is_dragging_agent = true;
                break;
            }
        }

        // Prevents default behaviour when dragging the mouse
        return false;
    }

    window.prevMouseX = mouseX;
    window.prevMouseY = mouseY;
}

/**
 * Handles actions when mouse is released.
 */
function mouseReleased(){
    cursor();
    window.is_dragging_agent = false;
    window.is_dragging_asset = false;
    window.dragging_side = null;
}

/**
 * Handles actions when mouse is moved.
 */
function mouseMoved(){

    // Draws the trace of the circle asset at the mouse position
    if(window.is_drawing_circle()){
        trace_canvas.clear();
        if(mouseX >= 0 && mouseX <= window.canvas.width
            && mouseY >= 0 && mouseY <= window.canvas.height) {
            trace_canvas.noStroke();
            trace_canvas.fill(136, 92, 0, 180);
            trace_canvas.circle(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.asset_size * 4 * window.game.env.zoom);
        }
        window.game.env.render();
        image(trace_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
    }

    // Draws the trace of the eraser at the mouse position
    else if (window.is_erasing()) {
        trace_canvas.clear();
        if (mouseX >= 0 && mouseX <= window.canvas.width
            && mouseY >= 0 && mouseY <= window.canvas.height) {
            trace_canvas.noStroke();
            trace_canvas.fill(255, 180);
            trace_canvas.circle(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.erasing_radius * 2);
        }
        window.game.env.render();
        image(drawing_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
        image(trace_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
        image(forbidden_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
    }
}

/**
 * Handles actions when a mouse wheel event is detected (actual mouse wheel or touchpad).
 * @param event {WheelEvent}
 * @returns {boolean}
 */
function mouseWheel(event){
    if(mouseX >= 0 && mouseX <= window.canvas.width
        && mouseY >= 0 && mouseY <= window.canvas.height) {

        trace_canvas.clear();

        // Resizes circle asset radius
        if(window.is_drawing_circle()){
            window.asset_size = Math.max(3, Math.min(window.asset_size - event.delta / 100, 30));
            trace_canvas.noStroke();
            trace_canvas.fill(136, 92, 0, 180);
            trace_canvas.circle(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.asset_size * 4 * window.game.env.zoom);
            window.game.env.render();
            image(trace_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
        }
        else if (window.is_drawing()){
            // Resizes erasing radius
            if(window.is_erasing()){
                window.erasing_radius = Math.max(5, Math.min(window.erasing_radius - event.delta / 100, 30));
                trace_canvas.noStroke();
                trace_canvas.fill(255, 180);
                trace_canvas.circle(mouseX, mouseY + SCROLL_MAX - window.game.env.scroll[1], window.erasing_radius * 2);
                window.game.env.render();
                image(drawing_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
                image(trace_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
                image(forbidden_canvas, 0, -SCROLL_MAX + window.game.env.scroll[1]);
            }
        }
        // Zooms in or out
        else {
            window.game.env.set_zoom(window.game.env.zoom - event.delta / 2000);
            // TODO: scroll on the mouse position
            window.game.env.set_scroll(null, window.game.env.scroll[0], window.game.env.scroll[1]);
            window.game.env.render();
        }

        // Prevents default behaviour for mouse wheel events inside the canvas
        return false;
    }
}

/**
 * Handles actions when a key is pressed.
 * @returns {boolean}
 */
function keyPressed(){
    // Deletes the agent or asset selected when pressing the delete key
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

/**
 * Handles actions when the window is resized.
 */
function windowResized(){

    let canvas_container = document.querySelector('#canvas_container');

    // Recomputes RENDERING_VIEWER_W, INIT_ZOOM and THUMBNAIL_ZOOM
    RENDERING_VIEWER_W = canvas_container.offsetWidth;
    INIT_ZOOM = RENDERING_VIEWER_W / ((TERRAIN_LENGTH + INITIAL_TERRAIN_STARTPAD) * 1.05 * TERRAIN_STEP * SCALE);
    THUMBNAIL_ZOOM = RENDERING_VIEWER_W / ((TERRAIN_LENGTH + INITIAL_TERRAIN_STARTPAD) * 0.99 * TERRAIN_STEP * SCALE);

    // Resizes the main canvas
    resizeCanvas(RENDERING_VIEWER_W, RENDERING_VIEWER_H);
    drawing_canvas.resizeCanvas(RENDERING_VIEWER_W, RENDERING_VIEWER_H + 2 * SCROLL_MAX);
    trace_canvas.resizeCanvas(RENDERING_VIEWER_W, RENDERING_VIEWER_H + 2 * SCROLL_MAX);
    forbidden_canvas.resizeCanvas(RENDERING_VIEWER_W, RENDERING_VIEWER_H + 2 * SCROLL_MAX);

    // Generates the terrain from the drawing
    if(is_drawing()){
        window.generateTerrain(true);
    }
    // Re-initializes the environment
    else{
        window.init_default();
    }
}

window.downloadObjectAsJson = (exportObj, exportName) => {
    let dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    let downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

window.strUcFirst = (a) => {
    return (a+'').charAt(0).toUpperCase()+a.substr(1);
}

window.draw_forbidden_area = () => {
    forbidden_canvas.clear();
    forbidden_canvas.stroke("#FF0000");
    forbidden_canvas.strokeWeight(3);
    forbidden_canvas.fill(255, 50, 0, 75);
    let w = convertPosEnvToCanvas((INITIAL_TERRAIN_STARTPAD - 1) * TERRAIN_STEP, 0).x;
    forbidden_canvas.rect(0, 0, w, RENDERING_VIEWER_H + 2 * SCROLL_MAX);
}

class SwimmerAbstractBody extends AbstractBody{
    constructor(scale, motors_torque, density, nb_steps_outside_water) {
        super(scale, motors_torque);
        this.body_type = BodyTypesEnum.SWIMMER;
        this.nb_steps_can_survive_outside_water = nb_steps_outside_water;

        // set the embodiment's density to the same value as water so that it will be in a zero-gravity setup
        this.DENSITY = density - 0.01; // Make it a little lighter such that it slowly goes up when no action is done
    }

    destroy(world) {
        super.destroy(world);
        this.fins = [];
        this.tail = null;
    }
}
class WaterDynamics {
    constructor(gravity, drag_mod=0.25, lift_mod=0.25, push_mod=0.05,
                max_drag=2000, max_lift=500, max_push=20){
        this.gravity = gravity;
        this.drag_mod = drag_mod;
        this.lift_mod = lift_mod;
        this.max_drag = max_drag;
        this.max_lift = max_lift;
        this.push_mod = push_mod;
        this.max_push = max_push;
    }
}

function WaterContactDetector() {
    b2.ContactListener.call(this);
    this.fixture_pairs = [];
}

WaterContactDetector.prototype = Object.create(b2.ContactListener.prototype);
WaterContactDetector.prototype.constructor = WaterContactDetector;
WaterContactDetector.prototype.BeginContact = function (contact){
    if(contact.GetFixtureA().GetBody().GetUserData().object_type == CustomUserDataObjectTypes.WATER
        && contact.GetFixtureB().GetBody().GetUserData().object_type == CustomUserDataObjectTypes.BODY_OBJECT){
        this.fixture_pairs.push([contact.GetFixtureA(), contact.GetFixtureB()]);
    }
    else if(contact.GetFixtureB().GetBody().GetUserData().object_type == CustomUserDataObjectTypes.WATER
        && contact.GetFixtureA().GetBody().GetUserData().object_type == CustomUserDataObjectTypes.BODY_OBJECT){
        this.fixture_pairs.push([contact.GetFixtureB(), contact.GetFixtureA()]);
    }
};

WaterContactDetector.prototype.EndContact = function (contact) {
    if(contact.GetFixtureA().GetBody().GetUserData().object_type == CustomUserDataObjectTypes.WATER
        && contact.GetFixtureB().GetBody().GetUserData().object_type == CustomUserDataObjectTypes.BODY_OBJECT){
        let index = this.fixture_pairs.indexOf([contact.GetFixtureA(), contact.GetFixtureB()]);
        if (index !== -1) {
            this.fixture_pairs.splice(index, 1);
        }
    }
    else if(contact.GetFixtureB().GetBody().GetUserData().object_type == CustomUserDataObjectTypes.WATER
        && contact.GetFixtureA().GetBody().GetUserData().object_type == CustomUserDataObjectTypes.BODY_OBJECT){
        let index = this.fixture_pairs.indexOf([contact.GetFixtureB(), contact.GetFixtureA()]);
        if (index !== -1) {
            this.fixture_pairs.splice(index, 1);
        }
    }
};

WaterContactDetector.prototype.Reset = function (){
    this.fixture_pairs = [];
};


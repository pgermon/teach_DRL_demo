class ParkourRenderer {
    constructor(config, parkour) {
        this.config = config
        this.parkour = parkour;
        this.main_screen = document.getElementById(config.canvas_id);
        this.ctx = this.main_screen.getContext("2d");
        this.resetCamera();
    }

    resetCamera() {
        this.zoom = this.config.max_zoom_factor;
        this.translate_x = 0;
        this.translate_y = 280;
    }

    setFps(fps) {
        this.config.draw_fps = fps;
        if (this.draw_interval)
            clearInterval(this.draw_interval);
        if (fps > 0 && this.config.draw_fps > 0) {
            this.draw_interval = setInterval(this.drawFrame.bind(this), Math.round(1000 / this.config.draw_fps));
        }
    }

    drawFrame() {

        // clear
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.main_screen.width, this.main_screen.height);

        this.drawParkour();

        this.ctx.restore();
    }

    drawParkour(){

        // Sky
        this.ctx.fillStyle = this.parkour.sky_poly[1];
        this.ctx.strokeStyle = this.parkour.sky_poly[1];
        this.drawPolygon(this.parkour.sky_poly[0], 0);

        // Water
        this.ctx.fillStyle = this.parkour.water_poly[1];
        this.ctx.strokeStyle = this.parkour.water_poly[1];
        this.drawPolygon(this.parkour.water_poly[0], 0);

        // Fill the ground and ceiling
        for(let i = 0; i < this.parkour.terrain_poly.length; i++){
            let pos = this.parkour.terrain_poly[i][0][0][0] - this.parkour.scroll_offset;
            if(pos >= - 0.02 * VIEWPORT_W && pos < VIEWPORT_W * 1.02){
                this.ctx.fillStyle = this.parkour.terrain_poly[i][1];
                this.ctx.strokeStyle = this.parkour.terrain_poly[i][1];
                this.drawPolygon(this.parkour.terrain_poly[i][0], this.parkour.scroll_offset);
            }
        }

        for(let i = 0; i < this.parkour.drawlist.length; i++){
            let body = this.parkour.drawlist[i];
            let data = body.GetUserData();
            if(data == "creeper"){
                let pos = body.GetFixtureList().GetShape().m_vertices[0].x - this.parkour.scroll_offset;
                if(pos >= - 0.02 * VIEWPORT_W && pos < VIEWPORT_W * 1.02){
                    this.ctx.fillStyle = body.color1;
                    this.ctx.strokeStyle = body.color2;
                    this.drawBodyPolygon(body, this.parkour.scroll_offset);
                }
            }
            else if(data == "rock" || data == "grass"){
                let shape = body.GetFixtureList().GetShape();
                let pos = shape.m_vertex1.x - this.parkour.scroll_offset;
                if(pos >= - 0.02 * VIEWPORT_W && pos < VIEWPORT_W * 1.02) {
                    this.ctx.fillStyle = body.color1;
                    this.ctx.strokeStyle = body.color2;
                    this.ctx.lineWidth = 1/SCALE;
                    this.drawLine(shape.m_vertex1, shape.m_vertex2, this.parkour.scroll_offset);
                }
            }
        }
    }

    drawPolygon(vertices, scroll){
        // set strokestyle and fillstyle before call
        this.ctx.beginPath();
        let p0 = vertices[0];
        this.ctx.moveTo(p0[0] - scroll, p0[1]);
        for (let k = 1; k < vertices.length; k++) {
            //let p = body.GetWorldPoint(vertices[k]);
            let p = vertices[k];
            this.ctx.lineTo(p[0] - scroll, p[1]);
        }
        this.ctx.lineTo(p0[0] - scroll, p0[1]);
        this.ctx.fill();
    }

    drawBodyPolygon(body, scroll){
        // set strokestyle and fillstyle before call
        this.ctx.beginPath();
        let fixture = body.GetFixtureList();
        let shape = fixture.GetShape();
        //let p0 = body.GetWorldPoint(shape.m_vertices[0]); //GetWorldPoint returns (NaN, NaN) from the 2nd iteration
        let p0 = shape.m_vertices[0];
        this.ctx.moveTo(p0.x - scroll, p0.y);
        for (let k = 1; k < shape.m_vertices.length / 2; k++) {
            //let p = body.GetWorldPoint(shape.m_vertices[k]);
            let p = shape.m_vertices[k];
            this.ctx.lineTo(p.x - scroll, p.y);
        }
        this.ctx.lineTo(p0.x - scroll, p0.y);

        this.ctx.fill();
        //this.ctx.stroke();
    }

    drawLine(p0, p1, scroll){
        // set strokestyle before call
        this.ctx.beginPath();
        this.ctx.moveTo(p0.x - scroll, p0.y);
        this.ctx.lineTo(p1.x - scroll, p1.y);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    drawBodyLine(body, scroll){
        // set strokestyle before call
        this.ctx.beginPath();
        let fixture = body.GetFixtureList();
        let shape = fixture.GetShape();
        //let p0 = body.GetWorldPoint(shape.m_vertex1);
        let p0 = shape.m_vertex1;
        //let p1 = body.GetWorldPoint(shape.m_vertex2);
        let p1 = shape.m_vertex2;
        this.ctx.moveTo(p0.x - this.parkour.scroll_offset, p0.y);
        this.ctx.lineTo(p1.x - this.parkour.scroll_offset, p1.y);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    getMinMaxDistance() {
        let min_x = 9999;
        let max_x = -1;
        let min_y = 9999;
        let max_y = -1;
        for (let k = 0; k < this.walkers.length; k++) {
            if (this.walkers[k].health > 0) {
                let dist = this.walkers[k].torso.upper_torso.GetPosition();
                min_x = Math.min(min_x, dist.x);
                max_x = Math.max(max_x, dist.x);
                min_y = Math.min(min_y, this.walkers[k].low_foot_height, this.walkers[k].head_height);
                max_y = Math.max(max_y, dist.y);
            }
        }
        return {
            min_x: min_x,
            max_x: max_x,
            min_y: min_y,
            max_y: max_y
        };
    }

    getZoom(min_x, max_x, min_y, max_y) {
        let delta_x = Math.abs(max_x - min_x);
        let delta_y = Math.abs(max_y - min_y);
        let zoom = Math.min(this.main_screen.width / delta_x, this.main_screen.height / delta_y);
        return zoom;
    }
}

import Timer from "timer";
import PWM from "pins/pwm";
import Color from "aral_util/rgbcolor";

class ColorLed extends Object {
    /**
     *  Flashing interval in ms.
     */
    #color;
    #rpin;
    #gpin;
    #bpin;
    #output2pwm(r,g,b) {
        this.#rpin.write(r);
        this.#gpin.write(g);
        this.#bpin.write(b);
    }

    #pwmOFF() {
        this.#rpin.write(0);
        this.#gpin.write(0);
        this.#bpin.write(0);
    }
    constructor(redpin = 12,greenpin =13,bluepin =14){
        super();
        this.#color = new Color();
        this.#rpin = new PWM({ pin: redpin });
        this.#gpin = new PWM({ pin: greenpin });
        this.#bpin = new PWM({ pin: bluepin });       
    }
    on() {
        this.#color.a= 1;
        this.#output2pwm(this.#color.r,this.#color.g,this.#color.b);
    }
    off(){
        this.#color.a=0;
        this.#pwmOFF()
    }
    set state(st) {
        this.#color.a=st;
    }
    get state() {
        return this.#color.a;
    }
    flash(interval){
        let on=true;
        if(interval===0) {
            this.#color.a =0;
            return;
        } else {
            this.#color.a = 2;
            return Timer.repeat(id => {
                if(this.#color.a != 2) {
                    Timer.clear(id);
                } else if( on ){
                    this.#output2pwm(this.#color.r,this.#color.g,this.#color.b);
                    on= false;
                } else {
                    this.#pwmOFF();
                    on= true;
                }
            },interval);
        }                      
    }
    setColor(red=0,green=0,blue=0)
    {
        this.#color.r= red;
        this.#color.g= green;
        this.#color.b= blue;
        if( this.#color.a == 1) this.#output2pwm(red,green,blue);
    }
    get color() 
    {
        return this.#color;
    }
    

    isFlashing()
    {
        return(this.#color.a == 2);
    }
    toString()
    {
        return 'color:'+this.#color
    }
}
Object.freeze(ColorLed.prototype);
export default ColorLed;
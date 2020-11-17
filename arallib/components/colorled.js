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
    
    constructor(redpin = 12,greenpin =13,bluepin =14){
        super();
        this.#color = new Color();
        this.#color.a= 2;
        this.#rpin = new PWM({ pin: redpin });
        this.#gpin = new PWM({ pin: greenpin });
        this.#bpin = new PWM({ pin: bluepin });       
    }
    flash(interval){
        if(interval===0) {
            this.color.a=2;
        } else {
            this.color.a= 1;
            Timer.repeat(id => {
                if(this.color.a === 1) {
                    this.#rpin.write(Color.invertValue(this.color.r));
                    this.#gpin.write(Color.invertValue(this.color.g));
                    this.#bpin.write(Color.invertValue(this.color.b));
                    this.color.a= 0;
                } else if(this.color.a === 0) {
                    this.#rpin.write(1023);
                    this.#gpin.write(1023);
                    this.#bpin.write(1023);
                    this.color.a= 1;
                } else Timer.clear(id);
            },interval);
        }                      
    }
    setColor(red=0,green=0,blue=0)
    {
        this.#color.r= red;
        this.#color.g= green;
        this.#color.b= blue;
    }
    get color() 
    {
        return this.#color;
    }
    

    isFlashing()
    {
        return(this.color.a != 2);
    }
    toString()
    {
        return 'color:'+this.color
    }
}
export default ColorLed;
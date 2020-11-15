import Timer from "timer";
import PWM from "pins/pwm";
import Color from "util/rgbcolor";

class ColorLed  {
    /**
     *  Flashing interval in ms.
     */
    color;
    #rpin;
    #gpin;
    #bpin;
    
    constructor(redpin = 12,greenpin =13,bluepin =14){
        this.color = new Color();
        this.color.flag= 2;
        this.#rpin = new PWM({ pin: 12 });
        this.#gpin = new PWM({ pin: 13 });
        this.#bpin = new PWM({ pin: 14 });       
    }
    flash(interval){
        if(interval===0) {
            this.color.flag=2;
        } else {
            this.color.flag= 1;
            Timer.repeat(id => {
                if(this.color.flag === 1) {
                    this.#rpin.write(Color.invertValue(this.color.r));
                    this.#gpin.write(Color.invertValue(this.color.g));
                    this.#bpin.write(Color.invertValue(this.color.b));
                    this.color.flag= 0;
                } else if(this.color.flag === 0) {
                    this.#rpin.write(1023);
                    this.#gpin.write(1023);
                    this.#bpin.write(1023);
                    this.color.flag= 1;
                } else Timer.clear(id);
            },interval);
        }                      
    }
    isFlashing()
    {
        return(this.color.flag != 2);
    }
}
export default ColorLed;
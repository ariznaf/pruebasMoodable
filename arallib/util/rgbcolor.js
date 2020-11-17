class RGBColor extends Object {
    // Colores almacenados como RRGGBBA en un entero de 32 bits con 10 bits por canal y 2 bits para el canal A,
    // 32 bit format RGB10A2 (big endian)
    // channel values between 0-1023, a values 0-3.
    #rgba= 0;
    static isInvalidValue(value) 
    {
        return (value & 0xFFFF_FFC00) != 0;
    }
    static isInvalidFlag(flag)
    {
        return (flag & 0xFFFF_FFF0) != 0;
    }
    static invertValue(value) {
        return ~value & 0x3FF;
    }
    constructor(red=0,green=0,blue=0,alfa=0)
    {
        super();
        if(red instanceof RGBColor){
            this.#rgba= red.rgb.#rgba;
        }else  if(typeof red === "object") {
            if(typeof red.rgb === "number") {
                this.rgb= red.rgb;
            } else {
                this.a= red.a;
                this.b= red.b;
                this.g= red.g;
                this.r= red.r;
            }
        } else {
            this.r= red;
            this.g= green;
            this.b= blue;
            this.a= alfa;
        }
    }
    //Getters
    get rgba()
    {
        return this.#rgba;
    }
    get rgb()
    {
        return this.rgb>>>2;
    }
    get r()
    {
        return (this.#rgba >>>22) & 0x3FF ;
    }
    get g()
    {
        return (this.#rgba >>> 12) & 0x3FF;
    }
    get b()
    {
        return (this.#rgba >> 2) & 0x3FF;
    }
    get a()
    {
        return this.#rgba & 0x3;       
    }
    
    //Setters
    set rgba(rgba)
    {
        this.#rgba= rgba;
    }
    set rgb(rgb)
    {
        this.#rgba= (rgb<<2) | (this.#rgba& 0xFFFF_FFFC);
    }
    set r(red)
    {
        if( RGBColor.isInvalidValue(red) )
            throw(`RGBColor.set r: Out of range (0-1023) color passed ${red}\n`);

        this.#rgba = (red << 22) | (this.#rgba & 0x003F_FFFF);
    }
    set g(green)
    {
        if( RGBColor.isInvalidValue(green) )
            throw(`RGBColor.set g: Out of range (0-1023) color passed ${green}\n`);

        this.#rgba = (green << 12 ) | (this.#rgba & 0xFFC0_0FFF);
    }
    set b(blue)
    {
        if( RGBColor.isInvalidValue(blue) )
            throw(`RGBColor.set g: Out of range (0-1023) color passed ${blue}\n`);

        this.#rgba = (blue<<2) | (this.#rgba & 0xFFFF_F003);
    }
    set a(value){
        if(RGBColor.isInvalidFlag(value))
            throw(`RGBColor.set flag: Out of range (0-3) flag passed ${blue}\n`);
        this.#rgba = value | (this.#rgba & 0xFFFF_FFFC);
    }
    toString()
    {
        return `r: ${this.r}, g: ${this.g}, b: ${this.b}, a: ${this.a}`;
    }
    toJSON()
    {
        return { r: this.r, g: this.g, b: this.b, a: this.a};
    }
}
export default RGBColor;
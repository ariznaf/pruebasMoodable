class RGBColor extends Object {
    // Colores almacenados como RRGGBB en un entero de 32 bits con 10 bits por canal (valores de 0 a 1023)
    #rgb= 0;
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
    constructor(red=0,green=0,blue=0)
    {
        super();
        this.setColor(red,green.blue)
    }
    // Init color with values r,g,b from 0 to 1023. 
    // You can set the values with a dictionary like
    // setcolor({r: xx, g: xx, b: xx})
    // or
    // setcolor({rgb: xxxxxx})
    setColor(red=0,green=0,blue=0) 
    {
        if(typeof red === "object") {
            trace(`RGBColor.setColor: typeof red.rgb= ${typeof red.rgb}\n`);
            if(red.rgb !== "undefined") {
                if( typeof red.rgb !== "number")
                    throw(`RGBColor.setcolor: Called with invalid rgb value\n`);
                    this.#rgb= red.rgb;
                return;
            } else {
                this.b= red.b;
                this.g= red.g;
                this.r= red.r;
            }
        } else {
            this.r= red;
            this.g= green;
            this.b= blue;
        }
        trace(`RGBColor.setColor: Color { r: ${red}, g: ${green}, b: ${blue}, rgb: ${this.#rgb} }\n`);

    }
    set rgb(rgb)
    {
        this.#rgb= rgb & 0x0FFF_FFFF;
    }
    get rgb()
    {
        return this.rgb & 0x0FFF_FFFF;
    }
    get r()
    {
        return (this.#rgb >>>20) & 0x3FF ;
    }
    get g()
    {
        return (this.#rgb >>> 10) & 0x3FF;
    }
    get b()
    {
        return this.#rgb & 0x3FF;
    }
    set r(red)
    {
        if( RGBColor.isInvalidValue(red) )
            throw(`RGBColor.set r: Out of range (0-1023) color passed ${red}\n`);

        this.#rgb = (red << 20) | (this.#rgb & 0x7_FFFF);
    }
    set g(green)
    {
        if( RGBColor.isInvalidValue(green) )
            throw(`RGBColor.set g: Out of range (0-1023) color passed ${green}\n`);

        this.#rgb = (green << 10 ) | (this.#rgb & 0x3FF0_03FF);
    }
    set b(blue)
    {
        if( RGBColor.isInvalidValue(blue) )
            throw(`RGBColor.set g: Out of range (0-1023) color passed ${blue}\n`);

        this.#rgb = blue | (this.#rgb & 0xFFFF_FFC00);
    }
    set flag(value){
        if(RGBColor.isInvalidFlag(value))
            throw(`RGBColor.set flag: Out of range (0-3) flag passed ${blue}\n`);
        this.#rgb = (value << 30) | (this.#rgb & 0x0FFF_FFFF);
    }
    get flag()
    {
        return this.#rgb >>>30;       
    }
    toString()
    {
        return "rgb:"+this.#rgb;
    }
    toJSON()
    {
        return { r: this.r, g: this.g, b: this.b};
    }
}
export default RGBColor;
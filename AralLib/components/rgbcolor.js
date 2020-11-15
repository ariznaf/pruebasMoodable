class RGBColor {
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
        this.setColor(red,green.blue)
    }
    // Inicializar el color con valores r,g,b de 0 a 1023.
    setColor(red=0,green=0,blue=0) 
    {
        if( RGBColor.isInvalidValue(red)|| RGBColor.isInvalidValue(green) || RGBColor.isInvalidValue(blue))
            throw(`RGBColor.constructor: Out of range (0-1023) color passed to constructor { r: ${red}, g: ${green}, b: ${blue} }\n`);
        this.#rgb= (red & 0x3FF)<<20;
        this.#rgb |= (green & 0x3FF)<<10;
        this.#rgb |= blue & 0x3FF;
//        trace(`RGBColor.constructor: Color { r: ${red}, g: ${green}, b: ${blue}, rgb: ${this.#rgb}\n`);

    }
    get r()
    {
        return this.#rgb >>>20;
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
        if( RGBColor.isIinvalidValue(red) )
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
}
export default RGBColor;
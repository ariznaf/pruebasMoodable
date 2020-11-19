import Color from "aral/util/rgbcolor";
let color;


debugger;
trace("===== RGBColor: constructor(200) expected output: 'r: 200, g: 0, b:0, a:0' ...\n");
color= new Color(200);
trace("===== ... got: "+color+'\n');


debugger;
trace("===== RGBColor: constructor({r:1000, g:0, b: 512}) expected output: 'r: 1000, g: 0, b:512, a:0' ...\n");
color= new Color({r:1000, g:0, b: 512});
trace("===== ... got: "+color+'\n');


debugger;
trace("===== RGBColor: constructor({rgb: 0x3CDA_3FC7}) expected output: 'r:973,g: 655,b:967, a: 0' ...\n");
color= new Color({rgb:0xFCDA_3FC7});
trace("===== ... got: "+color+'\n');



trace("===== RGBColor: constructor(973,655,967) expected output: '0xFCDA_3FC7' ...\n");
color= new Color(973,655,967);
trace("===== ... got: 0x"+color.rgb.toString(16)+'\n');



debugger;
trace("===== RGBColor: constructor(new Color(100,100,100))' expected output: 'r: 100, g: 100, b:100, a:0' ...\n");
//Creating a copy of a color from another color.
color= new Color(new Color(100,100,100));
trace("===== ... got: "+color+'\n');

debugger;
trace("===== RGBColor: testing get and set of color channels. r= 481, g= 222 b=947' ...\n");
color.r=481;
color.g= 222;
color.b= 947;
trace(`===== ... got: 'r= ${color.r}, g= ${color.g}, b= ${color.b}'\n`);

debugger;
trace("===== RGBColor: a= 1 (not affecting colors) expected output: 'a= 1, rgb:0x16419064' ...\n");
color.a= 1;
trace(`===== ... got: 'flag=${color.a},rgb= ${color.rgb}'\n`);

debugger;
trace("===== RGBColor: a= 0xF (not affecting colors) expected output: 'a= 1, rgb:0x6419064' ...\n");
color.a= 3;
trace(`===== ... got: 'a=${color.a},rgb= ${color.rgb}'\n`);

trace("===== RGBColor: constructor. Creating a color from another one with a set to maximum 3.'a= 3, rgb:0x6419064' ...\n");
{
    let color2= new Color(color);
    trace(`===== ... got: 'a=${color2.a},rgb= ${color2.rgb}'\n`);
}

debugger;
trace('===== RGBColor: Testing conversion to JSON. expected output: \'{ "r":"252","g":"653","b":"422",a": "3"}\' ...\n');
color.a= 0xF;
color.rgb= 0xFCA_35A6;
trace("===== ... got: "+color.toJSON()+"\n");

debugger;
trace('===== RGBColor: Test channel a out of bounds exception to JSON. expected output: ...\n');
try {
    color.a= 5;
} catch(error){
    trace("===== ... got: "+error+"\n");
}

debugger;
trace('===== RGBColor: Test channel r out of bounds exception to JSON. expected output: ...\n');
try {
    color.r= 124;
} catch(error){
    trace("===== ... got: "+error+"\n");
}




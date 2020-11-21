/*
 * Test batteries for modules of arallib.
 * use: mcrun -d -m -p <platform> 
 * <platform>= esp32 (for esp32 microcontroller)
 */

 let modulesToTest= [
    "rgbcolor",
    "infiniteloop"
];
import LoadMod from "loadmod";


trace("== Beginning battery of tests\n");
for(let i=0; i < modulesToTest.length;i++) {

    let module= modulesToTest[i];
    //Dont't break if there is an exception in the testing code.
    try {
        trace("==== Begin tests from "+module+"\n");

        //Try to isolate tests, invoking the tests in a block code, so any variable is internal and can be destroyed.
        {  
            LoadMod.load(module);
        }
        trace("==== End tests from "+module+"\n");
    } catch(error){
        trace("==== Caught exception tests from "+module+" "+error+"\n");
    }

}

trace("== Ended battery of tests\n");
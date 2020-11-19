
class Dummy {
    constructor(size=0)
    {
        let data= new Array();
        //if size is not given, create a random size array.
        if (size==0) size= Math.random()*500;
        trace(size+'                              \r');
        for(let i=0;i<size;i++)
        {
            data[i]= Math.random()*2^32;
        }
    }
}
debugger;

//Test if memory is well managed and is recoverded when objects is destroyed.
//create a big object and destroyed inmediatly.
new Dummy(600);

//create and destroyed multiple objects of differente sizes.
for(let i=1;i<4000;i++) {
    trace("Created object : "+i+" size: ");
    let obj= new Dummy();
}

//Test if we can still generate the big object 
debugger
new Dummy(600);

//test how many numbers we can still create
let data=[];
for(let i=0;10000;i++){
    trace('Creating array of size: '+i+'                      \r');
    data[i]= Math.random()*2^32;
}


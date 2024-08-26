import fetch from 'node-fetch'; // Import fetch if necessary for your environment


const samp = String.raw`fetch(...)`;



//   const samp2 = samp
//   .replace(/'\'/g, '\\\\')
//   ;


//   console.log(eval(samp2));

const req = eval(samp);

req.then()

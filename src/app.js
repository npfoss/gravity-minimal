'use strict'

// this is the wrong place to import from, replace with npm import later (TODO)
const GravityProtocol = require('../../gravity-protocol'); // two ..s because it ends up in public/


const gp = new GravityProtocol();


gp.getNodeInfo()
	.then(info => {
		document.getElementById("info").innerHTML = JSON.stringify(info, null, '\t');
	})

document.getElementById("refresh").addEventListener("click", function(){
	// another example to try: /ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
	gp.loadDirs(document.getElementById("pathinput").value)
		.then(resp => {
			document.getElementById("profile").innerHTML = JSON.stringify(resp, null, '\t');
		});
});

document.getElementById("keygen").addEventListener("click", function(){
	gp.resetMasterKey();
})

document.getElementById("getkey").addEventListener("click", function(){
	console.log(gp.getMasterKey());
})

document.getElementById("encdec").addEventListener("click", function(){
	let m = document.getElementById("message").value;
	console.log("message: " + m)
	let c = gp.encrypt(gp.getMasterKey(), m);
	console.log("ciphertext: ");
	console.log(c)
	let r = gp.decrypt(gp.getMasterKey(), c)
	console.log("decrypted: ")
	console.log(r)
	console.log('matching? ' + (m === r))
})

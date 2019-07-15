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
	gp.getMyProfileHash()
		.then(resp => {
			document.getElementById("toplevelinfo").innerHTML = JSON.stringify(resp, null, '\t');
		})
});

// document.getElementById("keygen").addEventListener("click", function(){
// 	gp.resetMasterKey();
// })

document.getElementById("getkey").addEventListener("click", async function(){
	console.log(await gp.getMasterKey());
})

document.getElementById("encdec").addEventListener("click", async function(){
	let m = document.getElementById("message").value;
	console.log("message: " + m)
	let c = await gp.encrypt(await gp.getMasterKey(), m);
	console.log("ciphertext: ");
	console.log(c)
	let r = await gp.decrypt(await gp.getMasterKey(), c)
	console.log("decrypted: ")
	console.log(r)
	console.log('matching? ' + (m === r))
})

document.getElementById("contactbutton").addEventListener("click", function(){
	gp.getContacts().then(contacts => {
		document.getElementById("contacts").innerHTML = JSON.stringify(contacts, null, '\t');
	})
})

document.getElementById("addsubscriber").addEventListener("click", function(){
	let pubkey = document.getElementById("peerpubkey").value;
	gp.addSubscriber(pubkey);
})

document.getElementById("friendkey").addEventListener("click", async () => {
	let path = `/ipfs/${await gp.getProfileHash("doesn't matter yet :P")}/subscribers`
	let key = await gp.testDecryptAllSubscribers(path);
	console.log(key)
})

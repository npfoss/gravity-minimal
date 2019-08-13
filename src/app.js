'use strict'

// this is the wrong place to import from, replace with npm import later (TODO)
const GravityProtocol = require('../../gravity-protocol'); // two ..s because it ends up in public/


const gp = new GravityProtocol();


gp.getNodeInfo()
	.then(info => {
		document.getElementById("info").innerHTML = JSON.stringify(info, null, '  ');
		console.log('public key: ' + info.publicKey);
	})

document.getElementById("refresh").addEventListener("click", function(){
	// another example to try: /ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
	gp.loadDirs(document.getElementById("pathinput").value)
		.then(resp => {
			document.getElementById("profile").innerHTML = JSON.stringify(resp, null, '  ');
		});
	gp.getMyProfileHash()
		.then(resp => {
			document.getElementById("toplevelinfo").innerHTML = JSON.stringify(resp, null, '  ');
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
		document.getElementById("contacts").innerHTML = JSON.stringify(contacts, null, '  ');
	})
})

gp.getMagicLink().then(m => {
	document.getElementById("magic").value = m;
});

document.getElementById("sendmagic").addEventListener("click", function(){
	let m = document.getElementById("magiclink").value;
	gp.addViaMagicLink(m);
})

document.getElementById("friendkey").addEventListener("click", async () => {
	let pk = document.getElementById("lookuppk").value;
	let key = await gp.getFriendKey(pk);
	console.log(key)
})

document.getElementById("creategroup").addEventListener("click", async () => {
	let c = await gp.getContacts();
	gp.createGroup(Object.keys(c)) // creates a group with all contacts
		.then(res => {console.log(res)})
})

document.getElementById("setnick").addEventListener("click", async () => {
	// sets the nickname for that person in our first group
	let groups = await gp.getGroupList(await gp.getPublicKey());
	let mypk = await gp.getPublicKey();
	console.log(await gp.getGroupInfo(mypk, groups[0]))
	let nicks = {};
	nicks[document.getElementById("nickkey").value] = document.getElementById("nickname").value;
	await gp.setNicknames(nicks, groups[0])
	console.log(await gp.getGroupInfo(mypk, groups[0]))
});

document.getElementById("setbio").addEventListener("click", async () => {
	const group = document.getElementById("biogroupid").value;
	console.log(await gp.getBio(group))
	let bio = {};
	bio[document.getElementById("biokey").value] = document.getElementById("bioval").value;
	await gp.setBio(group, bio);
	console.log(await gp.getBio(group))
});

document.getElementById("publish").addEventListener("click", async () => {
	await gp.publishProfile();
});

document.getElementById("lookup").addEventListener("click", async () => {
	let path = await gp.lookupProfileHash({publicKey: document.getElementById("ipnskey").value});
	document.getElementById("toplevelinfo").innerHTML = JSON.stringify(path, null, '  ');
	gp.loadDirs(path)
		.then(resp => {
			document.getElementById("profile").innerHTML = JSON.stringify(resp, null, '  ');
		});
});

document.getElementById("connectpeer").addEventListener("click", async () => {
	let addr = document.getElementById("peeraddr").value;
	await gp.connectToAddr(addr);
})

document.getElementById("refreshpeers").addEventListener("click", async () => {
	gp.getIpfsPeers()
		.then(resp => {
			document.getElementById("peerlist").innerHTML = JSON.stringify(resp, null, '  ');
		})
});

document.getElementById("sendpost").addEventListener("click", async () => {
	const group = document.getElementById("postgroupid").value;
	let text = document.getElementById("posttext").value;
	console.log(await gp.postTxt(group, text, undefined, ['testpost', 'firstpost', 'hashtag']));
});

document.getElementById("autoconnect").addEventListener("click", async () => {
	gp.autoconnectPeers();
});

document.getElementById("ipnsrefresh").addEventListener("click", async () => {
	gp.getIpnsInfo()
		.then(resp => {
			document.getElementById("ipnsinfo").innerHTML = JSON.stringify(resp, null, '  ');
		})
});

document.getElementById("getgroups").addEventListener("click", async () => {
	let pk = document.getElementById("groupgetpk").value;
	if (!pk || pk === 'me'){
		pk = await gp.getPublicKey();
	}
	let groups = await gp.getGroupList(pk);
	console.log(groups)
});

document.getElementById("getgroupinfo").addEventListener("click", async () => {
	let pk = document.getElementById("groupinfopk").value;
	if (!pk || pk === 'me'){
		pk = await gp.getPublicKey();
	}
	let name = document.getElementById("groupinfoname").value;
	let info = await gp.getGroupInfo(pk, name);
	console.log(info)
});

document.getElementById("getgroupposts").addEventListener("click", async () => {
	let pk = document.getElementById("getpostpk").value;
	if (!pk || pk === 'me'){
		pk = await gp.getPublicKey();
	}
	let name = document.getElementById("postgroupname").value;
	let links = await gp.getAllPostLinks(pk, name);
	let key = await gp.getGroupKey(pk, name)
	console.log(links)
	links.forEach(async l => {
		console.log({
			meta: await gp.readPostMetadata(key, l),
			main: await gp.readPostData(key, l),
		})
	});
});

'use strict'

// const GravityProtocol = require('../../gravity-protocol'); // two ..s because it ends up in public/
const GravityProtocol = require('gravity-protocol');
const Cookies = require('js-cookie');


// for starting over. be careful.
// Cookies.remove('gravity-device-key')

let deviceKey = Cookies.get('gravity-device-key');

const options = deviceKey === undefined ? {} : { deviceKey: deviceKey }
const gp = new GravityProtocol(options);

if (deviceKey === undefined) {
	gp.ready.then(() => {
		Cookies.set('gravity-device-key', gp.to_base64(gp.deviceKey), { expires: 365 });
	});
}

/* cookie examples

    use with caution
    this.setMasterKey = (newkey) => {
      Cookies.set('gravity-master-key', newkey, { expires: 365 });
      // , { secure: true }); // for https only
      // TODO: store somewhere better than in a cookie.
      //  (only store a device key, keep master key enc in profile only)
    };

    const cookie = Cookies.get('gravity-master-key');
    if (cookie === undefined) {
      throw new Error('No master key');
    }
    return sodium.from_base64(cookie);

*/


gp.ready
	.then(async () => {
		const info = await gp.getIpfsNodeInfo();
		document.getElementById("info").innerHTML = JSON.stringify(info, null, '  ');
		const identity = {id: gp.getIpnsId(), publicKey: gp.getPublicKey()};
		document.getElementById("info2").innerHTML = JSON.stringify(identity, null, '  ');
		// console.log('public key: ' + info.publicKey);
	});


document.getElementById("nuke").addEventListener("click", async function(){
	console.warn('nuking');
	deviceKey = await gp.deleteAllAndCreateNewIdentity();
	Cookies.set('gravity-device-key', gp.to_base64(deviceKey), { expires: 365 });
});

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
	/* testing device key stuff
	const dk = await gp.resetMasterKey();
	console.log(dk)
	console.log(await gp.getDeviceKeyInfo());
	await gp.setDeviceKeyDescription(dk, 'test desc')
	console.log(await gp.getDeviceKeyInfo());
	const dk2 = await gp.createNewDeviceKey('number 2');
	console.log(dk2)
	console.log(await gp.getDeviceKeyInfo());
	*/
// })

document.getElementById("getkey").addEventListener("click", async function(){
	console.log(deviceKey);
})

document.getElementById("encdec").addEventListener("click", async function(){
	let m = document.getElementById("message").value;
	console.log("message: " + m)
	let c = await gp.encrypt(gp.from_base64(deviceKey), m);
	console.log("ciphertext: ");
	console.log(c)
	let r = await gp.decrypt(gp.from_base64(deviceKey), c)
	console.log("decrypted: ")
	console.log(r)
	console.log('matching? ' + (m === r))
})

document.getElementById("contactbutton").addEventListener("click", function(){
	gp.getContacts().then(contacts => {
		document.getElementById("contacts").innerHTML = JSON.stringify(contacts, null, '  ');
	})
})

gp.ready.then(async () => {
	const m = await gp.getMagicLink();
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
	let groups = await gp.getGroupList(gp.getPublicKey());
	let mypk = gp.getPublicKey();
	console.log(await gp.getGroupInfo(groups[0], mypk))
	let nicks = {};
	nicks[document.getElementById("nickkey").value] = document.getElementById("nickname").value;
	await gp.setNicknames(groups[0], nicks)
	console.log(await gp.getGroupInfo(groups[0], mypk))
});

document.getElementById("setbio").addEventListener("click", async () => {
	const group = document.getElementById("biogroupid").value;
	console.log(await gp.getBio(gp.getPublicKey(), group))
	let bio = {};
	bio[document.getElementById("biokey").value] = document.getElementById("bioval").value;
	await gp.setBio(group, bio);
	console.log(await gp.getBio(gp.getPublicKey(), group))
});

document.getElementById("publish").addEventListener("click", async () => {
	await gp.publishProfile(undefined, document.getElementById("pubdata").value);
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
	const resp = gp.getIpnsInfo();
	document.getElementById("ipnsinfo").innerHTML = JSON.stringify(resp, null, '  ');
});

document.getElementById("getgroups").addEventListener("click", async () => {
	let pk = document.getElementById("groupgetpk").value;
	if (!pk || pk === 'me'){
		pk = gp.getPublicKey();
	}
	let groups = await gp.getGroupList(pk);
	console.log(groups)
});

document.getElementById("getgroupmembers").addEventListener("click", async () => {
	let salt = document.getElementById("membergetid").value;
	let memberStatus = await gp.getGroupMembership(salt);
	console.log(memberStatus);
});

document.getElementById("getgroupinfo").addEventListener("click", async () => {
	let pk = document.getElementById("groupinfopk").value;
	if (!pk || pk === 'me'){
		pk = gp.getPublicKey();
	}
	let name = document.getElementById("groupinfoname").value;
	let info = await gp.getGroupInfo(name, pk);
	console.log(info)
});

document.getElementById("getgroupposts").addEventListener("click", async () => {
	let pk = document.getElementById("getpostpk").value;
	if (!pk || pk === 'me'){
		pk = gp.getPublicKey();
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

document.getElementById("convertid").addEventListener("click", async () => {
	console.log(await gp.ipnsIdToPubkey(document.getElementById("ipnsid").value))
});

gp.on('new-record', async (args) => {
	console.log('event!')
	console.log(args);
});

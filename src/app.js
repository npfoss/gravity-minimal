'use strict'

// this is the wrong place to import from, replace with npm import later (TODO)
const GravityProtocol = require('../../gravity-protocol') // two ..s because it ends up in public/


const gp = new GravityProtocol()

document.getElementById("refresh").addEventListener("click", function(){
	gp.loadFiles('/')
		.then(resp => {
			document.getElementById("profile").innerHTML = JSON.stringify(resp, null, '\t')
		})
});



"use strict";
document.body.style.border = "5px solid #ff0080";
//alert("The test extension is up and running");
console.log('main.js says hello');


browser.runtime.onMessage.addListener(request => {
	document.body.style.border = "15px solid #ff0080";
	console.log("Message from the background script:");
	console.log(request.greeting);
	return Promise.resolve({response: "Hi from content script"});
});

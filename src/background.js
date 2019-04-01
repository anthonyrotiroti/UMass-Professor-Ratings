
//Port variable made global so that other functions can send rating asynchronously
var port;

chrome.runtime.onConnect.addListener(function(p) {
	port = p;
	p.onMessage.addListener(function(r){
		findProfRating(r.prof, r.index, r.lastIndex, r.name, findProfRatingCallback);
	});
});

function encodeName(name){
	var names = name.split(' ');
	return (names[0] + '+' + names[1]).trim();
}


function findProfRating(prof, index, lastIndex, name, callback){

	var url = 'https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=University+of+Massachusetts&schoolID=1513&query=' + encodeName(name);
	//console.log(url);
	var xhr = new XMLHttpRequest();

	xhr.open("GET", url , true); 
	xhr.onload = function(){
		//if(xhr.readyState == 4 && xhr.status == 200)
			
			// Parsing html of search page and extracting link to prof

		var parser = new DOMParser();
		var doc = parser.parseFromString(xhr.responseText,'text/html');
		console.log(doc)
		var listing = doc.querySelector(".listing.PROFESSOR");
		if(listing){
			var el = listing.firstElementChild.getAttribute('href');
			if(el)
				callback(prof, index, lastIndex, name, el);
			else{
				url = ''
				port.postMessage({prof: prof, index:index, 
				lastIndex:lastIndex,name:name, url:url, rating:'N/A'});
			}
		}

		else {
			url = ''
			port.postMessage({prof: prof, index:index, 
			lastIndex:lastIndex,name:name, url:url, rating:'N/A'});
		}

	
	}
	xhr.send(null);
}


function findProfRatingCallback(prof, index, lastIndex, name, page){
	var url = "https://www.ratemyprofessors.com" + page;	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);

	xhr.onload = function(){
		var parser = new DOMParser();
		var doc = parser.parseFromString(xhr.responseText, 'text/html');
		try{
			var rating = doc.querySelector("div.breakdown-container.quality").children[0].children[0].innerHTML;

			port.postMessage({prof:prof, index:index, lastIndex:lastIndex, name:name, url:url, rating:rating});

		}

		catch(error) {
			console.log("Unable to find rating for " + name);
		}

	}
	
	xhr.send(null);
}




/*
function findProfRatingCallback(index, page){

	if(page == null){
		profs[index].rating = "Not Found";
		console.log(profs[index].name + ": Not Found");
		return "error";
	}
	var url = "https://www.ratemyprofessors.com" + page;	
	var xhr = new XMLHttpRequest();

	xhr.open('GET', url, true);
	xhr.onload = function(){
		var parser = new DOMParser();
		var doc = parser.parseFromString(xhr.responseText, 'text/html');
		var rating = doc.querySelector("div.breakdown-container.quality").children[0].children[0].innerHTML;
		console.log(profs[index].name + ": " + profs[index].rating);
		

		
	}
	xhr.send(null);
	//return true;
	
	//var profPage = doc.getElementsByClassName('listing PROFESSOR')[0].children[0].getAttribute('href');
	//console.log(doc.getElementsByClassName('listing PROFESSOR'));
	//xhr.send(null);
}
*/



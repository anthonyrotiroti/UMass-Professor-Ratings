
// Global profs is not updating in the functions. Need to pass ratings back to content script.


var profs = [];


chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse){
		if(request.message == "find-rating"){
			findProfRating(request.prof, findProfRatingCallback);

			
			// Returning true makes the response send asynchronously
			return true; 
		}
	});



function findProfRating(prof, callback){

	var url = 'https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=University+of+Massachusetts&schoolID=1513&query=' + prof.urlName;
	//console.log(url);
	var xhr = new XMLHttpRequest();

	xhr.open("GET", url , true); 
	xhr.onload = function(){
		//if(xhr.readyState == 4 && xhr.status == 200)
			
			// Parsing html of search page and extracting link to prof

		var parser = new DOMParser();
		var doc = parser.parseFromString(xhr.responseText,'text/html');
		var el = doc.querySelector(".listing.PROFESSOR").firstElementChild.getAttribute('href');

		if(el)
			callback(prof, el);
		
	}
	xhr.send(null);
}


function findProfRatingCallback(prof, page){
	var url = "https://www.ratemyprofessors.com" + page;	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.onload = function(){
		var parser = new DOMParser();
		var doc = parser.parseFromString(xhr.responseText, 'text/html');
		var rating = doc.querySelector("div.breakdown-container.quality").children[0].children[0].innerHTML;

		prof.rating = rating;
	}
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
		f

		
	}
	xhr.send(null);
	//return true;
	
	//var profPage = doc.getElementsByClassName('listing PROFESSOR')[0].children[0].getAttribute('href');
	//console.log(doc.getElementsByClassName('listing PROFESSOR'));
	//xhr.send(null);
}
*/



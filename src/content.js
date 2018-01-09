// Global variables:

// An array of professors read from the Spire page.
var professors = [];

// A count of how many professor rating async calls have been completed.
var profsLoaded = 0;

// The iframe of the page, which contains the content.
var iframe = document.getElementById('ptifrmtgtframe');


function getProfs(){
   
	var element;
	for(var i = 0; iframe.contentDocument.getElementById('MTG_INSTR$'+i); i++){
		element = iframe.contentDocument.getElementById('MTG_INSTR$'+i);

		if(element.innerHTML !== 'Staff' && element.innerHTML !== 'TBA'){
			var names = element.innerHTML.split(/,\s<br>/);

			for(var j = 0; j < names.length; j++){
				var prof = element;
				prof.name = names[j];
				prof.rating = -1;
				professors.push(prof);
				findProfRating(prof, j, names.length-1,  prof.name, findProfRatingCallback);
			}
		}
	}	
}



function encodeName(name){
	var names = name.split(' ');
	return names[0] + '+' + names[1];
}


function findProfRating(prof, index, lastIndex, name, callback){
	prof.innerHTML = '';

	var url = 'https://www.ratemyprofessors.com/search.jsp?queryoption=HEADER&queryBy=teacherName&schoolName=University+of+Massachusetts&schoolID=1513&query='
	+ encodeName(name);

	var xhr = new XMLHttpRequest();

	xhr.open("GET", url , true); 
	xhr.onload = function(){

		var parser = new DOMParser();
		var doc = parser.parseFromString(xhr.responseText,'text/html');
		var result = doc.querySelector(".listing.PROFESSOR")

		if(result)
			callback(prof, index, lastIndex, name, result.firstElementChild.getAttribute('href'));

		else
			prof.innerHTML += (name + '  Not Found');
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
		var rating = doc.querySelector("div.breakdown-container.quality").children[0].children[0].innerHTML;

		prof.innerHTML += (name + '  <a href="' + url + '" target =_blank>' + rating + '</a> <br>');
		profsLoaded++;

		if(profsLoaded == professors.length)
			wait();	
	}
	
	xhr.send(null);
}


function wait(){
	setTimeout(function(){
		var el = iframe.contentDocument.getElementById('MTG_INSTR$0');	
		if(professors.length > 0 && !el)
			reset();
			
		if(el && (professors.length == 0)){
			getProfs();
			wait();
		}
		
		else
			wait();
		
	},1000);

	}


function reset(){
	professors = [];
	profsLoaded = 0;
}


wait();
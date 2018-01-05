var professors = [];

function runScript(){
	console.log("runScript called");
	var iframe = document.getElementById('ptifrmtgtframe');
	var el = iframe.contentDocument.getElementById('MTG_INSTR$0');
	if(!el){
		// A lower timeout causes different-origin error. Maybe because of more frequent runScript calls.
		//window.setTimeout(runScript,1000); 
		//console.log("no profs");
		return;
	}

	var i = 0;
	while(el){
		if(el.innerHTML !== 'Staff' && el.innerHTML !== 'TBA')
			professors.push(el);
		i++;
		el = iframe.contentDocument.getElementById('MTG_INSTR$'+i);
	}

	professors.forEach(function(prof){
		prof.name = prof.innerHTML;
		prof.urlName = encodeName(prof.name);
		prof.rating = -1;

		findProfRating(prof,findProfRatingCallback);
	});
}



function encodeName(name){
	var names = name.split(' ');
	return names[0] + '+' + names[1];
}


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
		var result = doc.querySelector(".listing.PROFESSOR")

		if(result)
			callback(prof, result.firstElementChild.getAttribute('href'));
		else
			prof.insertAdjacentHTML('beforeend', '  Not Found');

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

		prof.insertAdjacentHTML('beforeend', '  <a href="'+url+'" target =_blank>'+rating+'</a>');
		
		
	}
	xhr.send(null);
}

function checkIFrame(){
	var iframe = document.getElementById('ptifrmtgtframe');
	var doc = iframe.contentDocument;

	if(doc.readyState == 'complete') {
		iframe.contentWindow.onload = function(){
			console.log("loaded");
		};
		runScript();
	}
	window.setTimeout(checkIFrame,1000);
}

checkIFrame();
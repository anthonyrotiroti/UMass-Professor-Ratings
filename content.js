var professors = [];


var profsLoaded = 0;

var observer = new MutationObserver(function(){console.log("mutation");});
observer.observe(document, {childList: true, subtree: true});

iframe = document.getElementById('ptifrmtgtframe');

function runScript(){
	console.log("runScript called");
	//var iframe = document.getElementById('ptifrmtgtframe');
	var el = iframe.contentDocument.getElementById('MTG_INSTR$0');
	//if(!el){
		// A lower timeout causes different-or0igin error. Maybe because of more frequent runScript calls.
		//window.setTimeout(runScript,1000); 
		//console.log("no profs");
		//return;
	//}

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
		profsLoaded++;

		if(profsLoaded == professors.length)
			wait();
		
	}
	xhr.send(null);
}


//checkIFrame();


function wait(){
	console.log("wait");
	setTimeout(function(){
		var el = iframe.contentDocument.getElementById('MTG_INSTR$0');	
		if(professors.length > 0 && !el){
			reset();
		}	
		if(el && (professors.length == 0)){
			runScript();
			wait();
		}
		
		else{
			wait();
		}
	},1000);

	}


function reset(){
	professors = [];
	profsLoaded = 0;
}
	//setTimeout(1000, function(){
		//On prof page -> insert ratings
		//if(iframe.contentDocument.getElementById('MTG_INSTR$0')){ //&& (professors.length == 0 || profsLoaded < professors.length)){
			//console.log("hit");
			//observer.disconnect(); //Don't want to trigger observer with rating insertion
			//runScript();
		//}
	//};


wait();
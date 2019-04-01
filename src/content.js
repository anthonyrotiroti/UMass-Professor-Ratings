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
				prof.difficulty = -1;
				prof.wouldTakeAgain = -1;
				professors[i] = prof;
				
				port.postMessage({prof:prof, index:i, lastIndex: names.length-1, name:prof.name});
				//findProfRating(prof, j, names.length-1,  prof.name, insertRating);
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
	port.postMessage({prof:prof, index:index, lastIndex: lastIndex, name:name});

}


function insertRating(prof, index, lastIndex, name, url, rating){

// Not putting a link if the prof isn't found.
	if(rating == 'N/A'){
		professors[index].innerHTML = professors[index].innerHTML.replace(name, name + '  <a class="removelinkdefault" style="text-decoration: none;"' 
			+ '" target =_blank>' + '<span style="color:brown; font-size: 1.3em; font-family: Arial;">'
			+ rating + '</span>' + '</a> <br>');
	}

	else{
		professors[index].innerHTML = professors[index].innerHTML.replace(name, name + '  <a class="removelinkdefault" style="text-decoration: none;" href="' + url 
			+ '" target =_blank>' + '<span style="color:brown; font-size: 1.3em; font-family: Arial;">'
			+ rating + '</span>' + '</a> <br>');
	}

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

var port = chrome.runtime.connect({name: 'rating'});

port.onMessage.addListener(function(r){
	console.log(r.name + ': ' + r.rating);
	insertRating(r.prof, r.index, r.lastIndex, r.name, r.url, r.rating);
});

wait();
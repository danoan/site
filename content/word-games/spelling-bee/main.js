function clickLetter(letter){
  var current = document.getElementById("display").innerHTML;

  if(current.length<=30){
    document.getElementById("display").innerHTML = current + letter;
  }
}

function clear_messages(){
  document.getElementById("display").innerHTML="";
  document.getElementById("status").innerHTML="";
}

function check(){
  var input_word = document.getElementById("display").innerHTML
  
  var found = false;
  for(w of words){
    if(w==input_word){
      document.getElementById("status").innerHTML = "You got it!";
      
      var li = document.createElement("li");
      li.append(w);
      document.getElementById("words-list").appendChild(li);
      words.splice( words.indexOf(w),1);

      document.getElementById("missing-words").innerHTML = "Missing words: " + words.length;

      found=true;
      break;
    }
  }

  if(!found){
    document.getElementById("status").innerHTML = "This is not a missing word.";
  }

  setTimeout(() => {
    clear_messages();
  }, 1250);
}

function erase(){
  var current = document.getElementById("display").innerHTML;
  
  if(current.length>=1){
    document.getElementById("display").innerHTML = current.substring(0,current.length-1);
  }else{
    document.getElementById("display").innerHTML = "";
  }
  
}
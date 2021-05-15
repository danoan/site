'use strict';

function _labels_and_messages(){
  let english_language_authors = [
    'Kerouac',
    'Twain',
    'Hemingway',
    'Morrison',
    'Poe',
    'Fitzgerald',
    'Dickens',
    'Woolf',
    'Eliot',
    'Orwell',
    'Tolkien',
    'Huxley',
    'Wilde',
    'Rowling'];

  function random_author_name(){
    let max_index = english_language_authors.length-1;
    let index = Math.trunc( Math.random()*max_index );

    return english_language_authors[index];
  }

  function super_difficult_word_message(){
    return `${random_author_name()}, is that you?`
  }

  return {
    'missing_words_prefix': 'Missing words:',
    'valid_word_message': 'You got it!',
    'word_found_already_message': 'You\'ve found this word already.',
    'word_not_in_dictionary_message': 'This is not a missing word.',
    'word_too_short_message': 'There is no missing word with fewer than 3 letters.',    
    'super_easy_word_message': 'Easy cheese!',
    'easy_word_message': 'Excellent!',
    'average_word_message': 'Brilliant!',
    'quite_difficult_word_message': 'Glorious!',
    'difficult_word_message': 'Magnificent!',
    'super_difficult_word_message': super_difficult_word_message  
  }
}

function _html_objects() {

  const DISPLAY_TEXT_ID = 'display-text';
  const BOTTOM_STATUS_ID = 'bottom-status';
  const WORD_LIST_ID = 'words-list';
  const MISSING_WORDS_ID = 'missing-words';

  let html_obj = {
    display: document.getElementById(DISPLAY_TEXT_ID),
    status: document.getElementById(BOTTOM_STATUS_ID),
    word_list: document.getElementById(WORD_LIST_ID),
    missing_words: document.getElementById(MISSING_WORDS_ID)
  };

  return html_obj;
}

function _cookie_manager(cookie_id,iso_expiration_date) {

  function get(cname) {
    let name = cname + '=';
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  function set(cname, cvalue, iso_date) {
    let d = new Date(iso_date);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + 'domain=.danoan.github.io;path=/;SameSite=None; Secure';
  }

  return {
    get : () => get(cookie_id),
    set : (cvalue) => set(cookie_id,cvalue,iso_expiration_date)
  };
}

function _display_handler() {
  let gui = _html_objects();
  let messages = _labels_and_messages();

  function update_missing_words_count(new_count) {
    gui.missing_words.innerHTML = `${messages.missing_words_prefix} ${new_count}`;
  }

  function clear_messages() {
    gui.display.innerHTML = '';
    gui.status.innerHTML = '';
  }

  function add_found_word(found_word) {
    let li = document.createElement('li');
    li.append(found_word);
    gui.word_list.appendChild(li);
  }

  function valid_word_message(word_difficulty) {
    switch(word_difficulty){
      case 'super-easy':
        gui.status.innerHTML = `${messages.super_easy_word_message}`;
        break;
      case 'easy':
        gui.status.innerHTML = `${messages.easy_word_message}`;
        break;
      case 'average':
        gui.status.innerHTML = `${messages.average_word_message}`;
        break;        
      case 'quite-difficult':
        gui.status.innerHTML = `${messages.quite_difficult_word_message}`;
        break;                
      case 'difficult':
        gui.status.innerHTML = `${messages.difficult_word_message}`;
        break;                        
      case 'super-difficult':
        gui.status.innerHTML = `${messages.super_difficult_word_message()}`;
        break;                                
      default:
        gui.status.innerHTML = `${messages.valid_word_message}`;
    } 
  }

  function word_found_already_message() {
    gui.status.innerHTML = `${messages.word_found_already_message}`;
  }  

  function word_too_short_message() {
    gui.status.innerHTML = `${messages.word_too_short_message}`;
  }

  function word_not_in_dictionary_message() {
    gui.status.innerHTML = `${messages.word_not_in_dictionary_message}`;
  }

  function get_input_word() {
    return gui.display.innerHTML;
  }

  function substitute_a_char(html_object,pos,new_char){
    let current_text = html_object.innerHTML;
    html_object.innerHTML = current_text.substring(0,pos) + new_char;
    html_object.innerHTML += current_text.substring(pos+1);
  }

  function erase_letter() {
    let current = gui.display.innerHTML;

    if (current.length >= 1) {
      gui.display.innerHTML = current.substring(0, current.length - 1);
    } else {
      gui.display.innerHTML = '';
    }
  }

  function erase_letter_hint_mode(hint_context) {
    let char_pos_list = hint_context.input_chars_pos;
    for(let i=char_pos_list.length-1;i>=0;--i){
      let pos = char_pos_list[i];
      if(pos<0){
        substitute_a_char(gui.display,-pos,'_');
        hint_context.input_chars_pos[i] = -pos;
        break;
      }
    }
  }  

  function click_letter(letter) {
    let current = gui.display.innerHTML;

    if (current.length <= 30) {
      gui.display.innerHTML = current + letter;
    }
  }

  function click_letter_hint_mode(letter,hint_context) {       
    let char_pos_list = hint_context.input_chars_pos;
    for(let i=0;i<char_pos_list.length;++i){
      let pos = char_pos_list[i];
      if(pos>=0){
        substitute_a_char(gui.display,pos,letter);
        hint_context.input_chars_pos[i] = -pos;
        break;
      }
    }
  }  

  function hint(active,word){
    let hint_context = {
      active:active,
      input_chars_pos:[]
    };

    gui.display.innerHTML = '';

    for(let i=0;i<word.length;++i){
      if(i%2==0){
        gui.display.innerHTML += word[i];
      }else{
        gui.display.innerHTML += '_';
        hint_context.input_chars_pos.push(i);
      }
    }

    return hint_context;
  }

  return {
    update_missing_words_count,
    clear_messages,
    add_found_word,
    get_input_word,
    erase_letter,
    erase_letter_hint_mode,
    click_letter,
    click_letter_hint_mode,
    hint,
    valid_word_message,
    word_found_already_message,
    word_too_short_message,
    word_not_in_dictionary_message
  };
}

function create_control() {
  let words_found_cookie_id = '2021-06-16T13:36:17.853664_words_found_friday';
  let iso_expiration_date = '2022-06-11T13:36:17.853664';

  let cookie_manager = _cookie_manager(words_found_cookie_id,iso_expiration_date);
  let display_handler = _display_handler();

  let remaining_words = [];
  let words_found = [];
  
  let hint_context = display_handler.hint(false,'');

  let block_decorator = function () {
    let flag_block = false;

    function unblock(){
      flag_block = false;
    }
  
    return function(fn) {
      fn.unblock = unblock;
      return function () {
        if (flag_block) return;
        flag_block = true;
        fn.apply(this, arguments);
      }
    }
  }();  

  function dict_of_repeated_letters(word){
    let dict = {};
    for(let c of word){
      if(c in dict){
        dict[c] += 1;
      }else{
        dict[c] = 0;
      }
    }

    return dict;
  }

  function get_word_difficulty(word){
    let length = word.length;
    let number_repeated_letters=0;
    
    let dict = dict_of_repeated_letters(word); 
    for(let c in dict){
      number_repeated_letters += dict[c];
    } 

    if(length==4 && number_repeated_letters==0){
      return 'super-easy';
    }else if(length==4 && number_repeated_letters>0){
      return 'easy';
    }else if(length==5 && number_repeated_letters==0){
      return 'easy';
    }else if(length==5 && number_repeated_letters==1){
      return 'average';
    }else if(length==6 && number_repeated_letters==0){
      return 'easy';
    }else if(length==6 && number_repeated_letters==1){
      return 'average';
    }else if(length==6 && number_repeated_letters>1){
      return 'quite-difficult';
    }else if(length==7 && number_repeated_letters==0){
      return 'quite-difficult';
    }else if(length==7 && number_repeated_letters==1){
      return 'difficult';
    }else if(length==7 && number_repeated_letters==2){
      return 'difficult';
    }else if(length==7 && number_repeated_letters>2){
      return 'super-difficult';
    }else if(number_repeated_letters>=3){
      return 'super-difficult';
    }else{
      return 'quite-difficult';
    }

  }

  function add_remaining_word(word) {
    remaining_words.push(word);
  }

  function add_found_word(found_word) {
    display_handler.add_found_word(found_word);

    words_found.push(found_word);
    remaining_words.splice(remaining_words.indexOf(found_word), 1);
  }


  function click_letter(...args){
    if(hint_context.active){
      display_handler.click_letter_hint_mode(...args,hint_context);
    }else{
      display_handler.click_letter(...args);
    }
    click_letter.unblock();
  }

  function erase_letter(...args){
    if(hint_context.active){
      display_handler.erase_letter_hint_mode(...args,hint_context);
    }else{
      display_handler.erase_letter(...args);
    }
    
    erase_letter.unblock();
  }

  function hint(){      
    hint_context.active = !hint_context.active;
    if(hint_context.active){
      hint_context = display_handler.hint(true,remaining_words[0]);
    }else{
      display_handler.clear_messages();
    }    
    hint.unblock();
  }  

  function check_word() {
    let input_word = display_handler.get_input_word();

    let found = false;
    for (let word of remaining_words) {
      if (word == input_word) {
        add_found_word(word);
        found = true;
        break;
      }
    }
    
    if (found) {      
      save_found_words_in_cookie();

      display_handler.valid_word_message(get_word_difficulty(input_word));
      display_handler.update_missing_words_count(remaining_words.length);        
      hint_context.active = false;      
    }else if(input_word.length<=3){
      display_handler.word_too_short_message();
    }else if(words_found.find(element => element===input_word)){
      display_handler.word_found_already_message();
    }else{
      display_handler.word_not_in_dictionary_message();
    }

    setTimeout(() => {
      if(hint_context.active){
        hint(); //unset hint_mode
        hint(); //reset hint_mode
      }else{
        display_handler.clear_messages();
      }
      check_word.unblock();
    }, 1250);
  }

  function save_found_words_in_cookie() {
    let words_found_cookie = '';

    words_found.forEach(element => {
      if (element.length > 0) {
        words_found_cookie += element + ',';
      }
    });

    cookie_manager.set(words_found_cookie);
  }

  function load_found_words_from_cookie() {
    let str_words_found = cookie_manager.get();

    let _words_found = str_words_found.split(',');
    _words_found.forEach(element => {
      if (element.length > 0) {
        add_found_word(element);
      }
    });

    display_handler.update_missing_words_count(remaining_words.length);
  }



  return {
    click_letter: block_decorator( click_letter ),
    erase_letter: block_decorator( erase_letter ), 
    check_word: block_decorator( check_word ),
    hint : block_decorator( hint ),
    ephemeral: {
      add_remaining_word,
      load_found_words_from_cookie    
    },
    test_mode: {
      words_found,
      remaining_words
    }
  };

}

let control;
window.onload = function () {   
  let now = new Date();
  let ten_minutes_expire = new Date( now.getTime() + 1000*60*10);

  let cm = _cookie_manager('recently_accessed',ten_minutes_expire);

  if( cm.get() === '' ){    
    cm.set('recently_visited');
    window.location.href="../index.html";
  }

  control = create_control();

  
  control.ephemeral.add_remaining_word('goal');
  
  control.ephemeral.add_remaining_word('total');
  
  control.ephemeral.add_remaining_word('tall');
  
  control.ephemeral.add_remaining_word('legal');
  
  control.ephemeral.add_remaining_word('tell');
  
  control.ephemeral.add_remaining_word('logo');
  
  control.ephemeral.add_remaining_word('call');
  
  control.ephemeral.add_remaining_word('locate');
  
  control.ephemeral.add_remaining_word('elect');
  
  control.ephemeral.add_remaining_word('allocate');
  
  control.ephemeral.add_remaining_word('local');
  
  control.ephemeral.add_remaining_word('gate');
  
  control.ephemeral.add_remaining_word('toll');
  
  control.ephemeral.add_remaining_word('college');
  
  control.ephemeral.add_remaining_word('coat');
  
  control.ephemeral.add_remaining_word('coal');
  
  control.ephemeral.add_remaining_word('tale');
  
  control.ephemeral.add_remaining_word('tool');
  
  control.ephemeral.add_remaining_word('cattle');
  
  control.ephemeral.add_remaining_word('cool');
  
  control.ephemeral.add_remaining_word('cell');
  
  control.ephemeral.add_remaining_word('collect');
  
  control.ephemeral.add_remaining_word('allege');
  
  control.ephemeral.add_remaining_word('late');
  

  control.ephemeral.load_found_words_from_cookie();
  
  delete control.ephemeral;
  if("is_in_test_mode" in this){
    if(!is_in_test_mode) delete control.test_mode; 
  }else{
    delete control.test_mode; 
  }
    
};

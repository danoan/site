'use strict';

function _labels_and_messages() {
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

  function random_author_name() {
    let max_index = english_language_authors.length - 1;
    let index = Math.trunc(Math.random() * max_index);

    return english_language_authors[index];
  }

  function super_difficult_word_message() {
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

function _cookie_manager(cookie_id, iso_expiration_date) {

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
    get: () => get(cookie_id),
    set: (cvalue) => set(cookie_id, cvalue, iso_expiration_date)
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
    switch (word_difficulty) {
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

  function substitute_a_char(html_object, pos, new_char) {
    let current_text = html_object.innerHTML;
    html_object.innerHTML = current_text.substring(0, pos) + new_char;
    html_object.innerHTML += current_text.substring(pos + 1);
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
    for (let i = char_pos_list.length - 1; i >= 0; --i) {
      let pos = char_pos_list[i];
      if (pos < 0) {
        substitute_a_char(gui.display, -pos, '_');
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

  function click_letter_hint_mode(letter, hint_context) {
    let char_pos_list = hint_context.input_chars_pos;
    for (let i = 0; i < char_pos_list.length; ++i) {
      let pos = char_pos_list[i];
      if (pos >= 0) {
        substitute_a_char(gui.display, pos, letter);
        hint_context.input_chars_pos[i] = -pos;
        break;
      }
    }
  }

  function hint(active, word) {
    let hint_context = {
      active: active,
      input_chars_pos: []
    };

    gui.display.innerHTML = '';

    for (let i = 0; i < word.length; ++i) {
      if (i % 2 == 0) {
        gui.display.innerHTML += word[i];
      } else {
        gui.display.innerHTML += '_';
        hint_context.input_chars_pos.push(i);
      }
    }

    return hint_context;
  }

  function show_evidence_list(list_words, select_word_fn) {
    let evidence_list_words = document.getElementById("evidence-list-words");

    for (let word of list_words) {
      let item = document.createElement("li");
      item.onclick = function () { select_word_fn(item); };
      item.innerHTML = word;
      evidence_list_words.append(item);
    }

    document.getElementById("evidence-list").style.display = "block";
    document.getElementById("evidence-list-overlay").style.display = "block";
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
    word_not_in_dictionary_message,
    show_evidence_list
  };
}

function _word_definition() {

  let selected_words = { length: 0 };

  function select_word(li_element) {
    let class_word_selected = 'word-selected';

    if (li_element.classList.contains(class_word_selected)) {
      li_element.classList.remove(class_word_selected);

      delete selected_words[li_element.innerHTML];
      selected_words.length--;
    } else {
      if (selected_words.length < 3) {
        li_element.classList.add(class_word_selected);

        selected_words[li_element.innerHTML] = true;
        selected_words.length++;
      }
    }
  }

  function get_definition_from_collins_html(collins_html) {
    //Removing new line characters
    let res = collins_html.replaceAll(/\n/g, '');

    //Include new line characters after every div element
    res = res.replaceAll(/<\/div>/g, '</div>/\n');

    //Look for the div definition
    let reg = /<div class="def">.*<\/div>/;
    let x = reg.exec(res);

    if (x.length == 0) {
      console.log("Error while processing div definition");
      return '';
    } else {
      //Remove html elements
      let definition = x[0].replaceAll(/<.*?>/g, '');
      return definition;
    }
  }

  function get_word_definition(word) {
    return new Promise(function (resolve, reject) {
      const xhttp = new XMLHttpRequest();

      xhttp.onload = function () {
        let html_response = xhttp.responseText;
        let word_definition = get_definition_from_collins_html(html_response);

        if (word_definition) {
          resolve({
            "word": word,
            "definition": word_definition
          });
        } else {
          reject(new Error("Word not in collins dictionary"));
        }
      };

      xhttp.onerror = function () {
        reject(new Error("Error during http request"));
      };

      xhttp.open("GET", `https://www.collinsdictionary.com/dictionary/english/${word}`);
      xhttp.setRequestHeader("Accept", "text/html");
      xhttp.send();
    });
  }

  function get_words() {
    let list_words = [];
    for (let key in selected_words) {
      if (key !== "length") list_words.push(key);
    }
    return list_words;
  }

  function length() {
    return selected_words.length;
  }


  return {
    select_word,
    get_word_definition,
    get_words,
    length
  };

}

function _slider(slide_deck, callback_setting_slide_left, callback_processing_slide_left) {

  let slide_elements = [];
  let index_show_element = 0;

  for (let element of slide_deck.children) {
    if (element.tagName === 'DIV') {
      slide_elements.push(element);
      element.classList.add('slide');
      element.classList.add('slide-hidden-right');
    }
  }

  toogle_class(slide_elements[0], 'slide-hidden-right', 'slide-show');

  let previous = document.createElement('div');
  previous.classList.add('previous');
  previous.classList.add('hidden');
  previous.onclick = slide_right;
  let span_previous = document.createElement('span');
  span_previous.innerHTML = '<';
  previous.appendChild(span_previous);

  let next = document.createElement('div');
  next.classList.add('next');
  next.classList.add('visible');
  next.onclick = slide_left;
  let span_next = document.createElement('span');
  span_next.innerHTML = '>';
  next.appendChild(span_next);

  slide_deck.appendChild(previous);
  slide_deck.appendChild(next);

  function toogle_class(element, class_remove, class_add) {
    element.classList.remove(class_remove);
    element.classList.add(class_add);
  }

  function update_control_visibility() {
    // if(index_show_element===0){
    //   toogle_class(previous,'visible','hidden');
    // }else{
    //   toogle_class(previous,'hidden','visible');
    // }

    if (index_show_element !== slide_elements.length - 1) {
      toogle_class(next, 'hidden', 'visible');
    } else {
      toogle_class(next, 'visible', 'hidden');
    }
  }

  function slide_left() {
    let next_index;
    if (index_show_element === 0) {
      next_index = callback_setting_slide_left();
    } else {
      next_index = index_show_element + 1;
    }

    if (next_index >= slide_elements.length) return;

    let current_element = slide_elements[index_show_element];
    let next_element = slide_elements[next_index];

    callback_processing_slide_left(next_element, next_index === slide_elements.length - 1);

    toogle_class(current_element, 'slide-show', 'slide-hidden-left');
    toogle_class(next_element, 'slide-hidden-right', 'slide-show');

    index_show_element = next_index;
    update_control_visibility();
  }

  function slide_right() {
    let next_index = index_show_element - 1;
    if (next_index < 0) return;

    let current_element = slide_elements[index_show_element];
    let next_element = slide_elements[next_index];

    toogle_class(current_element, 'slide-show', 'slide-hidden-right');
    toogle_class(next_element, 'slide-hidden-left', 'slide-show');

    index_show_element = next_index;
    update_control_visibility();
  }

  return {
    slide_left,
    slide_right
  };

}

function create_control() {
  let words_found_cookie_id = '2021-06-22T15:21:07.361612_words_found_friday';
  let iso_expiration_date = '2022-06-17T15:21:07.361612';

  let cookie_manager = _cookie_manager(words_found_cookie_id, iso_expiration_date);
  let display_handler = _display_handler();

  let word_definition = _word_definition();
  let slider = _slider(document.getElementsByClassName('slide-deck')[0],
    function () {
      let num_slides = 5;
      console.log(word_definition.length());
      return (num_slides - word_definition.length() - 1);
    },
    function () {
      let word_index = 0;
      return function (html_element, final_slide) {
        if (!final_slide) {
          let list_words = word_definition.get_words();
          let word = list_words[word_index++];

          word_definition.get_word_definition(word).then(
            function (meaning_response) {
              html_element.children[0].innerHTML = meaning_response.word;
              html_element.children[1].innerHTML = meaning_response.definition;
            },
            function (error) { console.log(error); }
          );
        }
      };
    }()
  );

  let remaining_words = [];
  let words_found = [];

  let hint_context = display_handler.hint(false, '');

  let block_decorator = function () {
    let flag_block = false;

    function unblock() {
      flag_block = false;
    }

    return function (fn) {
      fn.unblock = unblock;
      return function () {
        if (flag_block) return;
        flag_block = true;
        fn.apply(this, arguments);
      }
    }
  }();

  function dict_of_repeated_letters(word) {
    let dict = {};
    for (let c of word) {
      if (c in dict) {
        dict[c] += 1;
      } else {
        dict[c] = 0;
      }
    }

    return dict;
  }

  function get_word_difficulty(word) {
    let length = word.length;
    let number_repeated_letters = 0;

    let dict = dict_of_repeated_letters(word);
    for (let c in dict) {
      number_repeated_letters += dict[c];
    }

    if (length == 4 && number_repeated_letters == 0) {
      return 'super-easy';
    } else if (length == 4 && number_repeated_letters > 0) {
      return 'easy';
    } else if (length == 5 && number_repeated_letters == 0) {
      return 'easy';
    } else if (length == 5 && number_repeated_letters == 1) {
      return 'average';
    } else if (length == 6 && number_repeated_letters == 0) {
      return 'easy';
    } else if (length == 6 && number_repeated_letters == 1) {
      return 'average';
    } else if (length == 6 && number_repeated_letters > 1) {
      return 'quite-difficult';
    } else if (length == 7 && number_repeated_letters == 0) {
      return 'quite-difficult';
    } else if (length == 7 && number_repeated_letters == 1) {
      return 'difficult';
    } else if (length == 7 && number_repeated_letters == 2) {
      return 'difficult';
    } else if (length == 7 && number_repeated_letters > 2) {
      return 'super-difficult';
    } else if (number_repeated_letters >= 3) {
      return 'super-difficult';
    } else {
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


  function click_letter(...args) {
    if (hint_context.active) {
      display_handler.click_letter_hint_mode(...args, hint_context);
    } else {
      display_handler.click_letter(...args);
    }
    click_letter.unblock();
  }

  function erase_letter(...args) {
    if (hint_context.active) {
      display_handler.erase_letter_hint_mode(...args, hint_context);
    } else {
      display_handler.erase_letter(...args);
    }

    erase_letter.unblock();
  }

  function hint() {
    hint_context.active = !hint_context.active;
    if (hint_context.active) {
      hint_context = display_handler.hint(true, remaining_words[0]);
    } else {
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

      if (remaining_words.length == 0) {
        display_handler.show_evidence_list(words_found, word_definition.select_word);
      }
    } else if (input_word.length <= 3) {
      display_handler.word_too_short_message();
    } else if (words_found.find(element => element === input_word)) {
      display_handler.word_found_already_message();
    } else {
      display_handler.word_not_in_dictionary_message();
    }

    setTimeout(() => {
      if (hint_context.active) {
        hint(); //unset hint_mode
        hint(); //reset hint_mode
      } else {
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
    click_letter: block_decorator(click_letter),
    erase_letter: block_decorator(erase_letter),
    check_word: block_decorator(check_word),
    hint: block_decorator(hint),
    select_word: word_definition.select_word,
    slide_left: slider.slide_left,
    slide_right: slider.slide_right,
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
  let ten_minutes_expire = new Date(now.getTime() + 1000 * 60 * 10);

  let cm = _cookie_manager('recently_accessed', ten_minutes_expire);

  if (cm.get() === '') {
    cm.set('recently_visited');
    window.location.href = "../index.html";
  }

  control = create_control();

  
  control.ephemeral.add_remaining_word('mark');
  
  control.ephemeral.add_remaining_word('reform');
  
  control.ephemeral.add_remaining_word('offer');
  
  control.ephemeral.add_remaining_word('referee');
  
  control.ephemeral.add_remaining_word('refer');
  
  control.ephemeral.add_remaining_word('form');
  
  control.ephemeral.add_remaining_word('error');
  
  control.ephemeral.add_remaining_word('mere');
  
  control.ephemeral.add_remaining_word('from');
  
  control.ephemeral.add_remaining_word('more');
  
  control.ephemeral.add_remaining_word('fake');
  
  control.ephemeral.add_remaining_word('farm');
  
  control.ephemeral.add_remaining_word('fame');
  
  control.ephemeral.add_remaining_word('free');
  
  control.ephemeral.add_remaining_word('roof');
  
  control.ephemeral.add_remaining_word('make');
  
  control.ephemeral.add_remaining_word('area');
  
  control.ephemeral.add_remaining_word('memo');
  
  control.ephemeral.add_remaining_word('former');
  
  control.ephemeral.add_remaining_word('frame');
  
  control.ephemeral.add_remaining_word('rare');
  
  control.ephemeral.add_remaining_word('fear');
  
  control.ephemeral.add_remaining_word('maker');
  
  control.ephemeral.add_remaining_word('room');
  
  control.ephemeral.add_remaining_word('fare');
  
  control.ephemeral.add_remaining_word('farmer');
  
  control.ephemeral.add_remaining_word('marker');
  
  control.ephemeral.add_remaining_word('rear');
  

  control.ephemeral.load_found_words_from_cookie();

  delete control.ephemeral;
  if ("is_in_test_mode" in this) {
    if (!is_in_test_mode) delete control.test_mode;
  } else {
    delete control.test_mode;
  }

};

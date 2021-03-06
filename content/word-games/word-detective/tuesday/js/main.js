import { cookie_manager } from "./modules/cookie-manager.js"
import { create_word_detective_api } from "./modules/word-detective/word-detective.js";

import { word_definition } from "./modules/word-definition/word-definition.js";
import { slider } from "./modules/slider/slider.js";

function gui_slider() {
  function html_objects() {
    const SLIDER_CONTAINER_ID = 'evidence-list';
    const NEXT_BUTTON_ELEMENT_ID = 'slide-next-button';

    return {
      slider_container: document.getElementById('evidence-list'),
      next_button_element: document.getElementById('slide-next-button')
    };
  }

  let gui = html_objects();

  return {
    "slider_container": gui.slider_container,
    "next_button": gui.next_button_element,
    "previous_button": undefined
  };

}

function gui_word_definition() {

  function html_objects() {
    const WORD_LIST_ID = 'evidence-list-words';
    const WORD_LIST_CONTAINER_ID = 'evidence-list';
    const OVERLAY_ID = 'evidence-list-overlay';

    return {
      word_list: document.getElementById(WORD_LIST_ID),
      word_list_container: document.getElementById(WORD_LIST_CONTAINER_ID),
      overlay: document.getElementById(OVERLAY_ID)
    };
  }

  let gui = html_objects();

  function display_word_list() {
    gui.word_list_container.style.display = "block";
    gui.overlay.style.display = "block";
  }

  function hide_word_list() {
    gui.word_list_container.style.display = "none";
    gui.overlay.style.display = "none";
  }

  function add_to_word_list(word, onclick) {
    let item = document.createElement("li");
    item.onclick = function () { onclick(item); };
    item.innerHTML = word;
    gui.word_list.append(item);
  }

  return {
    display_word_list,
    hide_word_list,
    add_to_word_list
  };
}

function gui_word_detective_api() {

  function html_objects() {

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

  let gui = html_objects();

  function set_display_value(value) {
    gui.display.innerHTML = value;
  }

  function get_display_value() {
    return gui.display.innerHTML;
  }  

  function clear_display_value() {
    gui.display.innerHTML = '';
  }

  function set_status_value(value) {
    gui.status.innerHTML = value;
  }

  function get_status_value(value) {
    return gui.status.innerHTML;
  }  

  function clear_status_value() {
    gui.status.innerHTML = '';
  }  

  function set_missing_words_value(value) {
    gui.missing_words.innerHTML = value;
  }

  function get_missing_words_value(value) {
    return gui.missing_words.innerHTML;
  }

  function clear_missing_words_value() {
    gui.missing_words.innerHTML = '';
  }

  function add_to_word_list(word) {
    let li = document.createElement('li');
    li.append(word);
    gui.word_list.appendChild(li);
  }

  return {
    set_display_value,
    get_display_value,
    clear_display_value,
    set_status_value,
    get_status_value,
    clear_status_value,
    set_missing_words_value,
    get_missing_words_value,
    clear_missing_words_value,
    add_to_word_list
  };
}

function load_assets() {
  const ASSETS_FOLDER = "js/modules/word-detective/assets";
  let messages_json_filepath = `${ASSETS_FOLDER}/english_messages.json`;
  let puzzle_json_filepath = "assets/puzzle.json";

  let assets = {
    "messages": null,
    "puzzle": null
  };

  return fetch(messages_json_filepath)
    .then(response => response.json())
    .then(response_json => {
      assets.messages = response_json;
    })
    .then(() => fetch(puzzle_json_filepath))
    .then(response => response.json())
    .then(response_json => new Promise(function (resolve) {
      assets.puzzle = response_json.puzzle;
      resolve(assets);
    }));
}

function handle_error(error) {
  alert(error);
}

function set_puzzle_cookie() {
  let words_found_cookie_id = '2021-07-15T19:59:38.424071_words_found_tuesday';
  let iso_expiration_date = '2022-07-10T19:59:38.424071';

  return cookie_manager(words_found_cookie_id, iso_expiration_date);
}

function redirect_to_today_puzzle() {
  let now = new Date();
  let ten_minutes_expire = new Date(now.getTime() + 1000 * 60 * 10);

  let cm = cookie_manager('recently_accessed', ten_minutes_expire);

  if (cm.get() === '') {
    cm.set('recently_visited');
    window.location.href = "../index.html";
  }
}

export function main(is_in_test_mode=false) {
  redirect_to_today_puzzle();
  let puzzle_cookie = set_puzzle_cookie();
  let WD = word_definition(gui_word_definition());
  let SD = configure_slider();

  return load_assets()
    .then(assets => new Promise( function(resolve) {
      let config = configure_word_detective(assets);
      control = create_word_detective_api(gui_word_detective_api(), assets.messages, config);

      if (is_in_test_mode) {
        control.ephemeral = {
          gui_slider,
          gui_word_definition,
          gui_word_detective_api
        };
      }

      resolve(control);

    }))
    .catch(error => handle_error(error));

  function configure_slider() {
    let config = { "callbacks": {} };

    config.callbacks.pre_slide_left = function (current_slide_number) {
      if (current_slide_number == 0) {
        let num_slides = 5;
        SD.set_next_slide_number(num_slides - WD.num_selected_words() - 2);
      }
    }
    config.callbacks.slide_left = create_slide_left_callback();

    return slider(gui_slider(), config);
  }

  function create_slide_left_callback() {
    let word_index = 0;
    return function (slide_element, is_final_slide) {
      if (!is_final_slide) {
        let list_words = WD.get_selected_words();
        let word = list_words[word_index++];

        WD.get_word_definition(word).then(
          function (meaning_response) {
            slide_element.children[0].innerHTML = meaning_response.word;
            slide_element.children[1].innerHTML = meaning_response.definition;
          },
          function (error) { handle_error(error); }
        );
      }
    }
  }

  function configure_word_detective(assets) {
    let config = { "callbacks": {} };
    config.callbacks.check_word = save_found_words_in_cookie;
    config.callbacks.init = control_members => init_puzzle(assets.puzzle, control_members);
    config.callbacks.end = display_word_list;

    return config;
  }

  function init_puzzle(puzzle, control_members) {
    for (let word of puzzle.words) {
      control_members.add_missing_word(word);
    }

    load_found_words_from_cookie(control_members)
  }

  function load_found_words_from_cookie(control_members) {
    let str_words_found = puzzle_cookie.get();

    let _words_found = str_words_found.split(',');
    _words_found.forEach(word => {
      if (word.length > 0) {
        control_members.add_found_word(word);
      }
    });
  }

  function save_found_words_in_cookie(control_members) {
    let words_found_cookie = '';

    control_members.get_words_found().forEach(word => {
      if (word.length > 0) {
        words_found_cookie += word + ',';
      }
    });

    puzzle_cookie.set(words_found_cookie);
  }

  function display_word_list(control_members) {
    WD.display_word_list(control_members.get_words_found());
  }
}
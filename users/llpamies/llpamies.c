#include "llpamies.h"

#include "quantum.h"

layer_state_t layer_state_set_user(layer_state_t state) {
  return update_tri_layer_state(state, _SYMBOL, _NAVIGATION, _ADJUST);
}

bool process_record_user(uint16_t keycode, keyrecord_t *record) {
  uint16_t chord;
  switch (keycode) {
    case TMUX:   chord = LCTL(KC_A); break;
    case TMUX_H: chord = LCTL(KC_H); break;
    case TMUX_J: chord = LCTL(KC_J); break;
    case TMUX_K: chord = LCTL(KC_K); break;
    case TMUX_L: chord = LCTL(KC_L); break;
    default: return true;
  }

  // register_code16() reads the mods straight off the keycode, so mod_config()
  // never gets a chance to turn Ctrl into GUI.
  if (record->event.pressed) {
    register_code16(chord);
  } else {
    unregister_code16(chord);
  }
  return false;
}

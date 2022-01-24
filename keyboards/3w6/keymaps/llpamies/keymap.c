#include QMK_KEYBOARD_H

#include "llpamies.h"

#define ADAPTIVE_TERM 1000

// We should swap n <---> h if prior letter is any of: tscpgwx
#define SHOULD_SWAP(code) (code == KC_T || code == KC_S || code == KC_C || code == KC_P || code == KC_G || code == KC_W || code == KC_X)

uint16_t adaptive_keycode = KC_NO;
uint16_t prior_keycode = KC_NO;
uint16_t prior_keydown = 0;

bool process_record_user(uint16_t keycode, keyrecord_t *record) {
  bool return_state = true;

  if (record->event.pressed) {
    switch(keycode) {
      case KC_H:
        if (SHOULD_SWAP(prior_keycode) && (timer_elapsed(prior_keydown) < ADAPTIVE_TERM)) {
          adaptive_keycode = KC_N;
          register_code(adaptive_keycode);
          return_state = false;
        }
        break;
      case KC_N:
        if (SHOULD_SWAP(prior_keycode) && (timer_elapsed(prior_keydown) < ADAPTIVE_TERM)) {
          adaptive_keycode = KC_H;
          register_code(adaptive_keycode);
          return_state = false;
        }
        break;
      }
      prior_keycode = keycode;
      prior_keydown = timer_read(); // (re)start prior timing
  }
  else {
    if (adaptive_keycode != KC_NO) {
      unregister_code(adaptive_keycode);
      adaptive_keycode = KC_NO;
      return_state = false;
    }
  }
  return return_state;
};

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
[_COLEMAK] = LAYOUT(
   ONESHOT, KC_W,    KC_F,       KC_P,      KC_COMMA,  KC_DOT,   KC_L,    KC_U,      KC_Y,   KC_SLASH,
   MY_A,    MY_R,    MY_S,       KC_T,      KC_G,      KC_H,     KC_N,    MY_E,      MY_I,   MY_O,
   MY_Z,    KC_X,    KC_C,       KC_D,      KC_V,      KC_Q,     KC_M,    KC_J,      KC_B,   MY_K,
                     G(KC_LBRC), SYMB_BSPC, KC_DELETE, KC_TAB,   NAV_SPC, G(KC_RBRC)
),
[_SYMBOL] = LAYOUT(
  _______, KC_AT,   KC_HASH, KC_DLR,  KC_PERC, KC_CIRC,  KC_AMPR, KC_ASTR,  _______, _______,
  KC_1,    KC_2,    KC_3,    KC_4,    KC_5,    KC_6,     KC_7,    KC_8,     KC_9,    KC_0,
  KC_GRV,  KC_TILD, KC_EXLM, KC_BSLS, KC_PIPE, KC_SLASH, KC_UNDS, KC_MINUS, KC_PLUS, KC_EQUAL,
                    _______, _______, _______, _______,  _______, _______
),
[_NAVIGATION] = LAYOUT(
  _______, _______, _______, _______, KC_MUTE, LCTL(KC_H), LCTL(KC_J), LCTL(KC_K), LCTL(KC_L), _______,
  _______, _______, _______, KC_MPLY, KC_VOLU, KC_LEFT,    KC_DOWN,    KC_UP,      KC_RIGHT,   _______,
  _______, _______, _______, KC_MNXT, KC_VOLD, KC_HOME,    KC_PGDOWN,  KC_PGUP,    KC_END,     _______,
                    _______, _______, _______, _______,    _______,    _______
  ),
[_ADJUST] = LAYOUT(
  _______, _______, _______, _______, RESET,   RESET,   _______, _______, _______, _______,
  KC_F1,   KC_F2,   KC_F3,   KC_F4,   KC_F5,   KC_F6,   KC_F7,   KC_F8,   KC_F9,   KC_F10,
  KC_F11,  KC_F12,  KC_PSCR, _______, _______, _______, _______, _______, _______, _______,
                    _______, _______, _______, _______, _______, _______
  )
};

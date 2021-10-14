#include QMK_KEYBOARD_H
#include "keymap_spanish.h"

#include "llpamies.h"

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
[_COLEMAK] = LAYOUT(
   ES_GRV,  KC_W,    KC_F,       KC_P,      KC_MPLY,    KC_MUTE, KC_L,    KC_U,       KC_Y,   ES_ACUT,
   MY_A,    MY_R,    MY_S,       KC_T,      KC_MNXT,    KC_VOLU, KC_N,    MY_E,       MY_I,   MY_O,
   MY_Z,    KC_X,    KC_C,       KC_D,      LCTL(KC_A), KC_VOLD, KC_H,    KC_COMMA,   KC_DOT, MY_SLASH,
                     G(KC_LBRC), SYMB_BSPC, KC_DELETE,  KC_TAB,  NAV_SPC, G(KC_RBRC)
),
[_SYMBOL] = LAYOUT(
  _______, KC_AT,   KC_HASH, KC_DLR,  KC_PERC, KC_CIRC, KC_AMPR, KC_ASTR,  KC_LPRN, KC_RPRN,
  KC_1,    KC_2,    KC_3,    KC_4,    KC_5,    KC_6,    KC_7,    KC_8,     KC_9,    KC_0,
  KC_GRV,  KC_TILD, KC_EXLM, KC_BSLS, KC_PIPE, _______, KC_UNDS, KC_MINUS, KC_PLUS, KC_EQUAL,
                    _______, _______, _______, _______, _______, _______
),
[_NAVIGATION] = LAYOUT(
  _______, _______, _______, _______, _______, LCTL(KC_H), LCTL(KC_J), LCTL(KC_K), LCTL(KC_L), _______,
  _______, _______, _______, _______, _______, KC_LEFT,    KC_DOWN,    KC_UP,      KC_RIGHT,   _______,
  _______, _______, ES_CCED, _______, _______, KC_HOME,    KC_PGDOWN,  KC_PGUP,    KC_END,     _______,
                    _______, _______, _______, _______,    _______,    _______
  ),
[_ADJUST] = LAYOUT(
  _______, _______, _______, _______, RESET,   RESET,   _______, _______, _______, _______,
  KC_F1,   KC_F2,   KC_F3,   KC_F4,   KC_F5,   KC_F6,   KC_F7,   KC_F8,   KC_F9,   KC_F10,
  KC_F11,  KC_F12,  KC_PSCR, _______, _______, _______, _______, _______, _______, _______,
                    _______, _______, _______, _______, _______, _______
  )
};

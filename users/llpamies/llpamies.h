#pragma once

#include "quantum.h"

#define SYMB_E LT(_SYMBOL, KC_E)
#define NAV_SPC LT(_NAVIGATION, KC_SPACE)
#define UNIQ(X) RALT(RCTL(RGUI(RSFT(X))))
#define MY_A CTL_T(KC_A)
#define MY_R SFT_T(KC_R)
#define MY_S ALT_T(KC_S)
#define MY_Z GUI_T(KC_Z)
#define MY_K GUI_T(KC_K)
#define MY_M ALT_T(KC_M)
#define MY_I SFT_T(KC_I)
#define MY_O CTL_T(KC_O)
#define ONESHOT OSM(MOD_MEH)

enum layers {
  _COLEMAK = 0,
  _SYMBOL,
  _NAVIGATION,
  _ADJUST
};

layer_state_t layer_state_set_user(layer_state_t state);

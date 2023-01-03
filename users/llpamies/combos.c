#include "llpamies.h"

// Open-close symbols.
const uint16_t PROGMEM combo_paren_open[] = {KC_T, MY_R, COMBO_END};
const uint16_t PROGMEM combo_paren_close[] = {KC_N, MY_I, COMBO_END};
const uint16_t PROGMEM combo_brack_open[] = {KC_P, KC_F, COMBO_END};
const uint16_t PROGMEM combo_brack_close[] = {KC_U, KC_L, COMBO_END};
const uint16_t PROGMEM combo_brace_open[] = {KC_T, MY_A, COMBO_END};
const uint16_t PROGMEM combo_brace_close[] = {KC_N, MY_O, COMBO_END};
const uint16_t PROGMEM combo_triang_open[] = {KC_C, KC_D, COMBO_END};
const uint16_t PROGMEM combo_triang_close[] = {KC_H, KC_J, COMBO_END};

// Punctuation symbols.
const uint16_t PROGMEM combo_colon[] = {KC_J, KC_B, COMBO_END};
const uint16_t PROGMEM combo_semicolon[] = {KC_U, KC_Y, COMBO_END};
const uint16_t PROGMEM combo_single_quote[] = {KC_X, KC_C, COMBO_END};
const uint16_t PROGMEM combo_double_quote[] = {KC_W, KC_F, COMBO_END};

// Spacing.
const uint16_t PROGMEM combo_enter[] = {MY_M, MY_I, COMBO_END};
const uint16_t PROGMEM combo_escape[] = {MY_R, MY_S, COMBO_END};
const uint16_t PROGMEM combo_lock[] = {MY_R, MY_I, COMBO_END};

// Middle column keycodes (hard to reach letters).
const uint16_t PROGMEM combo_letter_g[] = {MY_S, KC_T, COMBO_END};
const uint16_t PROGMEM combo_letter_q[] = {KC_H, MY_M, COMBO_END};
const uint16_t PROGMEM combo_letter_v[] = {MY_S, KC_D, COMBO_END};
const uint16_t PROGMEM combo_letter_dot[] = {KC_N, KC_U, COMBO_END};
const uint16_t PROGMEM combo_letter_comma[] = {KC_T, KC_F, COMBO_END};

combo_t key_combos[] = {
  // Programming symbols.
  COMBO(combo_paren_open, KC_LPRN),
  COMBO(combo_paren_close, KC_RPRN),
  COMBO(combo_brack_open, KC_LBRACKET),
  COMBO(combo_brack_close, KC_RBRACKET),
  COMBO(combo_brace_open, KC_LCBR),
  COMBO(combo_brace_close, KC_RCBR),
  COMBO(combo_triang_open, KC_LT),
  COMBO(combo_triang_close, KC_GT),

  // Hard to reach letters.
  COMBO(combo_letter_g, KC_G),
  COMBO(combo_letter_q, KC_Q),
  COMBO(combo_letter_v, KC_V),
  COMBO(combo_letter_dot, KC_DOT),
  COMBO(combo_letter_comma, KC_COMMA),

  // Spacing.
  COMBO(combo_enter, KC_ENTER),
  COMBO(combo_escape, KC_ESC),
  COMBO(combo_lock, KC_CAPS),

  // Punctuation symbols.
  COMBO(combo_colon, KC_COLON),
  COMBO(combo_semicolon, KC_SCOLON),
  COMBO(combo_single_quote, KC_QUOTE),
  COMBO(combo_double_quote, KC_DQUO),
};

uint16_t COMBO_LEN = sizeof(key_combos) / sizeof(key_combos[0]);

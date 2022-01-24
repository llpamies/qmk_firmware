#include "llpamies.h"

// Open-close symbols.
const uint16_t PROGMEM combo_paren_open[] = {KC_T, MY_R, COMBO_END};
const uint16_t PROGMEM combo_paren_close_h[] = {KC_H, MY_I, COMBO_END};
const uint16_t PROGMEM combo_paren_close_n[] = {KC_N, MY_I, COMBO_END};
const uint16_t PROGMEM combo_brack_open[] = {MY_A, MY_R, COMBO_END};
const uint16_t PROGMEM combo_brack_close[] = {MY_O, MY_I, COMBO_END};
const uint16_t PROGMEM combo_brace_open[] = {KC_T, MY_A, COMBO_END};
const uint16_t PROGMEM combo_brace_close_h[] = {KC_H, MY_O, COMBO_END};
const uint16_t PROGMEM combo_brace_close_n[] = {KC_N, MY_O, COMBO_END};

// Punctuation symbols.
const uint16_t PROGMEM combo_colon[] = {KC_K, KC_B, COMBO_END};
const uint16_t PROGMEM combo_semicolon[] = {KC_U, KC_Y, COMBO_END};
const uint16_t PROGMEM combo_single_quote[] = {KC_X, KC_C, COMBO_END};
const uint16_t PROGMEM combo_double_quote[] = {KC_W, KC_F, COMBO_END};

// Spacing.
const uint16_t PROGMEM combo_enter[] = {MY_E, MY_I, COMBO_END};
const uint16_t PROGMEM combo_escape[] = {MY_R, MY_S, COMBO_END};
const uint16_t PROGMEM combo_lock[] = {MY_R, MY_I, COMBO_END};

// Middle column keycodes (hard to reach letters).
const uint16_t PROGMEM combo_letter_g[] = {MY_S, KC_T, COMBO_END};
const uint16_t PROGMEM combo_letter_n[] = {KC_H, MY_E, COMBO_END};
const uint16_t PROGMEM combo_letter_h[] = {KC_N, MY_E, COMBO_END};
const uint16_t PROGMEM combo_letter_q[] = {KC_M, MY_E, COMBO_END};
const uint16_t PROGMEM combo_letter_v[] = {MY_S, KC_D, COMBO_END};
const uint16_t PROGMEM combo_letter_dot_h[] = {KC_H, KC_U, COMBO_END};
const uint16_t PROGMEM combo_letter_dot_n[] = {KC_N, KC_U, COMBO_END};
const uint16_t PROGMEM combo_letter_comma[] = {KC_T, KC_F, COMBO_END};

combo_t key_combos[] = {
  // Programming symbols.
  COMBO(combo_paren_open, KC_LPRN),
  COMBO(combo_paren_close_h, KC_RPRN),
  COMBO(combo_paren_close_n, KC_RPRN),
  COMBO(combo_brack_open, KC_LBRACKET),
  COMBO(combo_brack_close, KC_RBRACKET),
  COMBO(combo_brace_open, KC_LCBR),
  COMBO(combo_brace_close_h, KC_RCBR),
  COMBO(combo_brace_close_n, KC_RCBR),

  // Hard to reach letters.
  COMBO(combo_letter_g, KC_G),
  COMBO(combo_letter_n, KC_N),
  COMBO(combo_letter_h, KC_H),
  COMBO(combo_letter_q, KC_Q),
  COMBO(combo_letter_v, KC_V),
  COMBO(combo_letter_dot_h, KC_DOT),
  COMBO(combo_letter_dot_n, KC_DOT),
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

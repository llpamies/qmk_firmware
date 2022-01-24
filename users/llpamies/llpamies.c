#include "llpamies.h"

#include "quantum.h"

layer_state_t layer_state_set_user(layer_state_t state) {
  return update_tri_layer_state(state, _SYMBOL, _NAVIGATION, _ADJUST);
}

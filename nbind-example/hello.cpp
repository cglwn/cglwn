#include <iostream>
#include <string>

#include "nbind/nbind.h"

struct CallbackCaller {
  CallbackCaller() = default;

  void addCallback(nbind::cbFunction& cb) { callback = cb; }

  void callCallback() { callback(++i); }

  nbind::cbFunction callback;
  int i = 0;
};

NBIND_CLASS(CallbackCaller) {
  construct<>();
  method(addCallback);
  method(callCallback);
}

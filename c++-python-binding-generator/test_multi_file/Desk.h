#pragma once

#include "Color.h"

class Desk {
public:
 Desk(Color color) : color(color) {}

  Color getColor();

 private:
  Color color;
};

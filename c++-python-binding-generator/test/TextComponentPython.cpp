#include "TextComponent.h"

#include <boost/python.hpp>

using namespace boost::python;

BOOST_PYTHON_MODULE(CodegenExample) {
  class_<TextComponent>("TextComponent")
    .def("text", &TextComponent::text)
    .def("setText", &TextComponent::setText)
}

void init_bindings() {
  Py_Initialize();
  initCodegenExample();
}

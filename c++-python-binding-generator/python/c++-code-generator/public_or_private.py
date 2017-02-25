"""Determine whether a symbol is public or private in a C++ header.
"""
import asciitree
import clang.cindex
from IPython import embed

import argparse
import sys

if len(sys.argv) != 3:
    print("Usage: dump_ast [header file name]")
    sys.exit(1)

clang.cindex.Config.set_library_file(
    "/code/build/external/llvm/lib/libclang.so")
index = clang.cindex.Index.create()
translation_unit = index.parse(
    sys.argv[1], ['-x', 'c++', '-std=c++11', '-D__CODE_GENERATOR__'])

filename = sys.argv[1]
symbol = sys.argv[2]

cursors = []


def node_children(node):
    for c in node.get_children():
        if c.spelling == symbol or c.spelling == symbol:
            print("Symbol {} is {}.".format(symbol, c.access_specifier))

    return (c for c in node.get_children()
            if c.location.file.name == sys.argv[1])


def print_node(node):
    text = node.spelling or node.displayname
    kind = str(node.kind)[str(node.kind).index('.') + 1:]
    return '{} {}'.format(kind, text)


print(asciitree.draw_tree(translation_unit.cursor, node_children, print_node))

embed()

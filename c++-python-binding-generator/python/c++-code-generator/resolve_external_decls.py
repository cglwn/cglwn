"""
This is an attempt to resolve a bug where clang gives types a name of int.
"""
import clang.cindex

import argparse
import sys

cursors = []
def node_children(node):
    for c in node.get_children():
        cursors.append(c)

    return (c for c in node.get_children() if c.location.file.name == sys.argv[1])

def print_node(node):
    text = node.spelling or node.displayname
    kind = str(node.kind)[str(node.kind).index('.') + 1:]
    return '{} {}'.format(kind, text)

if len(sys.argv) != 3:
    print("Usage: dump_ast [header file name] [compdb]")
    sys.exit(1)

clang.cindex.Config.set_library_file("/code/build/external/llvm/lib/libclang.so")
index = clang.cindex.Index.create()
translation_unit = index.parse(sys.argv[1], ['-x', 'c++', '-std=c++11', '-D__CODE_GENERATOR__'])

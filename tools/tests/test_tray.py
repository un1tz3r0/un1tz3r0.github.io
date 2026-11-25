import pytest

gi = pytest.importorskip('gi')

from sitekit.tray import SEPARATOR, Indicator, item  # noqa: E402


def layout(entries, parent=0, depth=-1):
    ind = Indicator.__new__(Indicator)  # skip D-Bus registration
    ind.items, ind.layout = {}, entries
    return ind.find(parent, depth)


def test_layout_children_are_boxed_once():
    """Each child in the av must unpack straight to (id, props, children): a doubly wrapped child makes the GNOME
    AppIndicator extension throw on every layout fetch and rebuild the menu in a loop."""
    root = layout([item('a'), SEPARATOR, item('Sub', children=[item('x'), item('y')])])
    assert root.get_type_string() == '(ia{sv}av)'

    def walk(node):
        ident, props, children = node.unpack()
        for i in range(node.get_child_value(2).n_children()):
            child = node.get_child_value(2).get_child_value(i).get_variant()
            assert child.get_type_string() == '(ia{sv}av)'
            walk(child)

    walk(root)
    assert '<<' not in root.print_(True)


def test_layout_ids_are_positional():
    root = layout([item('a'), item('Sub', children=[item('x'), item('y')])])
    ident, _, children = root.unpack()
    assert ident == 0
    assert [c[0] for c in children] == [1, 2]
    assert [c[0] for c in children[1][2]] == [201, 202]


def test_partial_layout_starts_at_parent():
    ident, props, children = layout([item('a'), item('Sub', children=[item('x')])], parent=2).unpack()
    assert ident == 2 and props['label'] == 'Sub' and [c[0] for c in children] == [201]

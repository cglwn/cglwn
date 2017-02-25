#include <thread>
#include <vector>
#include <algorithm>
#include <iostream>
// Running this shows a race condition that can occur. In the prepend if we set the head in one thread while another
// thread just set its next pointer, then we can get a dangling node.
//
// The manifestation of this data race can be seen in the final length of the list after all the threads have joined:
// 1000
// 1000
// 993
// 997
// 1000
// 997
// 958
// 997
// 998
// 1000
// 999
// 965

class List {
public:
    class Node {
    public:
        Node* next = nullptr;
        int value;

        Node(int value) : value(value){}
    };

    Node* head = nullptr;

    int count() const {
        int n = 0;
        Node * cur = head;
        while (cur != nullptr) {
            ++n;
            cur = cur->next;
        }
        return n;
    }

    void prepend(int x) {
        auto node = new Node(x);
        node->next = head;
        head = node;
    }
};

void threadFunction(List& list) {
    for (int i = 0; i < 100; ++i)
        list.prepend(i);
}

int main(int argc, char** argv) {
    List list;
    std::vector<std::thread> workers;

    for (int i = 0; i < 10; ++i) {
        workers.emplace_back(std::thread(&threadFunction, std::ref(list)));
    }

    std::for_each(std::begin(workers), std::end(workers), [](std::thread& th) {
        th.join();
    });

    int total = list.count();
    std::cout << total << "\n";
}
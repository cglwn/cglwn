// This shows how you can pass an argument to a thread function by using arguments to the thread constructor.
#include <algorithm>
#include <cassert>
#include <iostream>
#include <thread>

void threadFunction(int i) {
    std::cout << "Hi from worker" << i << "!\n";
}

int main() {
    std::vector<std::thread> workers;
    for (int i = 0; i < 8; ++i) {
        auto th = std::thread(threadFunction, i);// <--- We now pass i in as an argument to the thread constructor.
        workers.push_back(std::move(th));
        assert(!th.joinable());
    }
    std::cout << "Hi from main!\n";
    std::for_each(workers.begin(), workers.end(), [](std::thread& th) {
        assert(th.joinable());
        th.join();
    });

    return 0;
}

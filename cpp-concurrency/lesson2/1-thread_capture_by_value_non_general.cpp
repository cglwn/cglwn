// This shows how you can pass an argument to a thread function by using lambda capture.
#include <algorithm>
#include <cassert>
#include <iostream>
#include <thread>

int main() {
    std::vector<std::thread> workers;
    for (int i = 0; i < 8; ++i) {
        auto th = std::thread([i]() { // <----- The i is captured by value. This is not very general.
            std::cout << "Hi from worker " << i << "!\n";
        });
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

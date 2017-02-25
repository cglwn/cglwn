// This shows how you can pass an argument to a thread function by reference.
// NOTE: This shows a lot of dangerous stuff when dealing with threads.

// Error if you just change signature of void threadFunction(int i) to void threadFunction(int& i)
// In file included from /usr/include/c++/5/thread:39:0,
// from /home/cglwn/Code/threading/lesson2/3-thread_capture_by_reference.cpp:5:
// /usr/include/c++/5/functional: In instantiation of ‘struct std::_Bind_simple<void (*(int))(int&)>’:
// /usr/include/c++/5/thread:137:59:   required from ‘std::thread::thread(_Callable&&, _Args&& ...) [with _Callable = void (&)(int&); _Args = {int&}]’
// /home/cglwn/Code/threading/lesson2/3-thread_capture_by_reference.cpp:14:48:   required from here
// /usr/include/c++/5/functional:1505:61: error: no type named ‘type’ in ‘class std::result_of<void (*(int))(int&)>’
// typedef typename result_of<_Callable(_Args...)>::type result_type;
//                                                       ^
// /usr/include/c++/5/functional:1526:9: error: no type named ‘type’ in ‘class std::result_of<void (*(int))(int&)>’
// _M_invoke(_Index_tuple<_Indices...>)
// ^

// By calling the thread constructor with std::ref(i) for the int& argument, it compiles.
// http://en.cppreference.com/w/cpp/utility/functional/ref
// However the output now looks like:
// Hi from main!
// Hi from worker1!
// Hi from worker8!
// Hi from worker8!
// Hi from worker8!
// Hi from worker8!
// Hi from worker8!
// Hi from worker8!
// Hi from worker8!

// By moving the thread construction into a separate function thus ensuring the passed int argument no longer exists it
// now outputs:
// Hi from workerHi from workerHi from worker3!
// 2!
// Hi from worker6!
// Hi from worker7!
// Hi from worker7!
// Hi from main!
// 1!
// Hi from worker0!
// Hi from worker0!
//
// Note 1: The passed int no longer exists so the `i` argument that threadFunction sees is no longer valid thus printing
// 0. In the tutorial it printed something like 1029394 indicating it was reading the same memory address which has
// since been overwritten.
//
// Note 2: It printed 7 twice because two threads had the same `i` reference and they both happened to be the same when
// they were printing out.
//
// Key takeaway: Threads can be dangerous especially when dealing with lifetimes of objects. This is why move semantics
// can be important.
#include <algorithm>
#include <cassert>
#include <iostream>
#include <thread>

void threadFunction(int& i) {
    std::cout << "Hi from worker" << i << "!\n";
}

void test(std::vector<std::thread>& workers) {
    for (int i = 0; i < 8; ++i) {
        auto th = std::thread(&threadFunction, std::ref(i));
        workers.push_back(std::move(th));
        assert(!th.joinable());
    }
}

int main() {
    std::vector<std::thread> workers;
    test(workers);
    std::cout << "Hi from main!\n";
    std::for_each(workers.begin(), workers.end(), [](std::thread& th) {
        assert(th.joinable());
        th.join();
    });

    return 0;
}


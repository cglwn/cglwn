// This shows that when only one thread is accessing a region of memory at a time instance then we don't run into races.
// The access by the thread calling `toSin` happens *after* filling the values vector, and *before* printing out the
// plot.
//**********
//*************
//****************
//******************
//********************
//********************
//********************
//******************
//****************
//*************
//**********
//*******
//****
//**
//
//
//
//**
//****
//*******
//**********

// By moving the `thread::join` call to after the printing, we get the two threads accessing the memory at the same time
// getting plots which do not match the sine wave.
//**********
//*************
//****************
//*******************
//***********************
//**************************
//*****************************
//********************************
//***********************************
//**************************************
//*****************************************
//*********************************************
//************************************************
//***************************************************
//******************************************************
//*********************************************************
//************************************************************
//***************************************************************
//*******************************************************************
//**********************************************************************
//*************************************************************************


#include <cmath>
#include <iostream>
#include <thread>
#include <vector>

auto toSin(std::vector<double>& values) -> void {
    for (auto& value : values) {
        value = std::sin(value);
    }
}

auto main(int argc, char** argv) -> int {
    auto values = std::vector<double>();
    auto epsilon = static_cast<double>(1e-5);
    auto slightlyLargerThanTwoPi = static_cast<double>(M_PI * 2) + epsilon;
    for (double d = 0.0; d < slightlyLargerThanTwoPi; d += M_PI / 10.0) {
        values.emplace_back(d);
    }
    auto thread = std::thread(toSin, std::ref(values));

    // Joining the thread here results in the sine wave **always** being printed since only one thread has access to the
    // vector at a time.
    thread.join();
    for(const auto& value : values) {
        auto count = static_cast<int>(10 * value + 10.5);
        for (int i = 0; i < count; ++i) {
            std::cout << "*";
        }
        std::cout << "\n";
    }
    // Joining the thread here can result in the sine function not being calculated for all values.
    //thread.join();

}
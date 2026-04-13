"use client"; // Required for interactivity in Next.js App Router

import React, { useState } from "react";
import { useEffect } from "react";
import {
  format,
  addDays,
  eachDayOfInterval,
  startOfToday,
  isSameDay,
  addMinutes,
  startOfHour,
  addHours,
} from "date-fns";

const STYLISTS = [
  { id: "1", name: "Marco (Master Barber)", image: "✂️" },
  { id: "2", name: "Elena (Stylist)", image: "🎨" },
  { id: "3", name: "Victor (Stylist Junior)", image: "💈" },
  { id: "4", name: "Daniel (Stylist Junior)", image: "💈" },
  { id: "5", name: "Erika (Barber)", image: "💈" },
];

const SERVICES = [
  { id: "1", name: "Just Cut", duration: 20, price: "$25" },
  { id: "2", name: "Cut & Style", duration: 30, price: "$35" },
  { id: "3", name: "Cut & Beard", duration: 45, price: "$50" },
  { id: "4", name: "All Inclusive", duration: 60, price: "$75" },
];

export default function Calendar() {
  const today = startOfToday();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const isEmailValid = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  // Mock data: Times that are already taken

  const [bookedSlots, setBookedSlots] = useState([]);

  const fetchBookings = async (date) => {
    const dateString = format(date, "yyyy-MM-dd");

    try {
      // We ask Stein to find rows where the 'date' matches our selected day
      const response = await fetch(
        `https://api.steinhq.com/v1/storages/69dc2f35bb16885eb7bda872/Bookings?search={"date":"${dateString}"}`,
      );
      const data = await response.json();

      // We convert the 'time' strings from the sheet back into timestamps the calendar understands
      const busyTimes = data.map((booking) => {
        // Logic to combine the selected date + the time string from the sheet
        return new Date(`${booking.date} ${booking.time}`).getTime();
      });

      setBookedSlots(busyTimes);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  useEffect(() => {
    fetchBookings(selectedDate);
  }, [selectedDate]);

  // 1. Generate the next 7 days for the user to pick from
  const days = eachDayOfInterval({
    start: today,
    end: addDays(today, 30),
  });

  // 2. Generate time slots (e.g., 9:00 AM to 5:00 PM)
  const getTimeSlots = (date, duration = 20) => {
    const slots = [];
    let currentSlot = addHours(startOfHour(date), 9); // Start 9 AM
    const endTime = addHours(startOfHour(date), 17); // End 5 PM

    while (currentSlot <= endTime) {
      slots.push(new Date(currentSlot));
      // DYNAMIC DURATION: Use the service duration instead of a hard-coded 30
      currentSlot = addMinutes(currentSlot, duration);
    }
    return slots;
  };

  // Call it like this:
  const timeSlots = getTimeSlots(selectedDate, selectedService?.duration || 20);

  const handleBooking = async () => {
    // 1. Prepare the data to match your Google Sheet headers
    const bookingData = [
      {
        date: format(selectedDate, "yyyy-MM-dd"),
        time: format(selectedTime, "h:mm a"),
        customerName: customerName,
        email: email,
        stylist: selectedStylist.name, // NEW
        service: selectedService.name, // NEW
        price: selectedService.price, // NEW
      },
    ];

    try {
      // 2. Send the data to your Stein API
      const response = await fetch(
        "https://api.steinhq.com/v1/storages/69dc2f35bb16885eb7bda872/Bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingData),
        },
      );

      if (response.ok) {
        // 3. Only show success screen if the data was actually saved
        setIsConfirmed(true);
      } else {
        alert("The shop is currently busy. Please try again.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Check your internet connection and try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl font-sans text-zinc-100">
      {!isConfirmed ? (
        <>
          <header className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-amber-500 uppercase italic">
              Samans Barbershop
            </h2>
            <p className="text-zinc-400 text-sm">Select your session</p>
          </header>

          {/* Stylist Selection */}
          <div className="mb-6">
            <label className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 block">
              Choose Stylist
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STYLISTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStylist(s)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedStylist?.id === s.id
                      ? "bg-amber-600 border-amber-600"
                      : "bg-zinc-800 border-zinc-700 text-zinc-400"
                  }`}>
                  <div className="text-xl mb-1">{s.image}</div>
                  <div className="text-[10px] font-bold uppercase">
                    {s.name.split(" ")[0]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Service Selection */}
          <div className="mb-8">
            <label className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3 block">
              Select Service
            </label>
            <div className="space-y-2">
              {SERVICES.map((service) => (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${
                    selectedService?.id === service.id
                      ? "bg-zinc-100 text-zinc-900 border-white"
                      : "bg-zinc-800 border-zinc-700 text-zinc-300"
                  }`}>
                  <div className="text-left">
                    <div className="font-bold text-sm">{service.name}</div>
                    <div className="text-[10px] opacity-60 uppercase">
                      {service.duration} mins
                    </div>
                  </div>
                  <div className="font-black text-amber-500">
                    {service.price}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Day Picker */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {days.map((day) => (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`flex-shrink-0 w-16 py-3 rounded-xl border transition-all duration-200 ${
                  isSameDay(day, selectedDate)
                    ? "bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/20"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
                }`}>
                <div className="text-[10px] uppercase font-bold tracking-widest">
                  {format(day, "EEE")}
                </div>
                <div className="text-lg font-black">{format(day, "d")}</div>
              </button>
            ))}
          </div>

          <div className="h-px bg-zinc-800 my-6" />

          {/* Time Slot Picker */}
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">
            Available for {format(selectedDate, "MMMM do")}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => {
              const isBooked = bookedSlots.some(
                (bookedTime) =>
                  isSameDay(slot, new Date(bookedTime)) &&
                  slot.getTime() === bookedTime,
              );
              const isSelected = selectedTime?.getTime() === slot.getTime();

              return (
                <button
                  key={slot.toString()}
                  disabled={isBooked}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-3 rounded-lg text-sm font-medium transition-all ${
                    isBooked
                      ? "bg-zinc-800/50 text-zinc-600 line-through cursor-not-allowed"
                      : isSelected
                        ? "bg-amber-600 text-white ring-2 ring-amber-500 ring-offset-2 ring-offset-zinc-900"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700"
                  }`}>
                  {format(slot, "h:mm a")}
                </button>
              );
            })}
          </div>

          {/* The Form */}
          {selectedTime && (
            <div className="mt-8 p-5 bg-zinc-800/50 rounded-xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold text-amber-500 mb-1">
                Confirm Details
              </h3>
              <p className="text-zinc-400 text-xs mb-4">
                You've picked{" "}
                <span className="text-zinc-100 font-bold">
                  {format(selectedTime, "h:mm a")}
                </span>
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-zinc-900 border rounded-lg p-3 text-sm focus:outline-none transition-all ${
                    email && !isEmailValid(email)
                      ? "border-red-500"
                      : "border-zinc-700 focus:ring-amber-500"
                  }`}
                />
                <button
                  onClick={handleBooking}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg shadow-lg active:scale-95 transition-all mt-2 uppercase tracking-tighter">
                  Book Appointment
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Success Screen */
        <div className="py-12 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-amber-600/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-zinc-100 mb-2 uppercase italic">
            Sharp & Ready!
          </h2>
          <p className="text-zinc-400 mb-8">
            See you soon,{" "}
            <span className="text-amber-500 font-bold">{customerName}</span>.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-amber-500 text-sm font-bold uppercase tracking-widest hover:text-amber-400 underline underline-offset-8">
            Book Another
          </button>
        </div>
      )}
    </div>
  );
}

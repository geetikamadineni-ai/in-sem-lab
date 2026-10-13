
const prices = {
    Agra: 5000,
    Manali: 8000,
    Goa: 6000
};

const form = document.getElementById("bookingForm");
const destination = document.getElementById("destination");
const travelers = document.getElementById("travelers");
const travelDate = document.getElementById("travelDate");
const totalPrice = document.getElementById("totalPrice");
const message = document.getElementById("message");
const bookingList = document.getElementById("bookingList");

// Get today's date in local time
function getToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Prevent selecting a past travel date
travelDate.min = getToday();

// Read saved bookings
function getBookings() {
    try {
        return JSON.parse(
            localStorage.getItem("travelBookings") || "[]"
        );
    } catch {
        return [];
    }
}

// Calculate total price
function calculatePrice() {
    const place = destination.value;
    const count = Number(travelers.value);
    const total = prices[place] * count || 0;

    totalPrice.textContent =
        "₹" + total.toLocaleString("en-IN");
}

// Update price when destination or travelers change
destination.addEventListener("change", calculatePrice);
travelers.addEventListener("input", calculatePrice);

// Select destination from a destination card
function selectDestination(place) {
    destination.value = place;
    calculatePrice();

    document.getElementById("booking").scrollIntoView({
        behavior: "smooth"
    });
}

// Display all bookings
function displayBookings() {
    const bookings = getBookings();
    bookingList.replaceChildren();

    if (bookings.length === 0) {
        const empty = document.createElement("p");
        empty.className = "empty-message";
        empty.textContent =
            "No bookings yet. Book your first trip!";
        bookingList.appendChild(empty);
        return;
    }

    bookings.forEach(function (booking) {
        const card = document.createElement("div");
        card.className = "booking-item";

        const title = document.createElement("h3");
        title.textContent = booking.destination + " Trip";

        const details = [
            "Booking ID: " + booking.id,
            "Name: " + booking.name,
            "Email: " + booking.email,
            "Travel Date: " + booking.date,
            "Travelers: " + booking.travelers,
            "Total Price: ₹" +
                booking.total.toLocaleString("en-IN")
        ];

        card.appendChild(title);

        details.forEach(function (detail) {
            const paragraph = document.createElement("p");
            paragraph.textContent = detail;
            card.appendChild(paragraph);
        });

        const cancelButton = document.createElement("button");
        cancelButton.className = "cancel-btn";
        cancelButton.textContent = "Cancel Booking";

        cancelButton.addEventListener("click", function () {
            cancelBooking(booking.id);
        });

        card.appendChild(cancelButton);
        bookingList.appendChild(card);
    });
}

// Handle booking form submission
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const place = destination.value;
    const date = travelDate.value;
    const count = Number(travelers.value);

    if (!name || !email || !prices[place]) {
        message.textContent = "Please fill in all required fields.";
        message.style.color = "red";
        return;
    }

    if (!date || date < getToday()) {
        message.textContent =
            "Please select today or a future travel date.";
        message.style.color = "red";
        return;
    }

    if (!Number.isInteger(count) || count < 1 || count > 20) {
        message.textContent =
            "Travelers must be between 1 and 20.";
        message.style.color = "red";
        return;
    }

    const booking = {
        id: Date.now(),
        name: name,
        email: email,
        destination: place,
        date: date,
        travelers: count,
        total: prices[place] * count
    };

    try {
        const bookings = getBookings();
        bookings.push(booking);

        localStorage.setItem(
            "travelBookings",
            JSON.stringify(bookings)
        );

        message.textContent =
            "Booking confirmed successfully!";
        message.style.color = "green";

        form.reset();
        travelers.value = "1";
        calculatePrice();
        displayBookings();

        document.getElementById("history").scrollIntoView({
            behavior: "smooth"
        });
    } catch (error) {
        message.textContent =
            "Unable to save booking. Check browser storage.";
        message.style.color = "red";
    }
});

// Cancel a booking
function cancelBooking(id) {
    const bookings = getBookings().filter(function (booking) {
        return booking.id !== id;
    });

    try {
        localStorage.setItem(
            "travelBookings",
            JSON.stringify(bookings)
        );

        message.textContent = "Booking cancelled successfully!";
        message.style.color = "green";
        displayBookings();
    } catch (error) {
        message.textContent = "Unable to cancel booking.";
        message.style.color = "red";
    }
}

// Load existing bookings when the page opens
calculatePrice();
displayBookings();

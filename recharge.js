const storage = "savedRechargePins";

function buildRefCode(network, generatedPin) {
    const refCodeMap = {
        airtel: `*126*${generatedPin}#`,
        mtn: `*555*${generatedPin}#`,
        glo: `*126*${generatedPin}#`
    };

    return refCodeMap[network] || generatedPin;
}

function clearInput() {
        network = " ",
        amount = " ",
        code = " ",
        refCode =" ",
        status = " ",
        dateCreated = " ",
        dateUsed = " ";
    
}

function showAlert(icon, title, text) {
    return Swal.fire({
        icon,
        title,
        text,
        confirmButtonColor: "#0a7d32"
    });
}

function getPins() {
    const savedPins = localStorage.getItem(storage);
    return savedPins ? JSON.parse(savedPins) : [];
}

function setPins(pins) {
    localStorage.setItem(storage, JSON.stringify(pins));
}

function formatDate(dateString) {
    if (!dateString) {
        return "Not used";
    }

    return new Date(dateString).toLocaleString();
}

function deletePin(index) {
    const pins = getPins();
    pins.splice(index, 1);
    setPins(pins);
    renderPins();
}

function renderPins() {
    const tableBody = document.getElementById("pinTableBody");

    if (!tableBody) {
        return;
    }

    const pins = getPins();

    if (pins.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8">No saved recharge PIN yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = pins
        .map((pin, index) => {
            const statusClass = pin.status === "Used" ? "status-used" : "status-unused";
            const actionButton =
                pin.status === "Used"
                    ? "Completed"
                    : `<button class="action-btn" onclick="markAsUsed('${pin.refCode}')">Mark as used</button>`;

            return `
                <tr>
                    <td>${index + 1}</td>
                    <td>${pin.network}</td>
                    <td>${pin.amount}</td>
                    <td>${pin.code}</td>
                    <td class="${statusClass}">${pin.status}</td>
                    <td>${formatDate(pin.dateCreated)}</td>
                    <td>${formatDate(pin.dateUsed)}</td>
                    <td>${actionButton}</td>
                    <td><button class="action-btn" onclick="deletePin('${pin.refCode}')">Delete</button></td>
                </tr>
            `;
        })
        .join("");
}

function generate() {
    const network = document.getElementById("airtel").value;
    const amount = document.getElementById("amount").value.trim();

    if (!network) {
        return showAlert("warning", "Network required", "Please select a network provider");
    }

    if (!amount) {
        return showAlert("warning", "Amount required", "Please enter an amount");
    }

    const randomPin = Math.trunc(100000000000 + Math.random() * 900000000000);
    document.getElementById("display").textContent = randomPin;
    return showAlert("success", "PIN generated", "Your recharge PIN is ready to save");
}

function savePin() {
    const network = document.getElementById("airtel").value;
    const amount = document.getElementById("amount").value.trim();
    const generatedPin = document.getElementById("display").textContent.trim();

    if (!network) {
        return showAlert("warning", "Network required", "Please select a network provider");
    }

    if (!amount) {
        return showAlert("warning", "Amount required", "Please enter an amount");
    }

    if (!generatedPin) {
        return showAlert("warning", "Generate PIN first", "Please generate a PIN first");
    }

    const refCode = buildRefCode(network, generatedPin);
    const pins = getPins();
    const pinExists = pins.some((pin) => pin.code === refCode);

    if (pinExists) {
        return showAlert("info", "Already saved", "This PIN has already been saved");
    }

    pins.push({
        network: network.toUpperCase(),
        amount,
        code: refCode,
        refCode,
        status: "Unused",
        dateCreated: new Date().toISOString(),
        dateUsed: ""
    });

    setPins(pins);
    renderPins();
    return showAlert("success", "Saved", "PIN saved successfully");
    clearInput();

    
}

function markAsUsed(refCode) {
    const pins = getPins();
    const pinIndex = pins.findIndex((pin) => pin.code === refCode || pin.refCode === refCode);

    if (pinIndex === -1) {
        return showAlert("error", "PIN not found", "The selected recharge PIN was not found");
    }

    if (pins[pinIndex].status === "Used") {
        return showAlert("info", "Already used", "This PIN has already been used");
    }

    pins[pinIndex].status = "Used";
    pins[pinIndex].dateUsed = new Date().toISOString();
    setPins(pins);
    renderPins();
    return showAlert("success", "Updated", "PIN status changed to used");
}

function rechargeCard() {
    const rechargePin = document.getElementById("rechargePin").value.trim();

    if (!rechargePin) {
        return showAlert("warning", "PIN required", "Enter a PIN to recharge");
    }

    const pins = getPins();
    const pinIndex = pins.findIndex((pin) => pin.code === rechargePin || pin.refCode === rechargePin);

    if (pinIndex === -1) {
        return showAlert("error", "Invalid PIN", "Invalid recharge PIN");
    }

    if (pins[pinIndex].status === "Used") {
        return showAlert("info", "Already used", "This recharge PIN has already been used");
    }

    pins[pinIndex].status = "Used";
    pins[pinIndex].dateUsed = new Date().toISOString();
    setPins(pins);
    renderPins();
    document.getElementById("rechargePin").value = "";
    return showAlert(
        "success",
        "Recharge successful",
        `${pins[pinIndex].network} ${pins[pinIndex].amount} recharge successful`
    );
}


document.addEventListener("DOMContentLoaded", renderPins);
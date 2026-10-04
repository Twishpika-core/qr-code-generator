const input = document.getElementById("qrInput");
const button = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("qrPreview");
const sizeSelect = document.getElementById("qrSize");
const errorCorrection = document.getElementById("errorCorrection");
const marginSelect = document.getElementById("qrMargin");
const qrPreset = document.getElementById("qrPreset");
const qrType = document.getElementById("qrType");
const wifiFields = document.getElementById("wifiFields");
const wifiName = document.getElementById("wifiName");
const wifiPassword = document.getElementById("wifiPassword");
const wifiSecurity = document.getElementById("wifiSecurity");
const fgColor = document.getElementById("fgColor");
const bgColor = document.getElementById("bgColor");
const recentQRs = document.getElementById("recentQRs");
const message = document.getElementById("message");

// ----------------------------------
// SHOW MESSAGE
// ----------------------------------

function showMessage(text, type) {
    message.textContent = text;
    message.className = "";

    if (type === "error") {
        message.classList.add("message-error");
    }

    if (type === "warning") {
        message.classList.add("message-warning");
    }

    if (type === "success") {
        message.classList.add("message-success");
    }
}

// ----------------------------------
// GET QR DATA
// ----------------------------------

function getQRData() {
    const type = qrType.value;
    const text = input.value.trim();
    const networkName = wifiName.value.trim();
    const password = wifiPassword.value;
    const security = wifiSecurity.value;

    if (type !== "wifi" && text === "") {
        return {
            valid: false,
            message: "Please enter something first!"
        };
    }

    if (
        type === "url" &&
        !text.startsWith("http://") &&
        !text.startsWith("https://")
    ) {
        return {
            valid: false,
            message: "Please enter a valid URL starting with http:// or https://"
        };
    }

    if (
        type === "email" &&
        (!text.includes("@") || !text.includes("."))
    ) {
        return {
            valid: false,
            message: "Please enter a valid email address!"
        };
    }

    if (
        type === "phone" &&
        !/^[0-9]{10}$/.test(text)
    ) {
        return {
            valid: false,
            message: "Please enter a valid 10-digit phone number!"
        };
    }

    if (
        type === "wifi" &&
        networkName === ""
    ) {
        return {
            valid: false,
            message: "Please enter the Wi-Fi name!"
        };
    }

    if (
        type === "wifi" &&
        security !== "nopass" &&
        password === ""
    ) {
        return {
            valid: false,
            message: "Please enter the Wi-Fi password!"
        };
    }

    let qrData = text;

    if (type === "email") {
        qrData = "mailto:" + text;
    }

    if (type === "phone") {
        qrData = "tel:" + text;
    }

    if (type === "wifi") {
    function escapeWifi(text) {
        return text.replace(/([\\;,:"])/g, "\\$1");
    }
    const safeNetworkName =
        escapeWifi(networkName);
    const safePassword =
        escapeWifi(password);
    qrData =
        `WIFI:T:${security};S:${safeNetworkName};P:${safePassword};;`;
    }
    return {
        valid: true,
        data: qrData,
        type: type
    };
}

// ----------------------------------
// CHECK COLOR CONTRAST
// ----------------------------------

function getBrightness(hex) {
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    return (
        (r * 299) +
        (g * 587) +
        (b * 114)
    ) / 1000;
}

function checkContrast(foreground, background) {
    const fgBrightness = getBrightness(foreground);
    const bgBrightness = getBrightness(background);
    const difference =
        Math.abs(fgBrightness - bgBrightness);

    if (difference < 80) {
        showMessage(
            "Warning: These colors may make the QR code difficult to scan.",
            "warning"
        );
        return false;
    } 
    else {
        message.textContent = "";
        message.className = "";
        return true;
    }
}

// ----------------------------------
// GENERATE QR
// ----------------------------------

function generateQR(showErrors = true) {
    const result = getQRData();

    if (!result.valid) {
        if (showErrors) {
            showMessage(result.message, "error");
        }
        return false;
    }

    const qrData = result.data;
    const size =
        Number(sizeSelect.value);
    const foreground =
        fgColor.value;
    const background =
        bgColor.value;
    const correction =
        errorCorrection.value;
    const margin =
        Number(marginSelect.value);
    const preset =
        qrPreset.value;
    let finalForeground =
        foreground;
    let finalBackground =
        background;

    if (preset === "dark") {
        finalForeground = "#ffffff";
        finalBackground = "#222222";
    }

    if (preset === "blue") {
        finalForeground = "#ffffff";
        finalBackground = "#2563eb";
    }

    if (preset === "green") {
        finalForeground = "#ffffff";
        finalBackground = "#16a34a";
    }

    preview.innerHTML = "";
    preview.style.padding =
        margin + "px";
    preview.style.width =
        (size + margin * 2) + "px";
    preview.style.height =
        (size + margin * 2) + "px";
    preview.style.backgroundColor =
        finalBackground;
    new QRCode(preview, {
        text: qrData,
        width: size,
        height: size,
        colorDark: finalForeground,
        colorLight: finalBackground,
        correctLevel:
            QRCode.CorrectLevel[correction]
    });
    checkContrast(
        finalForeground,
        finalBackground
    );
    return true;
}

// ----------------------------------
// GENERATE BUTTON
// ----------------------------------

button.addEventListener("click", function() {
    const generated =
        generateQR(true);
    if (!generated) {
        return;
    }
    const result =
        getQRData();
    saveRecentQR(
        result.type,
        result.data
    );
    showMessage(
        "QR code generated successfully!",
        "success"
    );
});

// ----------------------------------
// QR TYPE CHANGE
// ----------------------------------

qrType.addEventListener("change", function() {
    const type =
        qrType.value;

    if (type === "wifi") {
        wifiFields.style.display =
            "flex";
        input.style.display =
            "none";
    } else {
        wifiFields.style.display =
            "none";

        input.style.display =
            "block";
    }

    if (type === "text") {
        input.placeholder =
            "Enter text";
    }

    if (type === "url") {
        input.placeholder =
            "Enter URL";
    }

    if (type === "email") {
        input.placeholder =
            "Enter email address";
    }

    if (type === "phone") {
        input.placeholder =
            "Enter phone number";
    }
    generateQR(false);
});

// ----------------------------------
// REAL-TIME TEXT INPUT
// ----------------------------------

input.addEventListener("input", function() {
    generateQR(false);
});

// ----------------------------------
// REAL-TIME WI-FI INPUT
// ----------------------------------

wifiName.addEventListener("input", function() {
    generateQR(false);
});
wifiPassword.addEventListener("input", function() {
    generateQR(false);
});
wifiSecurity.addEventListener("change", function() {

    generateQR(false);
});

// ----------------------------------
// REAL-TIME CUSTOMIZATION
// ----------------------------------

sizeSelect.addEventListener("change", function() {
    generateQR(false);
});
fgColor.addEventListener("input", function() {
    generateQR(false);
});
bgColor.addEventListener("input", function() {
    generateQR(false);
});
errorCorrection.addEventListener("change", function() {
    generateQR(false);
});
qrPreset.addEventListener("change", function() {
    generateQR(false);
});
marginSelect.addEventListener("change", function() {
    generateQR(false);
});

// ----------------------------------
// DOWNLOAD QR
// ----------------------------------

downloadBtn.addEventListener("click", function() {
    const canvas =
        preview.querySelector("canvas");

    if (!canvas) {
        showMessage(
            "Please generate a QR code first!",
            "error"
        );
        return;
    }

    const margin =
        Number(marginSelect.value);
    const newCanvas =
        document.createElement("canvas");
    newCanvas.width =
        canvas.width + margin * 2;
    newCanvas.height =
        canvas.height + margin * 2;
    const ctx =
        newCanvas.getContext("2d");
    let downloadBackground =
        bgColor.value;
    const preset =
        qrPreset.value;

    if (preset === "dark") {
        downloadBackground =
            "#222222";
    }

    if (preset === "blue") {
        downloadBackground =
            "#2563eb";
    }

    if (preset === "green") {
        downloadBackground =
            "#16a34a";
    }

    ctx.fillStyle =
        downloadBackground;
    ctx.fillRect(
        0,
        0,
        newCanvas.width,
        newCanvas.height
    );
    ctx.drawImage(
        canvas,
        margin,
        margin
    );
    const link =
        document.createElement("a");
    link.download =
        "qr-code.png";
    link.href =
        newCanvas.toDataURL("image/png");
    link.click();
    showMessage(
        "QR code downloaded successfully!",
        "success"
    );
});

// ----------------------------------
// SAVE RECENT QR
// ----------------------------------

function saveRecentQR(type, data) {
    let recent =
        JSON.parse(
            localStorage.getItem("recentQRs")
        ) || [];
    // Prevent duplicate latest QR

    if (
        recent.length > 0 &&
        recent[0].type === type &&
        recent[0].data === data
    ) {
        return;
    }

    const newQR = {
        type: type,
        data: data
    };
    recent.unshift(newQR);
    recent =
        recent.slice(0, 5);
    localStorage.setItem(
        "recentQRs",
        JSON.stringify(recent)
    );
    displayRecentQRs();
}

// ----------------------------------
// DISPLAY RECENT QR
// ----------------------------------

function displayRecentQRs() {
    let recent =
        JSON.parse(
            localStorage.getItem("recentQRs")
        ) || [];
    recentQRs.innerHTML = "";

    if (recent.length === 0) {

        recentQRs.innerHTML =
            "<p>No recent QR codes yet.</p>";
        return;
    }
    recent.forEach(function(item, index) {
        const div =
            document.createElement("div");
        div.className =
            "recent-item";
        div.textContent =
            item.type.toUpperCase() +
            ": " +
            item.data;
        // Click recent QR to regenerate
        div.addEventListener(
            "click",
            function() {
                loadRecentQR(item);
            }
        );
        recentQRs.appendChild(div);
    });
}

// ----------------------------------
// LOAD RECENT QR
// ----------------------------------

function loadRecentQR(item) {
    const type =
        item.type;

    if (type === "wifi") {
        const wifiMatch =
            item.data.match(
                /^WIFI:T:(.*?);S:(.*?);P:(.*?);;$/
            );
        if (wifiMatch) {
            wifiFields.style.display =
                "flex";
            input.style.display =
                "none";
            qrType.value =
                "wifi";
            wifiSecurity.value =
                wifiMatch[1];
            wifiName.value =
                wifiMatch[2];
            wifiPassword.value =
                wifiMatch[3];
        }

    } else {
        wifiFields.style.display =
            "none";
        input.style.display =
            "block";
        qrType.value =
            type;
        if (type === "email") {

            input.value =
                item.data.replace(
                    "mailto:",
                    ""
                );

        } else if (type === "phone") {
            input.value =
                item.data.replace(
                    "tel:",
                    ""
                );

        } else {
            input.value =
                item.data;
        }
    }

    generateQR(false);
    showMessage(
        "Recent QR code loaded!",
        "success"
    );
}

// ----------------------------------
// LOAD RECENT QR CODES ON START
// ----------------------------------

displayRecentQRs();

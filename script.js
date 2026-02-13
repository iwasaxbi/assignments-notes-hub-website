// Wait until full HTML document is loaded before running JS
document.addEventListener("DOMContentLoaded", function() {

  // ---------------- NAVIGATION LINKS SETUP ----------------
  // Get all navigation links from navbar
  const navLinks = document.querySelectorAll("nav ul li a");

  let loginLink = null;
  let attendanceLink = null;
  let uploadLink = null;

  // Identify specific nav links based on text
  navLinks.forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    if (text === "login") loginLink = link;
    if (text === "attendance") attendanceLink = link;
    if (text === "upload") uploadLink = link;
  });

  // ---------------- PAGE SECTIONS REFERENCES ----------------
  // Getting all major sections of the website
  const modal = document.getElementById("loginModal");
  const loginForm = document.getElementById("loginForm");
  const attendanceSection = document.getElementById("attendancePage");
  const uploadSection = document.getElementById("uploadPage");
  const skillsSection = document.querySelector(".skills");
  const heroSection = document.querySelector(".hero-banner");

  // ---------------- STATE VARIABLES ----------------
  // Track login and attendance session states
  let isLoggedIn = false;
  let attendanceActive = false;
  let currentQRCode = null;

  // Set to prevent same QR reuse
  let usedCodes = new Set();

  // Load saved attendance data from localStorage
  let attendanceList = JSON.parse(localStorage.getItem("attendanceList")) || [];

  // ---------------- ATTENDANCE UI ELEMENTS ----------------
  const qrContainer = document.getElementById("qrCode");
  const listContainer = document.getElementById("attendanceList");
  const studentCount = document.getElementById("studentCount");

  // ================= LOGIN LOGIC =================

  // Handle Login / Logout button click
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      // Show login modal if not logged in
      modal.style.display = "flex";
    } else {
      // Logout process
      isLoggedIn = false;
      loginLink.textContent = "Login";

      // Reset visible sections
      attendanceSection.style.display = "none";
      uploadSection.style.display = "none";
      skillsSection.style.display = "block";
      heroSection.style.display = "block";

      alert("You have been logged out!");
    }
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  // Handle login form submission
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Demo login (no backend validation)
    modal.style.display = "none";
    isLoggedIn = true;
    loginLink.textContent = "Logout";

    alert("Login successful!");
  });

  // ================= QR GENERATION =================

  // Function to generate a new QR code
  function generateQRCode() {

    // If attendance not active, do nothing
    if (!attendanceActive) return;

    // Clear previous QR
    qrContainer.innerHTML = "";

    // Generate random unique code
    const code = "ATTEND-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    currentQRCode = code;

    // Create QR using QRCode library
    new QRCode(qrContainer, {
      text: code,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    console.log("QR Generated:", code);
  }

  // ================= ATTENDANCE PAGE NAVIGATION =================

  if (attendanceLink) {
    attendanceLink.addEventListener("click", (e) => {
      e.preventDefault();

      // Prevent access if not logged in
      if (!isLoggedIn) {
        document.getElementById('customAlert').style.display = 'flex';
        return;
      }

      // Hide other sections
      skillsSection.style.display = "none";
      heroSection.style.display = "none";
      uploadSection.style.display = "none";
      document.getElementById("notesPage").style.display = "none";

      // Show attendance section
      attendanceSection.style.display = "flex";

      window.scrollTo({ top: 0, behavior: 'smooth' });

      // If already active, regenerate QR
      if (attendanceActive) generateQRCode();
    });
  }

  // ================= START / STOP ATTENDANCE =================

  // Start attendance session
  document.getElementById("startAttendance").addEventListener("click", () => {
    attendanceActive = true;
    generateQRCode();
    alert("Attendance started");
  });

  // Stop attendance session
  document.getElementById("stopAttendance").addEventListener("click", () => {
    attendanceActive = false;
    qrContainer.innerHTML = "<p style='color:gray;'>Attendance stopped.</p>";
    currentQRCode = null;
    alert("Attendance stopped");
  });

  // ================= SIMULATE QR SCAN =================

  document.getElementById("simulateScan").addEventListener("click", () => {

    const name = document.getElementById("studentName").value.trim();

    // Basic validations
    if (!attendanceActive) return alert("Please start attendance first.");
    if (!name) return alert("Enter student name.");
    if (!currentQRCode) return alert("QR not found. Please restart attendance.");

    // Prevent QR reuse
    if (usedCodes.has(currentQRCode)) {
      alert("QR already used. Wait for next one.");
      return;
    }

    usedCodes.add(currentQRCode);

    // Record attendance entry
    const time = new Date().toLocaleTimeString();
    const entry = { name, time };

    attendanceList.push(entry);

    // Save to localStorage
    localStorage.setItem("attendanceList", JSON.stringify(attendanceList));

    renderList();

    alert(`${name} marked present at ${time}`);

    // Generate new QR after scan
    generateQRCode();

    document.getElementById("studentName").value = "";
  });

  // ================= RENDER ATTENDANCE LIST =================

  function renderList() {

    listContainer.innerHTML = "";

    attendanceList.forEach((s, i) => {
      const li = document.createElement("li");
      li.textContent = `${i + 1}. ${s.name} — ${s.time}`;
      listContainer.appendChild(li);
    });

    studentCount.textContent = attendanceList.length;
  }

  renderList();

  // ================= CLEAR ATTENDANCE =================

  document.getElementById("clearList").addEventListener("click", () => {

    if (confirm("Clear all attendance records?")) {

      attendanceList = [];
      localStorage.removeItem("attendanceList");

      renderList();
    }
  });

  // ================= EXPORT TO CSV =================

  document.getElementById("exportList").addEventListener("click", () => {

    if (attendanceList.length === 0)
      return alert("No attendance data to export.");

    let csv = "Name,Time\n";

    attendanceList.forEach(s => {
      csv += `${s.name},${s.time}\n`;
    });

    // Create downloadable CSV file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
  });

  // ================= HOME NAVIGATION =================

  const homeLink = navLinks[0];

  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();

      skillsSection.style.display = "block";
      heroSection.style.display = "block";
      attendanceSection.style.display = "none";
      uploadSection.style.display = "none";
      document.getElementById("notesPage").style.display = "none";

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================= UPLOAD SECTION NAV =================

  if (uploadLink) {
    uploadLink.addEventListener("click", (e) => {
      e.preventDefault();

      if (!isLoggedIn) {
        document.getElementById('uploadAlert').style.display = 'flex';
        return;
      }

      skillsSection.style.display = "none";
      heroSection.style.display = "none";
      attendanceSection.style.display = "none";
      document.getElementById("notesPage").style.display = "none";

      uploadSection.style.display = "flex";

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================= NOTES NAVIGATION =================

  const notesLink = Array.from(navLinks)
    .find(l => l.textContent.trim().toLowerCase() === "notes");

  if (notesLink) {
    notesLink.addEventListener("click", (e) => {
      e.preventDefault();

      skillsSection.style.display = "none";
      heroSection.style.display = "none";
      attendanceSection.style.display = "none";
      uploadSection.style.display = "none";

      document.getElementById("notesPage").style.display = "block";

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ================= ALERT CLOSE BUTTON =================

  document.querySelectorAll(".alert-btn, .upload-alert-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".custom-alert-overlay").style.display = "none";
    });
  });

});

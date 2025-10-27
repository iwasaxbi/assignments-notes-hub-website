document.addEventListener("DOMContentLoaded", function() {
  const navLinks = document.querySelectorAll("nav ul li a");
  let loginLink = null;
  let attendanceLink = null;
  let uploadLink = null;

  navLinks.forEach(link => {
    const text = link.textContent.trim().toLowerCase();
    if (text === "login") loginLink = link;
    if (text === "attendance") attendanceLink = link;
    if (text === "upload") uploadLink = link;
  });

  const modal = document.getElementById("loginModal");
  const loginForm = document.getElementById("loginForm");
  const attendanceSection = document.getElementById("attendancePage");
  const uploadSection = document.getElementById("uploadPage");
  const skillsSection = document.querySelector(".skills");
  const heroSection = document.querySelector(".hero-banner");

  let isLoggedIn = false;
  let attendanceActive = false;
  let currentQRCode = null;
  let usedCodes = new Set();
  let attendanceList = JSON.parse(localStorage.getItem("attendanceList")) || [];

  const qrContainer = document.getElementById("qrCode");
  const listContainer = document.getElementById("attendanceList");
  const studentCount = document.getElementById("studentCount");

  // --- LOGIN LOGIC ---
  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) modal.style.display = "flex";
    else {
      isLoggedIn = false;
      loginLink.textContent = "Login";
      attendanceSection.style.display = "none";
      uploadSection.style.display = "none";
      skillsSection.style.display = "block";
      heroSection.style.display = "block";
      alert("You have been logged out!");
    }
  });

  modal.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    modal.style.display = "none";
    isLoggedIn = true;
    loginLink.textContent = "Logout";
    alert("Login successful!");
  });

  // --- QR GENERATION ---
  function generateQRCode() {
    if (!attendanceActive) return;
    qrContainer.innerHTML = "";
    const code = "ATTEND-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    currentQRCode = code;
    new QRCode(qrContainer, {
      text: code,
      width: 200,
      height: 200,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });
    console.log("✅ QR Generated:", code);
  }

  // --- ATTENDANCE LOGIC ---
  if (attendanceLink) {
    attendanceLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (!isLoggedIn) {
        document.getElementById('customAlert').style.display = 'flex';
        return;
      }

      skillsSection.style.display = "none";
      heroSection.style.display = "none";
      uploadSection.style.display = "none";
      document.getElementById("notesPage").style.display = "none";

      attendanceSection.style.display = "flex";
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (attendanceActive) generateQRCode();
    });
  }

  // --- START / STOP ATTENDANCE ---
  document.getElementById("startAttendance").addEventListener("click", () => {
    attendanceActive = true;
    generateQRCode();
    alert("Attendance started ✅");
  });

  document.getElementById("stopAttendance").addEventListener("click", () => {
    attendanceActive = false;
    qrContainer.innerHTML = "<p style='color:gray;'>Attendance stopped.</p>";
    currentQRCode = null;
    alert("Attendance stopped ❌");
  });

  // --- SIMULATE SCAN ---
  document.getElementById("simulateScan").addEventListener("click", () => {
    const name = document.getElementById("studentName").value.trim();
    if (!attendanceActive) return alert("Please start attendance first.");
    if (!name) return alert("Enter student name.");
    if (!currentQRCode) return alert("QR not found. Please restart attendance.");

    if (usedCodes.has(currentQRCode)) {
      alert("⚠️ QR already used. Wait for the next one!");
      return;
    }

    usedCodes.add(currentQRCode);
    const time = new Date().toLocaleTimeString();
    const entry = { name, time };
    attendanceList.push(entry);
    localStorage.setItem("attendanceList", JSON.stringify(attendanceList));
    renderList();

    alert(`✅ ${name} marked present at ${time}`);
    generateQRCode(); // new QR after scan
    document.getElementById("studentName").value = "";
  });

  // --- RENDER ATTENDANCE LIST ---
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

  // --- CLEAR LIST ---
  document.getElementById("clearList").addEventListener("click", () => {
    if (confirm("Clear all attendance records?")) {
      attendanceList = [];
      localStorage.removeItem("attendanceList");
      renderList();
    }
  });

  // --- EXPORT TO CSV ---
  document.getElementById("exportList").addEventListener("click", () => {
    if (attendanceList.length === 0) return alert("No attendance data to export.");
    let csv = "Name,Time\n";
    attendanceList.forEach(s => { csv += `${s.name},${s.time}\n`; });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance.csv";
    a.click();
  });

  // --- OTHER EXISTING LOGIC (Home, Upload, Notes, Alerts) ---
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

  const getStartedBtn = document.querySelector(".modern-btn");
  if (getStartedBtn) {
    getStartedBtn.addEventListener("click", (e) => {
      e.preventDefault();
      document.querySelector(".skills-grid").scrollIntoView({ behavior: 'smooth' });
    });
  }

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

  const notesLink = Array.from(navLinks).find(l => l.textContent.trim().toLowerCase() === "notes");
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

  // Alerts close
  document.querySelectorAll(".alert-btn, .upload-alert-btn").forEach(btn => {
    btn.addEventListener("click", () => btn.closest(".custom-alert-overlay").style.display = "none");
  });
});

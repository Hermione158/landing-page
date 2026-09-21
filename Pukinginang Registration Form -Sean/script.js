(function () {
  "use strict";

  var STORAGE_KEY = "pdm_users";
  var SESSION_KEY = "pdm_current_user";

  /*Storage*/

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }

  function findUser(email) {
    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === email.toLowerCase()) return users[i];
    }
    return null;
  }

  /*Validation*/

  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var NAME_PATTERN = /^[A-Za-zÑñ.\-'\s]{2,50}$/;

  function checkName(value) {
    if (!value) return "Enter your full name.";
    if (!NAME_PATTERN.test(value)) return "Use letters only (2–50 characters).";
    if (value.trim().split(/\s+/).length < 2)
      return "Include your first and last name.";
    return "";
  }

  function checkEmail(value) {
    if (!value) return "Enter your email address.";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email, like juan@gmail.com.";
    return "";
  }

  function checkPassword(value) {
    if (!value) return "Enter a password.";
    if (value.length < 8) return "Use at least 8 characters.";
    if (!/[A-Za-z]/.test(value)) return "Include at least one letter.";
    if (!/[0-9]/.test(value)) return "Include at least one number.";
    return "";
  }

  function passwordStrength(value) {
    var score = 0;
    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    if (score <= 2) return { label: "Weak password", level: "weak" };
    if (score === 3 || score === 4) return { label: "Good password", level: "fair" };
    return { label: "Strong password", level: "strong" };
  }

  /*Inline Error Messages*/

  function errorSlotFor(input) {
    var wrapper = input.parentElement; // the .name_icon / .email_icon / .pwd_icon div
    var slot = wrapper.nextElementSibling;
    if (!slot || !slot.classList.contains("field-error")) {
      slot = document.createElement("span");
      slot.className = "field-error";
      wrapper.parentNode.insertBefore(slot, wrapper.nextSibling);
    }
    return slot;
  }

  function showError(input, message) {
    var slot = errorSlotFor(input);
    slot.textContent = message;
    slot.classList.toggle("is-visible", !!message);
    input.classList.toggle("is-invalid", !!message);
    input.setAttribute("aria-invalid", message ? "true" : "false");
    return !message;
  }

  /*Success Banner / Failure Messages)*/

  function showBanner(form, message, type) {
    var banner = form.querySelector(".form-banner");
    if (!banner) {
      banner = document.createElement("p");
      banner.className = "form-banner";
      banner.setAttribute("role", "status");
      form.insertBefore(banner, form.firstChild);
    }
    banner.textContent = message;
    banner.className = "form-banner is-visible " + (type || "info");
  }

  /*(Show/Hide Password)*/

  function addPasswordToggle(input) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "toggle-pwd";
    button.setAttribute("aria-label", "Show password");
    button.innerHTML = '<i class="fa-regular fa-eye"></i>';

    button.addEventListener("click", function () {
      var hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      button.setAttribute("aria-label", hidden ? "Hide password" : "Show password");
      button.innerHTML = hidden
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';
      input.focus();
    });

    input.parentElement.appendChild(button);
  }

  /*==REGISTRATION PAGE==*/

  function initRegistration() {
    var form = document.querySelector("form");
    var name = form.querySelector(".name-container");
    var email = form.querySelector(".email-container");
    var pwd = form.querySelector(".pwd-container");

    addPasswordToggle(pwd);

    // Password strength meter under the password box
    var meter = document.createElement("span");
    meter.className = "pwd-strength";
    pwd.parentElement.parentNode.insertBefore(meter, pwd.parentElement.nextSibling);

    pwd.addEventListener("input", function () {
      if (!pwd.value) {
        meter.textContent = "";
        meter.className = "pwd-strength";
        return;
      }
      var result = passwordStrength(pwd.value);
      meter.textContent = result.label;
      meter.className = "pwd-strength is-visible " + result.level;
    });

    // Validate a field once the user leaves it
    name.addEventListener("blur", function () {
      showError(name, checkName(name.value.trim()));
    });
    email.addEventListener("blur", function () {
      showError(email, checkEmail(email.value.trim()));
    });
    pwd.addEventListener("blur", function () {
      showError(pwd, checkPassword(pwd.value));
    });

    // Clear the error as soon as they start fixing it
    [name, email, pwd].forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) showError(field, "");
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var okName = showError(name, checkName(name.value.trim()));
      var okEmail = showError(email, checkEmail(email.value.trim()));
      var okPwd = showError(pwd, checkPassword(pwd.value));

      if (!okName || !okEmail || !okPwd) {
        showBanner(form, "Check the highlighted fields and try again.", "error");
        return;
      }

      if (findUser(email.value.trim())) {
        showError(email, "That email is already registered.");
        showBanner(form, "That email already has an account. Log in instead.", "error");
        return;
      }

      var users = getUsers();
      users.push({
        name: name.value.trim(),
        email: email.value.trim().toLowerCase(),
        password: pwd.value,
        registeredOn: new Date().toISOString(),
      });
      saveUsers(users);

      showBanner(form, "Account created. Taking you to the login page…", "success");
      form.querySelector(".signup-btn").disabled = true;

      setTimeout(function () {
        window.location.href = "Login.html";
      }, 1200);
    });
  }

  /*==LOGIN PAGE==*/

  function initLogin() {
    var form = document.querySelector("form");
    var email = form.querySelector(".email-container-login");
    var pwd = form.querySelector(".pwd-container-login");
    var forgot = form.querySelector(".forgot-pwd-container-login button");

    addPasswordToggle(pwd);

    // The "Forgot Password?" button sits inside the form, so stop it submitting
    if (forgot) {
      forgot.type = "button";
      forgot.addEventListener("click", function () {
        var address = email.value.trim();
        if (!EMAIL_PATTERN.test(address)) {
          showError(email, "Enter your email first, then tap Forgot Password.");
          email.focus();
          return;
        }
        if (!findUser(address)) {
          showBanner(form, "No account uses that email.", "error");
          return;
        }
        showBanner(
          form,
          "Password reset is not available in this demo. Ask the registrar to reset it.",
          "info"
        );
      });
    }

    [email, pwd].forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.classList.contains("is-invalid")) showError(field, "");
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var okEmail = showError(email, checkEmail(email.value.trim()));
      var okPwd = showError(pwd, pwd.value ? "" : "Enter your password.");
      if (!okEmail || !okPwd) return;

      var account = findUser(email.value.trim());
      if (!account || account.password !== pwd.value) {
        showBanner(form, "Email or password is incorrect.", "error");
        pwd.value = "";
        pwd.focus();
        return;
      }

      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ name: account.name, email: account.email })
      );

      showBanner(form, "Welcome back, " + account.name.split(" ")[0] + "!", "success");
      form.querySelector(".signup-btn-login").disabled = true;

      setTimeout(function () {
        window.location.href = "dashboard.html";
      }, 900);
    });
  }

  /*==DASHBOARD PAGE==*/

  function initDashboard() {
    var session;
    try {
      session = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch (e) {
      session = null;
    }

    if (!session) {
      window.location.replace("Login.html");
      return;
    }

    document.querySelector(".account-name").textContent = session.name;
    document.querySelector(".account-email").textContent = session.email;

    document.querySelector(".logout-btn").addEventListener("click", function () {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = "Login.html";
    });
  }

  /*Pick the Right Page*/

  document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector(".name-container")) initRegistration();
    else if (document.querySelector(".email-container-login")) initLogin();
    else if (document.querySelector(".account-card")) initDashboard();
  });
})();

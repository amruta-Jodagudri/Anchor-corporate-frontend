function validateMobile() {
  const mobile = $("#mobileNumber").val().trim();
  const wrapper = $("#mobileNumber").closest(".mobile-input-wrapper");

  if (mobile === "") {
    $("#mobileError").text("Please enter mobile number.").show();
    $("#mobileError").prev(".error-info").show();
    wrapper.addClass("error");
    return false;
  }

  if (!/^\d{10}$/.test(mobile)) {
    $("#mobileError")
      .text("Please enter a valid 10-digit mobile number.")
      .show();
    $("#mobileError").prev(".error-info").show();
    wrapper.addClass("error");
    return false;
  }

  $("#mobileError").hide();
  $("#mobileError").prev(".error-info").hide();
  wrapper.removeClass("error");
  return true;
}

function validateCaptcha() {
  const captchaInput = $("#verification-captcha").val().trim();
  const captchaText = $("#captchaText").text().trim();

  if (captchaInput === "") {
    $("#captchaError").text("Please enter CAPTCHA.").show();
    $("#captchaError").prev(".error-info").show();
    $("#verification-captcha").addClass("error");
    return false;
  }

  if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
    $("#captchaError").text("Invalid CAPTCHA.").show();
    $("#captchaError").prev(".error-info").show();
    $("#verification-captcha").addClass("error");
    return false;
  }

  $("#captchaError").hide();
  $("#captchaError").prev(".error-info").hide();
  $("#verification-captcha").removeClass("error");

  return true;
}

function updateOtpButtonState() {
  const mobileValid = /^\d{10}$/.test($("#mobileNumber").val().trim());
  const captchaInput = $("#verification-captcha").val().trim().toLowerCase();
  const captchaText = $("#captchaText").text().trim().toLowerCase();
  const captchaValid = captchaInput !== "" && captchaInput === captchaText;
  const consentChecked = $("#consentCheck").is(":checked");
  const isValid = mobileValid && captchaValid && consentChecked;

  const btn = $("#otpBtn");
  btn.prop("disabled", !isValid).toggleClass("active", isValid);

  if (isValid && !btn.is(":focus")) {
  }
}

$("#mobileNumber").on("input", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
  const wrapper = $(this).closest(".mobile-input-wrapper");

  $("#mobileError").hide();
  $("#mobileError").prev(".error-info").hide();
  wrapper.removeClass("error");

  updateOtpButtonState();
});

$("#verification-captcha").on("focus", function () {
  validateMobile();
});

$("#verification-captcha").on("input", function () {
  $("#captchaError").hide();
  $("#captchaError").prev(".error-info").hide();
  $("#verification-captcha").removeClass("error");

  updateOtpButtonState();
});

$("#consentCheck").on("click", function (e) {
  if (!validateMobile()) {
    e.preventDefault();
    $(this).prop("checked", false);
    return false;
  }

  if (!validateCaptcha()) {
    e.preventDefault();
    $(this).prop("checked", false);
    return false;
  }

  setTimeout(() => {
    updateOtpButtonState();
  }, 0);
});

$("#otpBtn").on("click", function (e) {
  e.preventDefault();

  const mobileValid = validateMobile();
  const captchaValid = validateCaptcha();
  const consentChecked = $("#consentCheck").is(":checked");

  if (!mobileValid || !captchaValid || !consentChecked) {
    return;
  }

  const mobile = $("#mobileNumber").val().trim();

  const maskedMobile = "+91-xxxxxx" + mobile.slice(-4);

  $("#otpMobileNumber").text(maskedMobile);

  const el = document.getElementById("otpModal");
  let modal = bootstrap.Modal.getInstance(el);

  if (!modal) {
    modal = new bootstrap.Modal(el);
  }
});

$(document).ready(function () {
  $("#mobileError").hide();
  $("#captchaError").hide();

  $("#mobileError").prev(".error-info").hide();
  $("#captchaError").prev(".error-info").hide();

  $("#otpBtn").prop("disabled", true).removeClass("active");
});

/* INIT */
jQuery(document).ready(function ($) {
  initializeOtpVisibilityToggle();
  initializeOtpVisibilityState();
  initializeOtpInputs();
  initializeOtpTimer();
});

/* OTP VISIBILITY TOGGLE */
function initializeOtpVisibilityToggle() {
  jQuery("#toggleOtpVisibility").on("click keydown", function (e) {
    if (e.type === "keydown" && e.key !== "Enter") return;

    if (e.type === "keydown") {
      e.preventDefault();
    }
    if (jQuery(this).prop("disabled")) return;

    const otpInputs = jQuery(".otp-input-verification");
    const isPassword = otpInputs.first().attr("type") === "password";

    if (isPassword) {
      otpInputs.attr("type", "text");
      jQuery("#eyeOpen").hide();
      jQuery("#eyeClose").show();
    } else {
      otpInputs.attr("type", "password");
      jQuery("#eyeClose").hide();
      jQuery("#eyeOpen").show();
    }
  });
}

/* OTP VISIBILITY STATE */
function initializeOtpVisibilityState() {
  const otpInputs = jQuery(".otp-input-verification");
  const toggleBtn = jQuery("#toggleOtpVisibility");

  function updateState() {
    let hasValue = false;

    otpInputs.each(function () {
      if (jQuery(this).val().trim() !== "") {
        hasValue = true;
        return false;
      }
    });

    toggleBtn.prop("disabled", !hasValue);

    if (hasValue) toggleBtn.addClass("active");
    else toggleBtn.removeClass("active");
  }

  otpInputs.on("input keyup", updateState);
  updateState();
}

/* OTP INPUTS */
function initializeOtpInputs() {
  const otpInputs = jQuery(".otp-input-verification");
  const verifyBtn = jQuery("#verifyOtpBtn");

  verifyBtn.prop("disabled", true);

  otpInputs.on("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 1);

    if (this.value.length === 1) {
      jQuery(this).next(".otp-input-verification").focus();
    }

    let allFilled = true;

    otpInputs.each(function () {
      if (jQuery(this).val().trim() === "") {
        allFilled = false;
      }
    });

    if (allFilled) {
      verifyBtn.prop("disabled", false).addClass("active");

      // Move focus to Eye icon after last OTP digit
      $("#toggleOtpVisibility")
        .prop("disabled", false)
        .addClass("active")
        .focus();
    } else {
      verifyBtn.prop("disabled", true).removeClass("active");
    }
  });

  otpInputs.on("keydown", function (e) {
    if (e.key === "Backspace" && this.value === "") {
      jQuery(this).prev(".otp-input-verification").focus();
    }
  });
}

/* OTP MODAL KEYBOARD NAVIGATION */

$(document).on("keydown", "#toggleOtpVisibility", function (e) {
  if (e.key === "Tab" && !e.shiftKey) {
    e.preventDefault();
    $(".cancel-btn.js-logout-trigger:visible").focus();
  }
});

$(document).on("keydown", ".cancel-btn.js-logout-trigger", function (e) {
  if (e.key === "Tab" && !e.shiftKey) {
    e.preventDefault();
    $("#verifyOtpBtn").focus();
  }

  if (e.key === "Enter") {
    e.preventDefault();
    $(this).trigger("click");
  }
});

$(document).on("keydown", "#verifyOtpBtn", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    $(this).trigger("click");
  }

  // Optional: cycle back to OTP inputs
  if (e.key === "Tab" && !e.shiftKey) {
    e.preventDefault();
    $(".otp-input-verification").first().focus();
  }
});

/* OTP TIMER */
function initializeOtpTimer() {
  let timer = 180;
  let interval = null;

  const timerTitle = jQuery("#otpTimerTitle");
  const timerElement = jQuery("#otpTimer");
  const resendBtn = jQuery("#resendOtpBtn");
  const otpResentMessage = jQuery("#otpResentMessage");

  otpResentMessage.removeClass("d-flex").addClass("d-none");

  jQuery("#otpModal").on("shown.bs.modal", function () {
    clearInterval(interval);
    startTimer();

    jQuery(".otp-input-verification").first().focus();
  });

  jQuery("#otpModal").on("hidden.bs.modal", function () {
    clearInterval(interval);
  });

  function startTimer() {
    timer = 180;

    timerTitle.show();
    timerElement.show();
    resendBtn.hide();

    updateTimerText();

    interval = setInterval(function () {
      timer--;
      updateTimerText();

      if (timer <= 0) {
        clearInterval(interval);
        timerTitle.hide();
        timerElement.hide();
        resendBtn.css("display", "flex");
      }
    }, 1000);
  }

  function updateTimerText() {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    timerElement.text(
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    );
  }

  resendBtn.on("click", function () {
    clearInterval(interval);

    otpResentMessage.removeClass("d-none").addClass("d-flex");

    setTimeout(() => {
      otpResentMessage.removeClass("d-flex").addClass("d-none");
    }, 3000);

    startTimer();
  });
}

/* MODAL FLOW */
jQuery(document).ready(function ($) {
  $("#verifyOtpBtn").on("click", function () {
    const otpEl = document.getElementById("otpModal");
    const successEl = document.getElementById("successModal");

    bootstrap.Modal.getInstance(otpEl)?.hide();

    setTimeout(() => {
      let successModal = bootstrap.Modal.getInstance(successEl);
      if (!successModal) successModal = new bootstrap.Modal(successEl);
      successModal.show();
    }, 300);
  });

  $("#backToOtpBtn").on("click", function () {
    const successEl = document.getElementById("successModal");
    const otpEl = document.getElementById("otpModal");

    bootstrap.Modal.getInstance(successEl)?.hide();

    setTimeout(() => {
      let otpModal = bootstrap.Modal.getInstance(otpEl);
      if (!otpModal) otpModal = new bootstrap.Modal(otpEl);
      otpModal.show();
    }, 300);
  });

  $("#proceedBtn").on("click", function () {
    const successEl = document.getElementById("successModal");
    const nextEl = document.getElementById("nextModal");

    bootstrap.Modal.getInstance(successEl)?.hide();

    setTimeout(() => {
      let nextModal = bootstrap.Modal.getInstance(nextEl);
      if (!nextModal) nextModal = new bootstrap.Modal(nextEl);
      nextModal.show();
    }, 300);
  });
});

/* LOGOUT MODAL */
function openLogoutModal() {
  const el = document.getElementById("logoutModal");
  document.querySelectorAll(".modal.show").forEach((modalEl) => {
    const instance = bootstrap.Modal.getInstance(modalEl);
    if (instance) instance.hide();
  });

  setTimeout(() => {
    let modal = bootstrap.Modal.getInstance(el);

    if (!modal) {
      modal = new bootstrap.Modal(el, {
        backdrop: "static",
        keyboard: false,
      });
    }

    modal.show();
  }, 350);
}

$(document).on("click", ".js-logout-trigger", function (e) {
  e.preventDefault();
  e.stopPropagation();

  openLogoutModal();
});

$("#consentCheck").on("keydown", function (e) {
  // ENTER → Check checkbox
  if (e.key === "Enter") {
    e.preventDefault();

    if (!$(this).is(":checked")) {
      $(this).trigger("click");

      setTimeout(() => {
        if (!$("#otpBtn").prop("disabled")) {
          $("#otpBtn").focus(); // This will trigger the focus shadow
        }
      }, 0);
    } else {
      // If already checked, Enter should behave like clicking Send OTP
      if (!$("#otpBtn").prop("disabled")) {
        $("#otpBtn").focus(); // Add focus before click for visual feedback
        $("#otpBtn").trigger("click");
      }
    }
  }

  // TAB → Move back to Mobile Number
  else if (e.key === "Tab" && !e.shiftKey) {
    e.preventDefault();
    $("#mobileNumber").focus();
  }
});

$("#otpBtn").on("click", function (e) {
  e.preventDefault();

  const mobileValid = validateMobile();
  const captchaValid = validateCaptcha();
  const consentChecked = $("#consentCheck").is(":checked");

  if (!mobileValid || !captchaValid || !consentChecked) {
    return;
  }

  const btn = $(this);

  btn.prop("disabled", true);

  const originalHtml = btn.html();

  btn.html('<div class="btn-loader"></div>');

  // Wait 5 seconds while loader runs
  setTimeout(() => {
    // Restore button
    btn.html(originalHtml);

    updateOtpButtonState();

    const mobile = $("#mobileNumber").val().trim();
    const maskedMobile = "+91-xxxxxx" + mobile.slice(-4);

    $("#otpMobileNumber").text(maskedMobile);

    // Open OTP modal AFTER loader completes
    const otpModalEl = document.getElementById("otpModal");

    let otpModal = bootstrap.Modal.getInstance(otpModalEl);

    if (!otpModal) {
      otpModal = new bootstrap.Modal(otpModalEl);
    }

    otpModal.show();
  }, 5000);
});

function generateCaptcha() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let captcha = "";

  for (let i = 0; i < 6; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  $("#captchaText").text(captcha);

  $("#verification-captcha").val("");
  updateOtpButtonState();
}

$(document).on("click", "#refreshCaptcha", function () {
  generateCaptcha();
});

$(document).on("keydown", "#refreshCaptcha", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();

    generateCaptcha();

    // Keep focus on refresh icon
    $(this).focus();
  }
});

$(document).on("keydown", "#successModal .cancel-btn", function (e) {
  if (e.key === "Tab" && !e.shiftKey) {
    e.preventDefault();
    $("#successModal .success-proceed").focus();
  }

  if (e.key === "Enter") {
    e.preventDefault();
    $(this).trigger("click");
  }
});

$(document).on("keydown", "#successModal .success-proceed", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    $(this).trigger("click");
  }
});

$("#successModal").on("shown.bs.modal", function () {
  document.activeElement.blur();

  $(this).attr("tabindex", "-1").focus();
});

function updateCountryCodeVisibility() {
  const mobileInput = $("#mobileNumber");
  const countryCode = $(".country-code");
  const value = mobileInput.val().trim();

  if (value.length > 0 && !mobileInput.is(":focus")) {
    countryCode.addClass("visible");
    mobileInput.css("padding-left", "0");
  } else {
    countryCode.removeClass("visible");
    mobileInput.css("padding-left", "0");
  }
}

$(document).ready(function () {
  $(".mobile-input-wrapper").prepend('<span class="country-code">+91</span>');

  updateCountryCodeVisibility();

  $("#mobileNumber").on("focus", function () {
    $(".country-code").removeClass("visible");
    $(this).css("padding-left", "0");
  });

  $("#mobileNumber").on("blur", function () {
    setTimeout(function () {
      updateCountryCodeVisibility();
    }, 100);
  });

  $("#mobileNumber").on("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
    const wrapper = $(this).closest(".mobile-input-wrapper");

    $("#mobileError").hide();
    $("#mobileError").prev(".error-info").hide();
    wrapper.removeClass("error");

    $(".country-code").removeClass("visible");
    $(this).css("padding-left", "0");

    updateOtpButtonState();
  });
});

// Multiple anchor

function updateProceedBtn() {
  const selected = $("#searchInput").val().trim();
  const hasSelection = selected !== "";

  $(".proceed-btn")
    .prop("disabled", !hasSelection)
    .toggleClass("active", hasSelection)
    .toggleClass("disabled-proceed", !hasSelection);
}

$(document).on(
  "keydown",
  "#successModal .default-enable, #successModal .success-proceed, #anchorProceedBtn, #proceedBtn",
  function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      $(this).trigger("click");
    }

    // Optional: if Tab is pressed from Proceed button, move to Cancel button
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      $("#successModal .cancel-btn.js-logout-trigger").focus();
    }
  },
);

function adjustHeight() {
  let visibleItems = $("#optionsList li:visible").length;
  let itemHeight = 40;
  let newHeight = visibleItems * itemHeight;
  let maxHeight = 240;
  $("#optionsList").css("height", Math.min(newHeight, maxHeight) + "px");
}

// need to comment out below code to work the multiple anchor(from 628 to 824)

// $(document).ready(function () {
//   const $input = $("#searchInput");
//   const $list = $("#optionsList");
//   const $arrow = $("#arrowIcon");

//   let currentIndex = -1;
//   let isDropdownOpen = false;
//   let isInputFocused = false;

//   $("#successModal").on("show.bs.modal", function () {
//     $input.val("");
//     $list.hide();
//     $arrow.removeClass("rotate");
//     isDropdownOpen = false;
//     isInputFocused = false;

//     currentIndex = -1;
//     $("#optionsList li").removeClass("active");

//     updateProceedBtn();
//   });

//   updateProceedBtn();

//   function filterOptions() {
//     let value = $input.val().toLowerCase().trim();

//     $("#optionsList li").each(function () {
//       let originalText = $(this).attr("data-original");
//       let lowerText = originalText.toLowerCase();

//       if (value === "") {
//         $(this).html(originalText).show();
//         return;
//       }

//       if (lowerText.includes(value)) {
//         let regex = new RegExp(`(${value})`, "gi");
//         let highlighted = originalText.replace(
//           regex,
//           `<span class="highlight">$1</span>`,
//         );
//         $(this).html(highlighted).show();
//       } else {
//         $(this).hide();
//       }
//     });

//     adjustHeight();

//     currentIndex = -1;
//     $("#optionsList li").removeClass("active");

//     updateProceedBtn();
//   }

//   $input.on("click", function (e) {
//     e.stopPropagation();
//     if (!isDropdownOpen) {
//       $list.show();
//       $arrow.addClass("rotate");
//       isDropdownOpen = true;
//       filterOptions();
//     }
//   });

//   $input.on("input", function () {
//     if (isDropdownOpen) {
//       filterOptions();
//     }
//   });

//   $input.on("focus", function () {
//     isInputFocused = true;
//   });

//   $input.on("blur", function () {
//     isInputFocused = false;
//   });

//   $input.on("keydown", function (e) {
//     const $visibleItems = $("#optionsList li:visible");
//     const itemCount = $visibleItems.length;

//     if (!isDropdownOpen && (e.key === "Enter" || e.key === "ArrowDown")) {
//       e.preventDefault();
//       $list.show();
//       $arrow.addClass("rotate");
//       isDropdownOpen = true;
//       filterOptions();
//       if (e.key === "ArrowDown" && itemCount > 0) {
//         currentIndex = 0;
//         updateActiveItem($visibleItems);
//       }
//       return;
//     }

//     if (itemCount === 0 || !isDropdownOpen) return;

//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       currentIndex = (currentIndex + 1) % itemCount;
//       updateActiveItem($visibleItems);
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       currentIndex = currentIndex <= 0 ? itemCount - 1 : currentIndex - 1;
//       updateActiveItem($visibleItems);
//     } else if (e.key === "Enter") {
//       e.preventDefault();

//       if (isDropdownOpen && currentIndex >= 0 && currentIndex < itemCount) {
//         const $activeItem = $visibleItems.eq(currentIndex);
//         if ($activeItem.length) {
//           $activeItem.click();
//         }
//       } else {
//         closeDropdown();
//       }
//     } else if (e.key === "Escape") {
//       closeDropdown();
//     } else if (e.key === "Tab") {
//       closeDropdown();
//       return;
//     }
//   });

//   function closeDropdown() {
//     $list.hide();
//     $arrow.removeClass("rotate");
//     isDropdownOpen = false;
//     currentIndex = -1;
//     $("#optionsList li").removeClass("active");
//   }

//   function updateActiveItem($items) {
//     $("#optionsList li").removeClass("active");

//     if (currentIndex >= 0 && currentIndex < $items.length) {
//       $items.eq(currentIndex).addClass("active");

//       const listContainer = document.getElementById("optionsList");
//       const activeItem = listContainer?.querySelector("li.active");
//       if (activeItem) {
//         activeItem.scrollIntoView({ block: "nearest" });
//       }
//     }
//   }

//   $("#optionsList li").on("click", function () {
//     let originalText = $(this).attr("data-original");
//     $input.val(originalText);
//     closeDropdown();
//     updateProceedBtn();
//     $input.focus();
//   });

//   $("#optionsList li").on("mouseenter", function () {
//     currentIndex = -1;
//     $("#optionsList li").removeClass("active");
//   });

//   $(document).on("click", function (e) {
//     if (!$(e.target).closest(".custom-select-wrapper").length) {
//       closeDropdown();
//     }
//   });

//   // $(document).on("keydown", "#successModal", function (e) {
//   //   if (e.key === "Tab") {
//   //     if (isDropdownOpen) {
//   //       closeDropdown();
//   //       return;
//   //     }

//   //     const $focusable = $(this).find(
//   //       'button:not([disabled]), a, input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
//   //     );

//   //     const $visibleFocusable = $focusable.filter(function () {
//   //       return $(this).is(":visible") && !$(this).prop("disabled");
//   //     });

//   //     if ($visibleFocusable.length === 0) return;

//   //     const firstElement = $visibleFocusable.first();
//   //     const lastElement = $visibleFocusable.last();

//   //     if (e.shiftKey && document.activeElement === firstElement[0]) {
//   //       e.preventDefault();
//   //       lastElement.focus();
//   //     } else if (!e.shiftKey && document.activeElement === lastElement[0]) {
//   //       e.preventDefault();
//   //       firstElement.focus();
//   //     }
//   //   }
//   // });
// });

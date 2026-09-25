function debounce(func, wait) {
  var timeout;
  return function executedFunction() {
    var args = arguments;
    var later = function () {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function openModal(modal) {
  $(modal).show();
  $("body").addClass("modal-open");
}

function closeModal(modal) {
  $(modal).hide();
  $("body").removeClass("modal-open");
}

function initIcons() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
    console.log("Lucide icons initialized");
  }
}

$(document).ready(function () {
  initIcons();
});

$(document).ajaxComplete(function (event, xhr, settings) {
  setTimeout(initIcons, 100);
});

var observerInitialized = false;
var observerDebounced = null;

function setupDOMMonitoring() {
  if (observerInitialized) return;

  observerDebounced = debounce(function () {
    var shouldInit = false;

    if ($("[data-lucide]").length > 0) {
      shouldInit = true;
    }

    if (shouldInit) {
      initIcons();
    }
  }, 200);

  $(document).on("DOMSubtreeModified", function () {
    observerDebounced();
  });

  observerInitialized = true;
}

// dashboardheader.js

var textSizeState = 1;
var lineHeightState = 1;
var letterSpacingState = 1;

var settingsChanged = false;

// var defaultFontSize = 16;
var defaultLineHeight = 1.5;
var defaultLetterSpacing = 0;

function closeSidePanels() {
  $("#notificationPanel, #menuPanel").removeClass("open");
  $("body").removeClass("modal-open");
  $("#sidePanelOverlay").removeClass("show");
}

$(document).on(
  "click",
  "#openNotificationPanel, #openNotificationPanelMobile",
  function () {
    closeSidePanels();

    $("#notificationPanel").addClass("open");
    $("body").addClass("modal-open");
    $("#sidePanelOverlay").addClass("show");
  },
);

$(document).on("click", "#menuToggle", function () {
  closeSidePanels();

  $("#menuPanel").addClass("open");
  $("body").addClass("modal-open");
  $("#sidePanelOverlay").addClass("show");
});

$(document).on("click", ".close-panel", function () {
  closeSidePanels();
});

$(document).on("click", "#sidePanelOverlay", function () {
  closeSidePanels();
});

$(document).on(
  "click",
  "#openAccessibilityModal,#openAccessibilityModalMobile",
  function (e) {
    e.stopPropagation();

    if ($(window).width() < 768) {
      if ($("#accessibilityPanel").is(":visible")) {
        $("#accessibilityPanel").hide();
        $("#accessibilityOverlay").removeClass("show");
      } else {
        $("#accessibilityPanel").show();
        $("#accessibilityOverlay").addClass("show");
      }
    } else {
      $("#accessibilityPanel").toggle();
    }
  },
);

$(document).on("click", function (e) {
  if (
    !$(e.target).closest("#accessibilityPanel").length &&
    !$(e.target).closest("#openAccessibilityModal").length &&
    !$(e.target).closest("#openAccessibilityModalMobile").length
  ) {
    if ($(window).width() < 768) {
      $("#accessibilityPanel").hide();
      $("#accessibilityOverlay").removeClass("show");
    } else {
      $("#accessibilityPanel").hide();
    }
  }
});

$(document).on("click", "[data-close-modal]", function () {
  $(".custom-modal-overlay").hide();
  $("body").removeClass("modal-open");
});

$(document).on("click", ".custom-modal-overlay", function (e) {
  if ($(e.target).hasClass("custom-modal-overlay")) {
    $(this).hide();
    $("body").removeClass("modal-open");
  }
});

$(document).on("click", "#openLogoutModal", function () {
  openModal("#logoutModal");
});

$(document).on("click", "#proceedBtn", function () {
  closeModal("#logoutModal");

  $("#logoutSuccessScreen").hide();
  $("#mobileLogoutSuccessScreen").hide();

  if ($(window).width() < 768) {
    $("#mobileLogoutSuccessScreen").show();
    $("#dashboardContent").show();
    $(".empty-state").show();
  } else {
    $("#logoutSuccessScreen").show();
    $("#dashboardContent").hide();
    $(".empty-state").hide();
  }

  lucide.createIcons();
});

// Accessibility Settings
function applyAccessibilitySettings() {
  $("body").removeClass("text-small text-large");

  // Text size
  if (textSizeState === 0) {
    $("body").addClass("text-small");
  } else if (textSizeState === 2) {
    $("body").addClass("text-large");
  }

  saveAccessibilitySettings();
}

$("#applyAccessibility").on("click", function () {
  const highContrastEnabled = $("#highContrastToggle").is(":checked");
  $("body").toggleClass("high-contrast", highContrastEnabled);

  applyAccessibilitySettings();
  disableAccessibilityButtons();

  $("#accessibilityPanel").hide();

  if ($(window).width() < 768) {
    $("#accessibilityOverlay").removeClass("show");
  }
});

$(document).on("click", "#accessibilityOverlay", function () {
  $("#accessibilityPanel").hide();
  $(this).removeClass("show");
});

$(document).ready(function () {
  const settings = JSON.parse(localStorage.getItem("accessibilitySettings"));

  if (settings) {
    textSizeState = settings.textSizeState;
    lineHeightState = settings.lineHeightState;
    letterSpacingState = settings.letterSpacingState;

    updateTextSizeUI();
    updateLineHeightUI();
    updateLetterSpacingUI();

    if (settings.highContrast) {
      $("#highContrastToggle").prop("checked", true);
      $("body").addClass("high-contrast");
    }

    applyAccessibilitySettings();
  }

  disableAccessibilityButtons();
});

function enableAccessibilityButtons() {
  settingsChanged = true;

  $("#applyAccessibility")
    .prop("disabled", false)
    .addClass("enabled")
    .removeClass("disabled");

  $("#resetAccessibility")
    .prop("disabled", false)
    .addClass("enabled")
    .removeClass("disabled");
}

function disableAccessibilityButtons() {
  settingsChanged = false;

  $("#applyAccessibility")
    .prop("disabled", true)
    .addClass("disabled")
    .removeClass("enabled");

  $("#resetAccessibility")
    .prop("disabled", true)
    .addClass("disabled")
    .removeClass("enabled");
}

$(document).on("change", "#highContrastToggle", function () {
  enableAccessibilityButtons();
});

$("#resetAccessibility").on("click", function () {
  textSizeState = 1;
  lineHeightState = 1;
  letterSpacingState = 1;

  updateTextSizeUI();
  updateLineHeightUI();
  updateLetterSpacingUI();

  $("#highContrastToggle").prop("checked", false);

  $("body").css({
    fontSize: "",
    lineHeight: "",
    letterSpacing: "",
  });

  $("body").removeClass("high-contrast");

  localStorage.removeItem("accessibilitySettings");

  disableAccessibilityButtons();
});

function updateTextSizeUI() {
  const buttons = $(".setting-row").eq(0).find(".setting-controls button");

  buttons.removeClass("active");

  if (textSizeState === 0) {
    buttons.eq(1).addClass("active");
    buttons.eq(0).prop("disabled", true);
    buttons.eq(4).prop("disabled", false);
  } else if (textSizeState === 1) {
    buttons.eq(2).addClass("active");
    buttons.eq(0).prop("disabled", false);
    buttons.eq(4).prop("disabled", false);
  } else {
    buttons.eq(3).addClass("active");
    buttons.eq(0).prop("disabled", false);
    buttons.eq(4).prop("disabled", true);
  }
}

function updateLineHeightUI() {
  const buttons = $(".setting-row").eq(1).find(".setting-controls button");

  buttons.removeClass("active");

  if (lineHeightState === 0) {
    buttons.eq(1).addClass("active");
    buttons.eq(0).prop("disabled", true);
    buttons.eq(4).prop("disabled", false);
  } else if (lineHeightState === 1) {
    buttons.eq(2).addClass("active");
    buttons.eq(0).prop("disabled", false);
    buttons.eq(4).prop("disabled", false);
  } else {
    buttons.eq(3).addClass("active");
    buttons.eq(0).prop("disabled", false);
    buttons.eq(4).prop("disabled", true);
  }
}

function updateLetterSpacingUI() {
  const buttons = $(".setting-row").eq(2).find(".setting-controls button");

  buttons.removeClass("active");

  if (letterSpacingState === 0) {
    buttons.eq(1).addClass("active");
    buttons.eq(0).prop("disabled", true);
    buttons.eq(4).prop("disabled", false);
  } else if (letterSpacingState === 1) {
    buttons.eq(2).addClass("active");
    buttons.eq(0).prop("disabled", false);
    buttons.eq(4).prop("disabled", false);
  } else {
    buttons.eq(3).addClass("active");
    buttons.eq(0).prop("disabled", false);
    buttons.eq(4).prop("disabled", true);
  }
}

$(document).on("click", ".increase-font", function () {
  if (textSizeState < 2) {
    textSizeState++;
    updateTextSizeUI();
    enableAccessibilityButtons();
    saveAccessibilitySettings();
  }
});

$(document).on("click", ".decrease-font", function () {
  if (textSizeState > 0) {
    textSizeState--;
    updateTextSizeUI();
    enableAccessibilityButtons();
    saveAccessibilitySettings();
  }
});

$(document).on("click", ".increase-line", function () {
  if (lineHeightState < 2) {
    lineHeightState++;
    updateLineHeightUI();
    enableAccessibilityButtons();
    saveAccessibilitySettings();
  }
});

$(document).on("click", ".decrease-line", function () {
  if (lineHeightState > 0) {
    lineHeightState--;
    updateLineHeightUI();
    enableAccessibilityButtons();
    saveAccessibilitySettings();
  }
});

$(document).on("click", ".increase-spacing", function () {
  if (letterSpacingState < 2) {
    letterSpacingState++;
    updateLetterSpacingUI();
    enableAccessibilityButtons();
    saveAccessibilitySettings();
  }
});

$(document).on("click", ".decrease-spacing", function () {
  if (letterSpacingState > 0) {
    letterSpacingState--;
    updateLetterSpacingUI();
    enableAccessibilityButtons();
    saveAccessibilitySettings();
  }
});

function saveAccessibilitySettings() {
  const settings = {
    textSizeState: textSizeState,
    lineHeightState: lineHeightState,
    letterSpacingState: letterSpacingState,
    highContrast: $("#highContrastToggle").is(":checked"),
  };
  localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
}

$(document).on("click", ".copy-contact", function (e) {
  e.stopPropagation();
  e.preventDefault();

  const value = $(this).siblings("span").text().trim();
  const $icon = $(this);

  function copySuccess() {
    $icon.html('<i class="copy-icon" data-lucide="check"></i>');
    lucide.createIcons();
    setTimeout(() => {
      $icon.html('<span class="copy-icon material-icons">content_copy</span>');
      lucide.createIcons();
    }, 500);
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(copySuccess);
  } else {
    const $temp = $("<textarea>")
      .val(value)
      .addClass("copy-content-textarea")
      .appendTo("body");
    $temp.select();
    document.execCommand("copy");
    $temp.remove();
    copySuccess();
  }
});

$(".getInTouchBtn").on("click", function (e) {
  e.stopPropagation();
  $(".getTouchDropdown").toggleClass("show");
});

$(document).on("click", function (e) {
  if (
    !$(e.target).closest(".getTouchDropdown").length &&
    !$(e.target).closest(".getInTouchBtn").length
  ) {
    $(".getTouchDropdown").removeClass("show");
  }
});

$(".getInTouchBtnMenu").on("click", function (e) {
  e.stopPropagation();
  $(".getTouchDropdownMenu").toggleClass("show");
});

$(document).on("click", function (e) {
  if (
    !$(e.target).closest(".getTouchDropdownMenu").length &&
    !$(e.target).closest(".getInTouchBtnMenu").length
  ) {
    $(".getTouchDropdownMenu").removeClass("show");
  }
});

// Toast.js
$(document).on("click", ".download-btn", function (e) {
  e.preventDefault();
  e.stopPropagation();

  const btn = $(this);

  btn.find(".download-loader").removeClass("d-none");
  btn.find("i, #download-text, #download-icon").hide();

  setTimeout(function () {
    btn.find(".download-loader").addClass("d-none");
    btn.find("i, #download-text, #download-icon").show();

    showToast(
      "success",
      "Download successful",
      "Sanction letter document has been downloaded successfully",
    );
  }, 1500);
});

function showToast(type, title, message) {
  const $toast = $("#downloadToast");

  if (!$toast.length) {
    console.error("Toast element not found!");
    return;
  }

  const iconName = type === "success" ? "check-circle" : "x-circle";

  $toast.removeClass("success error").addClass(type);
  $toast.find(".toast-title").text(title);
  $toast.find(".toast-message").text(message);

  const $iconContainer = $toast.find(".toast-icon");
  $iconContainer.empty();
  $iconContainer.html(
    `<i data-lucide="${iconName}" class="toast-icon-svg"></i>`,
  );

  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }

  $toast.stop(true, true).css("opacity", 0).show();
  $("#downloadToast").addClass("toast-flex");

  $toast
    .animate({ opacity: 1 }, 300)
    .delay(3000)
    .fadeOut(300, function () {
      $(this).removeClass("toast-flex");
    });
}

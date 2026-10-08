"use strict";

jQuery(function ($) {
  const TOAST_DURATION_MS = 2500;
  const VIEW_MORE_ICON =
    ' <i class="material-symbols-outlined view-more-icon">keyboard_arrow_down</i>';
  const PIN_STORAGE_KEY = "dealerPinnedState";
  const PAGE_STORAGE_KEY = "activeDashboardPage";

  const PIN_SORT_TARGETS = [
    { body: "#dealerTableBody", row: ".dealer-row" },
    { body: "#newDealerPage .dealer-table-view tbody", row: "tr" },
    { body: "#txnTableBody", row: ".txn-row" },
    { body: "#txnTableViewBody", row: "tr" },
    { body: "#renewalTableBody", row: ".renewal-row" },
    { body: "#renewalTableViewBody", row: "tr" },
  ];

  /* TODO(backend): replace with the logged-in user's saved emails */
  const SHARE_SAVED_EMAILS = ["harish.sharma@gmail.com"];

  const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

  const CAL_MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const CAL_WEEK = ["S", "M", "T", "W", "T", "F", "S"]
    .map(function (d) {
      return "<b>" + d + "</b>";
    })
    .join("");
  const TXN_DAYS_LIMIT = { "0-15": 15, "1-month": 30, "3-months": 90 };

  const LEAD_STATUSES = ["actioned", "sanctioned", "rejected"];
  const STAGE_FILTERS = ["current-account", "esign", "limit-setup"];

  const MENU_ROUTES = {
    "analytics dashboard": "dashboard",
    "new dealer leads": "newdealer",
    "transaction dashboard": "transaction",
    "renewal details": "renewal",
  };

  const VIEW_DETAILS_ROUTES = {
    "sanction across active dealers": "transaction",
    "new dealer leads": "newdealer",
    "renewal summary": "renewal",
  };

  function escapeHtml(value) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return String(value).replace(/[&<>"']/g, function (ch) {
      return map[ch];
    });
  }

  function parseCurrency(str) {
    return parseFloat(String(str).replace(/[₹,]/g, "")) || 0;
  }

  function formatAmountMarkup(amount) {
    return escapeHtml(amount).replace(
      /\.(\d{2})$/,
      '<span class="txn-paise">.$1</span>',
    );
  }

  function wrapPaise($cell) {
    if (!$cell.length || $cell.find(".txn-paise").length) return;
    $cell.html(formatAmountMarkup($cell.text().trim()));
  }

  function setActive($items, $activeItem) {
    const active = $activeItem && $activeItem.length ? $activeItem[0] : null;
    $items.each(function () {
      $(this).toggleClass("active", this === active);
    });
  }

  function bindClick(id, handler) {
    $("#" + id).on("click", handler);
  }

  function getFirstTextNode($el, skipBlank) {
    return $el.contents().filter(function () {
      return (
        this.nodeType === Node.TEXT_NODE &&
        (!skipBlank || this.textContent.trim() !== "")
      );
    })[0];
  }

  function setCssVar(el, name, value) {
    el.style.setProperty(name, value);
  }

  function getBadgeStatus($el) {
    return (
      LEAD_STATUSES.find(function (name) {
        return $el.hasClass(name);
      }) || ""
    );
  }

  function initDropdownMenu($button, $menu) {
    if (!$button.length || !$menu.length) return;

    $button.on("click", function (event) {
      event.stopPropagation();
      $menu.toggleClass("show open");
    });

    $(document).on("click", function () {
      $menu.removeClass("show open");
    });
  }

  const TOAST_ICONS = {
    success: "check_circle",
    error: "error",
    warning: "warning",
  };

  function showAppToast(message, type, subText) {
    const $toast = $("#appToast");
    if (!$toast.length) return;

    $toast
      .toggleClass("error", type === "error")
      .toggleClass("warning", type === "warning")
      .toggleClass("has-sub", Boolean(subText));
    $("#appToastIcon .app-toast-glyph").text(
      TOAST_ICONS[type] || TOAST_ICONS.success,
    );
    $("#appToastText").text(message);
    $("#appToastSub").text(subText || "");

    $toast.addClass("show");
    clearTimeout($toast.data("hideTimer"));
    $toast.data(
      "hideTimer",
      setTimeout(function () {
        $toast.removeClass("show");
      }, TOAST_DURATION_MS),
    );
  }

  const dealerCellLabels = {
    2: "Dealer details",
    3: "Association with corporate",
    4: "Sales to dealer (last 12 M)",
    5: "Loan offer",
    7: "Sanction status",
  };

  const dealerStages = {
    "Zenith Steel Traders": "apply",
    "SunDesh Systems Pvt. Ltd": "apply",
    "Chauhan Traders": "current-account",
    "Polychem Global": "rejected",
    TechGlobal: "esign",
    "Trader Groups": "limit-setup",
  };

  const commonDealerDetails = {
    dealerId: "CLB-00000000-4563-PRO",
    chequeReturns: "0 (Last 12 M)",
    uploadedBy: "ICICI Bank",
    leadDate: "07 Jul '26",
  };

  const dealerDetails = {
    "Zenith Steel Traders": $.extend({}, commonDealerDetails, {
      vintage: "12 years",
      overdue: "0 (7D +)",
      recommendation: "₹70,00,000.00",
    }),
    "SunDesh Systems Pvt. Ltd": $.extend({}, commonDealerDetails, {
      vintage: "14 years",
      overdue: "1 (7D +)",
      recommendation: "₹65,00,000.00",
    }),
    "Chauhan Traders": $.extend({}, commonDealerDetails, {
      vintage: "15 years",
      uploadedBy: "Anchor corporate",
      overdue: "0 (7D +)",
      recommendation: "₹80,00,000.00",
    }),
    "Polychem Global": $.extend({}, commonDealerDetails, {
      vintage: "16 years",
      overdue: "2 (7D +)",
      recommendation: "₹90,00,000.00",
    }),
    TechGlobal: $.extend({}, commonDealerDetails, {
      vintage: "16 years",
      overdue: "0 (7D +)",
      recommendation: "₹90,00,000.00",
    }),
    "Trader Groups": $.extend({}, commonDealerDetails, {
      vintage: "16 years",
      overdue: "0 (7D +)",
      recommendation: "₹90,00,000.00",
    }),
  };

  const progressSteps = [
    { key: "loan-offer", label: "Loan offer" },
    { key: "apply", label: "Apply" },
    { key: "sanction", label: "Sanction" },
    { key: "current-account", label: "Current account" },
    { key: "esign", label: "eSign" },
    { key: "limit-setup", label: "Limit setup" },
  ];

  const stageIndex = {
    "loan-offer": 0,
    apply: 1,
    sanction: 2,
    "current-account": 3,
    esign: 4,
    "limit-setup": 5,
  };

  const rejectedLabels = {
    apply: "Applied",
    sanction: "Application rejected",
  };

  /* TODO(backend): remove once the API returns real tranches */
  function generateDummyTranches(count, seedId) {
    const types = [
      "Principal",
      "Interest amount",
      "Processing fee",
      "Penal charges",
      "GST",
    ];
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push({
        id: "S" + (1890880 + seedId * 10 + i),
        date: "0" + ((i % 9) + 1) + " Jan '26",
        type: types[i % types.length],
        amount: "₹" + ((i + 1) * 25000).toLocaleString("en-IN") + ".00",
        due: "1" + (i % 9) + " Feb '26",
      });
    }
    return list;
  }

  /* TODO(backend): replace with API data */
  const transactionData = [
    //adding some json to check the scrolling
    {
      firm: "BluePeak Distributors",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹95,00,000.00",
      utilized: "₹65,00,000.00",
      utilizedPct: "68.42%",
      available: "₹30,00,000.00",
      availablePct: "31.58%",
      openTxns: 7,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(7, 0),
    },
    {
      firm: "SunDesh Systems Pvt. Ltd",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "unfreeze",
      sanction: "₹78,60,000.00",
      utilized: "₹56,40,000.00",
      utilizedPct: "71.76%",
      available: "₹22,20,000.00",
      availablePct: "28.24%",
      openTxns: 4,
      overdueAmount: "-",
      days: "4 days",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(4, 1),
    },
    {
      firm: "Chauhan Traders",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "unfreeze",
      sanction: "₹86,00,000.00",
      utilized: "₹62,00,000.00",
      utilizedPct: "72.09%",
      available: "₹24,00,000.00",
      availablePct: "27.91%",
      openTxns: 3,
      overdueAmount: "-",
      days: "6 days",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(3, 3),
    },
    {
      firm: "Polychem Global",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹93,00,000.00",
      utilized: "₹65,00,000.00",
      utilizedPct: "69.89%",
      available: "₹28,00,000.00",
      availablePct: "30.11%",
      openTxns: 5,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(5, 4),
    },
    {
      firm: "Kartikey Corporationsutio...",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹85,50,000.00",
      utilized: "₹63,50,000.00",
      utilizedPct: "74.71%",
      available: "₹22,00,000.00",
      availablePct: "25.88%",
      openTxns: 3,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(3, 5),
    },
    {
      firm: "BluePeak Distributors",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹95,00,000.00",
      utilized: "₹65,00,000.00",
      utilizedPct: "68.42%",
      available: "₹30,00,000.00",
      availablePct: "31.58%",
      openTxns: 7,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(7, 0),
    },
    {
      firm: "SunDesh Systems Pvt. Ltd",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "unfreeze",
      sanction: "₹78,60,000.00",
      utilized: "₹56,40,000.00",
      utilizedPct: "71.76%",
      available: "₹22,20,000.00",
      availablePct: "28.24%",
      openTxns: 4,
      overdueAmount: "-",
      days: "4 days",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(4, 1),
    },
    {
      firm: "Chauhan Traders",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "unfreeze",
      sanction: "₹86,00,000.00",
      utilized: "₹62,00,000.00",
      utilizedPct: "72.09%",
      available: "₹24,00,000.00",
      availablePct: "27.91%",
      openTxns: 3,
      overdueAmount: "-",
      days: "6 days",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(3, 3),
    },
    {
      firm: "Polychem Global",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹93,00,000.00",
      utilized: "₹65,00,000.00",
      utilizedPct: "69.89%",
      available: "₹28,00,000.00",
      availablePct: "30.11%",
      openTxns: 5,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(5, 4),
    },
    {
      firm: "Kartikey Corporationsutio...",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹85,50,000.00",
      utilized: "₹63,50,000.00",
      utilizedPct: "74.71%",
      available: "₹22,00,000.00",
      availablePct: "25.88%",
      openTxns: 3,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(3, 5),
    },
    {
      firm: "BluePeak Distributors",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹95,00,000.00",
      utilized: "₹65,00,000.00",
      utilizedPct: "68.42%",
      available: "₹30,00,000.00",
      availablePct: "31.58%",
      openTxns: 7,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(7, 0),
    },
    {
      firm: "SunDesh Systems Pvt. Ltd",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "unfreeze",
      sanction: "₹78,60,000.00",
      utilized: "₹56,40,000.00",
      utilizedPct: "71.76%",
      available: "₹22,20,000.00",
      availablePct: "28.24%",
      openTxns: 4,
      overdueAmount: "-",
      days: "4 days",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(4, 1),
    },
    {
      firm: "Chauhan Traders",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "unfreeze",
      sanction: "₹86,00,000.00",
      utilized: "₹62,00,000.00",
      utilizedPct: "72.09%",
      available: "₹24,00,000.00",
      availablePct: "27.91%",
      openTxns: 3,
      overdueAmount: "-",
      days: "6 days",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(3, 3),
    },
    {
      firm: "Polychem Global",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹93,00,000.00",
      utilized: "₹65,00,000.00",
      utilizedPct: "69.89%",
      available: "₹28,00,000.00",
      availablePct: "30.11%",
      openTxns: 5,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(5, 4),
    },
    {
      firm: "Kartikey Corporationsutio...",
      code: "T1H2E3M66",
      scfAccount: "2145 2145 2145",
      status: "freeze",
      sanction: "₹85,50,000.00",
      utilized: "₹63,50,000.00",
      utilizedPct: "74.71%",
      available: "₹22,00,000.00",
      availablePct: "25.88%",
      openTxns: 3,
      overdueAmount: "₹40,000.00",
      days: "overdue",
      caseType: "Digital",
      acExpiry: "01 Jul '26",
      tranches: generateDummyTranches(3, 5),
    },
  ];

  //  NEW DEALER LEADS - STATE & LOOKUPS

  const $newDealerPage = $("#newDealerPage");
  const $hideDetailsBtn = $("#hideDetailsBtn");
  const $searchInput = $("#dealerSearchInput");
  const $menuItems = $("#menuPanel .menu-list .menu-item");

  let $dealerRows = $("#newDealerPage .new-dealer-table .dealer-row");

  let detailsHidden = true;
  let activeFilter = "all";

  const leadSelection = new Set();

  let modalFilters = {
    sanction: "all",
    application: "all",
    loanFrom: null,
    loanTo: null,
    firms: [],
    leadTypes: [],
    uploadedBy: [],
  };

  function getDealerName($row) {
    return $row.find(".dealer-firm strong").first().text().trim();
  }

  function getRobustFirmName($container) {
    if (!$container || !$container.length) return "";
    const $clone = $container.first().clone();
    $clone.find(".table-firm-code").first().remove();
    return $clone.text().replace(/\s+/g, " ").trim();
  }

  function getGridFirmName($tRow) {
    return getRobustFirmName($tRow.find(".table-firm-name").first());
  }

  function getDealerStage($row) {
    return dealerStages[getDealerName($row)] || "apply";
  }

  function findDealerRow(dealerName) {
    return $dealerRows
      .filter(function () {
        return getDealerName($(this)) === dealerName;
      })
      .first();
  }

  function initDealerAmounts() {
    $("#dealerTableBody .dealer-row").each(function () {
      const $cells = $(this).children();
      wrapPaise($cells.eq(3));
      wrapPaise($cells.eq(4));
    });
    $("#newDealerPage .dealer-table-view tbody tr").each(function () {
      wrapPaise($(this).children().eq(8));
    });
  }

  function applyDealerCellLabels() {
    $dealerRows.each(function () {
      const $cells = $(this).children();
      $.each(dealerCellLabels, function (position, label) {
        $cells.eq(position - 1).attr("data-label", label);
      });
    });
  }

  function prepareContactIcons() {
    $(".dealer-contact span").each(function () {
      const $el = $(this);
      const original = $el.text().trim();
      if (!original) return;

      if (original.indexOf("☎") === 0) {
        $el.attr("data-icon", "phone");
        $el.attr("data-value", original.replace("☎", "").trim());
      } else {
        $el.attr("data-value", original);
      }
    });

    $(".dealer-contact small").each(function () {
      const $el = $(this);
      $el.attr("data-value", $el.text().trim().replace("✉", "").trim());
    });
  }

  function maskPhone(value) {
    const v = value.trim();
    const m = v.match(/^(\+\d{1,3}\s?)(\d+)$/);
    if (!m) return v;
    const num = m[2];
    return m[1] + "x".repeat(Math.max(num.length - 2, 4)) + num.slice(-2);
  }

  function maskEmail(value) {
    const v = value.trim();
    const parts = v.split("@");
    if (parts.length < 2) return v;

    const local = parts[0];
    const domain = parts[1];
    const maskedLocal =
      local.slice(0, 3) + "x".repeat(Math.max(local.length - 3, 6));
    const dotIndex = domain.lastIndexOf(".");
    const tld = dotIndex !== -1 ? domain.slice(dotIndex) : "";
    return maskedLocal + "@xxxx" + tld;
  }

  function maskPAN(value) {
    const v = value.replace(/^PAN:\s*/i, "").trim();
    return "x".repeat(Math.max(v.length - 2, 6)) + v.slice(-2);
  }

  function maskCodeValue(value) {
    const v = value.trim();
    return "x".repeat(Math.max(v.length - 3, 3)) + v.slice(-3);
  }

  function maskAccountNumber(value) {
    const v = value.trim();
    const parts = v.split(/\s+/);
    if (parts.length < 2) {
      return "x".repeat(Math.max(v.length - 4, 4)) + v.slice(-4);
    }
    return parts
      .map(function (part, i) {
        if (i === parts.length - 1) {
          return "x".repeat(Math.max(part.length - 3, 1)) + part.slice(-3);
        }
        return "x".repeat(part.length);
      })
      .join(" ");
  }

  function maskDealerId(value) {
    const v = value.trim();
    const parts = v.split("-");
    if (parts.length < 2) return v;
    return parts
      .map(function (part, i) {
        return i === 0 ? part : "x".repeat(part.length);
      })
      .join("-");
  }

  function toggleTextMask($el, isHidden, maskFn) {
    if (isHidden) {
      let original = $el.attr("data-original");
      if (!original) {
        original = $el.text().trim();
        $el.attr("data-original", original);
      }
      $el.text(maskFn(original));
    } else if ($el.attr("data-original")) {
      $el.text($el.attr("data-original"));
    }
  }

  function toggleValueMask($el, isHidden, maskFn) {
    if (isHidden) {
      const original = $el.attr("data-original") || $el.attr("data-value");
      $el.attr("data-original", original);
      $el.attr("data-value", maskFn(original));
    } else if ($el.attr("data-original")) {
      $el.attr("data-value", $el.attr("data-original"));
    }
  }

  function maskGridColumns($rows, columns, isHidden) {
    $rows.each(function () {
      const $cells = $(this).children();
      columns.forEach(function (column) {
        const $cell = $cells.eq(column.index);
        if ($cell.length) toggleTextMask($cell, isHidden, column.maskFn);
      });
    });
  }

  function updateHideButtonUI($btn, isHidden) {
    if (!$btn.length) return;

    const labelText = isHidden ? "Show details" : "Hide details";
    const $label = $btn.find(".hide-details-label").first();
    const $eye = $btn.find(".hide-details-eye").first();

    if ($label.length) {
      $label.text(labelText);
    } else {
      const textNode = getFirstTextNode($btn, true);
      if (textNode) textNode.textContent = labelText + " ";
    }

    if ($eye.length) $eye.text(isHidden ? "visibility" : "visibility_off");
  }

  function applyDealerMasking(isHidden) {
    $("#newDealerPage .dealer-contact span[data-value]").each(function () {
      toggleValueMask($(this), isHidden, maskPhone);
    });

    $("#newDealerPage .dealer-contact small[data-value]").each(function () {
      toggleValueMask($(this), isHidden, maskEmail);
    });

    $("#newDealerPage .dealer-association small").each(function () {
      toggleTextMask($(this), isHidden, function (v) {
        return "PAN: " + maskPAN(v);
      });
    });

    $("#newDealerPage .code-value").each(function () {
      toggleTextMask($(this), isHidden, maskCodeValue);
    });

    $("#newDealerPage .dealer-detail-item").each(function () {
      const $item = $(this);
      const $label = $item.find("span").first();
      const $value = $item.find("strong").first();
      if (
        $label.length &&
        $value.length &&
        $label.text().trim() === "Dealer ID"
      ) {
        toggleTextMask($value, isHidden, maskDealerId);
      }
    });

    maskGridColumns(
      $("#newDealerPage .dealer-table-view tbody tr"),
      [
        { index: 5, maskFn: maskPhone },
        { index: 6, maskFn: maskEmail },
        { index: 7, maskFn: maskPAN },
      ],
      isHidden,
    );
  }

  function applyTxnMasking(isHidden) {
    $("#transactionDashboardPage .code-value").each(function () {
      toggleTextMask($(this), isHidden, maskCodeValue);
    });

    $(".txn-scf-account").each(function () {
      toggleTextMask($(this), isHidden, maskAccountNumber);
    });
  }

  function applyRenewalMasking(isHidden) {
    $("#renewalDetailsPage .dealer-contact span[data-value]").each(function () {
      toggleValueMask($(this), isHidden, maskPhone);
    });

    $("#renewalDetailsPage .dealer-contact small[data-value]").each(
      function () {
        toggleValueMask($(this), isHidden, maskEmail);
      },
    );

    $("#renewalDetailsPage .pan-value").each(function () {
      toggleTextMask($(this), isHidden, maskPAN);
    });

    $("#renewalDetailsPage .id-value").each(function () {
      toggleTextMask($(this), isHidden, maskDealerId);
    });

    maskGridColumns(
      $("#renewalDetailsPage .renewal-table-view tbody tr"),
      [
        { index: 3, maskFn: maskPhone },
        { index: 4, maskFn: maskEmail },
        { index: 5, maskFn: maskPAN },
      ],
      isHidden,
    );
  }

  function applyAllMasking(isHidden) {
    applyDealerMasking(isHidden);
    applyTxnMasking(isHidden);
    applyRenewalMasking(isHidden);
    updateHideButtonUI($("#hideDetailsBtn"), isHidden);
    updateHideButtonUI($("#txnHideDetailsBtn"), isHidden);
    updateHideButtonUI($("#renewalHideDetailsBtn"), isHidden);
  }

  function setDetailsHidden(isHidden) {
    detailsHidden = isHidden;
    $newDealerPage.toggleClass("details-hidden", isHidden);
    $hideDetailsBtn.toggleClass("is-hidden-state", isHidden);
    applyAllMasking(isHidden);
  }

  function getProgressState(stage, stepKey) {
    if (stage === "rejected") {
      if (stepKey === "loan-offer" || stepKey === "apply") return "completed";
      if (stepKey === "sanction") return "rejected";
      return "pending";
    }

    const currentIndex = stageIndex[stage] ?? 1;
    const stepIndex = stageIndex[stepKey];

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "pending";
  }

  function getConnectorClass(state, nextState) {
    if (state !== "completed") return "";
    if (nextState === "completed" || nextState === "current")
      return "is-complete";
    if (nextState === "rejected") return "is-rejected";
    return "";
  }

  function getProgressNodeMarkup(state, index) {
    if (state === "completed")
      return '<span class="dealer-progress-check"></span>';
    if (state === "rejected")
      return '<span class="dealer-progress-alert"></span>';
    return '<span class="dealer-progress-number">' + (index + 1) + "</span>";
  }

  function getProgressMarkup(stage) {
    const states = progressSteps.map(function (step) {
      return getProgressState(stage, step.key);
    });

    const stepsMarkup = progressSteps
      .map(function (step, index) {
        const state = states[index];
        const isLast = index === progressSteps.length - 1;
        const label =
          (stage === "rejected" && rejectedLabels[step.key]) || step.label;
        const connectorClass = getConnectorClass(state, states[index + 1]);

        return `
          <div class="dealer-progress-step ${state}">
            <div class="dealer-progress-node">${getProgressNodeMarkup(state, index)}</div>
            <span class="dealer-progress-label">${label}</span>
            ${isLast ? "" : `<span class="dealer-progress-connector ${connectorClass}"></span>`}
          </div>
        `;
      })
      .join("");

    return `
      <div class="dealer-progress">
        <div class="dealer-progress-track">${stepsMarkup}</div>
      </div>
    `;
  }

  function getDetailItemMarkup(label, valueHtml, extraClass) {
    return `
      <div class="dealer-detail-item  ${extraClass || ""}">
        <span>${label}</span>
        <strong>${valueHtml}</strong>
      </div>
    `;
  }

  function formatDetailValue(value) {
    return escapeHtml(value).replace(
      /\s*\((.*?)\)/,
      '<span class="dealer-detail-muted">($1)</span>',
    );
  }

  function createDealerDetailRow($row) {
    const dealerName = getDealerName($row);
    const stage = getDealerStage($row);
    const details =
      dealerDetails[dealerName] || dealerDetails["Zenith Steel Traders"];
    const leadType = $row.attr("data-lead-type") === "old" ? "Old" : "Fresh";

    const $detailRow = $("<tr>", { class: "dealer-details-row" }).attr(
      "data-dealer-details-for",
      dealerName,
    );

    $detailRow.html(`
      <td colspan="8">
        <div class="dealer-detail-panel">

          <div class="dealer-detail-info">
            ${getDetailItemMarkup("Lead type", escapeHtml(leadType), "dealer-detail-item--mobile-only")}
            ${getDetailItemMarkup("Dealer ID", escapeHtml(details.dealerId))}
            ${getDetailItemMarkup("Cheque returns", formatDetailValue(details.chequeReturns))}
            ${getDetailItemMarkup("Business vintage", escapeHtml(details.vintage))}
            ${getDetailItemMarkup("Instances of overdue", formatDetailValue(details.overdue), "dealer-detail-item--end")}
            ${getDetailItemMarkup("Recommendation limit", formatAmountMarkup(details.recommendation), "dealer-detail-item--end")}
            ${getDetailItemMarkup("Uploaded by", getUploadedByMarkup(dealerName, details.uploadedBy))}
            ${getDetailItemMarkup("Lead date", escapeHtml(details.leadDate))}
          </div>

          ${getProgressMarkup(stage)}

          <div class="dealer-detail-footer">
            <div class="table-action">
              <button type="button" class="table-edit-btn" title="Edit"></button>
              <button type="button" class="table-delete-btn" title="Delete"></button>
            </div>
            <button type="button" class="dealer-collapse-btn">View less</button>
          </div>

        </div>
      </td>
    `);

    $detailRow.find(".dealer-collapse-btn").on("click", function () {
      toggleDealerRow($row);
    });

    return $detailRow;
  }

  function initializeDetailRows() {
    $dealerRows.each(function () {
      const $row = $(this);
      if ($row.next().hasClass("dealer-details-row")) return;

      $row.after(createDealerDetailRow($row));
    });
  }

  function closeAllDealerDetails() {
    $dealerRows.each(function () {
      const $row = $(this);
      $row.removeClass("is-expanded");
      $row.next(".dealer-details-row").removeClass("is-visible");
    });
  }

  function toggleDealerRow($row) {
    const wasExpanded = $row.hasClass("is-expanded");
    closeAllDealerDetails();
    if (wasExpanded) return;

    $row.addClass("is-expanded");
    $row.next(".dealer-details-row").addClass("is-visible");
  }

  function initRowExpansion() {
    $dealerRows.each(function () {
      const $row = $(this);
      const $expandButton = $row.find(".dealer-expand-btn").first();
      if (!$expandButton.length) return;

      $expandButton.on("click", function (event) {
        event.stopPropagation();
        toggleDealerRow($row);
      });
    });
  }

  function getStatusTooltip(status, stage) {
    if (status === "actioned")
      return "The dealer has not started the application process yet.";
    if (status === "rejected")
      return "The application has been rejected by the bank.";

    if (status === "sanctioned") {
      if (stage === "current-account")
        return "The application has been sanctioned and is pending for current account.";
      if (stage === "esign")
        return "The application has been sanctioned and is pending for eSign.";
      if (stage === "limit-setup")
        return "The application has been sanctioned and is pending for limit setup.";
      return "The application has been sanctioned.";
    }

    return "";
  }

  function initStatusTooltips() {
    $dealerRows.each(function () {
      const $row = $(this);
      $row
        .find(".dealer-status small")
        .first()
        .attr(
          "data-tooltip",
          getStatusTooltip($row.attr("data-status"), getDealerStage($row)),
        );
    });

    $("#newDealerPage .dealer-table-view tbody tr").each(function () {
      const $tRow = $(this);
      const $statusEl = $tRow.find(".table-status").first();
      const $infoIcon = $tRow.find(".table-status small").first();
      if (!$statusEl.length || !$infoIcon.length) return;

      const stage = dealerStages[getGridFirmName($tRow)] || "apply";

      $infoIcon.attr(
        "data-tooltip",
        getStatusTooltip(getBadgeStatus($statusEl), stage),
      );
    });
  }

  function renderFirmOptions($panel, firms) {
    if (!$panel.length) return;
    $panel.empty();

    firms.forEach(function (firm) {
      const $checkbox = $("<input>", {
        type: "checkbox",
        value: firm.name,
      }).attr("data-label", firm.name);
      const $meta = $("<small>").text(firm.meta);
      const $text = $("<span>").text(firm.name).append($meta);
      $panel.append($("<label>").append($checkbox, $text));
    });
  }

  function getOptionLabel($input) {
    return $input.attr("data-label") || $input.closest("label").text().trim();
  }

  function updateDropdownSummary($dropdown) {
    const $inputs = $dropdown.find(
      ".dealer-filter-dropdown-panel input[type='checkbox']",
    );
    const $allBox = $inputs
      .filter(function () {
        return this.value === "all";
      })
      .first();
    const picked = $inputs
      .filter(function () {
        return this.checked && this.value !== "all";
      })
      .map(function () {
        return getOptionLabel($(this));
      })
      .get();
    const summary =
      $allBox.length && $allBox.prop("checked") ? "All" : picked.join(", ");

    const $searchField = $dropdown
      .find(".dealer-filter-search-input input")
      .first();
    if ($searchField.length) {
      $searchField.val(summary);
      return;
    }

    const $button = $dropdown.find(".dealer-filter-dropdown-btn").first();
    if (!$button.length) return;

    const textNode = getFirstTextNode($button);
    if (textNode)
      textNode.textContent =
        (summary || $dropdown.attr("data-default-text")) + " ";
  }

  function closeFilterDropdown($dropdown) {
    $dropdown.removeClass("open");
    $dropdown.find(".dealer-filter-dropdown-panel label").show();
    updateDropdownSummary($dropdown);
  }

  function resetFilterDropdown($dropdown) {
    const $inputs = $dropdown.find(
      ".dealer-filter-dropdown-panel input[type='checkbox']",
    );
    const hasAll =
      $inputs.filter(function () {
        return this.value === "all";
      }).length > 0;
    $inputs.prop("checked", hasAll);
    updateDropdownSummary($dropdown);
  }

  function getActivePillValue(selector) {
    const $active = $(selector + " .active").first();
    return $active.length ? $active.attr("data-value") : "all";
  }

  function getCheckedValues(selector) {
    return $(selector + " input[type='checkbox']:checked")
      .map(function () {
        return this.value;
      })
      .get()
      .filter(function (value) {
        return value !== "all";
      });
  }

  function initFilterDropdowns() {
    $(".dealer-filter-dropdown").each(function () {
      const $dropdown = $(this);
      const $trigger = $dropdown
        .find(".dealer-filter-dropdown-btn, .dealer-filter-search-input")
        .first();
      const $panel = $dropdown.find(".dealer-filter-dropdown-panel").first();
      if (!$trigger.length || !$panel.length) return;

      const isSearch = $trigger.hasClass("dealer-filter-search-input");
      const $button = $dropdown.find(".dealer-filter-dropdown-btn").first();
      if ($button.length) {
        const textNode = getFirstTextNode($button);
        $dropdown.attr(
          "data-default-text",
          textNode ? textNode.textContent.trim() : "",
        );
      }

      const $allBox = $panel.find("input[value='all']").first();
      if ($allBox.length && $allBox.prop("checked")) {
        $panel.find("input[type='checkbox']").prop("checked", true);
      }

      $trigger.on("click", function (event) {
        event.stopPropagation();

        $(".dealer-filter-dropdown.open").each(function () {
          if (this !== $dropdown[0]) closeFilterDropdown($(this));
        });

        if (isSearch && !$(event.target).closest("span").length) {
          $dropdown.addClass("open");
        } else if ($dropdown.hasClass("open")) {
          closeFilterDropdown($dropdown);
        } else {
          $dropdown.addClass("open");
        }
      });

      $panel.on("click", function (event) {
        event.stopPropagation();
      });

      $panel.on("change", function (event) {
        const changed = event.target;
        if (changed.type !== "checkbox") return;

        const $inputs = $panel.find("input[type='checkbox']");
        const $all = $inputs
          .filter(function () {
            return this.value === "all";
          })
          .first();

        if ($all.length) {
          if (changed === $all[0]) {
            $inputs.prop("checked", $all.prop("checked"));
          } else {
            $all.prop(
              "checked",
              $inputs
                .not($all)
                .toArray()
                .every(function (input) {
                  return input.checked;
                }),
            );
          }
        }

        updateDropdownSummary($dropdown);
      });

      updateDropdownSummary($dropdown);
    });

    $(document).on("click", function () {
      $(".dealer-filter-dropdown.open").each(function () {
        closeFilterDropdown($(this));
      });
    });
  }

  function initFirmSearch($input, $panel) {
    if (!$input.length || !$panel.length) return;

    $input.on("focus", function () {
      this.select();
    });
    $input.on("input", function () {
      const query = ($input.val() || "").trim().toLowerCase();
      $panel.find("label").each(function () {
        const $label = $(this);
        $label.toggle(!query || $label.text().toLowerCase().includes(query));
      });
    });
  }

  function initDealerFirmFilter() {
    const $panel = $("#firmDropdown .dealer-filter-dropdown-panel").first();

    renderFirmOptions(
      $panel,
      $dealerRows
        .map(function () {
          const $row = $(this);
          const code = $row.find(".dealer-firm small").first().text() || "";
          const pan =
            $row.find(".dealer-association small").first().text() || "";

          return {
            name: getDealerName($row),
            meta:
              "Dealer code: " +
              code.replace(/^Code:\s*/i, "").trim() +
              "\n" +
              pan.trim(),
          };
        })
        .get(),
    );

    initFirmSearch($("#firmSearchInput"), $panel);
  }

  function readModalFilters() {
    return {
      sanction: getActivePillValue("#sanctionStatusPills"),
      application: getActivePillValue("#applicationStatusPills"),
      loanFrom: parseFloat($("#loanOfferFrom").val()) || null,
      loanTo: parseFloat($("#loanOfferTo").val()) || null,
      firms: getCheckedValues("#firmDropdown"),
      leadTypes: getCheckedValues("#leadTypeDropdown"),
      uploadedBy: getCheckedValues("#uploadedByDropdown"),
    };
  }

  function initDealerFiltersModal() {
    const $openBtn = $("#dealerFiltersBtn");
    const $overlay = $("#dealerFiltersOverlay");
    const $closeBtn = $("#dealerFiltersClose");
    const $resetBtn = $("#dealerFiltersReset");
    const $applyBtn = $("#dealerFiltersApply");
    if (!$overlay.length) return;

    let appliedSnapshot = null;

    function syncApplyState() {
      if (!$applyBtn.length) return;
      $applyBtn.prop(
        "disabled",
        appliedSnapshot !== null &&
          JSON.stringify(readModalFilters()) === appliedSnapshot,
      );
    }

    function closeOverlay() {
      $overlay.removeClass("show");
    }

    $overlay.on("change input click", syncApplyState);

    $openBtn.on("click", function () {
      if (appliedSnapshot === null)
        appliedSnapshot = JSON.stringify(readModalFilters());
      $overlay.addClass("show");
      syncApplyState();
    });

    $closeBtn.on("click", closeOverlay);

    $overlay.on("click", function (event) {
      if (event.target === $overlay[0]) closeOverlay();
    });

    $overlay.find(".dealer-filter-pills").on("click", function (event) {
      const $pill = $(event.target).closest(".dealer-filter-pill");
      if (!$pill.length) return;
      setActive($(this).find(".dealer-filter-pill"), $pill);
    });

    $resetBtn.on("click", function () {
      $overlay.find(".dealer-filter-pills").each(function () {
        $(this)
          .find(".dealer-filter-pill")
          .each(function (index) {
            $(this).toggleClass("active", index === 0);
          });
      });

      $("#loanOfferFrom, #loanOfferTo").val("");

      $overlay.find(".dealer-filter-dropdown").each(function () {
        resetFilterDropdown($(this));
      });
    });

    $applyBtn.on("click", function () {
      modalFilters = readModalFilters();
      appliedSnapshot = JSON.stringify(modalFilters);

      closeAllDealerDetails();
      applyCurrentView();
      closeOverlay();
      showAppToast("Filters applied successfully");
    });
  }

  function matchesModalFilters(dealerName) {
    const f = modalFilters;

    if (f.firms.length && !f.firms.includes(dealerName)) return false;

    const $listRow = findDealerRow(dealerName);
    if (!$listRow.length) return true;

    const stage = getDealerStage($listRow);
    const status = $listRow.attr("data-status");
    const loanValue = parseCurrency($listRow.children().eq(4).text());
    const uploadedBy = (dealerDetails[dealerName] || {}).uploadedBy || "";
    const uploadedKey = /icici/i.test(uploadedBy) ? "icici" : "anchor";

    const matchSanction = f.sanction === "all" || status === f.sanction;
    const matchApplication =
      f.application === "all" ||
      (f.application === "pending" && stage === "apply") ||
      stage === f.application ||
      status === f.application;
    const matchLoan =
      (f.loanFrom === null || loanValue >= f.loanFrom) &&
      (f.loanTo === null || loanValue <= f.loanTo);
    const matchLead =
      !f.leadTypes.length ||
      f.leadTypes.includes($listRow.attr("data-lead-type"));
    const matchUploader =
      !f.uploadedBy.length || f.uploadedBy.includes(uploadedKey);

    return (
      matchSanction &&
      matchApplication &&
      matchLoan &&
      matchLead &&
      matchUploader
    );
  }

  function matchesFilterValue(filter, status, leadType, stage) {
    switch (filter) {
      case "actioned":
      case "sanctioned":
        return status === filter;

      case "fresh":
      case "old":
        return leadType === filter;

      case "rejected":
      case "current-account":
      case "esign":
      case "limit-setup":
        return stage === filter;

      case "drafts":
        return false;

      default:
        return true;
    }
  }

  function matchesFilter($row, filter) {
    return matchesFilterValue(
      filter,
      $row.attr("data-status") || "",
      $row.attr("data-lead-type") || "",
      getDealerStage($row),
    );
  }

  function matchesFilterByName(dealerName, filter) {
    const $listRow = findDealerRow(dealerName);
    if ($listRow.length) return matchesFilter($listRow, filter);

    return matchesFilterValue(
      filter,
      "",
      "",
      dealerStages[dealerName] || "apply",
    );
  }

  function matchesGridFilter($tRow, filter) {
    const $status = $tRow.find(".table-status").first();
    if (LEAD_STATUSES.includes(filter)) {
      return $status.hasClass(filter);
    }

    if (STAGE_FILTERS.includes(filter)) {
      const stageText = $tRow
        .children()
        .eq(4)
        .text()
        .trim()
        .toLowerCase()
        .replace(/[^a-z]/g, "");
      const filterKey = String(filter).replace(/-/g, "");

      return (
        !$status.hasClass("rejected") && stageText.indexOf(filterKey) === 0
      );
    }

    return matchesFilterByName(getGridFirmName($tRow), filter);
  }

  function applyCurrentView() {
    const searchValue = $searchInput.length
      ? ($searchInput.val() || "").trim().toLowerCase()
      : "";

    /* List view */
    $dealerRows.each(function () {
      const $row = $(this);
      const $detailRow = $row.next(".dealer-details-row");
      const visible =
        matchesFilter($row, activeFilter) &&
        (!searchValue || $row.text().toLowerCase().includes(searchValue)) &&
        matchesModalFilters(getDealerName($row));

      $row.toggleClass("hidden-by-filter", !visible);
      $detailRow.toggleClass("hidden-by-filter", !visible);

      const progressStage =
        activeFilter === "sanctioned" &&
        $row.attr("data-status") === "sanctioned"
          ? "limit-setup"
          : getDealerStage($row);
      $detailRow
        .find(".dealer-progress")
        .replaceWith(getProgressMarkup(progressStage));
    });

    /* Grid view */
    $("#newDealerPage .dealer-table-view tbody tr").each(function () {
      const $tRow = $(this);
      const visible =
        matchesGridFilter($tRow, activeFilter) &&
        (!searchValue || $tRow.text().toLowerCase().includes(searchValue)) &&
        matchesModalFilters(getGridFirmName($tRow));

      $tRow.toggleClass("hidden-by-filter", !visible);
    });

    syncLeadSelection();
  }

  function initDealerFilterButtons() {
    const $viewMoreBtn = $("#viewMoreBtn");
    const $viewMoreMenu = $("#viewMoreMenu");
    const $toBeActionedBtn = $("#toBeActionedBtn");
    const $filterButtons = $("#newDealerPage .dealer-filter-btn");
    const $viewMoreFilters = $("#newDealerPage .view-more-menu button");

    const viewMoreDefaultHTML = $viewMoreBtn.length
      ? $viewMoreBtn.html()
      : "View more";
    const toBeActionedOriginalHTML = $toBeActionedBtn.length
      ? $toBeActionedBtn.html()
      : "";

    initDropdownMenu($viewMoreBtn, $viewMoreMenu);

    function resetViewMoreButton() {
      if (!$viewMoreBtn.length) return;
      $viewMoreBtn.html(viewMoreDefaultHTML).removeClass("active");
    }

    function restoreToBeActionedButton() {
      if (!$toBeActionedBtn.length) return;
      $toBeActionedBtn
        .html(toBeActionedOriginalHTML)
        .attr("data-filter", "actioned");
    }

    $filterButtons.on("click", function () {
      const $button = $(this);
      const filter = $button.attr("data-filter");
      if (!filter) return;

      activeFilter = filter;
      $viewMoreFilters.removeClass("is-selected");

      restoreToBeActionedButton();
      setActive($filterButtons, $button);
      resetViewMoreButton();

      closeAllDealerDetails();
      applyCurrentView();
    });

    $viewMoreFilters.on("click", function () {
      const $button = $(this);
      activeFilter = $button.attr("data-filter") || "all";

      $viewMoreFilters.removeClass("is-selected");
      $button.addClass("is-selected");

      $viewMoreMenu.removeClass("show");
      const fullText = $button.text().trim();
      const match = fullText.match(/^(.*)\((\d+)\)$/);
      const label = escapeHtml(match ? match[1].trim() : fullText);
      const count = match ? match[2] : "";
      const badge = count ? " <span>" + count + "</span>" : "";

      const isCompact =
        $toBeActionedBtn.length && $toBeActionedBtn.is(":hidden");

      setActive($filterButtons, null);

      if (isCompact && $viewMoreBtn.length) {
        $viewMoreBtn.html(label + badge + VIEW_MORE_ICON).addClass("active");
      } else {
        resetViewMoreButton();
        if ($toBeActionedBtn.length) {
          $toBeActionedBtn
            .html(label + badge)
            .attr("data-filter", activeFilter)
            .addClass("active");
        }
      }

      closeAllDealerDetails();
      applyCurrentView();
    });
  }

  function wrapCodeValues() {
    $(".dealer-firm small, .table-firm-code").each(function () {
      const $el = $(this);
      if ($el.find(".code-value").length) return;
      const m = $el.text().match(/^\s*Code:\s*(.+?)\s*$/i);
      if (!m) return;
      $el.html(
        'Code: <span class="code-value">' + escapeHtml(m[1]) + "</span>",
      );
    });
  }

  function initDealerSearch() {
    $searchInput.on("input", function () {
      closeAllDealerDetails();
      applyCurrentView();
    });
  }

  function initDetailsToggle() {
    $hideDetailsBtn.on("click", function () {
      setDetailsHidden(!detailsHidden);
    });
  }

  function initDealerViewSwitch() {
    const $buttons = $("#newDealerPage .view-switch-btn");
    const $listWrapper = $("#newDealerPage .new-dealer-table-wrapper").first();
    const $gridWrapper = $("#newDealerPage .dealer-table-view-wrapper").first();

    function setView(view) {
      const isGrid = view === "grid";

      $listWrapper.toggle(!isGrid);
      $gridWrapper.toggle(isGrid);
      $newDealerPage.toggleClass("table-view", isGrid);
      syncLeadSelection();
    }

    $buttons.on("click", function (event) {
      event.preventDefault();
      const $button = $(this);
      setActive($buttons, $button);
      setView($button.attr("data-view") || "list");
    });

    setView("list");
  }

  function getPinnedDealers() {
    try {
      return JSON.parse(localStorage.getItem(PIN_STORAGE_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function savePinnedDealers(pinnedDealers) {
    try {
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pinnedDealers));
    } catch (error) {
      console.error("Could not save pinned dealers:", error);
    }
  }

  function getPinKey($pin) {
    const $tableRow = $pin.closest("tr");
    if (!$tableRow.length) return "";
    const $tableName = $tableRow.find(".table-firm-name").first();
    if ($tableName.length) return getRobustFirmName($tableName);
    const $dealerName = $tableRow.find(".dealer-firm strong").first();
    return $dealerName.length ? $dealerName.text().trim() : "";
  }

  function reorderPinnedFirst($tbody, rowSelector) {
    if (!$tbody.length) return;

    const pinnedDealers = getPinnedDealers();

    const groups = $tbody
      .children(rowSelector)
      .map(function (index) {
        const $row = $(this);
        if ($row.attr("data-order") === undefined)
          $row.attr("data-order", index);

        const $next = $row.next();
        const $detail = $next.is(
          ".dealer-details-row, .txn-details-row, .renewal-details-row",
        )
          ? $next
          : null;

        const $pin = $row.find(".dealer-pin").first();

        return {
          row: $row,
          detail: $detail,
          order: Number($row.attr("data-order")),
          pinned: Boolean($pin.length && pinnedDealers[getPinKey($pin)]),
        };
      })
      .get();

    groups.sort(function (a, b) {
      return b.pinned - a.pinned || a.order - b.order;
    });

    groups.forEach(function (group) {
      $tbody.append(group.row);
      if (group.detail) $tbody.append(group.detail);
    });
  }

  function applySavedPins() {
    const pinnedDealers = getPinnedDealers();

    $(".dealer-pin").each(function () {
      const $pin = $(this);
      const key = getPinKey($pin);
      $pin.toggleClass("is-pinned", Boolean(key && pinnedDealers[key]));
    });

    PIN_SORT_TARGETS.forEach(function (target) {
      reorderPinnedFirst($(target.body).first(), target.row);
    });
  }

  function initPinning() {
    $(document).on("click", ".dealer-pin", function (event) {
      event.preventDefault();
      event.stopPropagation();

      const key = getPinKey($(this));
      if (!key) return;

      const pinnedDealers = getPinnedDealers();
      if (pinnedDealers[key]) {
        delete pinnedDealers[key];
      } else {
        pinnedDealers[key] = true;
      }

      savePinnedDealers(pinnedDealers);
      applySavedPins();
    });
  }

  function sendShareMail(payload) {
    /* TODO(backend): call the share-via-mail API here; resolve on success, reject on failure */
    return Promise.resolve(payload);
  }

  function bindOption($item, onPick) {
    $item.on("click", onPick);
    $item.on("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onPick();
      }
    });
  }

  function initShareViaMail() {
    const $overlay = $("#shareMailOverlay");
    if (!$overlay.length) return;

    const $emailInput = $("#shareEmailInput");
    const $emailError = $("#shareEmailError");
    const $emailWrap = $("#shareEmailDropdown");
    const $emailPanel = $("#shareEmailPanel");
    const $emailToggle = $("#shareEmailToggle");
    const $bucketWrap = $("#shareBucketDropdown");
    const $bucketBtn = $bucketWrap.find(".share-select-btn").first();
    const $bucketText = $bucketWrap.find(".share-select-text").first();
    const $bucketItems = $bucketWrap.find("[role='option']");
    const $submitBtn = $("#shareMailSubmit");
    const desktopMq = window.matchMedia("(min-width: 768px)");
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    let scope = "leads";
    let bucket = "";
    let sending = false;

    function setOpen($wrap, isOpen) {
      $wrap.toggleClass("open", isOpen);
      $wrap
        .find(".share-select-btn")
        .first()
        .attr("aria-expanded", String(isOpen));
    }

    function updateSubmitState() {
      const emailOk = EMAIL_RE.test(($emailInput.val() || "").trim());
      $submitBtn.prop("disabled", sending || !emailOk || !bucket);
    }

    function setBucket(value) {
      bucket = value;
      const $picked = $bucketItems
        .filter(function () {
          return $(this).attr("data-value") === value;
        })
        .first();

      $bucketText.text($picked.length ? $picked.text() : "Select bucketing");
      $bucketBtn.toggleClass("is-placeholder", !$picked.length);
      $bucketItems.each(function () {
        const isPicked = $picked.length > 0 && this === $picked[0];
        $(this).attr("aria-selected", String(isPicked));
      });
    }

    function pickEmail(email) {
      $emailInput.val(email);
      $emailError.text("");
      setOpen($emailWrap, false);
      updateSubmitState();
    }

    function pickBucket(value) {
      setBucket(value);
      setOpen($bucketWrap, false);
      updateSubmitState();
      $bucketBtn.trigger("focus");
    }

    function closeModal() {
      $overlay.removeClass("show");
      setOpen($emailWrap, false);
      setOpen($bucketWrap, false);
    }

    function openModal($trigger) {
      scope = $trigger.closest("#transactionDashboardPage").length
        ? "transaction"
        : "leads";

      $emailInput.val("").attr("placeholder", "Select email");
      $emailError.text("");
      setBucket("");
      setOpen($emailWrap, false);
      setOpen($bucketWrap, false);
      sending = false;
      updateSubmitState();

      $overlay.addClass("show");
      if (desktopMq.matches) $emailInput.trigger("focus");
    }

    async function submit() {
      if ($submitBtn.prop("disabled")) return;

      sending = true;
      updateSubmitState();

      try {
        await sendShareMail({
          scope: scope,
          email: $emailInput.val().trim(),
          bucketDays: Number(bucket),
        });
        closeModal();
        showAppToast("Shared via mail successfully");
      } catch (error) {
        console.error("Share via mail failed:", error);
        showAppToast("Could not share via mail. Please try again.", "error");
      } finally {
        sending = false;
        updateSubmitState();
      }
    }

    SHARE_SAVED_EMAILS.forEach(function (email) {
      const $option = $("<div>", {
        class: "share-option",
        role: "option",
        tabindex: 0,
        text: email,
      });
      bindOption($option, function () {
        pickEmail(email);
      });
      $emailPanel.append($option);
    });

    $(document).on("click", ".dealer-share-btn", function () {
      openModal($(this));
    });

    $emailInput.on("input", function () {
      $emailError.text("");
      updateSubmitState();
    });
    $emailInput.on("blur", function () {
      const value = ($emailInput.val() || "").trim();
      $emailError.text(
        value && !EMAIL_RE.test(value) ? "Enter a valid email ID" : "",
      );
    });
    $emailInput.on("keydown", function (event) {
      if (event.key === "Enter") submit();
    });
    $emailToggle.on("click", function () {
      setOpen($bucketWrap, false);
      setOpen($emailWrap, !$emailWrap.hasClass("open"));
    });

    $bucketBtn.on("click", function () {
      setOpen($emailWrap, false);
      setOpen($bucketWrap, !$bucketWrap.hasClass("open"));
    });
    $bucketItems.each(function () {
      const $item = $(this);
      bindOption($item, function () {
        pickBucket($item.attr("data-value"));
      });
    });

    $overlay.on("click", function (event) {
      if (event.target === $overlay[0]) {
        closeModal();
        return;
      }
      if (!$(event.target).closest("#shareBucketDropdown").length)
        setOpen($bucketWrap, false);
      if (!$(event.target).closest("#shareEmailDropdown").length)
        setOpen($emailWrap, false);
    });

    $(document).on("keydown", function (event) {
      if (event.key !== "Escape" || !$overlay.hasClass("show")) return;

      if ($bucketWrap.hasClass("open") || $emailWrap.hasClass("open")) {
        setOpen($bucketWrap, false);
        setOpen($emailWrap, false);
      } else {
        closeModal();
      }
    });

    bindClick("shareMailClose", closeModal);
    bindClick("shareMailCancel", closeModal);
    $submitBtn.on("click", submit);
  }

  function initScrollLock() {
    const $overlays = $(
      ".dealer-filters-overlay, #shareMailOverlay, #openTranchesModal, #uploadedDetailsOverlay",
    );
    if (!$overlays.length) return;

    const rootEl = document.documentElement;
    let locked = false;

    function sync() {
      const shouldLock = $overlays.toArray().some(function (overlay) {
        return $(overlay).hasClass("show");
      });
      if (shouldLock === locked) return;
      locked = shouldLock;

      if (shouldLock) {
        setCssVar(
          rootEl,
          "--nd-scrollbar-width",
          window.innerWidth - rootEl.clientWidth + "px",
        );
      } else {
        rootEl.style.removeProperty("--nd-scrollbar-width");
      }

      $("html, body").toggleClass("nd-scroll-lock", shouldLock);
    }

    const observer = new MutationObserver(sync);
    $overlays.each(function () {
      observer.observe(this, { attributes: true, attributeFilter: ["class"] });
    });

    sync();
  }

  function deleteLeadsRequest(names) {
    /* TODO(backend): call the delete API here; resolve on success, reject on failure */
    return Promise.resolve(names);
  }

  function cellText($cell) {
    return $cell.length
      ? ($cell.attr("data-original") || $cell.text()).trim()
      : "";
  }

  function stripInfoIcon($badge) {
    if (!$badge.length) return "";
    const $clone = $badge.clone();
    $clone.find("small").first().remove();
    return $clone.text().trim();
  }

  function getGridRowByName(name) {
    return $("#newDealerPage .dealer-table-view tbody tr")
      .filter(function () {
        return getGridFirmName($(this)) === name;
      })
      .first();
  }

  function getLeadInfoFromList($row) {
    const $codeEl = $row.find(".dealer-firm small .code-value").first();
    const $codeSmall = $row.find(".dealer-firm small").first();
    const $panEl = $row.find(".dealer-association small").first();
    const $phoneEl = $row.find(".dealer-contact-text").first();
    const $cells = $row.children();

    return {
      firm: getDealerName($row),
      code: $codeEl.length
        ? cellText($codeEl)
        : $codeSmall.length
          ? $codeSmall
              .text()
              .replace(/^\s*Code:\s*/i, "")
              .trim()
          : "",
      pan: cellText($panEl).replace(/^\s*PAN:\s*/i, ""),
      mobile: cellText($phoneEl),
      sales: $cells.eq(3).text().trim(),
      loan: $cells.eq(4).text().trim(),
      status: $row.attr("data-status") || "",
      statusText: stripInfoIcon($row.find(".dealer-status").first()),
    };
  }

  function getLeadInfoFromGrid($tRow) {
    const $cells = $tRow.children();
    let $codeEl = $tRow.find(".table-firm-code .code-value").first();
    if (!$codeEl.length) $codeEl = $tRow.find(".table-firm-code").first();
    const $statusEl = $tRow.find(".table-status").first();

    return {
      firm: getGridFirmName($tRow),
      code: cellText($codeEl).replace(/^\s*Code:\s*/i, ""),
      pan: cellText($cells.eq(7)),
      mobile: cellText($cells.eq(5)),
      sales: cellText($cells.eq(8)),
      loan: "-",
      status: getBadgeStatus($statusEl),
      statusText: stripInfoIcon($statusEl),
    };
  }

  function getLeadInfo(name) {
    const $listRow = findDealerRow(name);
    if ($listRow.length) return getLeadInfoFromList($listRow);

    const $gridRow = getGridRowByName(name);
    return $gridRow.length ? getLeadInfoFromGrid($gridRow) : null;
  }

  function getLeadNameFromBox($box) {
    const $listRow = $box.closest(".dealer-row");
    if ($listRow.length) return getDealerName($listRow);

    const $tRow = $box.closest("tr");
    return $tRow.length ? getGridFirmName($tRow) : "";
  }

  function getVisibleLeadNames() {
    if ($newDealerPage.hasClass("table-view")) {
      return $(
        "#newDealerPage .dealer-table-view tbody tr:not(.hidden-by-filter)",
      )
        .map(function () {
          return getGridFirmName($(this));
        })
        .get();
    }

    return $dealerRows
      .filter(function () {
        return !$(this).hasClass("hidden-by-filter");
      })
      .map(function () {
        return getDealerName($(this));
      })
      .get();
  }

  function getSelectedLeadNames() {
    const visible = new Set(getVisibleLeadNames());
    return Array.from(leadSelection).filter(function (name) {
      return visible.has(name);
    });
  }

  function syncLeadSelection() {
    const visible = getVisibleLeadNames();
    const selected = getSelectedLeadNames();
    const picked = new Set(selected);

    $("#newDealerPage .lead-select-row").each(function () {
      $(this).prop("checked", picked.has(getLeadNameFromBox($(this))));
    });

    const inView = visible.filter(function (name) {
      return picked.has(name);
    }).length;
    $("#newDealerPage .lead-select-all").each(function () {
      $(this).prop({
        checked: visible.length > 0 && inView === visible.length,
        indeterminate: inView > 0 && inView < visible.length,
      });
    });

    $("#leadBulkCount").text(selected.length);
    $("#leadBulkDelete")
      .text("Delete (" + selected.length + ")")
      .prop("disabled", selected.length === 0);
  }

  function setLeadSelectMode(on) {
    if (!$newDealerPage.length) return;
    $newDealerPage.toggleClass("select-mode", on);
    if (on) closeAllDealerDetails();
    else leadSelection.clear();
    syncLeadSelection();
  }

  function removeLead(name) {
    const $row = findDealerRow(name);
    if ($row.length) {
      $row.next(".dealer-details-row").remove();
      $dealerRows = $dealerRows.not($row);
      $row.remove();
    }

    getGridRowByName(name).remove();

    $(
      "#firmDropdown .dealer-filter-dropdown-panel input[type='checkbox']",
    ).each(function () {
      if (this.value !== name) return;
      $(this).closest("label").remove();
    });

    const pinned = getPinnedDealers();
    if (pinned[name]) {
      delete pinned[name];
      savePinnedDealers(pinned);
    }
  }

  function decrementBadge($el, by) {
    if (!$el.length || !by) return;
    const $first = $el.first();
    const value = parseInt($first.text(), 10);
    if (!isNaN(value)) $first.text(Math.max(value - by, 0));
  }

  /* TODO(backend): if counts come from the API, remove this and set them directly */
  function updateLeadCounts(infos) {
    const $toBeActionedBtn = $("#toBeActionedBtn");
    const actioned = infos.filter(function (info) {
      return info.status === "actioned";
    }).length;

    decrementBadge(
      $('#newDealerPage .dealer-filter-btn[data-filter="all"] span'),
      infos.length,
    );
    if (
      $toBeActionedBtn.length &&
      $toBeActionedBtn.attr("data-filter") === "actioned"
    ) {
      decrementBadge($toBeActionedBtn.find("span"), actioned);
    }
    $(
      '#newDealerPage .new-dealer-tab.active .new-dealer-count, [data-goto="newdealer"] .new-dealer-count',
    ).each(function () {
      decrementBadge($(this), infos.length);
    });
  }

  function initLeadDeletion() {
    const $overlay = $("#deleteLeadOverlay");
    if (!$newDealerPage.length || !$overlay.length) return;

    const $titleEl = $("#deleteLeadTitle");
    const $panel = $("#deleteLeadPanel");
    const $confirmBtn = $("#deleteLeadConfirm");
    const $toolbarBtn = $("#leadBulkDeleteBtn");
    const $bulkDeleteBtn = $("#leadBulkDelete");

    let pendingNames = [];
    let pendingIsBulk = false;

    function makeCheckbox(cls, label) {
      return $("<input>", {
        type: "checkbox",
        class: "lead-select " + cls,
        "aria-label": label,
      });
    }

    $dealerRows.each(function () {
      const $row = $(this);
      const $del = $row.find(".dealer-row-actions button:nth-child(2)").first();
      if ($del.length) {
        $del.addClass("dealer-delete-btn").attr("title", "Delete");
      }

      const $firm = $row.find(".dealer-firm").first();
      if ($firm.length)
        $firm.prepend(makeCheckbox("lead-select-row", "Select lead"));
    });

    $("#newDealerPage .dealer-table-view tbody .table-firm").each(function () {
      $(this).prepend(makeCheckbox("lead-select-row", "Select lead"));
    });

    $(
      "#newDealerPage .dealer-leads-table thead th:first-child .dealer-th-inner, " +
        "#newDealerPage .dealer-table-view thead th:first-child .dealer-th-inner",
    ).each(function () {
      $(this).prepend(makeCheckbox("lead-select-all", "Select all leads"));
    });

    function panelRow(label, valueHtml) {
      return (
        '<div class="delete-lead-row"><span>' +
        label +
        "</span><strong>" +
        valueHtml +
        "</strong></div>"
      );
    }

    function renderSingle(info) {
      const tooltip = getStatusTooltip(
        info.status,
        dealerStages[info.firm] || "apply",
      );
      const badge =
        '<span class="dealer-status ' +
        escapeHtml(info.status) +
        '">' +
        escapeHtml(info.statusText) +
        ' <small data-tooltip="' +
        escapeHtml(tooltip) +
        '"><span class="material-symbols-outlined">info</span></small></span>';

      return (
        panelRow("Firm", escapeHtml(info.firm)) +
        panelRow("Dealer code", escapeHtml(info.code)) +
        panelRow("PAN", escapeHtml(info.pan)) +
        panelRow("Mobile number", escapeHtml(info.mobile)) +
        panelRow("Sales to dealer (last 12M)", formatAmountMarkup(info.sales)) +
        panelRow("Loan offer", formatAmountMarkup(info.loan)) +
        panelRow("Sanction status", badge)
      );
    }

    function renderBulk(infos) {
      const rows = infos
        .map(function (info) {
          return (
            "<tr><td>" +
            escapeHtml(info.firm) +
            "</td><td>" +
            escapeHtml(info.code) +
            "</td><td>" +
            escapeHtml(info.loan) +
            "</td></tr>"
          );
        })
        .join("");

      return (
        '<div class="delete-lead-row"><span>Total leads</span>' +
        '<div class="delete-lead-selected" tabindex="0">' +
        "<span>" +
        infos.length +
        ' selected</span><i class="delete-lead-trash material-symbols-outlined">delete</i>' +
        '<div class="delete-lead-tip"><div class="delete-lead-tip-box"><table>' +
        "<thead><tr><th>Firm</th><th>Code</th><th>Loan offer</th></tr></thead>" +
        "<tbody>" +
        rows +
        "</tbody></table></div></div>" +
        "</div></div>"
      );
    }

    function openModal(names, isBulk) {
      const infos = names.map(getLeadInfo).filter(Boolean);
      if (!infos.length) return;

      pendingNames = infos.map(function (info) {
        return info.firm;
      });
      pendingIsBulk = isBulk;

      $titleEl.text(
        isBulk
          ? "Are you sure you want to delete selected lead(s)?"
          : "Are you sure you want to delete this lead?",
      );
      $panel.html(isBulk ? renderBulk(infos) : renderSingle(infos[0]));

      $overlay
        .find(".delete-lead-modal")
        .first()
        .toggleClass("is-bulk", isBulk)
        .toggleClass("is-single", !isBulk);

      $overlay.addClass("show");
    }

    function closeModal() {
      $overlay.removeClass("show");
    }

    async function confirmDelete() {
      if (!pendingNames.length || $confirmBtn.prop("disabled")) return;

      const names = pendingNames.slice();
      const infos = names.map(getLeadInfo).filter(Boolean);
      $confirmBtn.prop("disabled", true);

      try {
        await deleteLeadsRequest(names);

        names.forEach(removeLead);
        updateLeadCounts(infos);
        closeAllDealerDetails();
        closeModal();

        if (pendingIsBulk) {
          setLeadSelectMode(false);
        } else {
          names.forEach(function (name) {
            leadSelection.delete(name);
          });
        }

        applyCurrentView();
        showAppToast(
          pendingIsBulk
            ? "Leads deleted successfully"
            : "Lead deleted successfully",
        );
      } catch (error) {
        console.error("Delete lead failed:", error);
        showAppToast("Could not delete. Please try again.", "error");
      } finally {
        $confirmBtn.prop("disabled", false);
      }
    }

    $newDealerPage.on(
      "click",
      ".dealer-delete-btn, .table-delete-btn",
      function () {
        const $btn = $(this);
        const $listRow = $btn.closest(".dealer-row");
        const $detailRow = $btn.closest(".dealer-details-row");
        const $gridRow = $btn.closest("tr");

        const name = $listRow.length
          ? getDealerName($listRow)
          : $detailRow.length
            ? $detailRow.attr("data-dealer-details-for")
            : getGridFirmName($gridRow);

        if (name) openModal([name], false);
      },
    );

    $newDealerPage.on(
      "change",
      ".lead-select-all, .lead-select-row",
      function () {
        const $box = $(this);

        if ($box.hasClass("lead-select-all")) {
          getVisibleLeadNames().forEach(function (name) {
            if ($box.prop("checked")) leadSelection.add(name);
            else leadSelection.delete(name);
          });
        } else {
          const name = getLeadNameFromBox($box);
          if ($box.prop("checked")) leadSelection.add(name);
          else leadSelection.delete(name);
        }

        syncLeadSelection();
      },
    );

    $toolbarBtn.on("click", function () {
      setLeadSelectMode(!$newDealerPage.hasClass("select-mode"));
    });

    bindClick("leadBulkCancel", function () {
      setLeadSelectMode(false);
    });

    $bulkDeleteBtn.on("click", function () {
      openModal(getSelectedLeadNames(), true);
    });

    bindClick("deleteLeadClose", closeModal);
    bindClick("deleteLeadCancel", closeModal);
    $confirmBtn.on("click", confirmDelete);

    $overlay.on("click", function (event) {
      if (event.target === $overlay[0]) closeModal();
    });

    $panel.on("click", function (event) {
      const $target = $(event.target);
      const $selected = $target.closest(".delete-lead-selected");
      if ($selected.length && !$target.closest(".delete-lead-tip").length)
        $selected.toggleClass("open");
    });

    $(document).on("keydown", function (event) {
      if (event.key === "Escape" && $overlay.hasClass("show")) closeModal();
    });
  }

  function cleanAmount(value) {
    return String(value || "").replace(/[,\s\u00a0\u202f₹]/g, "");
  }

  function parseAmountInput(value) {
    const clean = cleanAmount(value);
    return AMOUNT_RE.test(clean) ? parseFloat(clean) : null;
  }

  function formatAmount(number) {
    return number.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function initRangeField(opts) {
    const $from = $("#" + opts.fromId);
    const $to = $("#" + opts.toId);
    const $msg = $("#" + opts.errorId);
    if (!$from.length || !$to.length || !$msg.length) {
      return {
        hasError: function () {
          return false;
        },
        reset: function () {},
      };
    }

    let checkOrder = false;

    function isFormatOk($el) {
      const clean = cleanAmount($el.val());
      return clean === "" || AMOUNT_RE.test(clean);
    }

    function isOrderBad() {
      const a = parseAmountInput($from.val());
      const b = parseAmountInput($to.val());
      return a !== null && b !== null && a > b;
    }

    function decorate($el) {
      const $wrap = $("<div>", { class: "range-amount-wrap" });
      const $view = $("<div>", { class: "range-amount-view" });
      $el.before($wrap);
      $wrap.append($el, $view);

      return function render() {
        const number = parseAmountInput($el.val());
        $view.html(
          number !== null ? formatAmountMarkup(formatAmount(number)) : "",
        );
        $wrap.toggleClass("has-value", number !== null);
      };
    }

    const renderFrom = decorate($from);
    const renderTo = decorate($to);

    function renderViews() {
      renderFrom();
      renderTo();
    }

    function paint(errFrom, errTo, message) {
      $from
        .closest(".dealer-filter-range-input")
        .toggleClass("is-error", errFrom);
      $to.closest(".dealer-filter-range-input").toggleClass("is-error", errTo);
      $msg.text(message);
      if (opts.onChange) opts.onChange();
    }

    function validate() {
      const badFrom = !isFormatOk($from);
      const badTo = !isFormatOk($to);

      if (badFrom || badTo) {
        paint(badFrom, badTo, opts.formatMsg);
      } else if (checkOrder && isOrderBad()) {
        paint(true, true, opts.orderMsg);
      } else {
        paint(false, false, "");
      }
    }

    [$from, $to].forEach(function ($el) {
      const $wrap = $el.closest(".range-amount-wrap");

      $el.on("input", function () {
        checkOrder = false;
        validate();
        renderViews();
      });

      $el.on("focus", function () {
        $wrap.addClass("is-focused");
        $el.val(cleanAmount($el.val()));
      });

      $el.on("blur", function () {
        $wrap.removeClass("is-focused");
        checkOrder = true;
        const number = parseAmountInput($el.val());
        if (number !== null) $el.val(formatAmount(number));
        validate();
        renderViews();
      });
    });

    return {
      hasError: function () {
        return (
          !isFormatOk($from) || !isFormatOk($to) || (checkOrder && isOrderBad())
        );
      },
      reset: function () {
        checkOrder = false;
        paint(false, false, "");
        renderViews();
      },
    };
  }

  function formatDMY(d) {
    return (
      String(d.getDate()).padStart(2, "0") +
      "/" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "/" +
      d.getFullYear()
    );
  }

  function initDateRangePicker(opts) {
    const $cal = opts.$cal;
    let tmpFrom = null,
      tmpTo = null,
      calView = null;

    function shortDate(d) {
      return (
        d.getDate() +
        " " +
        CAL_MONTHS[d.getMonth()].slice(0, 3) +
        " '" +
        String(d.getFullYear()).slice(-2)
      );
    }

    function renderMonth(offset) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const fromT = tmpFrom ? tmpFrom.getTime() : null;
      const toT = tmpTo ? tmpTo.getTime() : null;
      const hasRange = fromT !== null && toT !== null && toT > fromT;

      const first = new Date(
        calView.getFullYear(),
        calView.getMonth() + offset,
        1,
      );
      const total = new Date(
        first.getFullYear(),
        first.getMonth() + 1,
        0,
      ).getDate();
      let cells = "";

      for (let i = 0; i < first.getDay(); i++) cells += "<span></span>";

      for (let d = 1; d <= total; d++) {
        const t = new Date(first.getFullYear(), first.getMonth(), d).getTime();
        const col = (first.getDay() + d - 1) % 7;

        let cellCls = "renewal-cal-cell";
        if (hasRange && t >= fromT && t <= toT) {
          cellCls += " in-band";
          if (t === fromT || col === 0 || d === 1) cellCls += " band-l";
          if (t === toT || col === 6 || d === total) cellCls += " band-r";
        }

        let dayCls = "renewal-cal-day";
        if (t === fromT) dayCls += " is-start";
        if (t === toT) dayCls += " is-end";
        if (t === today.getTime()) dayCls += " is-today";

        cells +=
          '<span class="' +
          cellCls +
          '"><button type="button" class="' +
          dayCls +
          '" data-ts="' +
          t +
          '">' +
          d +
          "</button></span>";
      }

      return (
        '<div class="renewal-cal-month"><div class="renewal-cal-title">' +
        CAL_MONTHS[first.getMonth()] +
        " " +
        first.getFullYear() +
        '</div><div class="renewal-cal-grid">' +
        CAL_WEEK +
        cells +
        "</div></div>"
      );
    }

    function render() {
      const headText = tmpFrom
        ? shortDate(tmpFrom) + (tmpTo ? " - " + shortDate(tmpTo) : "")
        : "Select date range";

      $cal.html(
        '<div class="renewal-cal-head"><span>' +
          headText +
          '</span><i class="renewal-cal-pencil material-symbols-outlined">edit</i></div>' +
          '<div class="renewal-cal-body">' +
          '<div class="renewal-cal-nav"><button type="button" data-nav="-1" aria-label="Previous month"><span class="material-symbols-outlined">chevron_left</span></button>' +
          '<button type="button" data-nav="1" aria-label="Next month"><span class="material-symbols-outlined">chevron_right</span></button></div>' +
          '<div class="renewal-cal-months">' +
          renderMonth(0) +
          renderMonth(1) +
          "</div>" +
          "</div>" +
          '<div class="renewal-cal-footer"><button type="button" data-cal="clear">Clear</button>' +
          '<div><button type="button" data-cal="cancel">Cancel</button><button type="button" data-cal="ok">OK</button></div></div>',
      );
    }

    function open() {
      const range = opts.getRange();
      tmpFrom = range.from;
      tmpTo = range.to;
      const base = tmpFrom || new Date();
      calView = new Date(base.getFullYear(), base.getMonth(), 1);
      render();
      $cal.addClass("show");
    }

    $cal.on("click", function (event) {
      event.stopPropagation();
      const $target = $(event.target);

      const $nav = $target.closest("[data-nav]");
      if ($nav.length) {
        calView = new Date(
          calView.getFullYear(),
          calView.getMonth() + Number($nav.attr("data-nav")),
          1,
        );
        render();
        return;
      }

      const $day = $target.closest(".renewal-cal-day");
      if ($day.length) {
        const picked = new Date(Number($day.attr("data-ts")));
        if (!tmpFrom || tmpTo) {
          tmpFrom = picked;
          tmpTo = null;
        } else if (picked < tmpFrom) {
          tmpFrom = picked;
        } else {
          tmpTo = picked;
        }
        render();
        return;
      }

      const $action = $target.closest("[data-cal]");
      if (!$action.length) return;

      const action = $action.attr("data-cal");
      if (action === "clear") {
        tmpFrom = tmpTo = null;
        render();
      } else if (action === "cancel") {
        $cal.removeClass("show");
      } else if (action === "ok") {
        $cal.removeClass("show");
        opts.onOk(tmpFrom, tmpTo || tmpFrom);
      }
    });

    opts.$fromBtn.on("click", open);
    opts.$toBtn.on("click", open);
  }

  //  TRANSACTION DASHBOARD

  const txnState = {
    tab: "all",
    search: "",
    firms: [],
    sanctionFrom: null,
    sanctionTo: null,
    overdueFrom: null,
    overdueTo: null,
    daysDue: "all",
    dateFrom: null,
    dateTo: null,
  };

  function getTxnDaysMarkup(item) {
    return item.days === "overdue"
      ? '<span class="txn-days overdue">Overdue</span>'
      : '<span class="txn-days pending">' + escapeHtml(item.days) + "</span>";
  }

  function getTxnScfMarkup(item) {
    const isFreeze = item.status === "freeze";
    return (
      `<span class="txn-scf-account">${escapeHtml(item.scfAccount)}</span><br>` +
      `<span class="scf-badge ${escapeHtml(item.status)}">${isFreeze ? "Freeze" : "Unfreeze"}</span>`
    );
  }

  function getTxnAmountMarkup(amount, pct) {
    return (
      '<div class="txn-amount">' +
      formatAmountMarkup(amount) +
      '<span class="txn-percent">' +
      escapeHtml(pct) +
      "</span></div>"
    );
  }

  function getTxnOpenCountMarkup(item, index) {
    return `<span class="txn-open-count" data-open-tranches="${index}">${item.openTxns} <span class="txn-open-icon material-symbols-outlined">assignment</span></span>`;
  }

  function getTxnRowAttributes(item, index) {
    return (
      `data-txn-index="${index}"` +
      ` data-firm="${escapeHtml(item.firm)}"` +
      ` data-days-left="${item.days === "overdue" ? "" : parseInt(item.days, 10)}"` +
      ` data-status="${item.days === "overdue" ? "overdue" : "upcoming"}"` +
      ` data-sanction-value="${parseCurrency(item.sanction)}"` +
      ` data-overdue-value="${parseCurrency(item.overdueAmount)}"`
    );
  }

  function renderTxnRow(item, index) {
    return `
      <tr class="dealer-row txn-row" ${getTxnRowAttributes(item, index)}>
        <td class="txn-cell txn-cell--firm">
          <div class="dealer-firm">
            <span class="material-symbols-outlined dealer-pin" role="button" tabindex="0">push_pin</span>
            <div>
              <strong>${escapeHtml(item.firm)}</strong>
              <small>Code: ${escapeHtml(item.code)}</small>
            </div>
          </div>
        </td>
        <td class="txn-cell txn-cell--scf" data-label="SCF limit account">${getTxnScfMarkup(item)}</td>
        <td class="txn-cell txn-cell--extra txn-cell--sanction" data-label="Sanction limit">${formatAmountMarkup(item.sanction)}</td>
        <td class="txn-cell txn-cell--extra txn-cell--utilized" data-label="Utilized limit">${getTxnAmountMarkup(item.utilized, item.utilizedPct)}</td>
        <td class="txn-cell txn-cell--extra txn-cell--available" data-label="Available limit">${getTxnAmountMarkup(item.available, item.availablePct)}</td>
        <td class="txn-cell txn-cell--extra txn-cell--open" data-label="Open transactions">${getTxnOpenCountMarkup(item, index)}</td>
        <td class="txn-cell txn-cell--overdue${item.overdueAmount === "-" ? " is-empty" : ""}" data-label="Overdue amount">${formatAmountMarkup(item.overdueAmount)}</td>
        <td class="txn-cell txn-cell--days" data-label="Days to get in overdue">${getTxnDaysMarkup(item)}</td>
        <td class="txn-cell txn-cell--actions">
          <div class="dealer-row-actions">
            <button type="button" class="txn-refresh-btn" title="Refresh"><span class="material-symbols-outlined">refresh</span></button>
            <button type="button" class="dealer-expand-btn"><span class="material-symbols-outlined nd-icon">keyboard_arrow_down</span></button>
          </div>
        </td>
        <td class="txn-cell txn-cell--extra txn-cell--case txn-mobile-only" data-label="Case type">${escapeHtml(item.caseType || "-")}</td>
        <td class="txn-cell txn-cell--extra txn-cell--expiry txn-mobile-only" data-label="A/c expiry date">${escapeHtml(item.acExpiry || "-")}</td>
      </tr>
      <tr class="txn-details-row" data-txn-details-for="${index}">
        <td>
          <div class="txn-detail-item"><span>Case type</span><strong>${escapeHtml(item.caseType || "-")}</strong></div>
        </td>
        <td>
          <div class="txn-detail-item"><span>A/c expiry date</span><strong>${escapeHtml(item.acExpiry || "-")}</strong></div>
        </td>
        <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
      </tr>
    `;
  }

  function renderTxnGridRow(item, index) {
    return `
      <tr ${getTxnRowAttributes(item, index)}>
        <td>
          <div class="table-firm">
            <span class="material-symbols-outlined dealer-pin" role="button" tabindex="0">push_pin</span>
            <div class="table-firm-name">${escapeHtml(item.firm)}<small class="table-firm-code">Code: ${escapeHtml(item.code)}</small></div>
          </div>
        </td>
        <td>
          <div class="table-action">
            <button type="button" class="txn-refresh-btn" title="Refresh"><span class="material-symbols-outlined">refresh</span></button>
          </div>
        </td>
        <td>${getTxnDaysMarkup(item)}</td>
        <td>${getTxnScfMarkup(item)}</td>
        <td>${formatAmountMarkup(item.sanction)}</td>
        <td>${getTxnAmountMarkup(item.utilized, item.utilizedPct)}</td>
        <td>${getTxnAmountMarkup(item.available, item.availablePct)}</td>
        <td>${getTxnOpenCountMarkup(item, index)}</td>
        <td>${formatAmountMarkup(item.overdueAmount)}</td>
        <td>${escapeHtml(item.caseType || "-")}</td>
      </tr>
    `;
  }

  function closeAllTxnDetails() {
    $("#txnTableBody .txn-details-row").removeClass("is-visible");
    $("#txnTableBody .txn-row").removeClass("is-expanded");
  }

  function txnRowMatches($row) {
    const s = txnState;

    if (s.tab !== "all" && $row.attr("data-status") !== s.tab) return false;
    if (s.search && !$row.text().toLowerCase().includes(s.search)) return false;
    if (s.firms.length && !s.firms.includes($row.attr("data-firm")))
      return false;

    if (s.tab === "upcoming" && s.daysDue !== "all") {
      const left = Number($row.attr("data-days-left"));

      if (s.daysDue === "custom") {
        const now = new Date();
        const due = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + left,
        );
        if (s.dateFrom && due < s.dateFrom) return false;
        if (s.dateTo && due > s.dateTo) return false;
      } else if (left > TXN_DAYS_LIMIT[s.daysDue]) {
        return false;
      }
    }

    const sanctionValue = parseFloat($row.attr("data-sanction-value")) || 0;
    if (s.sanctionFrom !== null && sanctionValue < s.sanctionFrom) return false;
    if (s.sanctionTo !== null && sanctionValue > s.sanctionTo) return false;

    if (s.tab === "overdue") {
      const overdueValue = parseFloat($row.attr("data-overdue-value")) || 0;
      if (s.overdueFrom !== null && overdueValue < s.overdueFrom) return false;
      if (s.overdueTo !== null && overdueValue > s.overdueTo) return false;
    }

    return true;
  }

  function applyTxnFilters() {
    closeAllTxnDetails();

    $(".txn-row, .txn-table-view tbody tr").each(function () {
      const $row = $(this);
      $row.toggleClass("hidden-by-filter", !txnRowMatches($row));
    });
  }

  function bindTxnRowExpansion($listBody) {
    $listBody.find(".dealer-expand-btn").on("click", function () {
      const $row = $(this).closest(".txn-row");
      const $detailRow = $listBody.find(
        '.txn-details-row[data-txn-details-for="' +
          $row.attr("data-txn-index") +
          '"]',
      );
      const wasVisible = $detailRow.hasClass("is-visible");

      closeAllTxnDetails();

      if (!wasVisible) {
        $detailRow.addClass("is-visible");
        $row.addClass("is-expanded");
      }
    });
  }

  function bindTxnRefreshButtons() {
    $(".txn-refresh-btn").on("click", function (event) {
      event.stopPropagation();
      const $btn = $(this);
      $btn.addClass("spinning");
      setTimeout(function () {
        $btn.removeClass("spinning");
      }, 450);
    });
  }

  function initInfoTooltips() {
    const $tip = $("<div>", { class: "app-tooltip", role: "tooltip" }).appendTo(
      "body",
    );
    const tipEl = $tip[0];

    const canHover = window.matchMedia("(hover: hover)");
    const mobileMq = window.matchMedia("(max-width: 767.98px)");
    let source = null;

    function hide() {
      $tip.removeClass("show");
      source = null;
    }

    function show(el, text, rect) {
      source = el;
      $tip.text(text).removeClass("below").addClass("show");

      const r = rect || el.getBoundingClientRect();
      const w = tipEl.offsetWidth;
      const h = tipEl.offsetHeight;
      const centerX = r.left + r.width / 2;
      const left = Math.max(
        8,
        Math.min(centerX - w / 2, window.innerWidth - w - 8),
      );
      const below = r.top - h - 12 < 8;

      setCssVar(tipEl, "--tip-left", left + "px");
      setCssVar(
        tipEl,
        "--tip-top",
        (below ? r.bottom + 12 : r.top - h - 12) + "px",
      );
      setCssVar(
        tipEl,
        "--arrow-x",
        Math.max(14, Math.min(centerX - left, w - 14)) + "px",
      );
      $tip.toggleClass("below", below);
    }

    const TIP_SEL =
      ".info-dot[data-tooltip], .dealer-status small[data-tooltip], .table-status small[data-tooltip]";

    $(document).on("mouseover", TIP_SEL, function () {
      if (!canHover.matches) return;
      show(this, $(this).attr("data-tooltip"));
    });

    $(document).on("mouseout", TIP_SEL, hide);

    $(document).on("click", function (event) {
      const $target = $(event.target);
      const dot = canHover.matches ? null : $target.closest(TIP_SEL)[0] || null;
      const cell = mobileMq.matches
        ? $target.closest(".txn-cell--days")[0] || null
        : null;
      const el = dot || cell;

      if (!el) {
        hide();
        return;
      }
      if (source === el) {
        hide();
        return;
      }

      if (cell) {
        const r = cell.getBoundingClientRect();
        show(cell, "Excluding cure days", {
          left: r.right - 13,
          width: 13,
          top: r.top,
          bottom: r.top + 16,
        });
      } else {
        show(dot, $(dot).attr("data-tooltip"));
      }
    });

    window.addEventListener("scroll", hide, true);
    $(window).on("resize", hide);
  }

  function bindOpenTranchesModal() {
    const $modal = $("#openTranchesModal");
    const $count = $("#tranchesCount");
    const $body = $("#tranchesTableBody");
    if (!$modal.length || !$count.length || !$body.length) return;

    function closeModal() {
      $modal.removeClass("show");
    }

    $("[data-open-tranches]").on("click", function () {
      const item = transactionData[$(this).attr("data-open-tranches")];

      $count.text(item.openTxns);
      $body.html(
        item.tranches
          .map(function (t) {
            return `
              <tr>
                <td data-label="ID">${escapeHtml(t.id)}</td>
                <td data-label="Transaction date">${escapeHtml(t.date)}</td>
                <td data-label="Transaction type">${escapeHtml(t.type)}</td>
                <td data-label="Amount">${formatAmountMarkup(t.amount)}</td>
                <td data-label="Due date">${escapeHtml(t.due)}</td>
              </tr>
            `;
          })
          .join("") ||
          '<tr><td colspan="5" class="tranches-empty">No open tranches</td></tr>',
      );

      $modal.addClass("show");
    });

    ["openTranchesClose", "openTranchesCloseBtn"].forEach(function (id) {
      bindClick(id, closeModal);
    });
  }

  function setTxnFilterTab(tab) {
    $("#txnFilterTabs .dealer-filter-pill").each(function () {
      $(this).toggleClass("active", $(this).attr("data-tab") === tab);
    });

    $(".txn-filter-extra").each(function () {
      $(this).toggle($(this).attr("data-extra-for") === tab);
    });
  }

  function initTxnToolbar($txnPage) {
    const $tabButtons = $(".txn-filter-btn");
    const $txnSearchInput = $("#txnSearchInput");
    const $txnHideBtn = $("#txnHideDetailsBtn");

    $tabButtons.on("click", function () {
      const $btn = $(this);
      txnState.tab = $btn.attr("data-txn-filter");
      setActive($tabButtons, $btn);
      setTxnFilterTab(txnState.tab);
      applyTxnFilters();
    });

    $txnSearchInput.on("input", function () {
      txnState.search = ($txnSearchInput.val() || "").trim().toLowerCase();
      applyTxnFilters();
    });

    function setTxnView(view) {
      $txnPage.toggleClass("txn-grid-active", view === "grid");
    }

    if ($txnPage.length) {
      const $viewButtons = $txnPage.find(".view-switch-btn");
      $viewButtons.on("click", function () {
        const $btn = $(this);
        setActive($viewButtons, $btn);
        setTxnView($btn.attr("data-view") || "list");
      });
    }
    setTxnView("list");

    $txnHideBtn.on("click", function () {
      setDetailsHidden(!detailsHidden);
    });
  }

  function initTxnFiltersModal() {
    const $openBtn = $("#txnFiltersBtn");
    const $overlay = $("#txnFiltersOverlay");
    const $closeBtn = $("#txnFiltersClose");
    const $resetBtn = $("#txnFiltersReset");
    const $applyBtn = $("#txnFiltersApply");
    const $tabsWrap = $("#txnFilterTabs");
    const $daysPills = $("#txnDaysDuePills .dealer-filter-pill");
    const $toolbarTabs = $(".txn-filter-btn");
    const $customField = $("#txnCustomField");
    const $fromBtn = $("#txnDateFrom");
    const $toBtn = $("#txnDateTo");
    const $cal = $("#txnCalendar");

    let daysDue = "all",
      dateFrom = null,
      dateTo = null;

    function readNumber(id) {
      return parseAmountInput($("#" + id).val());
    }

    function getActiveTab() {
      const $pill = $tabsWrap.find(".active").first();
      return $pill.attr("data-tab") || "all";
    }

    function closeOverlay() {
      $cal.removeClass("show");
      $overlay.removeClass("show");
    }

    function syncTxnApply() {
      if (!$applyBtn.length) return;
      const tab = getActiveTab();
      const incomplete =
        tab === "upcoming" && daysDue === "custom" && (!dateFrom || !dateTo);
      $applyBtn.prop(
        "disabled",
        incomplete ||
          sanctionField.hasError() ||
          (tab === "overdue" && overdueField.hasError()),
      );
    }

    function updateDays() {
      $daysPills.each(function () {
        $(this).toggleClass("active", $(this).attr("data-value") === daysDue);
      });
      $customField.prop(
        "hidden",
        !(getActiveTab() === "upcoming" && daysDue === "custom"),
      );
      $fromBtn
        .children()
        .first()
        .text(dateFrom ? formatDMY(dateFrom) : "Select date");
      $toBtn
        .children()
        .first()
        .text(dateTo ? formatDMY(dateTo) : "Select date");
      $cal.removeClass("show");
      syncTxnApply();
    }

    function pickTab(tab) {
      setTxnFilterTab(tab);
      daysDue = "all";
      dateFrom = dateTo = null;
      updateDays();
    }

    const sanctionField = initRangeField({
      fromId: "txnSanctionFrom",
      toId: "txnSanctionTo",
      errorId: "txnSanctionError",
      formatMsg:
        "Entered sanction limit is in wrong format, please enter a valid limit.",
      orderMsg:
        "Entered starting limit cannot be greater than ending limit, please enter a valid limit.",
      onChange: syncTxnApply,
    });

    const overdueField = initRangeField({
      fromId: "txnOverdueFrom",
      toId: "txnOverdueTo",
      errorId: "txnOverdueError",
      formatMsg:
        "Entered overdue amount is in wrong format, please enter a valid amount.",
      orderMsg:
        "Entered starting amount cannot be greater than ending amount, please enter a valid amount.",
      onChange: syncTxnApply,
    });

    initDateRangePicker({
      $cal: $cal,
      $fromBtn: $fromBtn,
      $toBtn: $toBtn,
      getRange: function () {
        return { from: dateFrom, to: dateTo };
      },
      onOk: function (from, to) {
        dateFrom = from;
        dateTo = to;
        updateDays();
      },
    });

    renderFirmOptions(
      $("#txnFirmDropdown .dealer-filter-dropdown-panel").first(),
      transactionData.map(function (item) {
        return { name: item.firm, meta: "Code: " + item.code };
      }),
    );

    if ($openBtn.length && $overlay.length) {
      $openBtn.on("click", function () {
        setTxnFilterTab(txnState.tab);
        daysDue = txnState.daysDue;
        dateFrom = txnState.dateFrom;
        dateTo = txnState.dateTo;
        updateDays();
        $overlay.addClass("show");
      });
    }

    $closeBtn.on("click", closeOverlay);

    $overlay.on("click", function (event) {
      if (event.target === $overlay[0]) closeOverlay();
    });

    $tabsWrap.find(".dealer-filter-pill").on("click", function () {
      pickTab($(this).attr("data-tab"));
    });

    $daysPills.on("click", function () {
      daysDue = $(this).attr("data-value");
      if (daysDue !== "custom") dateFrom = dateTo = null;
      updateDays();
    });

    $resetBtn.on("click", function () {
      $("#txnSanctionFrom, #txnSanctionTo, #txnOverdueFrom, #txnOverdueTo").val(
        "",
      );

      sanctionField.reset();
      overdueField.reset();
      $overlay.find(".dealer-filter-dropdown").each(function () {
        resetFilterDropdown($(this));
      });
      pickTab("all");
    });

    $applyBtn.on("click", function () {
      txnState.tab = getActiveTab();
      txnState.firms = getCheckedValues("#txnFirmDropdown");
      txnState.sanctionFrom = readNumber("txnSanctionFrom");
      txnState.sanctionTo = readNumber("txnSanctionTo");
      txnState.overdueFrom = readNumber("txnOverdueFrom");
      txnState.overdueTo = readNumber("txnOverdueTo");
      txnState.daysDue = daysDue;
      txnState.dateFrom = dateFrom;
      txnState.dateTo = dateTo;

      $toolbarTabs.each(function () {
        $(this).toggleClass(
          "active",
          $(this).attr("data-txn-filter") === txnState.tab,
        );
      });

      applyTxnFilters();
      closeOverlay();
      showAppToast("Filters applied successfully");
    });
  }

  function initTransactionDashboard() {
    const $listBody = $("#txnTableBody");
    const $gridBody = $("#txnTableViewBody");
    const $txnPage = $("#transactionDashboardPage");
    if (!$listBody.length || !$gridBody.length) return;

    $listBody.html(transactionData.map(renderTxnRow).join(""));
    $gridBody.html(transactionData.map(renderTxnGridRow).join(""));

    bindTxnRowExpansion($listBody);
    bindTxnRefreshButtons();
    bindOpenTranchesModal();
    initTxnToolbar($txnPage);
    initTxnFiltersModal();
  }

  //  RENEWAL DETAILS

  const renewalActions = {
    enhance: "Enhance limit",
    update: "Update expiry",
    renew: "Renew limit",
  };

  const renewalActionIcons = {
    enhance: "arrow_circle_up",
    update: "update",
    renew: "autorenew",
  };

  const renewalCommon = {
    id: "CLB-000203606-PRO",
    phone: "+91 9836273854",
    uploadedBy: "ICICI Bank",
    /* TODO(backend): replace with API data */
    dealerCode: "T1H2E3M66",
    constitution: "Proprietorship",
    address: "132P, BKC, Mumbai, Maharashtra, 400001",
    accountNumber: "0102 0502 4537",
  };

  /* TODO(backend): replace with API data */
  const renewalData = [
    {
      firm: "Zenith Steel Traders",
      email: "harish@zenith.com",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹70,00,000.00",
      state: "due",
      days: 12,
      action: "enhance",
      vintage: "12 years",
    },
    {
      firm: "SunDesh Systems Pvt. Ltd",
      email: "keshav@sundesh.com",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹4,00,00,000.00",
      sanction: "₹65,00,000.00",
      state: "expired",
      days: 20,
      action: "update",
      vintage: "14 years",
    },
    {
      firm: "Chauhan Traders",
      email: "shivam@chauhan.com",
      uploadedBy: "Anchor corporate",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹3,00,00,000.00",
      sanction: "₹80,00,000.00",
      state: "due",
      days: 8,
      action: "renew",
      vintage: "15 years",
    },
    {
      firm: "Polychem Global",
      email: "aryan@polychem.com",
      years: "5 years",
      pan: "CFSG34527F",
      sales: "₹2,95,00,000.00",
      sanction: "₹90,00,000.00",
      state: "expired",
      days: 20,
      action: "update",
      vintage: "16 years",
    },
    {
      firm: "Vertex Industrial Solutions",
      email: "kartik@polychem.com",
      years: "2 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹95,00,000.00",
      state: "due",
      days: 4,
      action: "renew",
      vintage: "10 years",
    },
    {
      firm: "Kartikey Corporations",
      email: "keshav@kartikey.com",
      years: "6 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹70,00,000.00",
      state: "due",
      days: 24,
      action: "enhance",
      vintage: "13 years",
    },
    {
      firm: "TradersTech",
      email: "arjun@traderstech.com",
      years: "7 years",
      pan: "YAHS8D9573",
      sales: "₹3,00,00,000.00",
      sanction: "₹86,00,000.00",
      state: "due",
      days: 8,
      action: "renew",
      vintage: "9 years",
    },
    {
      firm: "Global Traders",
      email: "harshal@globaltraders.com",
      years: "9 years",
      pan: "MEJA8D9573",
      sales: "₹3,15,00,000.00",
      sanction: "₹86,00,000.00",
      state: "expired",
      days: 10,
      action: "update",
      vintage: "11 years",
    },
    {
      firm: "Zenith Steel Traders",
      email: "harish@zenith.com",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹70,00,000.00",
      state: "due",
      days: 12,
      action: "enhance",
      vintage: "12 years",
    },
    {
      firm: "SunDesh Systems Pvt. Ltd",
      email: "keshav@sundesh.com",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹4,00,00,000.00",
      sanction: "₹65,00,000.00",
      state: "expired",
      days: 20,
      action: "update",
      vintage: "14 years",
    },
    {
      firm: "Chauhan Traders",
      email: "shivam@chauhan.com",
      uploadedBy: "Anchor corporate",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹3,00,00,000.00",
      sanction: "₹80,00,000.00",
      state: "due",
      days: 8,
      action: "renew",
      vintage: "15 years",
    },
    {
      firm: "Polychem Global",
      email: "aryan@polychem.com",
      years: "5 years",
      pan: "CFSG34527F",
      sales: "₹2,95,00,000.00",
      sanction: "₹90,00,000.00",
      state: "expired",
      days: 20,
      action: "update",
      vintage: "16 years",
    },
    {
      firm: "Vertex Industrial Solutions",
      email: "kartik@polychem.com",
      years: "2 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹95,00,000.00",
      state: "due",
      days: 4,
      action: "renew",
      vintage: "10 years",
    },
    {
      firm: "Kartikey Corporations",
      email: "keshav@kartikey.com",
      years: "6 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹70,00,000.00",
      state: "due",
      days: 24,
      action: "enhance",
      vintage: "13 years",
    },
    {
      firm: "TradersTech",
      email: "arjun@traderstech.com",
      years: "7 years",
      pan: "YAHS8D9573",
      sales: "₹3,00,00,000.00",
      sanction: "₹86,00,000.00",
      state: "due",
      days: 8,
      action: "renew",
      vintage: "9 years",
    },
    {
      firm: "Global Traders",
      email: "harshal@globaltraders.com",
      years: "9 years",
      pan: "MEJA8D9573",
      sales: "₹3,15,00,000.00",
      sanction: "₹86,00,000.00",
      state: "expired",
      days: 10,
      action: "update",
      vintage: "11 years",
    },
    {
      firm: "Zenith Steel Traders",
      email: "harish@zenith.com",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹70,00,000.00",
      state: "due",
      days: 12,
      action: "enhance",
      vintage: "12 years",
    },
    {
      firm: "SunDesh Systems Pvt. Ltd",
      email: "keshav@sundesh.com",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹4,00,00,000.00",
      sanction: "₹65,00,000.00",
      state: "expired",
      days: 20,
      action: "update",
      vintage: "14 years",
    },
    {
      firm: "Chauhan Traders",
      email: "shivam@chauhan.com",
      uploadedBy: "Anchor corporate",
      years: "3 years",
      pan: "CFSG34527F",
      sales: "₹3,00,00,000.00",
      sanction: "₹80,00,000.00",
      state: "due",
      days: 8,
      action: "renew",
      vintage: "15 years",
    },
    {
      firm: "Polychem Global",
      email: "aryan@polychem.com",
      years: "5 years",
      pan: "CFSG34527F",
      sales: "₹2,95,00,000.00",
      sanction: "₹90,00,000.00",
      state: "expired",
      days: 20,
      action: "update",
      vintage: "16 years",
    },
    {
      firm: "Vertex Industrial Solutions",
      email: "kartik@polychem.com",
      years: "2 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹95,00,000.00",
      state: "due",
      days: 4,
      action: "renew",
      vintage: "10 years",
    },
    {
      firm: "Kartikey Corporations",
      email: "keshav@kartikey.com",
      years: "6 years",
      pan: "CFSG34527F",
      sales: "₹3,15,00,000.00",
      sanction: "₹70,00,000.00",
      state: "due",
      days: 24,
      action: "enhance",
      vintage: "13 years",
    },
    {
      firm: "TradersTech",
      email: "arjun@traderstech.com",
      years: "7 years",
      pan: "YAHS8D9573",
      sales: "₹3,00,00,000.00",
      sanction: "₹86,00,000.00",
      state: "due",
      days: 8,
      action: "renew",
      vintage: "9 years",
    },
    {
      firm: "Global Traders",
      email: "harshal@globaltraders.com",
      years: "9 years",
      pan: "MEJA8D9573",
      sales: "₹3,15,00,000.00",
      sanction: "₹86,00,000.00",
      state: "expired",
      days: 10,
      action: "update",
      vintage: "11 years",
    },
  ].map(function (item) {
    const today = new Date();
    const offset = item.state === "expired" ? -item.days : item.days;
    return $.extend({}, renewalCommon, item, {
      recommendation: item.sanction,
      expiryDate: new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + offset,
      ),
    });
  });

  const renewalState = {
    filter: "all",
    search: "",
    firms: [],
    uploadedBy: [],
    sanctionFrom: null,
    sanctionTo: null,
    range: "all",
    dateFrom: null,
    dateTo: null,
  };

  function getRenewalStatusMarkup(item, cls) {
    // const info = cls === "dealer-status" ? "ⓘ" : "i";

    if (item.state === "expired") {
      return (
        '<div class="renewal-status">' +
        '<span class="' +
        cls +
        ' rejected">Expired <small data-tooltip="This lead is expired."><span class="material-symbols-outlined">info</span></small></span>' +
        "</small></span>" +
        '<span class="renewal-status-sub">' +
        item.days +
        " days ago</span></div>"
      );
    }

    return (
      '<div class="renewal-status"><span class="' +
      cls +
      ' actioned">Expiry in ' +
      item.days +
      " days</span></div>"
    );
  }

  function getRenewalActionMarkup(item) {
    return (
      '<button type="button" class="renewal-action-link ' +
      item.action +
      '"><span class="material-symbols-outlined">' +
      renewalActionIcons[item.action] +
      "</span>" +
      renewalActions[item.action] +
      "</button>"
    );
  }

  function renderRenewalRow(item, index) {
    return `
      <tr class="renewal-row" data-renewal-status="${item.state}" data-renewal-index="${index}">
        <td class="renewal-cell renewal-cell--firm">
          <div class="dealer-firm">
            <span class="material-symbols-outlined dealer-pin" role="button" tabindex="0" aria-label="Pin dealer">push_pin</span>
            <div>
              <strong>${escapeHtml(item.firm)}</strong>
              <small class="renewal-firm-id">ID: <span class="id-value">${escapeHtml(item.id)}</span></small>
            </div>
          </div>
        </td>
        <td class="renewal-cell renewal-cell--extra renewal-cell--dealer" data-label="Dealer details">
          <div class="dealer-contact">
            <span data-value="${escapeHtml(item.phone)}">${escapeHtml(item.phone)}</span>
            <small data-value="${escapeHtml(item.email)}">${escapeHtml(item.email)}</small>
          </div>
        </td>
        <td class="renewal-cell renewal-cell--extra renewal-cell--assoc" data-label="Association with corporate">
          <div class="dealer-association">
            <strong>${escapeHtml(item.years)}</strong>
            <small>PAN: <span class="pan-value">${escapeHtml(item.pan)}</span></small>
          </div>
        </td>
        <td class="renewal-cell renewal-cell--extra renewal-cell--sales" data-label="Sales to dealer (last 12M)">${formatAmountMarkup(item.sales)}</td>
        <td class="renewal-cell renewal-cell--sanction" data-label="Sanction limit">${formatAmountMarkup(item.sanction)}</td>
        <td class="renewal-cell renewal-cell--status" data-label="Renewal status">${getRenewalStatusMarkup(item, "dealer-status")}</td>
        <td class="renewal-cell renewal-cell--actions">
          <div class="renewal-action">
            ${getRenewalActionMarkup(item)}
            <button type="button" class="renewal-expand-btn" aria-label="Toggle details"><span class="material-symbols-outlined">keyboard_arrow_down</span></button>
          </div>
        </td>
        <td class="renewal-cell renewal-cell--extra renewal-cell--vintage renewal-mobile-only" data-label="Business vintage">${escapeHtml(item.vintage)}</td>
        <td class="renewal-cell renewal-cell--extra renewal-cell--uploaded renewal-mobile-only" data-label="Uploaded by">${getUploadedByMarkup(item.firm, item.uploadedBy)}</td>
        <td class="renewal-cell renewal-cell--extra renewal-cell--recommend renewal-mobile-only" data-label="Recommendation limit">${formatAmountMarkup(item.recommendation)}</td>
      </tr>
      <tr class="renewal-details-row">
        <td><div class="renewal-detail-item"><span>Business vintage</span><strong>${escapeHtml(item.vintage)}</strong></div></td>
        <td><div class="renewal-detail-item"><span>Uploaded by</span><strong>${getUploadedByMarkup(item.firm, item.uploadedBy)}</strong></div></td>
        <td><div class="renewal-detail-item renewal-detail-item--end"><span>Recommendation limit</span><strong>${formatAmountMarkup(item.recommendation)}</strong></div></td>
        <td></td><td></td><td></td><td></td>
      </tr>
    `;
  }

  function renderRenewalGridRow(item, index) {
    return `
      <tr data-renewal-status="${item.state}" data-renewal-index="${index}">
        <td>
          <div class="table-firm">
            <span class="material-symbols-outlined dealer-pin" role="button" tabindex="0" aria-label="Pin dealer">push_pin</span>
            <div class="table-firm-name">${escapeHtml(item.firm)}<small class="table-firm-code renewal-firm-id">ID: <span class="id-value">${escapeHtml(item.id)}</span></small></div>
          </div>
        </td>
        <td><div class="renewal-action">${getRenewalActionMarkup(item)}</div></td>
        <td>${getRenewalStatusMarkup(item, "table-status")}</td>
        <td>${escapeHtml(item.phone)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.pan)}</td>
        <td>${formatAmountMarkup(item.sales)}</td>
        <td>${escapeHtml(item.years)}</td>
        <td>${formatAmountMarkup(item.sanction)}</td>
      </tr>
    `;
  }

  function closeAllRenewalDetails() {
    $(".renewal-row.is-expanded").removeClass("is-expanded");
    $(".renewal-details-row.is-visible").removeClass("is-visible");
  }

  function renewalItemMatches(item) {
    const s = renewalState;

    if (s.filter !== "all" && item.state !== s.filter) return false;
    if (s.firms.length && !s.firms.includes(item.firm)) return false;

    const sanction = parseCurrency(item.sanction);
    if (s.sanctionFrom !== null && sanction < s.sanctionFrom) return false;
    if (s.sanctionTo !== null && sanction > s.sanctionTo) return false;

    if (s.uploadedBy.length) {
      const key = /icici/i.test(item.uploadedBy) ? "icici" : "anchor";
      if (!s.uploadedBy.includes(key)) return false;
    }

    if (s.filter !== "all" && s.range !== "all") {
      if (s.range === "custom") {
        if (s.dateFrom && item.expiryDate < s.dateFrom) return false;
        if (s.dateTo && item.expiryDate > s.dateTo) return false;
      } else if (item.days > Number(s.range)) {
        return false;
      }
    }
    return true;
  }

  function applyRenewalFilters() {
    closeAllRenewalDetails();

    $(".renewal-row, .renewal-table-view tbody tr").each(function () {
      const $row = $(this);
      const item = renewalData[$row.attr("data-renewal-index")];
      const matchFilter = item ? renewalItemMatches(item) : true;
      const matchSearch =
        !renewalState.search ||
        $row.text().toLowerCase().includes(renewalState.search);
      $row.toggleClass("hidden-by-filter", !(matchFilter && matchSearch));
    });
  }

  function initRenewalFiltersModal() {
    const $overlay = $("#renewalFiltersOverlay");
    const $openBtn = $("#renewalFiltersBtn");
    if (!$overlay.length || !$openBtn.length) return;

    const $page = $("#renewalDetailsPage");
    const $applyBtn = $("#renewalFiltersApply");
    const $resetBtn = $("#renewalFiltersReset");
    const $tabPills = $("#renewalFilterTabs .dealer-filter-pill");
    const $daysField = $("#renewalDaysField");
    const $daysLabel = $("#renewalDaysLabel");
    const $daysPills = $("#renewalDaysPills .dealer-filter-pill");
    const $customField = $("#renewalCustomField");
    const $fromBtn = $("#renewalDateFrom");
    const $toBtn = $("#renewalDateTo");
    const $cal = $("#renewalCalendar");
    const $firmPanel = $(
      "#renewalFirmDropdown .dealer-filter-dropdown-panel",
    ).first();

    let tab = "all",
      range = "all",
      dateFrom = null,
      dateTo = null;
    let snapshot = null;

    function num(id) {
      return parseAmountInput($("#" + id).val());
    }

    renderFirmOptions(
      $firmPanel,
      renewalData.map(function (item) {
        return {
          name: item.firm,
          meta: "ID: " + item.id + "\nPAN: " + item.pan,
        };
      }),
    );
    initFirmSearch($("#renewalFirmSearchInput"), $firmPanel);

    function readFilters() {
      return {
        filter: tab,
        range: range,
        dateFrom: dateFrom ? dateFrom.getTime() : null,
        dateTo: dateTo ? dateTo.getTime() : null,
        firms: getCheckedValues("#renewalFirmDropdown"),
        uploadedBy: getCheckedValues("#renewalUploadedByDropdown"),
        sanctionFrom: num("renewalSanctionFrom"),
        sanctionTo: num("renewalSanctionTo"),
      };
    }

    function syncApply() {
      const incomplete = range === "custom" && (!dateFrom || !dateTo);
      const unchanged =
        snapshot !== null && JSON.stringify(readFilters()) === snapshot;
      const invalid = sanctionField.hasError();
      $applyBtn.prop("disabled", incomplete || unchanged || invalid);
    }

    const sanctionField = initRangeField({
      fromId: "renewalSanctionFrom",
      toId: "renewalSanctionTo",
      errorId: "renewalSanctionError",
      formatMsg:
        "Entered sanction limit is in wrong format, please enter a valid limit.",
      orderMsg:
        "Entered starting limit cannot be greater than ending limit, please enter a valid limit.",
      onChange: syncApply,
    });

    function updateExtra() {
      $tabPills.each(function () {
        $(this).toggleClass("active", $(this).attr("data-tab") === tab);
      });
      $daysField.toggle(tab !== "all");
      $daysLabel.text(tab === "expired" ? "Expired since" : "Days to expire");
      $daysPills.each(function () {
        $(this).toggleClass("active", $(this).attr("data-value") === range);
      });
      $customField.toggle(range === "custom");
      $fromBtn
        .children()
        .first()
        .text(dateFrom ? formatDMY(dateFrom) : "Select date");
      $toBtn
        .children()
        .first()
        .text(dateTo ? formatDMY(dateTo) : "Select date");
      $cal.removeClass("show");
    }

    function setTab(next) {
      tab = next;
      range = "all";
      dateFrom = dateTo = null;
      updateExtra();
    }

    initDateRangePicker({
      $cal: $cal,
      $fromBtn: $fromBtn,
      $toBtn: $toBtn,
      getRange: function () {
        return { from: dateFrom, to: dateTo };
      },
      onOk: function (from, to) {
        dateFrom = from;
        dateTo = to;
        updateExtra();
        syncApply();
      },
    });

    function closeOverlay() {
      $cal.removeClass("show");
      $overlay.removeClass("show");
    }

    $openBtn.on("click", function () {
      tab = renewalState.filter;
      range = renewalState.range;
      dateFrom = renewalState.dateFrom;
      dateTo = renewalState.dateTo;
      updateExtra();
      if (snapshot === null) snapshot = JSON.stringify(readFilters());
      $overlay.addClass("show");
      syncApply();
    });

    bindClick("renewalFiltersClose", closeOverlay);
    $overlay.on("click", function (event) {
      if (event.target === $overlay[0]) closeOverlay();
    });

    $tabPills.on("click", function () {
      setTab($(this).attr("data-tab"));
    });

    $daysPills.on("click", function () {
      range = $(this).attr("data-value");
      if (range !== "custom") dateFrom = dateTo = null;
      updateExtra();
    });

    $overlay.on("change input click", syncApply);

    $resetBtn.on("click", function () {
      setTab("all");
      $("#renewalSanctionFrom, #renewalSanctionTo").val("");
      sanctionField.reset();
      $overlay.find(".dealer-filter-dropdown").each(function () {
        resetFilterDropdown($(this));
      });
      syncApply();
    });

    $applyBtn.on("click", function () {
      const f = readFilters();

      renewalState.filter = f.filter;
      renewalState.range = f.range;
      renewalState.dateFrom = dateFrom;
      renewalState.dateTo = dateTo;
      renewalState.firms = f.firms;
      renewalState.uploadedBy = f.uploadedBy;
      renewalState.sanctionFrom = f.sanctionFrom;
      renewalState.sanctionTo = f.sanctionTo;

      $page.find(".renewal-filter-btn").each(function () {
        $(this).toggleClass(
          "active",
          $(this).attr("data-renewal-filter") === f.filter,
        );
      });

      snapshot = JSON.stringify(f);
      applyRenewalFilters();
      closeOverlay();
      showAppToast("Filters applied successfully");
    });
  }

  //  RENEW / ENHANCE LIMIT FLOW (reuses the add dealer lead modals)
  const LIMIT_FLOW_TEXT_ATTR = {
    renew: "data-renewal-text",
    enhance: "data-enhance-text",
  };

  let activeLimitFlow = "";

  function isLimitFlow() {
    return activeLimitFlow !== "";
  }

  function setLimitFlow(flow) {
    if (flow === activeLimitFlow) return;

    const on = flow !== "";
    $(".lead-only").toggle(!on);
    $(".renewal-only").toggle(on);

    $("[data-renewal-text]").each(function () {
      const $el = $(this);
      if (!isLimitFlow()) $el.attr("data-lead-text", $el.text());

      $el.text(
        on
          ? $el.attr(LIMIT_FLOW_TEXT_ATTR[flow]) ||
              $el.attr("data-renewal-text")
          : $el.attr("data-lead-text"),
      );
    });

    activeLimitFlow = flow;
  }

  function resetStepForm() {
    const $form = $("#addDealerLeadForm");

    $form[0].reset();
    $form.find(".input-error").removeClass("input-error");
    $form.find(".error-msg").removeClass("show");
    $form.find(".input-with-icon").removeClass("has-view");

    $form.find(".custom-select-wrapper").each(function () {
      const $wrap = $(this);
      const placeholder = $wrap
        .siblings("select")
        .find("option")
        .first()
        .text()
        .trim();
      $wrap.find(".selected-option").text(placeholder);
      $wrap.find(".option-item").removeClass("selected");
    });

    $(".custom-calendar-popup").each(function () {
      this._calState = null;
    });

    $("#monthlySalesGrid").empty();
    $(
      "#monthlySalesContainer, #monthlySalesSummary, #editMonthlySales, #endDateWrap, #limitHelper, #cityStateDisplay",
    ).hide();
    $("#endDateTrigger").closest(".date-input-wrap").show();
    $("#addMonthlySalesBtn").addClass("btn-disabled").prop("disabled", true);

    validateForm();
  }

  function startLimitFlow(flow, item) {
    setLimitFlow(flow);
    resetStepForm();

    $("[data-renewal-field]").each(function () {
      $(this).text(item[$(this).attr("data-renewal-field")] || "-");
    });

    $("#mobileNumber").val(String(item.phone || "").replace(/^\+91\s*/, ""));
    $("#emailId").val(item.email || "");
    $("#associationYears").val(parseInt(item.years, 10) || "");
    $("#recommendationLimit")
      .val(item.recommendation ? cleanAmount(item.recommendation) : "")
      .trigger("blur");

    validateForm();

    openModal("#addDelarLeadModal");
  }

  function endLimitFlow() {
    if (!isLimitFlow()) return;
    setLimitFlow("");
    resetStepForm();
  }

  function amountToWords(amount) {
    const ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    const units = [
      { value: 10000000, name: "crore" },
      { value: 100000, name: "lakh" },
      { value: 1000, name: "thousand" },
    ];

    function belowHundred(n) {
      if (n < 20) return ones[n];
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    }

    function belowThousand(n) {
      const hundreds = Math.floor(n / 100);
      const rest = n % 100;
      const head = hundreds ? ones[hundreds] + " hundred" : "";
      return head + (head && rest ? " " : "") + belowHundred(rest);
    }

    let remaining = Math.floor(amount);
    if (remaining === 0) return "Rupees zero";

    const parts = [];
    units.forEach(function (unit) {
      const count = Math.floor(remaining / unit.value);
      if (!count) return;
      parts.push(belowThousand(count) + " " + unit.name);
      remaining %= unit.value;
    });
    if (remaining) parts.push(belowThousand(remaining));

    return "Rupees " + parts.join(" ");
  }

  function initLimitFlowAmountField() {
    const $limit = $("#recommendationLimit");
    const $helper = $("#limitHelper");
    if (!$limit.length) return;

    const $wrap = $limit.closest(".input-with-icon");
    const $view = $("<span>", { class: "renewal-limit-view" }).appendTo($wrap);

    $(document).on("focus", "#recommendationLimit", function () {
      if (!isLimitFlow()) return;
      $wrap.removeClass("has-view");
      $limit.val(cleanAmount($limit.val()));
    });

    $(document).on("blur", "#recommendationLimit", function () {
      if (!isLimitFlow()) return;

      const amount = parseAmountInput($limit.val());
      if (amount === null) {
        $helper.hide();
        return;
      }

      const formatted = formatAmount(amount);
      $limit.val(formatted);
      $view.html(formatAmountMarkup(formatted));
      $wrap.addClass("has-view");
      $helper.text(amountToWords(amount)).show();
    });
  }

  function initStepModalScrollReset() {
    const modal = document.getElementById("stepModal");
    if (!modal) return;

    function resetScroll() {
      const scroller = modal.querySelector(".stepScroll");
      if (!scroller) return;

      // focused field (e.g. last input) scroll ko neeche kheench leta hai
      const active = document.activeElement;
      if (active && modal.contains(active)) active.blur();

      const toTop = function () {
        scroller.scrollTop = 0;
      };
      toTop();
      requestAnimationFrame(toTop);
      setTimeout(toTop, 120);
    }

    let wasOpen = false;
    new MutationObserver(function () {
      const isOpen = getComputedStyle(modal).display !== "none";
      if (isOpen && !wasOpen) resetScroll();
      wasOpen = isOpen;
    }).observe(modal, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });
  }

  function initRenewalFlow() {
    $(".renewal-only").hide();
    initLimitFlowAmountField();

    $(document).on(
      "click",
      ".addDealerMenu .menu-item[data-action='single-lead']",
      endLimitFlow,
    );
  }

  function initRenewalDashboard() {
    const $page = $("#renewalDetailsPage");
    const $listBody = $("#renewalTableBody");
    const $gridBody = $("#renewalTableViewBody");
    if (!$page.length || !$listBody.length || !$gridBody.length) return;

    $listBody.html(renewalData.map(renderRenewalRow).join(""));
    $gridBody.html(renewalData.map(renderRenewalGridRow).join(""));

    const $filterButtons = $page.find(".renewal-filter-btn");
    const $viewButtons = $page.find(".view-switch-btn");
    const $searchBox = $("#renewalSearchInput");
    const $hideBtn = $("#renewalHideDetailsBtn");

    $filterButtons.on("click", function () {
      const $btn = $(this);
      renewalState.filter = $btn.attr("data-renewal-filter");
      setActive($filterButtons, $btn);
      applyRenewalFilters();
    });

    $searchBox.on("input", function () {
      renewalState.search = ($searchBox.val() || "").trim().toLowerCase();
      applyRenewalFilters();
    });

    $viewButtons.on("click", function () {
      const $btn = $(this);
      setActive($viewButtons, $btn);
      $page.toggleClass(
        "renewal-grid-active",
        $btn.attr("data-view") === "grid",
      );
    });

    $hideBtn.on("click", function () {
      setDetailsHidden(!detailsHidden);
    });

    $listBody.on("click", ".renewal-expand-btn", function () {
      const $row = $(this).closest(".renewal-row");
      const $detailRow = $row.next();
      const wasOpen = $row.hasClass("is-expanded");

      closeAllRenewalDetails();

      if (!wasOpen) {
        $row.addClass("is-expanded");
        $detailRow.addClass("is-visible");
      }
    });

    $page.on("click", ".renewal-action-link", function () {
      if ($(this).hasClass("update")) {
        showAppToast(
          "This lead is expired",
          "warning",
          "This lead is expired. Please contact ICICI Bank SM/RM for enhancement.",
        );
      }

      const $link = $(this);
      const flow = Object.keys(LIMIT_FLOW_TEXT_ATTR).find(function (name) {
        return $link.hasClass(name);
      });

      if (flow) {
        startLimitFlow(
          flow,
          renewalData[$link.closest("tr").attr("data-renewal-index")],
        );
      }
      /* TODO: "Enhance limit" flow */
    });
    initRenewalFiltersModal();
  }

  //  UPLOADED DETAILS MODAL (shared: new dealer + renewal)

  const UPLOAD_ROLES = {
    icici: {
      subtitle: "Dealer was added by ICICI Bank SM",
      showSm: true,
    },
    anchor: {
      subtitle: "Dealer was added by anchor corporate representative",
      showSm: false,
    },
  };

  /* TODO(backend): replace with API data */
  const ICICI_SM = {
    name: "Aryan Rathee",
    phone: "+91 7432345677",
    email: "aryan.rathee@icici.bank.in",
  };
  const ANCHOR_REP_DEFAULT = {
    name: "Keshav Mishra",
    mobile: "9867546875",
    email: "keshav.mishra@gmail.com",
  };
  const EMPTY_REP = { name: "", mobile: "", email: "" };
  const REP_TITLE = "Anchor corporate representative details";
  const SM_AVATAR =
    '<img src="../assets/image/dashboard/icici-icon.svg" alt="ICICI Bank" />';
  const REP_AVATAR =
    '<img src="../assets/image/dashboard/user-image.svg" alt="Human Image" />';
  const UPLOAD_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const UD_RULES = {
    name: {
      test: function (v) {
        return /^[A-Za-z][A-Za-z\s.'-]*$/.test(v);
      },
      empty: "Please enter name.",
      bad: "Entered name is in wrong format, please enter a valid name.",
    },
    mobile: {
      test: function (v) {
        return /^\d{10}$/.test(v);
      },
      empty: "Please enter mobile number.",
      bad: "Entered mobile number is in wrong format, please enter a valid 10-digit mobile number.",
    },
    email: {
      test: function (v) {
        return UPLOAD_EMAIL_RE.test(v);
      },
      empty: "Please enter email ID.",
      bad: "Entered email ID is in wrong format, please enter a valid email ID.",
    },
  };

  function getUdError(field, value) {
    const rule = UD_RULES[field];
    if (!value) return rule.empty;
    return rule.test(value) ? "" : rule.bad;
  }

  const anchorReps = {};

  function getUploadRole(uploadedBy) {
    return /icici/i.test(uploadedBy) ? "icici" : "anchor";
  }

  function getUploadIconMarkup(firm, uploadedBy) {
    return (
      '<i class="dealer-upload-user-icon material-symbols-outlined" role="button" tabindex="0"' +
      ' aria-label="View uploaded details"' +
      ' data-upload-firm="' +
      escapeHtml(firm) +
      '"' +
      ' data-upload-role="' +
      getUploadRole(uploadedBy) +
      '">person</i>'
    );
  }

  function getUploadedByMarkup(firm, uploadedBy) {
    const role = getUploadRole(uploadedBy);
    const words = String(uploadedBy).trim().split(/\s+/);
    const lastWord = role === "icici" ? words.splice(0).join(" ") : words.pop();
    const head = words.length ? escapeHtml(words.join(" ")) + " " : "";

    return (
      '<span class="dealer-upload-value">' +
      head +
      '<span class="dealer-upload-end">' +
      escapeHtml(lastWord) +
      getUploadIconMarkup(firm, uploadedBy) +
      "</span></span>"
    );
  }

  function getAnchorRep(firm, role) {
    if (anchorReps[firm]) return anchorReps[firm];
    return role === "anchor" ? ANCHOR_REP_DEFAULT : EMPTY_REP;
  }

  function isRepFilled(rep) {
    return Boolean(rep.name && rep.mobile && rep.email);
  }

  function contactRowMarkup(icon, value) {
    return (
      '<div class="ud-contact"><span class="material-symbols-outlined ud-contact-icon">' +
      icon +
      '</span><span class="ud-contact-text">' +
      escapeHtml(value) +
      '</span><button type="button" class="ud-copy" aria-label="Copy" data-copy="' +
      escapeHtml(value) +
      '"><span class="material-symbols-outlined">content_copy</span></button></div>'
    );
  }

  function personCardMarkup(opts) {
    const edit = opts.editable
      ? '<button type="button" class="ud-edit-link" data-ud-action="edit">' +
        '<span class="material-symbols-outlined">edit</span>Edit</button>'
      : "";

    return (
      '<div class="ud-card ud-card--filled">' +
      '<div class="ud-card-head"><p class="ud-card-title">' +
      opts.title +
      "</p>" +
      edit +
      "</div>" +
      '<div class="ud-person"><div class="ud-person-main">' +
      '<span class="ud-avatar">' +
      opts.avatar +
      "</span>" +
      "<div><small>Name</small><strong>" +
      escapeHtml(opts.name) +
      "</strong></div></div>" +
      '<div class="ud-person-contacts">' +
      contactRowMarkup("call", opts.phone) +
      contactRowMarkup("mail", opts.email) +
      "</div></div></div>"
    );
  }

  function repEmptyMarkup() {
    function field(label) {
      return (
        '<div><span class="ud-label">' +
        label +
        '</span><div class="ud-value">-</div></div>'
      );
    }
    return (
      '<div class="ud-card"><div class="ud-card-head"><p class="ud-card-title">' +
      REP_TITLE +
      "</p>" +
      '<button type="button" class="ud-edit-link" data-ud-action="edit">' +
      '<span class="material-symbols-outlined">edit</span>Edit</button></div>' +
      '<div class="ud-grid">' +
      field("Name") +
      field("Mobile number") +
      field("Email ID") +
      "</div></div>"
    );
  }

  function repFormMarkup(rep) {
    function err(field) {
      return (
        '<small class="filter-error" data-ud-error="' + field + '"></small>'
      );
    }
    return (
      '<div class="ud-card"><div class="ud-card-head"><p class="ud-card-title">' +
      REP_TITLE +
      "</p></div>" +
      '<div class="ud-grid">' +
      '<div class="ud-field"><label class="ud-label">Name</label>' +
      '<input type="text" class="ud-input" data-ud-field="name" placeholder="Enter name" value="' +
      escapeHtml(rep.name) +
      '" />' +
      err("name") +
      "</div>" +
      '<div class="ud-field"><label class="ud-label">Mobile number</label>' +
      '<div class="ud-mobile"><span class="ud-mobile-prefix">+91</span>' +
      '<input type="text" class="ud-input" data-ud-field="mobile" inputmode="numeric" maxlength="10" placeholder="10 digit mobile number" value="' +
      escapeHtml(rep.mobile) +
      '" /></div>' +
      err("mobile") +
      "</div>" +
      '<div class="ud-field"><label class="ud-label">Email ID</label>' +
      '<input type="text" class="ud-input" data-ud-field="email" placeholder="Enter email ID" value="' +
      escapeHtml(rep.email) +
      '" />' +
      err("email") +
      "</div>" +
      '<div class="ud-actions"><button type="button" class="ud-save" data-ud-action="save">Save details</button></div>' +
      "</div></div>"
    );
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise(function (resolve) {
      const $tmp = $("<textarea>").val(value).appendTo("body");
      $tmp[0].select();
      document.execCommand("copy");
      $tmp.remove();
      resolve();
    });
  }

  function initUploadedDetails() {
    const $overlay = $("#uploadedDetailsOverlay");
    if (!$overlay.length) return;

    const $subtitle = $("#uploadedDetailsSubtitle");
    const $body = $("#uploadedDetailsBody");
    const state = { firm: "", role: "icici", mode: "view" };

    function render() {
      const cfg = UPLOAD_ROLES[state.role];
      const rep = getAnchorRep(state.firm, state.role);
      let html = "";

      if (cfg.showSm) {
        html += personCardMarkup({
          title: "ICICI Bank SM details",
          avatar: SM_AVATAR,
          name: ICICI_SM.name,
          phone: ICICI_SM.phone,
          email: ICICI_SM.email,
        });
      }

      if (state.mode === "edit") {
        html += repFormMarkup(rep);
      } else if (isRepFilled(rep)) {
        html += personCardMarkup({
          title: REP_TITLE,
          avatar: REP_AVATAR,
          name: rep.name,
          phone: "+91 " + rep.mobile,
          email: rep.email,
          editable: true,
        });
      } else {
        html += repEmptyMarkup();
      }

      $subtitle.text(cfg.subtitle);
      $body.html(html);
    }

    function open(firm, role) {
      state.firm = firm;
      state.role = UPLOAD_ROLES[role] ? role : "icici";
      state.mode = "view";
      render();
      $overlay.addClass("show");
    }

    function close() {
      $overlay.removeClass("show");
    }

    function readForm() {
      const values = {};
      $body.find("[data-ud-field]").each(function () {
        values[$(this).attr("data-ud-field")] = ($(this).val() || "").trim();
      });
      return values;
    }

    function setFieldError(field, message) {
      const $input = $body.find('[data-ud-field="' + field + '"]');
      const $wrap = $input.closest(".ud-mobile");
      const $box = $wrap.length ? $wrap : $input;
      $box.toggleClass("is-error", Boolean(message));
      $body.find('[data-ud-error="' + field + '"]').text(message);
    }

    function saveRep() {
      const values = readForm();
      let valid = true;

      Object.keys(UD_RULES).forEach(function (field) {
        const message = getUdError(field, values[field]);
        setFieldError(field, message);
        if (message) valid = false;
      });
      if (!valid) return;

      /* TODO(backend): save API call here */
      anchorReps[state.firm] = values;
      state.mode = "view";
      render();
    }

    $(document).on("click", ".dealer-upload-user-icon", function (event) {
      event.stopPropagation();
      const $icon = $(this);
      open($icon.attr("data-upload-firm"), $icon.attr("data-upload-role"));
    });

    $(document).on("keydown", ".dealer-upload-user-icon", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        $(this).trigger("click");
      }
    });

    $overlay.on("click", "[data-ud-action]", function () {
      if ($(this).attr("data-ud-action") === "edit") {
        state.mode = "edit";
        render();
      } else {
        saveRep();
      }
    });

    $overlay.on("click", ".ud-copy", function () {
      const $btn = $(this);
      const $icon = $btn.find(".material-symbols-outlined");

      copyText($btn.attr("data-copy") || "").then(function () {
        $icon.text("check");
        $btn.addClass("is-copied");
        clearTimeout($btn.data("copyTimer"));
        $btn.data(
          "copyTimer",
          setTimeout(function () {
            $icon.text("content_copy");
            $btn.removeClass("is-copied");
          }, 1500),
        );
      });
    });

    $overlay.on("input", "[data-ud-field]", function () {
      setFieldError($(this).attr("data-ud-field"), "");
    });

    $overlay.on("focusout", "[data-ud-field]", function () {
      const field = $(this).attr("data-ud-field");
      const value = ($(this).val() || "").trim();
      if (value) setFieldError(field, getUdError(field, value));
    });

    $overlay.on("click", function (event) {
      if (event.target === $overlay[0]) close();
    });

    bindClick("uploadedDetailsClose", close);

    $(document).on("keydown", function (event) {
      if (event.key === "Escape" && $overlay.hasClass("show")) close();
    });
  }

  //  NAVIGATION

  function centerActiveTab($page) {
    const $activeTab = $page.find(".new-dealer-tab.active").first();
    const $tabList = $activeTab.closest(".new-dealer-tab-list");
    if (!$tabList.length) return;
    $tabList.scrollLeft(
      $activeTab.prop("offsetLeft") -
        ($tabList.prop("clientWidth") - $activeTab.prop("offsetWidth")) / 2,
    );
  }

  function getMenuRoute($item) {
    const $title = $item.find(".menu-title").first();
    return $title.length ? MENU_ROUTES[$title.text().trim().toLowerCase()] : "";
  }

  function syncMenuActive(which) {
    $menuItems.each(function () {
      const $item = $(this);
      $item.toggleClass("active", getMenuRoute($item) === which);
    });
  }

  function savePage(which) {
    try {
      sessionStorage.setItem(PAGE_STORAGE_KEY, which);
    } catch (error) {
      console.error("Could not save active page:", error);
    }
  }

  function getSavedPage() {
    try {
      const saved = sessionStorage.getItem(PAGE_STORAGE_KEY);
      return Object.values(MENU_ROUTES).includes(saved) ? saved : "";
    } catch (error) {
      return "";
    }
  }

  function setNdOffsets() {
    const $page = $(".new-dealer-page:visible").first();
    if (!$page.length) return;

    const root = document.documentElement.style;
    root.setProperty("--nd-top-offset", $page.offset().top + "px");

    const footer = document.getElementById("dashboardFooter");
    if (footer) {
      root.setProperty("--app-footer-height", footer.offsetHeight + "px");
    }
  }

  function showPage(which) {
    const pages = {
      newdealer: $("#newDealerPage"),
      transaction: $("#transactionDashboardPage"),
      renewal: $("#renewalDetailsPage"),
      dashboard: $(".Dashboard-page-section").first(),
    };

    $.each(pages, function (key, $page) {
      $page.hide();
    });

    const $target = pages[which];
    if (!$target || !$target.length) return;

    $target.show();
    if (
      which === "newdealer" ||
      which === "transaction" ||
      which === "renewal"
    ) {
      $(".dashboard-wrapper").hide();
    } else {
      $(".dashboard-wrapper").show();
    }
    $("html").toggleClass("nd-page-active", which !== "dashboard");
    setNdOffsets();
    centerActiveTab($target);
    syncMenuActive(which);
    savePage(which);
  }

  function initNavigation() {
    $menuItems.each(function () {
      const $item = $(this);
      const route = getMenuRoute($item);
      if (!route) return;

      $item.on("click", function () {
        showPage(route);
      });
    });

    $("[data-goto]").on("click", function () {
      showPage($(this).attr("data-goto"));
    });

    $(document).on(
      "click",
      ".Dashboard-page-section .card-header .view-details",
      function (event) {
        event.preventDefault();

        const title = $(this)
          .closest(".card-header")
          .find("h2")
          .text()
          .trim()
          .toLowerCase();
        const route = VIEW_DETAILS_ROUTES[title];

        if (!route) return;
        showPage(route);
        window.scrollTo(0, 0);
      },
    );

    function initHeaderCollapse() {
      $(".new-dealer-table-wrapper, .dealer-table-view-wrapper").on(
        "wheel",
        function (e) {
          var ev = e.originalEvent;
          if (Math.abs(ev.deltaY) <= Math.abs(ev.deltaX)) return;

          var $page = $(this).closest(".new-dealer-page");
          if (ev.deltaY > 0) {
            $page.addClass("header-collapsed");
          } else if (this.scrollTop === 0) {
            $page.removeClass("header-collapsed");
          }
        },
      );
    }

    initHeaderCollapse();
  }

  applyDealerCellLabels();
  initDealerAmounts();
  initializeDetailRows();
  initStatusTooltips();
  initDealerFiltersModal();
  initFilterDropdowns();
  initDealerFirmFilter();
  initShareViaMail();
  initScrollLock();
  prepareContactIcons();

  initDealerFilterButtons();
  initDealerSearch();
  initRowExpansion();
  initDetailsToggle();
  initDealerViewSwitch();
  initLeadDeletion();
  applyCurrentView();

  initTransactionDashboard();
  initRenewalDashboard();
  initRenewalFlow();
  initStepModalScrollReset();
  wrapCodeValues();
  initInfoTooltips();
  initUploadedDetails();
  initPinning();
  initNavigation();
  applySavedPins();
  setDetailsHidden(detailsHidden);

  $(document).on("click", "#proceedBtn", function () {
    try {
      sessionStorage.removeItem(PAGE_STORAGE_KEY);
    } catch (error) {
      console.error("Could not clear active page:", error);
    }
  });

  const savedPage = getSavedPage();
  if (savedPage && savedPage !== "dashboard") showPage(savedPage);
  $(".Dashboard-page-section").addClass("page-ready");

  $(window).on("resize load", setNdOffsets);
});

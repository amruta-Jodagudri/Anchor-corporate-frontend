// Mobile nav function
$(document).on("click", ".mobile-nav-item", function () {
  $(".mobile-nav-item").removeClass("active");

  $(this).addClass("active");

  const tab = $(this).data("tab");

  if (tab === "dashboard") {
    $("#mobileProfileSection").hide();
    $("#dashboard-title").show();
    $("#dashboard-top-section").show();
    $("#dashboardTop").show();
    $("#stepper-card").show();
    $("#dashboardCard").show();
    $(".dashboardCardHigh").show();
    $(".Dashboard-page-section").show();
  }

  if (tab === "profile") {
    $("#dashboard-top-section").hide();
    $("#mobileProfileSection").show();
    $("#dashboard-title").hide();

    $("#stepper-card").hide();
    $("#dashboardCard").hide();
    $("#dashboardEsign").hide();
    $("#dashboardDocuments").hide();
    $(".dashboardCardHigh").hide();
    $(".Dashboard-page-section").hide();
  }

  lucideIconCommonCode();
});

// Edit profile
$(document).on("click", "#mobileEditProfileBtn", function () {
  openModal("#profileEditModal");
});

// Update profile
$(document).on("click", "#updateProfileBtn", function () {
  const name = $("#editName").val();
  const dob = $("#editDob").val();
  const email = $("#editEmail").val();
  const mobile = $("#editMobile").val();
  const address = $("#editAddress").val();

  $("#profileName").text(name);
  $("#profileDob").text(dob);
  $("#profileEmail").text(email);
  $("#profileMobile").text(mobile);
  $("#profileAddress").text(address);

  $("#mobileProfileName").text(name);
  $("#mobileProfileDob").text(dob);
  $("#mobileProfileEmail").text(email);
  $("#mobileProfileMobile").text(mobile);
  $("#mobileProfileAddress").text(address + " Mumbai, Maharshtra");

  closeModal("#profileEditModal");
});

// graph data
var leadsData = [
  {
    label: "To be actioned",
    value: 18,
    display: "18",
    color: "#0B46B4",
    dotClass: "legend-dot-blue-1",
  },
  {
    label: "Sanction approved",
    value: 35,
    display: "35",
    color: "#072E75",
    dotClass: "legend-dot-blue-2",
  },
  {
    label: "Current account pending",
    value: 12,
    display: "12",
    color: "#0F62FE",
    dotClass: "legend-dot-blue-3",
  },
  {
    label: "eSign pending",
    value: 7,
    display: "7",
    color: "#5E96FE",
    dotClass: "legend-dot-blue-4",
  },
  {
    label: "Limit setup pending",
    value: 16,
    display: "16",
    color: "#B5CEFF",
    dotClass: "legend-dot-blue-5",
  },
  {
    label: "Application rejected",
    value: 12,
    display: "12",
    color: "#B4CDFF",
    dotClass: "legend-dot-blue-6",
  },
  {
    label: "Limit steup done",
    value: 8,
    display: "8",
    color: "#E7EFFF",
    dotClass: "legend-dot-blue-7",
  },
];

var sanctionViews = {
  utilized: {
    label: "Program utilized limit",
    value: "₹12,80,00,000.00",
    segments: [
      {
        label: "Upcoming",
        value: 1130,
        display: "₹11,30,00,000",
        color: "#FFBD61",
        dotClass: "legend-dot-orange",
      },
      {
        label: "Overdue",
        value: 150,
        display: "₹1,50,00,000",
        color: "#DE343D",
        dotClass: "legend-dot-red",
      },
    ],
  },

  available: {
    label: "Program available limit",
    value: "₹5,20,00,000.00",
    segments: [
      {
        label: "Usable limit",
        value: 430,
        display: "₹4,30,00,000",
        color: "#198038",
        dotClass: "legend-dot-green",
      },
      {
        label: "Restricted limit",
        value: 90,
        display: "₹90,00,000",
        color: "#DE343D",
        dotClass: "legend-dot-red",
      },
    ],
  },
};

// var renewalData = [
//   {
//     label: "Expired",
//     value: 15,
//     display: "15",
//     color: "#0B46B4",
//   },
//   {
//     label: "Renewal due in 30 days",
//     value: 42,
//     display: "42",
//     color: "#5E96FE",
//   },
//   {
//     label: "Renewal due in 90 days",
//     value: 78,
//     display: "78",
//     color: "#B5CEFF",
//   },
// ];

var renewalData = [
  {
    label: "Expired",
    value: 15,
    display: "15",
    color: "#FFAA33",
    dotClass: "legend-dot-renewal-orange",
  },
  {
    label: "Renewal due in 30 days",
    value: 42,
    display: "42",
    color: "#FFC676",
    dotClass: "legend-dot-renewal-light-orange",
  },
  {
    label: "Renewal due in 90 days",
    value: 78,
    display: "78",
    color: "#FFE5C0",
    dotClass: "legend-dot-renewal-pale-orange",
  },
];

$(function () {
  lucideIconCommonCode();

  function paintDonut($el, segments) {
    var total = segments.reduce(function (sum, s) {
      return sum + s.value;
    }, 0);

    var size = $el[0].clientWidth || 240;
    var outerRadius = size / 2;
    var innerRadius = outerRadius * 0.72;
    var cornerRadius = 8;

    $el.empty();

    var svg = d3
      .select($el[0])
      .append("svg")
      .attr("viewBox", "0 0 " + size + " " + size)
      .attr("width", "100%")
      .attr("height", "100%")
      .append("g")
      .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

    var pie = d3
      .pie()
      .value(function (d) {
        return d.value;
      })
      .sort(null)
      .padAngle(total > 0 ? 0.035 : 0);

    var arcGen = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(cornerRadius);

    svg
      .selectAll("path")
      .data(pie(segments))
      .enter()
      .append("path")
      .attr("d", arcGen)
      .attr("fill", function (d) {
        return d.data.color;
      });
  }

  function renderLegendGrid($container, items) {
    $container.empty();
    items.forEach(function (item) {
      var $entry = $(
        '<div class="legend-entry" data-label="' +
          item.label +
          '" data-count="' +
          item.display +
          '">' +
          '<div class="legend-title">' +
          '<div class="legend-top">' +
          '<span class="legend-dot ' +
          item.dotClass +
          '"></span>' +
          "<span>" +
          item.label +
          "</span>" +
          "</div>" +
          '<i data-lucide="chevron-right" class="legend-arrow"></i>' +
          "</div>" +
          '<div class="legend-count">' +
          item.display +
          '<span class="dealer-count"> dealers' +
          "</span>" +
          '<span class="zero-count">.00' +
          "</span>" +
          "</div>" +
          "</div>",
      );
      $container.append($entry);
    });
    lucideIconCommonCode();
  }

  function renderLegendList($container, items) {
    $container.empty();
    items.forEach(function (item) {
      var $entry = $(
        '<div class="legend-entry">' +
          '<div class="legend-title">' +
          '<div class="legend-top">' +
          '<span class="legend-dot ' +
          item.dotClass +
          '"></span>' +
          "<span>" +
          item.label +
          "</span>" +
          "</div>" +
          '<i data-lucide="chevron-right" class="legend-arrow"></i>' +
          "</div>" +
          '<div class="legend-count">' +
          item.display +
          '<span class="dealer-count"> dealers' +
          "</span>" +
          '<span class="zero-count">.00' +
          "</span>" +
          "</div>" +
          "</div>",
      );
      $container.append($entry);
    });
    lucideIconCommonCode();
  }

  paintDonut($("#leadsDonut"), leadsData);
  renderLegendGrid($("#leadsLegend"), leadsData);

  function renderSanctionView(view) {
    var data = sanctionViews[view];
    paintDonut($("#sanctionDonut"), data.segments);
    renderLegendList($("#sanctionLegend"), data.segments);
    $("#sanctionCenterLabel").text(data.label);
    $("#sanctionCenterValue").text(data.value);

    $("#utilizedBox").toggleClass("active", view === "utilized");
    $("#availableBox").toggleClass("active", view === "available");
  }

  renderSanctionView("utilized");

  $(".toggle-box").on("click", function () {
    renderSanctionView($(this).data("view"));
  });

  paintDonut($("#renewalDonut"), renewalData);
  renderLegendList($("#renewalLegend"), renewalData);
});

$("#addDealerBtn").on("click", function (e) {
  e.stopPropagation();
  $("#addDealerMenu").toggleClass("open");
});

$("#dateSelect").on("click", function (e) {
  e.stopPropagation();
});

// new leads table
$(document).on(
  "click",
  ".two-col-row .saction-part .card .legend-entry",
  function () {
    const title = $(this).attr("data-label");
    const count = $(this).attr("data-count");

    $("#leadTitle").text(title);
    $("#leadCount").text(count);

    renderLeadTable(title);
    openModal("#leadTableModal");

    lucideIconCommonCode();
  },
);

$(document).on("click", "#leadTableCloseBtn, #leadTableCloseIcon", function () {
  closeModal("#leadTableModal");
});

var leadTableColumns = {
  sanction: [
    {
      key: "firm",
      label: "Firm details",
      sort: true,
    },
    {
      key: "dealer",
      label: "Dealer details",
      sort: false,
    },
    {
      key: "sanctionLimit",
      label: "Sanction limit",
      sort: true,
    },
    {
      key: "leadType",
      label: "Lead type",
      sort: false,
    },
    {
      key: "bankSM",
      label: "ICICI Bank SM",
      sort: true,
    },
  ],

  actioned: [
    {
      key: "firm",
      label: "Firm details",
      sort: true,
    },
    {
      key: "dealer",
      label: "Dealer details",
      sort: false,
    },
    {
      key: "loanOffer",
      label: "Loan offer",
      sort: true,
    },
    {
      key: "bankSM",
      label: "ICICI Bank SM",
      sort: true,
    },
    {
      key: "leadType",
      label: "Lead type",
      sort: true,
    },
    {
      key: "customerStatus",
      label: "Customer contacted status",
      sort: false,
    },
  ],

  rejected: [
    {
      key: "firm",
      label: "Firm details",
      sort: true,
    },
    {
      key: "dealer",
      label: "Dealer details",
      sort: false,
    },
    {
      key: "loanOffer",
      label: "Loan offer",
      sort: true,
    },
    {
      key: "leadType",
      label: "Lead type",
      sort: false,
    },
    {
      key: "bankSM",
      label: "ICICI Bank SM",
      sort: true,
    },
  ],
};

function getLeadTableColumns(title) {
  if (title === "To be actioned") {
    return leadTableColumns.actioned;
  }

  if (title === "Application rejected" || title === "Application Rejected") {
    return leadTableColumns.rejected;
  }

  return leadTableColumns.sanction;
}

var leadTableData = [
  {
    firm: {
      name: "Surya Prakash Electrical Traders",
      id: "CLB-00000000-4563-PRO",
    },

    dealer: {
      phone: "9836273854",
      email: "info@suryaprakash.com",
    },

    sanctionLimit: {
      amount: "₹2,80,00,000.00",
      date: "20 Jun '25",
    },

    loanOffer: "₹2,80,00,000.00",

    leadType: {
      type: "Fresh",
      constitution: "Proprietor",
    },

    bankSM: {
      name: "Manish Sharma",
      phone: "9836273854",
    },

    customerStatus: {
      status: "N",
      reason: "mobile",
    },

    corporateRep: {
      name: "",
      mobile: "",
      email: "",
    },
  },

  {
    firm: {
      name: "Bhavani Industrial Power Supplies",
      id: "CLB-00000000-7291-PRO",
    },

    dealer: {
      phone: "8754629301",
      email: "contact@bhavanipower.com",
    },

    sanctionLimit: {
      amount: "₹1,80,00,000.00",
      date: "20 Jun '25",
    },

    loanOffer: "₹1,80,00,000.00",

    leadType: {
      type: "Fresh",
      constitution: "Proprietor",
    },

    bankSM: {
      name: "Rajesh Sharma",
      phone: "9836273854",
    },

    customerStatus: {
      status: "N",
      reason: "email",
    },

    corporateRep: {
      name: "Karan Patel",
      mobile: "9836472345",
      email: "karan@gmail.com",
    },
  },

  {
    firm: {
      name: "Ganesh Techno Power Solutions",
      id: "CLB-00000000-9847-PRO",
    },

    dealer: {
      phone: "9173648520",
      email: "hello@ganeshtechno.com",
    },

    sanctionLimit: {
      amount: "₹2,50,00,000.00",
      date: "20 Jun '25",
    },

    loanOffer: "₹2,50,00,000.00",

    leadType: {
      type: "Old",
      constitution: "Proprietor",
    },

    bankSM: {
      name: "Amit Verma",
      phone: "9836273854",
    },

    customerStatus: {
      status: "Y",
      reason: "",
    },

    corporateRep: {
      name: "",
      mobile: "",
      email: "",
    },
  },

  {
    firm: {
      name: "Mahalakshmi Electrical Enterprises",
      id: "CLB-00000000-6134-PRO",
    },

    dealer: {
      phone: "7892341056",
      email: "sales@mahalakshmiee.com",
    },

    sanctionLimit: {
      amount: "₹1,56,00,000.00",
      date: "20 Jun '25",
    },

    loanOffer: "₹1,56,00,000.00",

    leadType: {
      type: "Fresh",
      constitution: "Proprietor",
    },

    bankSM: {
      name: "Suresh Gupta",
      phone: "9836273854",
    },

    customerStatus: {
      status: "N",
      reason: "mobile",
    },

    corporateRep: {
      name: "Karan Patel",
      mobile: "9836472345",
      email: "karan@gmail.com",
    },
  },

  {
    firm: {
      name: "Shree Sai Power and Tools Pvt.",
      id: "CLB-00000000-9052-PRO",
    },

    dealer: {
      phone: "8361920475",
      email: "ops@shreesaitools.com",
    },

    sanctionLimit: {
      amount: "₹2,20,00,000.00",
      date: "20 Jun '25",
    },

    loanOffer: "₹2,20,00,000.00",

    leadType: {
      type: "Old",
      constitution: "Proprietor",
    },

    bankSM: {
      name: "Vikram Singh",
      phone: "9836273854",
    },

    customerStatus: {
      status: "N",
      reason: "email",
    },

    corporateRep: {
      name: "Karan Patel",
      mobile: "9836472345",
      email: "karan@gmail.com",
    },
  },

  {
    firm: {
      name: "Kaveri Energy Systems and Trading",
      id: "CLB-00000000-2716-PRO",
    },

    dealer: {
      phone: "9047382615",
      email: "reach@kaverienergy.com",
    },

    sanctionLimit: {
      amount: "₹1,11,00,000.00",
      date: "20 Jun '25",
    },

    loanOffer: "₹1,11,00,000.00",

    leadType: {
      type: "Fresh",
      constitution: "Proprietor",
    },

    bankSM: {
      name: "Anil Mehta",
      phone: "9836273854",
    },

    customerStatus: {
      status: "Y",
      reason: "",
    },

    corporateRep: {
      name: "",
      mobile: "",
      email: "",
    },
  },
];

function renderLeadTableHeader(columns) {
  var headerHtml = "<tr>";

  columns.forEach(function (column) {
    headerHtml +=
      '<th class="' +
      (column.key === "sanctionLimit" ? "sanction-limit-column" : "") +
      '">';
    headerHtml += '<div class="table-header-content">';
    headerHtml +=
      '<span class="table-header-label">' + column.label + "</span>";
    if (column.sort) {
      headerHtml +=
        '<span class="material-icons table-sort-icon">import_export</span>';
    }
    headerHtml += "</div>";
    headerHtml += "</th>";
  });

  headerHtml += "<th></th>";
  headerHtml += "</tr>";
  $("#leadTableHead").html(headerHtml);
}

function renderLeadTableRows(columns, data) {
  var rowsHtml = "";

  data.forEach(function (row, index) {
    var rowClass = index % 2 !== 0 ? "even-row" : "";

    rowsHtml +=
      '<tr class="lead-table-row ' +
      rowClass +
      '" data-row-index="' +
      index +
      '">';

    columns.forEach(function (column) {
      rowsHtml +=
        '<td class="' +
        (column.key === "sanctionLimit" ? "sanction-limit-column" : "") +
        '">';

      if (column.key === "firm") {
        var firmName = row.firm.name || "";
        var displayName =
          firmName.length > 30 ? firmName.substring(0, 30) + "..." : firmName;

        rowsHtml +=
          '<div class="firm-name" data-full="' +
          firmName +
          '">' +
          displayName +
          "</div>" +
          '<div class="sub-text"><span class="firm-id">ID: </span>' +
          '<span class="masked-id">' +
          maskId(row.firm.id) +
          "</span>" +
          '<span class="real-id" style="display:none;">' +
          row.firm.id +
          "</span>" +
          "</div>";
      }

      if (column.key === "dealer") {
        rowsHtml +=
          '<div class="dealer-phone">' +
          '<span class="material-icons">phone</span><span class="country-code">+91 </span>' +
          '<span class="masked-phone">' +
          maskMobile(row.dealer.phone) +
          "</span>" +
          '<span class="real-phone" style="display:none;">' +
          row.dealer.phone +
          "</span>" +
          "</div>" +
          '<div class="dealer-email">' +
          '<span class="material-icons">mail_outline</span>' +
          '<span class="masked-email">' +
          maskEmail(row.dealer.email) +
          "</span>" +
          '<span class="real-email" style="display:none;">' +
          row.dealer.email +
          "</span>" +
          "</div>";
      }

      if (column.key === "sanctionLimit") {
        rowsHtml +=
          '<div class="limit-value">' +
          row.sanctionLimit.amount +
          "</div>" +
          '<div class="sub-text"><span class="sanction-limit">Sanction date: </span>' +
          row.sanctionLimit.date +
          "</div>";
      }

      if (column.key === "loanOffer") {
        rowsHtml += '<div class="limit-value">' + row.loanOffer + "</div>";
      }

      if (column.key === "leadType") {
        rowsHtml +=
          '<div class="lead-type">' +
          row.leadType.type +
          "</div>" +
          '<div class="sub-text"><span class="constitution">Constitution: </span>' +
          row.leadType.constitution +
          "</div>";
      }

      if (column.key === "bankSM") {
        rowsHtml +=
          '<div class="sm-name">' +
          row.bankSM.name +
          "</div>" +
          '<div class="dealer-phone">' +
          '<span class="material-icons">phone</span><span class="country-code">+91 </span>' +
          '<span class="masked-phone">' +
          maskMobile(row.bankSM.phone) +
          "</span>" +
          '<span class="real-phone" style="display:none;">' +
          row.bankSM.phone +
          "</span>" +
          "</div>";
      }

      if (column.key === "customerStatus") {
        if (row.customerStatus.status === "Y") {
          rowsHtml +=
            '<span class="customer-status">Application to be actioned</span>';
        }

        if (row.customerStatus.status === "N") {
          var reasonText = "";
          if (row.customerStatus.reason === "email") {
            reasonText = "CSR - Email ID incorrect";
          }
          if (row.customerStatus.reason === "mobile") {
            reasonText = "CSR - Mobile number incorrect";
          }
          rowsHtml +=
            '<div class="customer-status customer-status-error">' +
            '<i data-lucide="info" class="customer-status-info"></i>' +
            "<span>" +
            reasonText +
            "</span>" +
            "</div>";
        }
      }

      rowsHtml += "</td>";
    });

    var rep = row.corporateRep || {};
    var hasData = rep.name || rep.mobile || rep.email;

    rowsHtml += `
      <td class="chevron-cell">
        <i data-lucide="chevron-down" class="expand-chevron"></i>
      </td>
    </tr>
    
    <tr class="expanded-row" style="display: none;">
      <td colspan="${columns.length + 1}">
        <div class="expanded-content">
          
          <!-- VIEW MODE -->
          <div class="rep-view-mode">
            <div class="rep-field">
              <span class="rep-label">Corporate representative name</span>
              <span class="rep-value">${hasData && rep.name ? rep.name : "-"}</span>
            </div>
            <div class="rep-field">
              <span class="rep-label">Mobile number</span>
              <span class="rep-value">${hasData && rep.mobile ? "+91 " + rep.mobile : "-"}</span>
            </div>
            <div class="rep-field">
              <span class="rep-label">Email ID</span>
              <span class="rep-value">${hasData && rep.email ? rep.email : "-"}</span>
            </div>
            <div class="rep-actions">
              <button class="edit-rep-btn">Edit details</button>
            </div>
          </div>

          <!-- EDIT MODE -->
          <div class="rep-edit-mode" style="display: none;">
            <div class="rep-field">
              <label class="rep-label">Corporate representative name</label>
              <input type="text" class="rep-input" id="repName" value="${rep.name || ""}" placeholder="Enter name">
              <span class="error-msg name-error" style="display:none;"><i data-lucide="info" class="error-info-icon"></i> Entered name is in wrong format, please enter a valid name.</span>
            </div>
            <div class="rep-field">
              <label class="rep-label">Mobile number</label>
              <div class="mobile-input-wrapper">
                <input type="text" class="rep-input" id="repMobile" value="${rep.mobile || ""}" maxlength="10" placeholder="Enter mobile">
              </div>
              <span class="error-msg mobile-error" style="display:none;"><i data-lucide="info" class="error-info-icon"></i> Entered mobile number should be of 10-digits, please enter a valid 10-digit number.</span>
            </div>
            <div class="rep-field">
              <label class="rep-label">Email ID</label>
              <input type="text" class="rep-input" id="repEmail" value="${rep.email || ""}" placeholder="Enter email">
              <span class="error-msg email-error" style="display:none;"><i data-lucide="info" class="error-info-icon"></i> Entered email ID is in wrong format, please enter a valid email ID.</span>
            </div>
            <div class="rep-actions">
              <button class="reset-rep-btn">Reset</button>
              <button class="save-rep-btn">Save</button>
            </div>
          </div>

        </div>
      </td>
    </tr>
    `;
  });

  $("#leadTableBody").html(rowsHtml);
}

function renderLeadTable(title) {
  var columns = getLeadTableColumns(title);

  renderLeadTableHeader(columns);
  renderLeadTableRows(columns, leadTableData);

  lucideIconCommonCode();
}

$(document).on("click", ".expand-chevron", function (e) {
  e.stopPropagation();

  var $currentChevron = $(this);
  var $currentRow = $currentChevron.closest("tr.lead-table-row");
  var $currentExpandedRow = $currentChevron.closest("tr").next(".expanded-row");

  var isAlreadyOpen = $currentExpandedRow.is(":visible");

  $(".expanded-row").hide();
  $(".expand-chevron").removeClass("rotated");
  $("#leadTableBody tr.lead-table-row").removeClass("row-expanded");

  if (!isAlreadyOpen) {
    $currentExpandedRow.show();
    $currentChevron.addClass("rotated");
    $currentRow.addClass("row-expanded");
  }
});

$(document).on("click", ".edit-rep-btn", function (e) {
  e.stopPropagation();
  var $container = $(this).closest(".expanded-content");
  $container.find(".rep-view-mode").hide();
  $container.find(".rep-edit-mode").show();
});

$(document).on("click", ".reset-rep-btn", function (e) {
  e.stopPropagation();
  var $container = $(this).closest(".expanded-content");
  var $editMode = $container.find(".rep-edit-mode");

  $editMode.find(".rep-input").val("");
  $editMode.find(".error-msg").hide();
  $editMode.find(".rep-input").removeClass("input-error");
});

$(document).on("click", ".save-rep-btn", function (e) {
  e.stopPropagation();
  var $container = $(this).closest(".expanded-content");
  var $editMode = $container.find(".rep-edit-mode");

  var name = $editMode.find("#repName").val().trim();
  var mobile = $editMode.find("#repMobile").val().trim();
  var email = $editMode.find("#repEmail").val().trim();

  var isValid = true;

  $editMode.find(".error-msg").hide();
  $editMode.find(".rep-input").removeClass("input-error");

  var nameRegex = /^[a-zA-Z\s]+$/;
  if (!name || !nameRegex.test(name)) {
    $editMode.find(".name-error").show();
    $editMode.find("#repName").addClass("input-error");
    isValid = false;
  }

  var mobileRegex = /^\d{10}$/;
  if (!mobile || !mobileRegex.test(mobile)) {
    $editMode.find(".mobile-error").show();
    $editMode.find("#repMobile").addClass("input-error");
    isValid = false;
  }

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    $editMode.find(".email-error").show();
    $editMode.find("#repEmail").addClass("input-error");
    isValid = false;
  }

  if (!isValid) return;

  $container.find(".rep-view-mode .rep-value").eq(0).text(name);
  $container
    .find(".rep-view-mode .rep-value")
    .eq(1)
    .text("+91 " + mobile);
  $container.find(".rep-view-mode .rep-value").eq(2).text(email);

  $container.find(".rep-edit-mode").hide();
  $container.find(".rep-view-mode").show();
});

$(document).on("focus", "#repName, #repMobile, #repEmail", function (e) {
  e.stopPropagation();
  $(this).removeClass("input-error");
  $(this).closest(".rep-field").find(".error-msg").hide();
});

// Mask firm, mobile number and email
function maskId(id) {
  if (!id) return "-";
  var prefix = id.split("-")[0];
  return prefix + "-xxxxxxxx-xxxx-xxx";
}

function maskMobile(mobile) {
  if (!mobile || mobile.length < 10) return mobile || "-";
  return "xxxxxxx" + mobile.slice(-3);
}

function maskEmail(email) {
  if (!email) return "-";
  var first3 = email.substring(0, 3);
  var masked = first3 + "xxxxxxxxxxxxxxxxxxxx";
  return masked + "...";
}

// Toggle View Details / Hide Details
$(document).on("click", ".LeadTableHideShowBtn", function (e) {
  e.stopPropagation();
  var $btn = $(this);
  var isShowing = $btn.hasClass("showing");

  if (isShowing) {
    $btn.removeClass("showing");

    // Mask Firm ID
    $("#leadTableBody .masked-id").show();
    $("#leadTableBody .real-id").hide();

    // Mask Mobile
    $("#leadTableBody .masked-phone").show();
    $("#leadTableBody .real-phone").hide();

    // Mask Email
    $("#leadTableBody .masked-email").show();
    $("#leadTableBody .real-email").hide();
  } else {
    $btn.addClass("showing");

    // Show real Firm ID
    $("#leadTableBody .masked-id").hide();
    $("#leadTableBody .real-id").show();

    // Show real Mobile
    $("#leadTableBody .masked-phone").hide();
    $("#leadTableBody .real-phone").show();

    // Show real Email
    $("#leadTableBody .masked-email").hide();
    $("#leadTableBody .real-email").show();
  }

  lucideIconCommonCode();
});

function lucideIconCommonCode() {
  if (window.lucide) lucide.createIcons();
}

$(".custom-modal-overlay, .esign-modal-overlay").on("click", function (e) {
  if (e.target === this) {
    e.stopPropagation();
    return false;
  }
});

function openModal(modal) {
  $(modal).show();
  $("body").addClass("modal-open");
}

function closeModal(modal) {
  $(modal).hide();
  $("body").removeClass("modal-open");
}

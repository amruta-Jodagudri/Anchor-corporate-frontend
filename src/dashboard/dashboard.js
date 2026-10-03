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

$(document).on("click", ".addDealerBtn", function (e) {
  e.stopPropagation();
  $(".addDealerMenu").removeClass("open");
  $(this).siblings(".addDealerMenu").toggleClass("open");
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

function renderLeadTableRows(columns, data, title) {
  var rowsHtml = "";
  var cardsHtml = "";

  var cardType = "default";
  if (title === "To be actioned") {
    cardType = "actioned";
  } else if (title === "Sanction approved") {
    cardType = "sanction";
  } else if (
    title === "Application rejected" ||
    title === "Application Rejected"
  ) {
    cardType = "rejected";
  } else if (
    title === "Current account pending" ||
    title === "eSign pending" ||
    title === "Limit setup pending" ||
    title === "Limit steup done"
  ) {
    cardType = "currentAccount";
  }

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

    var firmNameCard = row.firm.name || "";
    var displayNameCard =
      firmNameCard.length > 18
        ? firmNameCard.substring(0, 18) + "..."
        : firmNameCard;

    var firmId = row.firm.id || "";
    var maskedId = maskId(firmId);
    var displayMaskedId =
      maskedId.length > 16 ? maskedId.substring(0, 16) + "..." : maskedId;
    var displayRealId =
      firmId.length > 16 ? firmId.substring(0, 16) + "..." : firmId;

    var dealerDetailsValueHtml = `
      <div class="dealer-phone">
        <span class="material-icons">phone</span><span class="country-code">+91 </span>
        <span class="masked-phone">${maskMobile(row.dealer.phone)}</span>
        <span class="real-phone" style="display:none;">${row.dealer.phone}</span>
      </div>
      <div class="dealer-email">
        <span class="material-icons">mail_outline</span>
        <span class="masked-email">${maskEmail(row.dealer.email)}</span>
        <span class="real-email" style="display:none;">${row.dealer.email}</span>
      </div>
    `;

    var bankSmValueHtml = `
      <div>${row.bankSM.name}</div>
      <div class="dealer-phone">
        <span class="material-icons">phone</span><span class="country-code">+91 </span>
        <span class="masked-phone">${maskMobile(row.bankSM.phone)}</span>
        <span class="real-phone" style="display:none;">${row.bankSM.phone}</span>
      </div>
    `;

    var leadTypeValueHtml = `
      <div>${row.leadType.type}</div>
      <div class="sub-text">Constitution: ${row.leadType.constitution}</div>
    `;

    var repSectionHtml = `
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
          <button class="card-edit-rep-btn">Edit details</button>
        </div>
      </div>

      <div class="rep-edit-mode" style="display: none;">
        <div class="rep-field">
          <label class="rep-label">Corporate representative name</label>
          <input type="text" class="card-rep-input" id="repName-${index}" value="${rep.name || ""}" placeholder="Enter name">
          <span class="error-msg name-error" style="display:none;"><i data-lucide="info" class="error-info-icon"></i> Entered name is in wrong format, please enter a valid name.</span>
        </div>
        <div class="rep-field">
          <label class="rep-label">Mobile number</label>
          <div class="mobile-input-wrapper">
            <input type="text" class="card-rep-input" id="repMobile-${index}" value="${rep.mobile || ""}" maxlength="10" placeholder="Enter mobile">
          </div>
          <span class="error-msg mobile-error" style="display:none;"><i data-lucide="info" class="error-info-icon"></i> Entered mobile number should be of 10-digits, please enter a valid 10-digit number.</span>
        </div>
        <div class="rep-field">
          <label class="rep-label">Email ID</label>
          <input type="text" class="card-rep-input" id="repEmail-${index}" value="${rep.email || ""}" placeholder="Enter email">
          <span class="error-msg email-error" style="display:none;"><i data-lucide="info" class="error-info-icon"></i> Entered email ID is in wrong format, please enter a valid email ID.</span>
        </div>
        <div class="rep-actions">
          <button class="card-reset-rep-btn">Reset</button>
          <button class="card-save-rep-btn">Save</button>
        </div>
      </div>
    `;

    var cardHtml = "";

    if (cardType === "actioned") {
      var custStatusText = "";
      var isCustError = false;
      if (row.customerStatus.status === "Y") {
        custStatusText = "Application to be actioned";
      } else if (row.customerStatus.status === "N") {
        custStatusText =
          row.customerStatus.reason === "email"
            ? "CSR - Email ID incorrect"
            : "CSR - Mobile number incorrect";
        isCustError = true;
      }

      cardHtml = `
        <div class="lead-card" data-row-index="${index}">
          <div class="lead-card-header">
            <div class="lead-card-firm">
              <div class="firm-name">${displayNameCard}</div>
              <div class="firm-id">
                <span class="masked-id">ID: ${displayMaskedId}</span>
                <span class="real-id" style="display:none;">ID: ${displayRealId}</span>
              </div>
            </div>
            <div class="lead-card-offer">
              <span class="offer-label">Loan offer</span>
              <span class="offer-value">${row.loanOffer}</span>
            </div>
          </div>

          <div class="lead-card-row two-col-row row-2">
            <div class="lead-card-col">
              <span class="lead-card-label">Customer contacted status</span>
              <span class="lead-card-value ${isCustError ? "error-text" : ""}">
                ${isCustError ? '<i data-lucide="info" class="customer-status-info"></i>' : ""}
                ${custStatusText}
              </span>
            </div>
            <div class="lead-card-col right-col view-end-common">
              <div class="view-more-wrap">
                <button class="lead-card-toggle" data-target="card-expanded-${index}">
                  View more <i data-lucide="chevron-down" class="arrow-icon"></i>
                </button>
              </div>
              <div class="dealer-details-wrap dealer-right-common" style="display:none;">
                <span class="lead-card-label">Dealer details</span>
                <div class="lead-card-value dealer-value-right-common">
                  ${dealerDetailsValueHtml}
                </div>
              </div>
            </div>
          </div>

          <div class="lead-card-expanded" id="card-expanded-${index}">
            <div class="lead-card-row two-col-row">
              <div class="lead-card-col">
                <span class="lead-card-label">ICICI Bank SM</span>
                <div class="lead-card-value">
                  ${bankSmValueHtml}
                </div>
              </div>
              <div class="lead-card-col dealer-right-common">
                <span class="lead-card-label">Lead type</span>
                <div class="lead-card-value">
                  ${leadTypeValueHtml}
                </div>
              </div>
            </div>

            ${repSectionHtml}

            <div class="lead-card-row date-action-row bottom-action">
              <button class="lead-card-toggle" data-target="card-expanded-${index}">
                View less <i data-lucide="chevron-up" class="arrow-icon"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (cardType === "sanction") {
      cardHtml = `
        <div class="lead-card" data-row-index="${index}">
          <div class="lead-card-header">
            <div class="lead-card-firm">
              <div class="firm-name">${displayNameCard}</div>
              <div class="firm-id">
                <span class="masked-id">ID: ${displayMaskedId}</span>
                <span class="real-id" style="display:none;">ID: ${displayRealId}</span>
              </div>
            </div>
            <div class="lead-card-offer">
              <span class="offer-label">Sanction limit</span>
              <span class="offer-value">${row.sanctionLimit.amount}</span>
            </div>
          </div>

          <div class="lead-card-row two-col-row row-2">
            <div class="lead-card-col">
              <span class="lead-card-label">Sanction date</span>
              <span class="lead-card-value">${row.sanctionLimit.date}</span>
            </div>
            <div class="lead-card-col right-col view-end-common">
              <div class="view-more-wrap">
                <button class="lead-card-toggle" data-target="card-expanded-${index}">
                  View more <i data-lucide="chevron-down" class="arrow-icon"></i>
                </button>
              </div>
              <div class="dealer-details-wrap dealer-right-common" style="display:none;">
                <span class="lead-card-label">Dealer details</span>
                <div class="lead-card-value dealer-value-right-common">
                  ${dealerDetailsValueHtml}
                </div>
              </div>
            </div>
          </div>

          <div class="lead-card-expanded" id="card-expanded-${index}">
            <div class="lead-card-row two-col-row">
              <div class="lead-card-col">
                <span class="lead-card-label">Lead type</span>
                <div class="lead-card-value">
                  ${leadTypeValueHtml}
                </div>
              </div>
              <div class="lead-card-col dealer-right-common dealer-value-right-common">
                <span class="lead-card-label">ICICI Bank SM</span>
                <div class="lead-card-value">
                  ${bankSmValueHtml}
                </div>
              </div>
            </div>

            ${repSectionHtml}

            <div class="lead-card-row date-action-row bottom-action">
              <button class="lead-card-toggle" data-target="card-expanded-${index}">
                View less <i data-lucide="chevron-up" class="arrow-icon"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (cardType === "rejected") {
      cardHtml = `
        <div class="lead-card" data-row-index="${index}">
          <div class="lead-card-header">
            <div class="lead-card-firm">
              <div class="firm-name">${displayNameCard}</div>
              <div class="firm-id">
                <span class="masked-id">ID: ${displayMaskedId}</span>
                <span class="real-id" style="display:none;">ID: ${displayRealId}</span>
              </div>
            </div>
            <div class="lead-card-offer">
              <span class="offer-label">Loan offer</span>
              <span class="offer-value">${row.loanOffer}</span>
            </div>
          </div>

          <div class="lead-card-row two-col-row row-2">
            <div class="lead-card-col">
              <span class="lead-card-label">Dealer details</span>
              <div class="lead-card-value">
                ${dealerDetailsValueHtml}
              </div>
            </div>
            <div class="lead-card-col right-col view-end-common">
              <div class="view-more-wrap">
                <button class="lead-card-toggle" data-target="card-expanded-${index}">
                  View more <i data-lucide="chevron-down" class="arrow-icon"></i>
                </button>
              </div>
              <div class="dealer-details-wrap dealer-right-common dealer-value-right-common" style="display:none;">
                <span class="lead-card-label">Lead type</span>
                <div class="lead-card-value">
                  ${leadTypeValueHtml}
                </div>
              </div>
            </div>
          </div>

          <div class="lead-card-expanded" id="card-expanded-${index}">
            <div class="lead-card-row">
              <span class="lead-card-label">ICICI Bank SM</span>
              <div class="lead-card-value">
                ${bankSmValueHtml}
              </div>
            </div>

            ${repSectionHtml}

            <div class="lead-card-row date-action-row bottom-action">
              <button class="lead-card-toggle" data-target="card-expanded-${index}">
                View less <i data-lucide="chevron-up" class="arrow-icon"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    } else if (cardType === "currentAccount") {
      cardHtml = `
        <div class="lead-card" data-row-index="${index}">
          <div class="lead-card-header">
            <div class="lead-card-firm">
              <div class="firm-name">${displayNameCard}</div>
              <div class="firm-id">
                <span class="masked-id">ID: ${displayMaskedId}</span>
                <span class="real-id" style="display:none;">ID: ${displayRealId}</span>
              </div>
            </div>
            <div class="lead-card-offer">
              <span class="offer-label">Sanction limit</span>
              <span class="offer-value">${row.sanctionLimit.amount}</span>
            </div>
          </div>

          <div class="lead-card-row two-col-row row-2">
            <div class="lead-card-col">
              <span class="lead-card-label">Sanction date</span>
              <span class="lead-card-value">${row.sanctionLimit.date}</span>
            </div>
            <div class="lead-card-col right-col view-end-common">
              <div class="view-more-wrap ">
                <button class="lead-card-toggle" data-target="card-expanded-${index}">
                  View more <i data-lucide="chevron-down" class="arrow-icon"></i>
                </button>
              </div>
              <div class="dealer-details-wrap dealer-right-common" style="display:none;">
                <span class="lead-card-label">Dealer details</span>
                <div class="lead-card-value dealer-value-right-common">
                  ${dealerDetailsValueHtml}
                </div>
              </div>
            </div>
          </div>

          <div class="lead-card-expanded" id="card-expanded-${index}">
            <div class="lead-card-row two-col-row">
              <div class="lead-card-col">
                <span class="lead-card-label">Lead type</span>
                <div class="lead-card-value">
                  ${leadTypeValueHtml}
                </div>
              </div>
              <div class="lead-card-col dealer-right-common dealer-value-right-common">
                <span class="lead-card-label">ICICI Bank SM</span>
                <div class="lead-card-value">
                  ${bankSmValueHtml}
                </div>
              </div>
            </div>

            ${repSectionHtml}

            <div class="lead-card-row date-action-row bottom-action">
              <button class="lead-card-toggle" data-target="card-expanded-${index}">
                View less <i data-lucide="chevron-up" class="arrow-icon"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }

    cardsHtml += cardHtml;
  });

  $("#leadTableBody").html(rowsHtml);
  $("#mobileLeadCards").html(cardsHtml);

  applyAllCardsMasking(isCardDetailsShown);
}

function renderLeadTable(title) {
  var columns = getLeadTableColumns(title);

  renderLeadTableHeader(columns);
  renderLeadTableRows(columns, leadTableData, title);

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

    // Mask Table
    $("#leadTableBody .masked-id").show();
    $("#leadTableBody .real-id").hide();
    $("#leadTableBody .masked-phone").show();
    $("#leadTableBody .real-phone").hide();
    $("#leadTableBody .masked-email").show();
    $("#leadTableBody .real-email").hide();

    // Mask Cards
    isCardDetailsShown = false;
    applyAllCardsMasking(false);
  } else {
    $btn.addClass("showing");

    // Unmask Table
    $("#leadTableBody .masked-id").hide();
    $("#leadTableBody .real-id").show();
    $("#leadTableBody .masked-phone").hide();
    $("#leadTableBody .real-phone").show();
    $("#leadTableBody .masked-email").hide();
    $("#leadTableBody .real-email").show();

    // Unmask Cards
    isCardDetailsShown = true;
    applyAllCardsMasking(true);
  }

  lucideIconCommonCode();
});

// Card for new leads data in mobile
var isCardDetailsShown = false;

$(document).on("click", ".lead-card-toggle", function (e) {
  e.stopPropagation();
  var $btn = $(this);
  var $card = $btn.closest(".lead-card");
  var $rightCol = $card.find(".row-2 .right-col");
  var $viewMoreWrap = $rightCol.find(".view-more-wrap");
  var $dealerWrap = $rightCol.find(".dealer-details-wrap");
  var $expandedSection = $card.find(".lead-card-expanded");

  var isExpanding = !$expandedSection.hasClass("show");

  if (isExpanding) {
    $viewMoreWrap.hide();
    $dealerWrap.show();
    $expandedSection.addClass("show");
  } else {
    $dealerWrap.hide();
    $viewMoreWrap.show();
    $expandedSection.removeClass("show");
  }

  applyCardMasking($card, isCardDetailsShown);
  lucideIconCommonCode();
});

$(document).on("click", ".card-edit-rep-btn", function (e) {
  e.stopPropagation();
  var $container = $(this).closest(".lead-card-expanded");
  $container.find(".rep-view-mode").hide();
  $container.find(".rep-edit-mode").show();
});

$(document).on("click", ".card-reset-rep-btn", function (e) {
  e.stopPropagation();
  var $container = $(this).closest(".lead-card-expanded");
  var $editMode = $container.find(".rep-edit-mode");
  var index = $container.attr("id").replace("card-expanded-", "");

  $editMode.find("#repName-" + index).val("");
  $editMode.find("#repMobile-" + index).val("");
  $editMode.find("#repEmail-" + index).val("");
  $editMode.find(".error-msg").hide();
  $editMode.find(".card-rep-input").removeClass("input-error");
});

$(document).on("click", ".card-save-rep-btn", function (e) {
  e.stopPropagation();
  var $container = $(this).closest(".lead-card-expanded");
  var $editMode = $container.find(".rep-edit-mode");
  var $viewMode = $container.find(".rep-view-mode");

  var index = $container.attr("id").replace("card-expanded-", "");

  var name = $editMode
    .find("#repName-" + index)
    .val()
    .trim();
  var mobile = $editMode
    .find("#repMobile-" + index)
    .val()
    .trim();
  var email = $editMode
    .find("#repEmail-" + index)
    .val()
    .trim();

  var isValid = true;

  $editMode.find(".error-msg").hide();
  $editMode.find(".card-rep-input").removeClass("input-error");

  var nameRegex = /^[a-zA-Z\s]+$/;
  if (!name || !nameRegex.test(name)) {
    $editMode.find(".name-error").show();
    $editMode.find("#repName-" + index).addClass("input-error");
    isValid = false;
  }

  var mobileRegex = /^\d{10}$/;
  if (!mobile || !mobileRegex.test(mobile)) {
    $editMode.find(".mobile-error").show();
    $editMode.find("#repMobile-" + index).addClass("input-error");
    isValid = false;
  }

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    $editMode.find(".email-error").show();
    $editMode.find("#repEmail-" + index).addClass("input-error");
    isValid = false;
  }

  if (!isValid) return;

  $viewMode.find(".rep-value").eq(0).text(name);
  $viewMode
    .find(".rep-value")
    .eq(1)
    .text("+91 " + mobile);
  $viewMode.find(".rep-value").eq(2).text(email);

  $editMode.hide();
  $viewMode.show();
});

$(document).on("focus", ".card-rep-input", function (e) {
  e.stopPropagation();
  $(this).removeClass("input-error");
  $(this).closest(".rep-field").find(".error-msg").hide();
});

function applyCardMasking($card, showReal) {
  if (showReal) {
    $card.find(".masked-phone").hide();
    $card.find(".real-phone").show();
    $card.find(".masked-email").hide();
    $card.find(".real-email").show();
    $card.find(".masked-id").hide();
    $card.find(".real-id").show();
  } else {
    $card.find(".masked-phone").show();
    $card.find(".real-phone").hide();
    $card.find(".masked-email").show();
    $card.find(".real-email").hide();
    $card.find(".masked-id").show();
    $card.find(".real-id").hide();
  }
}

function applyAllCardsMasking(showReal) {
  $("#mobileLeadCards .lead-card").each(function () {
    applyCardMasking($(this), showReal);
  });
}

// Add single lead
$(document).on("click", "#addLeadProceedBtn", function (e) {
  closeModal("#addDelarLeadModal");
  openModal("#stepModal");
});

$(document).on("click", "#modalCloseBtn, #cancelBtn", function (e) {
  closeModal("#addDelarLeadModal");
});

$(document).on("click", "#stepNextBtn", function (e) {
  closeModal("#stepModal");
  openModal("#reviewModal");
});

$(document).on("click", "#cancelStepBtn", function (e) {
  closeModal("#stepModal");
  openModal("#addDelarLeadModal");
});

$(document).on("click", "#reviewSubmitBtn", function (e) {
  closeModal("#reviewModal");
  openModal("#checkEligibilityModal");
});

$(document).on("click", "#reviewCancel", function (e) {
  closeModal("#reviewModal");
  openModal("#stepModal");
});

$(document).on("click", "#submitEligibilityBtn", function (e) {
  closeModal("#checkEligibilityModal");
  openModal("#leadSuccessModal");
});

$(document).on("click", "#modalReviewCloseBtn", function (e) {
  closeModal("#reviewModal");
});

$(document).on("click", "#successSubmitBtn", function (e) {
  closeModal("#leadSuccessModal");
});

$(document).on("click", ".addDealerMenu .menu-item", function (e) {
  e.stopPropagation();
  var action = $(this).data("action");
  $(".addDealerMenu").removeClass("open");

  if (action === "single-lead") {
    openModal("#addDelarLeadModal");
  } else if (action === "bulk-upload") {
    openModal("#bulkUploadModal");
  }
});

$(document).on("click", function () {
  $(".addDealerMenu").removeClass("open");
});

// constitution select options
const constitutions = [
  "Proprietorship",
  "Partnership",
  "Private Limited",
  "LLP",
  "HUF",
];

(function populateConstitutions() {
  const $select = $("#constitutionSelect");
  const $options = $("#constitutionCustomSelect .custom-select-options");

  constitutions.forEach(function (item) {
    $select.append(
      `<option value="${item}" data-state="${item}">
        ${item}
      </option>`,
    );

    $options.append(
      `<div class="option-item" data-value="${item}" data-state="${item}">
        ${item}
      </div>`,
    );
  });
})();

// city select options
const cityStateData = [
  { CITYNAME: "BASAI ROAD", STATENAME: "HARYANA" },
  { CITYNAME: "URBAN ESTATE", STATENAME: "HARYANA" },
  { CITYNAME: "SOHNA ADDA", STATENAME: "HARYANA" },
  { CITYNAME: "GURGAON KTY.", STATENAME: "HARYANA" },
  { CITYNAME: "GURGAON", STATENAME: "HARYANA" },
  { CITYNAME: "NEW COLONY", STATENAME: "HARYANA" },
  { CITYNAME: "SHIVAJI NAGAR", STATENAME: "HARYANA" },
];

(function populateCities() {
  const $select = $("#citySelect");
  const $options = $("#cityCustomSelect .custom-select-options");

  cityStateData.forEach(function (item) {
    $select.append(
      `<option value="${item.CITYNAME}" data-state="${item.STATENAME}">
        ${item.CITYNAME}
      </option>`,
    );

    $options.append(
      `<div class="option-item" data-value="${item.CITYNAME}" data-state="${item.STATENAME}">
        ${item.CITYNAME}
      </div>`,
    );
  });
})();

$(document).on("click", "#cityCustomSelect .option-item", function () {
  const state = $(this).data("state");
  $("#cityStateValue").text(state);
  $("#cityStateDisplay").show();
});

function generateMonthlySalesGrid() {
  var startVal = $(".startDate").val();
  var endVal = $(".endDate").val();

  var monthsList =
    startVal && endVal ? buildMonthsFromRange(startVal, endVal) : months;

  const $grid = $("#monthlySalesGrid");
  $grid.empty();

  monthsList.forEach(function (month) {
    $grid.append(`
        <div class="month-item">
          <label>${month}</label>
          <div class="input-wrapper">
            <span class="currency-symbol">₹</span>
            <input type="text" class="monthly-sales-input" placeholder="" data-month="${month}">
          </div>
          <span class="error-msg sale-value-error"><i data-lucide="info" class="error-info-icon"></i> Entered amount is in wrong format, please enter a valid amount.</span>
        </div>
      `);
  });

  $("#monthlySalesSummary").hide();
  $("#monthlySalesFooter").show();
  $("#submitMonthlySalesBtn").prop("disabled", true).addClass("btn-disabled");
  lucideIconCommonCode();
}

function buildMonthsFromRange(startVal, endVal) {
  function myToDate(my) {
    var parts = my.split("/");
    var mm = parseInt(parts[0], 10);
    var yy = parseInt(parts[1], 10);
    var fullYear = yy < 100 ? 2000 + yy : yy;
    return new Date(fullYear, mm - 1, 1);
  }

  var start = myToDate(startVal);
  var end = myToDate(endVal);

  if (start > end) {
    var tmp = start;
    start = end;
    end = tmp;
  }

  var MONTH_ABBR = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  var result = [];
  var cursor = new Date(end.getFullYear(), end.getMonth(), 1);
  var startMonth = new Date(start.getFullYear(), start.getMonth(), 1);

  while (cursor >= startMonth) {
    var label =
      MONTH_ABBR[cursor.getMonth()] +
      " '" +
      String(cursor.getFullYear()).slice(-2);
    result.push(label);
    cursor.setMonth(cursor.getMonth() - 1);
  }

  return result;
}

$(document).on("click", "#editMonthlySales", function () {
  $("#monthlySalesGrid input").prop("disabled", false);
  $("#monthlySalesFooter").show();
  $("#monthlySalesSummary, #editMonthlySales").hide();
  $(".monthly-sales-input").removeClass("submitted").prop("disabled", false);
});

$(document).on("click", "#resetMonthlySales", function () {
  $("#monthlySalesGrid input").val("").removeClass("input-error");
  $("#monthlySalesGrid .error-msg").remove();
  $("#submitMonthlySalesBtn, #resetMonthlySales")
    .prop("disabled", true)
    .addClass("btn-disabled");
  $("#editMonthlySales").hide();
});

$(document).on("click", "#submitMonthlySalesBtn", function () {
  let isValid = true;
  let total = 0;

  $(".monthly-sales-input").each(function () {
    const $input = $(this);
    const val = $input.val().trim();
    const $error = $input.closest(".month-item").find(".sale-value-error");

    $input.removeClass("input-error");
    $error.removeClass("show");

    if (val) {
      const numVal = parseFloat(val.replace(/[^0-9.-]+/g, ""));
      if (isNaN(numVal)) {
        $input.addClass("input-error");
        $error.addClass("show");
        isValid = false;
      } else {
        total += numVal;
      }
    }
  });

  if (!isValid) {
    return;
  }

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(total);

  $("#totalSalesValue").text(formattedTotal);
  $("#monthlySalesSummary, #editMonthlySales").show();
  $(".monthly-sales-input").addClass("submitted").prop("disabled", true);
  $("#monthlySalesFooter").hide();
  $("#monthlySalesGrid input").prop("disabled", true);

  validateForm();
});

$(document).on("input change", ".monthly-sales-input", function () {
  var allFilled = true;

  $(".monthly-sales-input").each(function () {
    if ($(this).val().trim() === "") {
      allFilled = false;
      return false;
    }
  });

  if (allFilled) {
    $("#submitMonthlySalesBtn, #resetMonthlySales")
      .prop("disabled", false)
      .removeClass("btn-disabled");
  } else {
    $("#submitMonthlySalesBtn, #resetMonthlySales")
      .prop("disabled", true)
      .addClass("btn-disabled");
  }
});

$(document).on("focus", ".monthly-sales-input", function () {
  const $input = $(this);
  const $error = $input.closest(".month-item").find(".sale-value-error");

  $input.removeClass("input-error");
  $error.removeClass("show");
});

function showError(elementId, errorId) {
  $("#" + elementId).addClass("input-error");
  $("#" + errorId).addClass("show");
}

$(document).on(
  "blur",
  "#firmName, #dealerCode, #panNumber, #mobileNumber, #emailId, #address1, #pinCode, #firstName, #associationYears, #recommendationLimit, #instancesOverdue, #chequeReturns",
  function () {
    validateField($(this));
    validateForm();
  },
);

$(document).on(
  "focus",
  "#firmName, #dealerCode, #panNumber, #mobileNumber, #emailId, #address1, #pinCode, #firstName, #associationYears, #recommendationLimit, #instancesOverdue, #chequeReturns",
  function () {
    const $el = $(this);
    $el.removeClass("input-error");
    $el.closest(".form-group").find(".error-msg").removeClass("show");
  },
);

$(document).on(
  "change",
  "#constitutionSelect, #citySelect, #saleTypeSelect",
  function () {
    validateField($(this));
    validateForm();
  },
);

function validateField($el) {
  const id = $el.attr("id");
  const val = $el.val().trim();
  let isValid = true;

  $el.removeClass("input-error");
  $el.closest(".form-group").find(".error-msg").removeClass("show");

  switch (id) {
    case "firmName":
      if (!val || !/^[a-zA-Z0-9\s&.,'-]+$/.test(val)) {
        showError(id, "firmNameError");
        isValid = false;
      }
      break;

    case "dealerCode":
      if (!val) {
        showError(id, "dealerCodeError");
        isValid = false;
      }
      break;

    case "panNumber":
      if (!val || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase())) {
        showError(id, "panError");
        isValid = false;
      }
      break;

    case "constitutionSelect":
      if (!val || val === "select-constitution") {
        showError(id, "constitutionError");
        isValid = false;
      }
      break;

    case "mobileNumber": {
      const digits = val.replace(/\D/g, "").replace(/^91/, "").slice(-10);
      if (!digits || digits.length !== 10) {
        showError(id, "mobileError");
        isValid = false;
      }
      break;
    }

    case "emailId":
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        showError(id, "emailError");
        isValid = false;
      }
      break;

    case "address1":
      if (!val || val.length < 3) {
        showError(id, "address1Error");
        isValid = false;
      }
      break;

    case "pinCode":
      if (!val || !/^\d{6}$/.test(val)) {
        showError(id, "pinError");
        isValid = false;
      }
      break;

    case "citySelect":
      if (!val || val === "select-city") {
        showError(id, "cityError");
        isValid = false;
      }
      break;

    case "firstName":
      if (val && !/^[a-zA-Z\s]+$/.test(val)) {
        showError(id, "firstNameError");
        isValid = false;
      }
      break;

    case "saleTypeSelect":
      if (!val || val === "sales-type") {
        showError(id, "salesTypeError");
        isValid = false;
      }
      break;

    case "associationYears":
      if (!val || !/^\d+$/.test(val) || parseInt(val) < 0) {
        showError(id, "associationError");
        isValid = false;
      }
      break;

    case "recommendationLimit":
      if (!val || isNaN(parseFloat(val.replace(/,/g, "")))) {
        showError(id, "limitError");
        isValid = false;
      } else {
        const num = parseFloat(val.replace(/,/g, ""));
        $("#limitHelper").text(numberToWords(num) + " rupees");
      }
      break;

    case "instancesOverdue":
      if (!val || !/^\d+$/.test(val)) {
        showError(id, "overdueError");
        isValid = false;
      }
      break;

    case "chequeReturns":
      if (!val || !/^\d+$/.test(val)) {
        showError(id, "chequeError");
        isValid = false;
      }
      break;
  }

  return isValid;
}

function numberToWords(num) {
  if (num === 0) return "Zero";
  if (num === 30000000) return "Rupees three crore";
  return num.toLocaleString("en-IN");
}

function validateForm() {
  let isFormValid = true;

  const requiredFields = [
    "firmName",
    "dealerCode",
    "panNumber",
    "constitutionSelect",
    "mobileNumber",
    "emailId",
    "address1",
    "pinCode",
    "citySelect",
    "saleTypeSelect",
    "associationYears",
    "recommendationLimit",
    "instancesOverdue",
    "chequeReturns",
  ];

  requiredFields.forEach(function (id) {
    const $el = $("#" + id);
    if (!$el.val() || $el.hasClass("input-error")) {
      isFormValid = false;
    }
  });

  if ($("#monthlySalesContainer").is(":visible")) {
    const isGridSubmitted = $("#monthlySalesSummary").is(":visible");
    if (!isGridSubmitted) {
      isFormValid = false;
    }
  }

  if (!$(".startDate").val() || !$(".endDate").val()) {
    isFormValid = false;
  }

  if (isFormValid) {
    $("#stepNextBtn").prop("disabled", false);
  } else {
    $("#stepNextBtn").prop("disabled", true);
  }
}

$(document).on("focus", "#mobileNumber", function () {
  const digits = this.value.replace(/\D/g, "").slice(-10);
  this.value = digits;
});

$(document).on("input", "#mobileNumber", function () {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

$(document).on("blur", "#mobileNumber", function () {
  const digits = this.value.replace(/\D/g, "").slice(-10);

  if (digits.length === 10) {
    this.value = "+91 " + digits;
  } else {
    this.value = digits;
  }

  validateField($(this));
  validateForm();
});

$(document).on("change", ".startDate", function () {
  var startVal = $(this).val();

  if (startVal) {
    $("#endDateTrigger").closest(".date-input-wrap").hide();
    $("#endDateWrap").show();

    var parts = startVal.split("/");
    if (parts.length === 2) {
      var mm = parseInt(parts[0], 10) - 1;
      var yy = parseInt(parts[1], 10);
      var fullYear = yy < 100 ? 2000 + yy : yy;

      var startDate = new Date(fullYear, mm, 1);
      var endDate = new Date(fullYear, mm + 11, 1);

      var endMM = String(endDate.getMonth() + 1).padStart(2, "0");
      var endYY = String(endDate.getFullYear()).slice(-2);
      var formattedEnd = endMM + "/" + endYY;

      $(".endDate").val(formattedEnd);

      $("#addMonthlySalesBtn")
        .removeClass("btn-disabled")
        .prop("disabled", false);

      $("#dateRangeError").removeClass("show");
    }
  } else {
    $("#endDateTrigger").closest(".date-input-wrap").show();
    $("#endDateWrap").hide();
    $(".endDate").val("");
    $("#addMonthlySalesBtn").addClass("btn-disabled").prop("disabled", true);
  }

  validateForm();
});

$(document).on("change", ".endDate", function () {
  var endVal = $(this).val();

  if (endVal) {
    $("#addMonthlySalesBtn")
      .removeClass("btn-disabled")
      .prop("disabled", false);
  } else {
    $("#addMonthlySalesBtn").addClass("btn-disabled").prop("disabled", true);
  }

  validateForm();
});

$(document).on("click", "#addMonthlySalesBtn", function (e) {
  e.preventDefault();

  var startVal = $(".startDate").val();
  var endVal = $(".endDate").val();

  if (!startVal || !endVal) {
    $("#dateRangeError").addClass("show");
    $("#monthlySalesContainer").hide();
    return;
  }

  function myToDate(my) {
    var parts = my.split("/");
    var mm = parseInt(parts[0], 10);
    var yy = parseInt(parts[1], 10);
    var fullYear = yy < 100 ? 2000 + yy : yy;
    return new Date(fullYear, mm - 1, 1);
  }

  var startDate = myToDate(startVal);
  var endDate = myToDate(endVal);

  if (startDate > endDate) {
    $("#dateRangeError").addClass("show");
    $("#monthlySalesContainer").hide();
    return;
  }

  $("#dateRangeError").removeClass("show");
  generateMonthlySalesGrid();
  $("#monthlySalesContainer").show();
  $("#addMonthlySalesBtn").addClass("btn-disabled").prop("disabled", true);

  // $("html, body").animate(
  //   {
  //     scrollTop: $("#monthlySalesContainer").offset().top - 100,
  //   },
  //   500,
  // );
});

validateForm();

// Eligible status
const eligibleStatus = "Y";
if (eligibleStatus === "Y") {
  $("#eligibleStatus").show();
  $("#submitEligibilityBtn")
    .prop("disabled", false)
    .removeClass("disabled-btn");
} else {
  $("#notEligibleStatus").show();
  $("#submitEligibilityBtn").prop("disabled", true).addClass("disabled-btn");
}

// Add another lead
$(document).on("click", "#addAnotherBtn", function (e) {
  closeModal("#leadSuccessModal");

  const isAddLeadTermChecked = $("#skipOverviewCheck").is(":checked");
  if (isAddLeadTermChecked) {
    openModal("#stepModal");
  } else {
    openModal("#addDelarLeadModal");
  }
});

// Save and exit modal
$(document).on("click", ".saveExitBtn, #modalStep3CloseBtn", function (e) {
  closeModal("#stepModal");
  openModal("#saveAndExitModal");
});

$(document).on("click", "#saveAndCloseBtn", function (e) {
  closeModal("#saveAndExitModal");
  showToast("success", "Draft saved successfully", "");
});

// Bulk upload
var bulkParsedRows = [];

var BULK_HEADER_MAP = {
  firmName: ["Name of the firm", "Firm Name", "Firm"],
  constitution: [
    "Constitution",
    "Constitution (Enter: 1 for Proprietorship Firm, 2 for Partnership Firm, 3 for Pvt. Ltd. Company, 4 for Public Ltd. Company)",
  ],
  dealerCode: ["Dealer Code", "Dealer code"],
  firstName: ["First Name of Dealer (Optional)", "First Name"],
  lastName: ["Last Name of Dealer (Optional)", "Last Name"],
  pan: ["PAN Card of firm", "PAN", "PAN Card"],
  mobile: ["Mobile Number", "Mobile number"],
  email: ["Email ID", "Email"],
  address1: ["Address Line 1", "Address"],
  pinCode: ["Pin Code", "Pin code", "Pincode"],
  salesType: ["Sales Type (Enter: 1 for Past, 2 for Projected)", "Sales Type"],
  fromDate: ["From Date (Last 12 Month Sales) (MM-YYYY)", "From Date"],
  toDate: ["To Date (Last 12 Month Sales) (MM-YYYY)", "To Date"],
  month1: ["Month1 Sales (in Rupees) (ToDate)", "Month1 Sales", "Month1"],
  month2: ["Month2 Sales (in Rupees)", "Month2 Sales", "Month2"],
  month3: ["Month3 Sales (in Rupees)", "Month3 Sales", "Month3"],
  month4: ["Month4 Sales (in Rupees)", "Month4 Sales", "Month4"],
  month5: ["Month5 Sales (in Rupees)", "Month5 Sales", "Month5"],
  month6: ["Month6 Sales (in Rupees)", "Month6 Sales", "Month6"],
  month7: ["Month7 Sales (in Rupees)", "Month7 Sales", "Month7"],
  month8: ["Month8 Sales (in Rupees)", "Month8 Sales", "Month8"],
  month9: ["Month9 Sales (in Rupees)", "Month9 Sales", "Month9"],
  month10: ["Month10 Sales (in Rupees)", "Month10 Sales", "Month10"],
  month11: ["Month11 Sales (in Rupees)", "Month11 Sales", "Month11"],
  month12: ["Month12 Sales (in Rupees)", "Month12 Sales", "Month12"],
  associationYears: [
    "No of Years of Association (FromDate)",
    "No of Years of Association",
    "Association",
  ],
  chequeReturns: [
    "Cheque Returns in Last Available 12 months (Optional)",
    "Cheque Returns",
  ],
  recommendation: [
    "Recommendation Limit (in Million) (Optional)",
    "Recommendation Limit",
    "Recommendation limit",
  ],
  instancesOverdue: [
    "Instances of Overdue More Than 7 Days in Last Available 12 Months",
    "Instances of Overdue",
  ],
  businessVintage: [
    "Business Vintage (fill mandatory if no. of years of association is less than or equal to 1) (fill 0 if not required)",
    "Business Vintage",
  ],
  corpRep: ["Corporate Representative (Optional)", "Corporate Representative"],
  corpRepMobile: [
    "Corporate Representative Mobile number (Optional)",
    "Corporate Representative Mobile",
  ],
  corpRepEmail: [
    "Corporate Representative Email ID (Optional)",
    "Corporate Representative Email",
  ],
};

function mapBulkRow(rawRow) {
  var normalized = {};
  var rawKeys = Object.keys(rawRow);

  function pickValue(aliases) {
    for (var i = 0; i < aliases.length; i++) {
      var alias = aliases[i];
      if (rawKeys.indexOf(alias) !== -1) return rawRow[alias];
      var found = rawKeys.find(function (k) {
        return (
          String(k).trim().toLowerCase() === String(alias).trim().toLowerCase()
        );
      });
      if (found) return rawRow[found];
    }
    return "";
  }

  Object.keys(BULK_HEADER_MAP).forEach(function (key) {
    normalized[key] = pickValue(BULK_HEADER_MAP[key]);
  });

  return normalized;
}

function validateBulkRow(row, rowIndex) {
  var errors = [];
  var rowNum = rowIndex + 2;

  if (!row.firmName || String(row.firmName).trim().length < 2) {
    errors.push("Row " + rowNum + ": Firm name is missing or invalid.");
  }

  var pan = String(row.pan || "")
    .trim()
    .toUpperCase();
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
    errors.push(
      "Row " + rowNum + ": PAN '" + (row.pan || "") + "' is invalid.",
    );
  }

  var mobile = String(row.mobile || "")
    .replace(/\D/g, "")
    .slice(-10);
  if (mobile.length !== 10) {
    errors.push(
      "Row " +
        rowNum +
        ": Mobile number '" +
        (row.mobile || "") +
        "' is invalid.",
    );
  }

  var email = String(row.email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push(
      "Row " + rowNum + ": Email ID '" + (row.email || "") + "' is invalid.",
    );
  }

  var pin = String(row.pinCode || "").trim();
  if (!/^\d{6}$/.test(pin)) {
    errors.push(
      "Row " + rowNum + ": Pin code '" + (row.pinCode || "") + "' is invalid.",
    );
  }

  var constitution = String(row.constitution || "").trim();
  if (!constitution || !/^[1-4]$/.test(constitution)) {
    errors.push("Row " + rowNum + ": Constitution must be 1–4.");
  }

  var salesType = String(row.salesType || "").trim();
  if (!salesType || !/^[1-2]$/.test(salesType)) {
    errors.push("Row " + rowNum + ": Sales Type must be 1 or 2.");
  }

  var assoc = String(row.associationYears || "").trim();
  if (!/^\d+$/.test(assoc)) {
    errors.push("Row " + rowNum + ": No. of Years of Association is invalid.");
  }

  if (assoc !== "" && Number(assoc) <= 1) {
    var bv = String(row.businessVintage || "").trim();
    if (bv === "" || !/^\d+$/.test(bv)) {
      errors.push(
        "Row " +
          rowNum +
          ": Business Vintage is required when association ≤ 1 year.",
      );
    }
  }

  var monthKeys = [
    "month1",
    "month2",
    "month3",
    "month4",
    "month5",
    "month6",
    "month7",
    "month8",
    "month9",
    "month10",
    "month11",
    "month12",
  ];
  monthKeys.forEach(function (mk, i) {
    var v = String(row[mk] || "").trim();
    if (v !== "" && isNaN(Number(String(v).replace(/,/g, "")))) {
      errors.push(
        "Row " + rowNum + ": Month" + (i + 1) + " sales value is invalid.",
      );
    }
  });

  return { valid: errors.length === 0, errors: errors, rowNum: rowNum };
}

function formatBulkAmount(val) {
  var num = Number(String(val == null ? "" : val).replace(/[^0-9.-]/g, ""));
  if (isNaN(num) || num === 0) return "₹0.00";
  return (
    "₹" +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

// shorten long firm names in the table
function shortenFirmName(name, max) {
  name = String(name || "").trim();
  max = max || 28;
  return name.length > max ? name.substring(0, max - 1).trim() + "…" : name;
}

// Parse the uploaded file → array of normalized rows
function parseBulkFile(file, callback) {
  var reader = new FileReader();

  reader.onload = function (e) {
    try {
      var data = new Uint8Array(e.target.result);
      var workbook = XLSX.read(data, { type: "array" });
      var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      var jsonRows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (!jsonRows.length) {
        callback({ success: false, message: "Uploaded file has no records." });
        return;
      }

      var normalized = jsonRows.map(mapBulkRow);
      callback({ success: true, rows: normalized });
    } catch (err) {
      callback({
        success: false,
        message: "Unable to read the file. Please check the format.",
      });
    }
  };

  reader.onerror = function () {
    callback({ success: false, message: "File read error. Please try again." });
  };

  reader.readAsArrayBuffer(file);
}

// format a number into Indian-words (e.g. "Rupees three crore")
function numberToIndianWords(num) {
  num = Number(num) || 0;
  if (num === 0) return "Rupees zero";

  var ones = [
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
  var tens = [
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

  function twoDigits(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
  }

  function threeDigits(n) {
    var out = "";
    if (n > 99) {
      out += ones[Math.floor(n / 100)] + " hundred";
      n = n % 100;
      if (n) out += " ";
    }
    if (n) out += twoDigits(n);
    return out;
  }

  var crore = Math.floor(num / 10000000);
  var lakh = Math.floor((num % 10000000) / 100000);
  var thou = Math.floor((num % 100000) / 1000);
  var rest = Math.floor(num % 1000);

  var parts = [];
  if (crore) parts.push(threeDigits(crore) + " crore");
  if (lakh) parts.push(threeDigits(lakh) + " lakh");
  if (thou) parts.push(threeDigits(thou) + " thousand");
  if (rest) parts.push(threeDigits(rest));

  var words = parts.join(" ").trim();
  return "Rupees " + (words || "zero");
}

// Render the parsed + validated rows into the eligibility modal table
function renderBulkEligibilityTable(rows) {
  var $body = $("#bulkUploadEligibilityModal .modal-table-body");
  $body.empty();

  var totalPQ = 0;
  var acceptedCount = 0;

  var tableHtml =
    '<div class="bulk-eligibility-table-wrap">' +
    '<table class="bulk-eligibility-table">' +
    "<thead><tr>" +
    "<th>Firm</th>" +
    '<th class="amount-cell">PQ offer</th>' +
    '<th class="amount-cell">Recommendation limit</th>' +
    "<th>Tenor</th>" +
    "<th>Status</th>" +
    "</tr></thead><tbody>";

  rows.forEach(function (row) {
    var recLimitMillion =
      Number(String(row.recommendation || "0").replace(/[^0-9.]/g, "")) || 0;
    var recLimitRupees = recLimitMillion;

    var pan = String(row.pan || "")
      .trim()
      .toUpperCase();
    var mobile = String(row.mobile || "")
      .replace(/\D/g, "")
      .slice(-10);
    var email = String(row.email || "").trim();

    var isAccepted =
      /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan) &&
      mobile.length === 10 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      recLimitRupees > 0;

    var pqOffer = isAccepted ? recLimitRupees : 0;
    var tenor = isAccepted ? "60 days" : "0 days";

    if (isAccepted) {
      acceptedCount++;
      totalPQ += pqOffer;
    }

    var statusText = isAccepted ? "Accepted" : "Rejected";
    var statusClass = isAccepted ? "status-accepted" : "status-rejected";
    var statusIcon = isAccepted ? "check" : "close";

    tableHtml +=
      "<tr>" +
      '<td class="firm-name-cell" title="' +
      String(row.firmName || "").replace(/"/g, "&quot;") +
      '">' +
      shortenFirmName(row.firmName) +
      "</td>" +
      '<td class="amount-cell">' +
      formatBulkAmount(pqOffer) +
      "</td>" +
      '<td class="amount-cell">' +
      formatBulkAmount(recLimitRupees) +
      "</td>" +
      "<td>" +
      tenor +
      "</td>" +
      "<td>" +
      '<span class="status-cell ' +
      statusClass +
      '">' +
      '<span class="material-icons status-icon">' +
      statusIcon +
      "</span>" +
      statusText +
      "</span>" +
      "</td>" +
      "</tr>";
  });

  tableHtml += "</tbody></table></div>";
  $body.html(tableHtml);

  var fileName =
    $("#bulkUploadDropZone").data("selected-file-name") || "Uploaded file";

  $(".fileUploaded").text(fileName);
  $(".dealerCount").text(rows.length);
  var totalPQFormatted = totalPQ.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  var totalParts = totalPQFormatted.split(".");
  $(".totalPQOffer").text(totalParts[0]);
  $(".decimal-point-value").text("." + (totalParts[1] || "00"));

  // Rupees in words
  $(".rupeesText").text(numberToIndianWords(totalPQ));
}

function renderDocumentOverview(errors, totalRecords, fileName) {
  var $modal = $("#documentOverviewModal");

  $modal
    .find(".overview-text")
    .html(
      '<span class="material-symbols-outlined">close</span>' +
        (fileName || "uploaded file"),
    );

  $modal
    .find(".error-summary")
    .html(
      '<span class="error-text"><span class="error-count">' +
        errors.length +
        "</span> errors found</span> in " +
        totalRecords +
        " records",
    );
}

// File selected → parse + validate (but do NOT close modal yet)
$(document).on("change", "#bulkUploadDropZone .upload-file-input", function () {
  var input = this;
  var file = input.files && input.files[0];
  if (!file) return;

  var zone = $(this).closest("#bulkUploadDropZone");
  var leftIcon = zone.find(".upload-left-icon");
  var rightIcon = zone.find(".upload-right-icon");
  var title = zone.find(".upload-title");
  var loader = zone.find(".upload-loader");

  leftIcon.hide();
  loader.show();

  rightIcon.html('<i data-lucide="x"></i>').addClass("right-icon-color").show();
  if (window.lucide) lucide.createIcons();

  zone.data("selected-file-name", file.name);

  var uploadTimer = setTimeout(function () {
    loader.hide();

    zone.addClass("uploaded");
    leftIcon.show();
    leftIcon
      .html('<span class="material-symbols-outlined">draft</span>')
      .addClass("file-name");
    title.text(file.name).addClass("file-name");

    if (window.lucide) lucide.createIcons();

    parseBulkFile(file, function (result) {
      if (!result.success) {
        zone.data("parse-error", result.message || "Unable to parse the file.");
        $("#bulkUploadBtn").addClass("btn-disabled").prop("disabled", true);
        return;
      }

      var rows = result.rows;
      var allErrors = [];
      var validRows = [];

      rows.forEach(function (row, idx) {
        var check = validateBulkRow(row, idx);
        if (check.valid) {
          validRows.push(row);
        } else {
          allErrors = allErrors.concat(check.errors);
        }
      });

      bulkParsedRows = validRows;

      zone.data("valid-rows", validRows);
      zone.data("errors", allErrors);
      zone.data("total-records", rows.length);

      $("#bulkUploadBtn").removeClass("btn-disabled").prop("disabled", false);
    });

    clearTimeout(uploadTimer);
  }, 1200);
});

$(document).on("click", "#bulkUploadDropZone", function (e) {
  e.stopPropagation();
  $(this).find(".upload-file-input")[0].click();
});

$(document).on("click", "#bulkUploadBtn", function (e) {
  e.preventDefault();

  var zone = $("#bulkUploadDropZone");
  var errors = zone.data("errors") || [];
  var validRows = zone.data("valid-rows") || [];
  var totalRecords = zone.data("total-records") || 0;
  var fileName = zone.data("selected-file-name") || "uploaded file";
  var parseError = zone.data("parse-error");

  closeModal("#bulkUploadModal");
  openModal("#bulkUploadLoaderModal");

  setTimeout(function () {
    closeModal("#bulkUploadLoaderModal");

    // 1. Parse error → Document overview
    if (parseError) {
      renderDocumentOverview([parseError], 0, fileName);
      openModal("#documentOverviewModal");
      if (window.lucide) lucide.createIcons();
      return;
    }

    // 2. Validation errors → Document overview
    if (errors.length > 0) {
      renderDocumentOverview(errors, totalRecords, fileName);
      openModal("#documentOverviewModal");
      if (window.lucide) lucide.createIcons();
      return;
    }

    // 3. No errors → Eligibility modal
    renderBulkEligibilityTable(validRows);
    openModal("#bulkUploadEligibilityModal");
    if (window.lucide) lucide.createIcons();
  }, 1200);
});

$(document).on("click", "#submitBulkUploadBtn", function (e) {
  closeModal("#bulkUploadEligibilityModal");
  openModal("#BulkUploadSuccessModal");
});

$(document).on("click", "#BulkUploadSuccessSubmitBtn", function (e) {
  closeModal("#BulkUploadSuccessModal");
});

$(document).on(
  "click",
  "#bulkUploadEligibilityCloseBtn, #modalBulkUploadSuccessCloseBtn",
  function (e) {
    closeModal("#bulkUploadEligibilityModal, #BulkUploadSuccessModal");
    openModal("#uploadExitModal");
  },
);

$(document).on("click", "#reuploadBtn", function () {
  var zone = $("#bulkUploadDropZone");
  zone.removeClass("uploaded");
  zone
    .find(".upload-left-icon")
    .show()
    .html('<span class="material-symbols-outlined">draft</span>')
    .removeClass("file-name");
  zone.find(".upload-right-icon").hide();
  zone
    .find(".upload-title")
    .text("Upload / Drag & Drop file")
    .removeClass("file-name");
  zone.find(".upload-loader").hide();
  zone.find(".upload-file-input").val("");
  zone.removeData(
    "valid-rows errors total-records selected-file-name parse-error",
  );

  bulkParsedRows = [];
  $("#bulkUploadBtn").addClass("btn-disabled").prop("disabled", true);

  closeModal("#documentOverviewModal");
  openModal("#bulkUploadModal");
  if (window.lucide) lucide.createIcons();
});

$(document).on("click", "#bulkUploadModal [data-close-modal]", function () {
  var zone = $("#bulkUploadDropZone");
  zone.removeClass("uploaded");
  zone
    .find(".upload-left-icon")
    .show()
    .html('<span class="material-symbols-outlined">draft</span>')
    .removeClass("file-name");
  zone.find(".upload-right-icon").hide();
  zone
    .find(".upload-title")
    .text("Upload / Drag & Drop file")
    .removeClass("file-name");
  zone.find(".upload-loader").hide();
  zone.find(".upload-file-input").val("");
  zone.removeData(
    "valid-rows errors total-records selected-file-name parse-error",
  );

  bulkParsedRows = [];
  $("#bulkUploadBtn").addClass("btn-disabled").prop("disabled", true);
});

// Common functions
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

// ── Custom Calendar Picker
(function () {
  var MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  function sameDay(a, b) {
    return (
      a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function pad(n) {
    return n < 10 ? "0" + n : "" + n;
  }

  function formatMY(d) {
    return pad(d.getMonth() + 1) + "/" + String(d.getFullYear()).slice(-2);
  }

  function initState() {
    return {
      view: "year",
      viewMonth: today.getMonth(),
      viewYear: today.getFullYear(),
      centerYear: today.getFullYear(),
      selected: null,
    };
  }

  function buildWeekdays() {
    var w = document.createElement("div");
    w.className = "weekdays";
    ["S", "M", "T", "W", "T", "F", "S"].forEach(function (d) {
      var s = document.createElement("span");
      s.textContent = d;
      w.appendChild(s);
    });
    return w;
  }

  function isDOBPicker(pop) {
    var wrap = pop.closest(".custom-datepicker-wrap");
    var inp = wrap.querySelector(".dobDate");
    return inp !== null;
  }

  function getCutoffDate() {
    var cutoff = new Date(today);
    cutoff.setFullYear(today.getFullYear() - 21);
    return cutoff;
  }

  function buildDaysGrid(state, pop) {
    var grid = document.createElement("div");
    grid.className = "days";
    var firstDay = new Date(state.viewYear, state.viewMonth, 1).getDay();
    var totalDays = new Date(state.viewYear, state.viewMonth + 1, 0).getDate();

    var isDOB = isDOBPicker(pop);
    var cutoffDate = getCutoffDate();

    for (var i = 0; i < firstDay; i++) {
      var e = document.createElement("div");
      e.className = "day empty";
      grid.appendChild(e);
    }
    for (var d = 1; d <= totalDays; d++) {
      (function (day) {
        var cellDate = new Date(state.viewYear, state.viewMonth, day);
        cellDate.setHours(0, 0, 0, 0);
        var cell = document.createElement("div");
        cell.className = "day";
        cell.textContent = day;

        if (isDOB) {
          if (cellDate > today || cellDate > cutoffDate) {
            cell.classList.add("disabled");
          }
        } else {
          if (cellDate > today) {
            cell.classList.add("disabled");
          }
        }

        if (sameDay(cellDate, today)) cell.classList.add("today");
        if (state.selected && sameDay(cellDate, state.selected))
          cell.classList.add("selected");
        if (!cell.classList.contains("disabled")) {
          cell.addEventListener("click", function (e) {
            e.stopPropagation();
            state.selected = cellDate;
            var wrap = pop.closest(".custom-datepicker-wrap");
            var inp = wrap.querySelector(".startDate, .endDate");
            inp.value = formatMY(cellDate);
            pop.style.display = "none";
            $(inp).trigger("change");
          });
        }
        grid.appendChild(cell);
      })(d);
    }
    return grid;
  }

  function buildMonthsGrid(state, pop) {
    var grid = document.createElement("div");
    grid.className = "months";
    var isDOB = isDOBPicker(pop);
    var cutoffYear = today.getFullYear() - 21;

    MONTHS.forEach(function (m, idx) {
      var item = document.createElement("div");
      item.className = "month-item";
      item.textContent = m;

      if (isDOB) {
        var isAfterCutoff =
          (state.viewYear === cutoffYear && idx > today.getMonth()) ||
          state.viewYear > cutoffYear;
        if (isAfterCutoff) item.classList.add("disabled");
      } else {
        var isAfterToday =
          (state.viewYear === today.getFullYear() && idx > today.getMonth()) ||
          state.viewYear > today.getFullYear();
        if (isAfterToday) item.classList.add("disabled");
      }

      if (idx === state.viewMonth && state.selected)
        item.classList.add("selected");
      if (idx === today.getMonth() && state.viewYear === today.getFullYear())
        item.classList.add("current");

      if (!item.classList.contains("disabled")) {
        item.addEventListener("click", function (e) {
          e.stopPropagation();
          state.viewMonth = idx;

          var selectedDate = new Date(state.viewYear, idx, 1);
          state.selected = selectedDate;

          var wrap = pop.closest(".custom-datepicker-wrap");
          var inp = wrap.querySelector(".startDate, .endDate");
          inp.value = formatMY(selectedDate);
          pop.style.display = "none";
          $(inp).trigger("change");
        });
      }
      grid.appendChild(item);
    });
    return grid;
  }

  var MIN_YEAR = 1980;

  function buildYearsGrid(state, pop) {
    var grid = document.createElement("div");
    grid.className = "years";
    var start = MIN_YEAR;
    var end = today.getFullYear();

    var isDOB = isDOBPicker(pop);
    var cutoffYear = today.getFullYear() - 21;

    for (var y = start; y <= end; y++) {
      (function (yr) {
        var item = document.createElement("div");
        item.className = "year-item";
        item.textContent = yr;

        var isFaded = false;

        if (isDOB) {
          if (yr > cutoffYear) {
            item.classList.add("faded");
            isFaded = true;
          }
        } else {
          if (yr > today.getFullYear()) {
            item.classList.add("faded");
            isFaded = true;
          }
        }

        if (isDOB) {
          if (yr === cutoffYear) {
            item.classList.add("current");
          }
        } else {
          if (yr === today.getFullYear() && !isFaded) {
            item.classList.add("current");
          }
        }

        if (yr === state.viewYear && state.selected)
          item.classList.add("selected");

        var isClickable = false;
        if (isDOB) {
          if (yr <= cutoffYear) {
            isClickable = true;
          }
        } else {
          if (yr <= today.getFullYear()) {
            isClickable = true;
          }
        }

        if (isClickable) {
          item.addEventListener("click", function (e) {
            e.stopPropagation();
            state.viewYear = yr;
            state.centerYear = yr;
            state.view = "month";
            render(state, pop);
          });
        }
        grid.appendChild(item);
      })(y);
    }
    return grid;
  }

  function render(state, pop) {
    pop.innerHTML = "";

    var nav = document.createElement("div");
    nav.className = "nav-dropdown";

    var yBtn = document.createElement("div");
    yBtn.className = "dd" + (state.view === "year" ? " active" : "");
    yBtn.innerHTML =
      "<span>" +
      state.viewYear +
      "</span><span class='caret'>" +
      (state.view === "year" ? "&#9650;" : "&#9660;") +
      "</span>";
    yBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      state.centerYear = state.viewYear;
      state.view = state.view === "year" ? "day" : "year";
      render(state, pop);
    });

    var mBtn = document.createElement("div");
    mBtn.className = "dd" + (state.view === "month" ? " active" : "");
    mBtn.innerHTML =
      "<span>" +
      MONTHS[state.viewMonth] +
      "</span><span class='caret'>" +
      (state.view === "month" ? "&#9650;" : "&#9660;") +
      "</span>";
    mBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      state.view = state.view === "month" ? "day" : "month";
      render(state, pop);
    });

    nav.appendChild(yBtn);
    nav.appendChild(mBtn);
    pop.appendChild(nav);

    if (state.view === "day") {
      pop.appendChild(buildWeekdays());
      pop.appendChild(buildDaysGrid(state, pop));
    } else if (state.view === "month") {
      pop.appendChild(buildMonthsGrid(state, pop));
    } else {
      pop.appendChild(buildYearsGrid(state, pop));
      var scrollTarget =
        pop.querySelector(".year-item.selected") ||
        pop.querySelector(".year-item.current");
      if (scrollTarget) scrollTarget.scrollIntoView({ block: "center" });
    }
  }

  function openPicker(wrap) {
    var pop = wrap.querySelector(".custom-calendar-popup");
    if (!pop._calState) pop._calState = initState();
    var state = pop._calState;
    var inp = wrap.querySelector(".startDate, .endDate");
    state.valueOnOpen = inp.value;
    state.selectedOnOpen = state.selected;
    if (inp.value) {
      var parts = inp.value.split("/");
      if (parts.length === 2) {
        var mm = parseInt(parts[0], 10);
        var yy = parseInt(parts[1], 10);
        var fullYear = yy < 100 ? 2000 + yy : yy;
        var d = new Date(fullYear, mm - 1, 1);
        d.setHours(0, 0, 0, 0);
        state.selected = d;
        state.viewYear = fullYear;
        state.viewMonth = mm - 1;
        state.centerYear = fullYear;
      }
    }
    state.view = "year";
    render(state, pop);
    pop.style.display = "block";
  }

  $(document).on(
    "click",
    ".custom-datepicker-wrap .startDate, .custom-datepicker-wrap .endDate, .custom-datepicker-wrap .custom-cal-icon",
    function (e) {
      e.stopPropagation();
      var wrap = $(this).closest(".custom-datepicker-wrap")[0];
      var pop = wrap.querySelector(".custom-calendar-popup");
      document.querySelectorAll(".custom-calendar-popup").forEach(function (p) {
        if (p !== pop) p.style.display = "none";
      });
      if (pop.style.display === "none" || pop.style.display === "") {
        openPicker(wrap);
      } else {
        pop.style.display = "none";
      }
    },
  );

  $(document).on("click", function (e) {
    if ($(e.target).closest(".custom-datepicker-wrap").length === 0) {
      document.querySelectorAll(".custom-calendar-popup").forEach(function (p) {
        p.style.display = "none";
      });
    }
  });
})();

// Custom dropdown
$(document).on("click", ".custom-select-trigger", function (e) {
  e.stopPropagation();

  const wrapper = $(this).closest(".custom-select-wrapper");
  const options = wrapper.find(".custom-select-options");
  const isOpen = options.is(":visible");

  $(".custom-select-options").not(options).hide();
  $(".custom-select-trigger").not(this).removeClass("active");

  if (isOpen) {
    options.hide();
    $(this).removeClass("active");
  } else {
    options.show();
    $(this).addClass("active");
  }
});

$(document).on("click", ".custom-select-options .option-item", function (e) {
  e.stopPropagation();

  const wrapper = $(this).closest(".custom-select-wrapper");
  const trigger = wrapper.find(".custom-select-trigger");
  const selectedSpan = trigger.find(".selected-option");
  const hiddenSelect = wrapper.siblings("select");
  const options = wrapper.find(".custom-select-options");

  const value = $(this).data("value");
  const text = $(this).text().trim();

  selectedSpan.text(text);
  selectedSpan.removeClass("placeholder");

  if (hiddenSelect.length) {
    hiddenSelect.val(value);
    hiddenSelect.trigger("change");
  }

  options.find(".option-item").removeClass("selected");
  $(this).addClass("selected");

  options.hide();
  trigger.removeClass("active");

  const form = wrapper.closest(".bank-account-form");
  if (form.length) {
    validateBankForm(form);

    const hasValue = form
      .find("input")
      .toArray()
      .some((input) => $(input).val().trim() !== "");
    const hasSelect = form
      .find("select")
      .toArray()
      .some((select) => $(select).val() !== "");
    isFormUnsaved = hasValue || hasSelect;

    if (isFormUnsaved) {
      $("#addBankAccount").addClass("disabled").removeClass("enabled");
    }
  }
});

$(document).on("click", function (e) {
  if (!$(e.target).closest(".custom-select-wrapper").length) {
    $(".custom-select-options").hide();
    $(".custom-select-trigger").removeClass("active");
  }
});

// Shared "Add dealer" dropdown template
var addDealerTemplate = `
  <button class="orange-btn addDealerBtn">
    Add dealer
    <i data-lucide="chevron-down"></i>
  </button>
  <div class="add-dealer-menu addDealerMenu">
    <div class="menu-item" data-action="bulk-upload">Bulk leads upload</div>
    <div class="menu-item" data-action="single-lead">Add a single lead</div>
  </div>
`;

function renderAddDealerDropdowns() {
  $("[data-add-dealer]").each(function () {
    if (!$(this).children().length) {
      $(this).html(addDealerTemplate);
    }
  });
  lucideIconCommonCode();
}

$(function () {
  renderAddDealerDropdowns();
});

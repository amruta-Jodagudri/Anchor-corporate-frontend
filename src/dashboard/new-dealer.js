"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const TOAST_DURATION_MS = 2500;
    const PIN_STORAGE_KEY = "dealerPinnedState";

    const PIN_SORT_TARGETS = [
        { body: "#dealerTableBody",                        row: ".dealer-row" },
        { body: "#newDealerPage .dealer-table-view tbody", row: "tr" },
        { body: "#txnTableBody",                           row: ".txn-row" },
        { body: "#txnTableViewBody",                       row: "tr" },
        { body: "#renewalTableBody",                       row: ".renewal-row" },
        { body: "#renewalTableViewBody",                   row: "tr" }
    ];

    /* TODO(backend): replace with the logged-in user's saved emails */
    const SHARE_SAVED_EMAILS = ["harish.sharma@gmail.com"];

    const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;

    const CAL_MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                        "August", "September", "October", "November", "December"];
    const CAL_WEEK = ["S", "M", "T", "W", "T", "F", "S"].map(function (d) { return "<b>" + d + "</b>"; }).join("");
    const TXN_DAYS_LIMIT = { "0-15": 15, "1-month": 30, "3-months": 90 };

    const MENU_ROUTES = {
        "analytics dashboard": "dashboard",
        "new dealer leads": "newdealer",
        "transaction dashboard": "transaction",
        "renewal details": "renewal"
    };

    function escapeHtml(value) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return String(value).replace(/[&<>"']/g, function (ch) { return map[ch]; });
    }

    function parseCurrency(str) {
        return parseFloat(String(str).replace(/[₹,]/g, "")) || 0;
    }

    function formatAmountMarkup(amount) {
        return escapeHtml(amount).replace(/\.(\d{2})$/, '<span class="txn-paise">.$1</span>');
    }

    function wrapPaise(cell) {
        if (!cell || cell.querySelector(".txn-paise")) return;
        cell.innerHTML = formatAmountMarkup(cell.textContent.trim());
    }

    function initDealerAmounts() {
        document.querySelectorAll("#dealerTableBody .dealer-row").forEach(function (row) {
            wrapPaise(row.children[3]);
            wrapPaise(row.children[4]);
        });
        document.querySelectorAll("#newDealerPage .dealer-table-view tbody tr").forEach(function (row) {
            wrapPaise(row.children[8]);
        });
    }

    function setActive(items, activeItem) {
        items.forEach(function (item) {
            item.classList.toggle("active", item === activeItem);
        });
    }

    function bindClick(id, handler) {
        const el = document.getElementById(id);
        if (el) el.addEventListener("click", handler);
    }

    function initDropdownMenu(button, menu) {
        if (!button || !menu) return;

        button.addEventListener("click", function (event) {
            event.stopPropagation();
            menu.classList.toggle("show");
        });

        document.addEventListener("click", function () {
            menu.classList.remove("show");
        });
    }

    function showAppToast(message, type, subText) {
        const toast = document.getElementById("appToast");
        const text = document.getElementById("appToastText");
        const sub = document.getElementById("appToastSub");
        if (!toast) return;

        toast.classList.toggle("error", type === "error");
        toast.classList.toggle("warning", type === "warning");
        toast.classList.toggle("has-sub", Boolean(subText));
        if (text) text.textContent = message;
        if (sub) sub.textContent = subText || "";

        toast.classList.add("show");
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(function () {
            toast.classList.remove("show");
        }, TOAST_DURATION_MS);
    }

    const dealerCellLabels = {
        2: "Dealer details",
        3: "Association with corporate",
        4: "Sales to dealer (last 12 M)",
        5: "Loan offer",
        7: "Sanction status"
    };

    const dealerStages = {
        "Zenith Steel Traders": "apply",
        "SunDesh Systems Pvt. Ltd": "apply",
        "Chauhan Traders": "current-account",
        "Polychem Global": "rejected",
        "TechGlobal": "esign",
        "Trader Groups": "limit-setup"
    };

    const commonDealerDetails = {
        dealerId: "CLB-00000000-4563-PRO",
        chequeReturns: "0 (Last 12 M)",
        uploadedBy: "ICICI Bank",
        leadDate: "07 Jul '26"
    };

    const dealerDetails = {
        "Zenith Steel Traders":     Object.assign({}, commonDealerDetails, { vintage: "12 years", overdue: "0 (7D +)", recommendation: "₹70,00,000.00" }),
        "SunDesh Systems Pvt. Ltd": Object.assign({}, commonDealerDetails, { vintage: "14 years", overdue: "1 (7D +)", recommendation: "₹65,00,000.00" }),
        "Chauhan Traders":          Object.assign({}, commonDealerDetails, { vintage: "15 years", overdue: "0 (7D +)", recommendation: "₹80,00,000.00" }),
        "Polychem Global":          Object.assign({}, commonDealerDetails, { vintage: "16 years", overdue: "2 (7D +)", recommendation: "₹90,00,000.00" }),
        "TechGlobal":               Object.assign({}, commonDealerDetails, { vintage: "16 years", overdue: "0 (7D +)", recommendation: "₹90,00,000.00" }),
        "Trader Groups":            Object.assign({}, commonDealerDetails, { vintage: "16 years", overdue: "0 (7D +)", recommendation: "₹90,00,000.00" })
    };

    const progressSteps = [
        { key: "loan-offer",      label: "Loan offer" },
        { key: "apply",           label: "Apply" },
        { key: "sanction",        label: "Sanction" },
        { key: "current-account", label: "Current account" },
        { key: "esign",           label: "eSign" },
        { key: "limit-setup",     label: "Limit setup" }
    ];

    const stageIndex = {
        "loan-offer": 0,
        "apply": 1,
        "sanction": 2,
        "current-account": 3,
        "esign": 4,
        "limit-setup": 5
    };

    const rejectedLabels = {
        "apply": "Applied",
        "sanction": "Application rejected"
    };

    function generateDummyTranches(count, seedId) {
        const types = ["Principal", "Interest amount", "Processing fee", "Penal charges", "GST"];
        const list = [];
        for (let i = 0; i < count; i++) {
            list.push({
                id: "S" + (1890880 + seedId * 10 + i),
                date: "0" + ((i % 9) + 1) + " Jan '26",
                type: types[i % types.length],
                amount: "₹" + ((i + 1) * 25000).toLocaleString("en-IN") + ".00",
                due: "1" + (i % 9) + " Feb '26"
            });
        }
        return list;
    }

    const transactionData = [
        {
            firm: "BluePeak Distributors", code: "T1H2E3M66",
            scfAccount: "2145 2145 2145", status: "freeze",
            sanction: "₹95,00,000.00", utilized: "₹65,00,000.00", utilizedPct: "68.42%",
            available: "₹30,00,000.00", availablePct: "31.58%",
            openTxns: 7, overdueAmount: "₹40,000.00", days: "overdue",
            caseType: "Digital", acExpiry: "01 Jul '26",
            tranches: generateDummyTranches(7, 0)
        },
        {
            firm: "SunDesh Systems Pvt. Ltd", code: "T1H2E3M66",
            scfAccount: "2145 2145 2145", status: "unfreeze",
            sanction: "₹78,60,000.00", utilized: "₹56,40,000.00", utilizedPct: "71.76%",
            available: "₹22,20,000.00", availablePct: "28.24%",
            openTxns: 4, overdueAmount: "-", days: "4 days",
            caseType: "Digital", acExpiry: "01 Jul '26",
            tranches: generateDummyTranches(4, 1)
        },
        {
            firm: "Chauhan Traders", code: "T1H2E3M66",
            scfAccount: "2145 2145 2145", status: "unfreeze",
            sanction: "₹86,00,000.00", utilized: "₹62,00,000.00", utilizedPct: "72.09%",
            available: "₹24,00,000.00", availablePct: "27.91%",
            openTxns: 3, overdueAmount: "-", days: "6 days",
            caseType: "Digital", acExpiry: "01 Jul '26",
            tranches: generateDummyTranches(3, 3)
        },
        {
            firm: "Polychem Global", code: "T1H2E3M66",
            scfAccount: "2145 2145 2145", status: "freeze",
            sanction: "₹93,00,000.00", utilized: "₹65,00,000.00", utilizedPct: "69.89%",
            available: "₹28,00,000.00", availablePct: "30.11%",
            openTxns: 5, overdueAmount: "₹40,000.00", days: "overdue",
            caseType: "Digital", acExpiry: "01 Jul '26",
            tranches: generateDummyTranches(5, 4)
        },
        {
            firm: "Kartikey Corporationsutio...", code: "T1H2E3M66",
            scfAccount: "2145 2145 2145", status: "freeze",
            sanction: "₹85,50,000.00", utilized: "₹63,50,000.00", utilizedPct: "74.71%",
            available: "₹22,00,000.00", availablePct: "25.88%",
            openTxns: 3, overdueAmount: "₹40,000.00", days: "overdue",
            caseType: "Digital", acExpiry: "01 Jul '26",
            tranches: generateDummyTranches(3, 5)
        }
    ];

    const newDealerPage = document.getElementById("newDealerPage");
    const hideDetailsBtn = document.getElementById("hideDetailsBtn");
    const searchInput = document.getElementById("dealerSearchInput");

    const menuItems = document.querySelectorAll("#menuPanel .menu-list .menu-item");

    const dealerRows = Array.from(document.querySelectorAll("#newDealerPage .new-dealer-table .dealer-row"));

    let detailsHidden = false;
    let activeFilter = "all";

    const leadSelection = new Set();

    let modalFilters = {
        sanction: "all",
        application: "all",
        loanFrom: null,
        loanTo: null,
        firms: [],
        leadTypes: [],
        uploadedBy: []
    };

    function getDealerName(row) {
        const name = row.querySelector(".dealer-firm strong");
        return name ? name.textContent.trim() : "";
    }

    function getRobustFirmName(container) {
        if (!container) return "";
        const clone = container.cloneNode(true);
        const codeEl = clone.querySelector(".table-firm-code");
        if (codeEl) codeEl.remove();
        return clone.textContent.replace(/\s+/g, " ").trim();
    }

    function getDealerStage(row) {
        return dealerStages[getDealerName(row)] || "apply";
    }

    function findDealerRow(dealerName) {
        return dealerRows.find(function (row) {
            return getDealerName(row) === dealerName;
        });
    }

    function applyDealerCellLabels() {
        dealerRows.forEach(function (row) {
            Object.keys(dealerCellLabels).forEach(function (position) {
                const cell = row.children[position - 1];
                if (cell) cell.dataset.label = dealerCellLabels[position];
            });
        });
    }

    function prepareContactIcons() {
        document.querySelectorAll(".dealer-contact span").forEach(function (element) {
            const original = element.textContent.trim();
            if (!original) return;

            if (original.startsWith("☎")) {
                element.dataset.icon = "phone";
                element.dataset.value = original.replace("☎", "").trim();
            } else {
                element.dataset.value = original;
            }
        });

        document.querySelectorAll(".dealer-contact small").forEach(function (element) {
            element.dataset.value = element.textContent.trim().replace("✉", "").trim();
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
        const maskedLocal = local.slice(0, 3) + "x".repeat(Math.max(local.length - 3, 6));
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
        return parts.map(function (part, i) {
            if (i === parts.length - 1) {
                return "x".repeat(Math.max(part.length - 3, 1)) + part.slice(-3);
            }
            return "x".repeat(part.length);
        }).join(" ");
    }

    function maskDealerId(value) {
        const v = value.trim();
        const parts = v.split("-");
        if (parts.length < 2) return v;
        return parts.map(function (part, i) {
            return i === 0 ? part : "x".repeat(part.length);
        }).join("-");
    }

    function toggleTextMask(el, isHidden, maskFn) {
        if (isHidden) {
            el.dataset.original = el.dataset.original || el.textContent.trim();
            el.textContent = maskFn(el.dataset.original);
        } else if (el.dataset.original) {
            el.textContent = el.dataset.original;
        }
    }

    function toggleValueMask(el, isHidden, maskFn) {
        if (isHidden) {
            el.dataset.original = el.dataset.original || el.dataset.value;
            el.dataset.value = maskFn(el.dataset.original);
        } else if (el.dataset.original) {
            el.dataset.value = el.dataset.original;
        }
    }

    function updateHideButtonUI(btn, isHidden) {
        if (!btn) return;

        const labelText = isHidden ? "Show details" : "Hide details";
        const label = btn.querySelector(".hide-details-label");
        const eye = btn.querySelector(".hide-details-eye");

        if (label) {
            label.textContent = labelText;
        } else {
            const textNode = Array.from(btn.childNodes).find(function (node) {
                return node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "";
            });
            if (textNode) textNode.textContent = labelText + " ";
        }

        if (eye) eye.textContent = isHidden ? "visibility" : "visibility_off";
    }

    function applyDealerMasking(isHidden) {
        document.querySelectorAll("#newDealerPage .dealer-contact span[data-value]").forEach(function (el) {
            toggleValueMask(el, isHidden, maskPhone);
        });

        document.querySelectorAll("#newDealerPage .dealer-contact small[data-value]").forEach(function (el) {
            toggleValueMask(el, isHidden, maskEmail);
        });

        document.querySelectorAll("#newDealerPage .dealer-association small").forEach(function (el) {
            toggleTextMask(el, isHidden, function (v) { return "PAN: " + maskPAN(v); });
        });

        document.querySelectorAll("#newDealerPage .code-value").forEach(function (el) {
            toggleTextMask(el, isHidden, maskCodeValue);
        });

        document.querySelectorAll("#newDealerPage .dealer-detail-item").forEach(function (item) {
            const label = item.querySelector("span");
            const value = item.querySelector("strong");
            if (label && value && label.textContent.trim() === "Dealer ID") {
                toggleTextMask(value, isHidden, maskDealerId);
            }
        });

        const gridColumns = [
            { index: 5, maskFn: maskPhone },
            { index: 6, maskFn: maskEmail },
            { index: 7, maskFn: maskPAN }
        ];

        document.querySelectorAll("#newDealerPage .dealer-table-view tbody tr").forEach(function (row) {
            gridColumns.forEach(function (column) {
                const cell = row.children[column.index];
                if (cell) toggleTextMask(cell, isHidden, column.maskFn);
            });
        });
    }

    function applyTxnMasking(isHidden) {
        document.querySelectorAll("#transactionDashboardPage .code-value").forEach(function (el) {
            toggleTextMask(el, isHidden, maskCodeValue);
        });

        document.querySelectorAll(".txn-scf-account").forEach(function (el) {
            toggleTextMask(el, isHidden, maskAccountNumber);
        });
    }

    function applyRenewalMasking(isHidden) {
        document.querySelectorAll("#renewalDetailsPage .dealer-contact span[data-value]").forEach(function (el) {
            toggleValueMask(el, isHidden, maskPhone);
        });

        document.querySelectorAll("#renewalDetailsPage .dealer-contact small[data-value]").forEach(function (el) {
            toggleValueMask(el, isHidden, maskEmail);
        });

        document.querySelectorAll("#renewalDetailsPage .pan-value").forEach(function (el) {
            toggleTextMask(el, isHidden, maskPAN);
        });

        document.querySelectorAll("#renewalDetailsPage .id-value").forEach(function (el) {
            toggleTextMask(el, isHidden, maskDealerId);
        });

        const gridColumns = [
            { index: 3, maskFn: maskPhone },
            { index: 4, maskFn: maskEmail },
            { index: 5, maskFn: maskPAN }
        ];

        document.querySelectorAll("#renewalDetailsPage .renewal-table-view tbody tr").forEach(function (row) {
            gridColumns.forEach(function (column) {
                const cell = row.children[column.index];
                if (cell) toggleTextMask(cell, isHidden, column.maskFn);
            });
        });
    }

    function applyAllMasking(isHidden) {
        applyDealerMasking(isHidden);
        applyTxnMasking(isHidden);
        applyRenewalMasking(isHidden);
        updateHideButtonUI(document.getElementById("hideDetailsBtn"), isHidden);
        updateHideButtonUI(document.getElementById("txnHideDetailsBtn"), isHidden);
        updateHideButtonUI(document.getElementById("renewalHideDetailsBtn"), isHidden);
    }

    function setDetailsHidden(isHidden) {
        detailsHidden = isHidden;
        if (newDealerPage) newDealerPage.classList.toggle("details-hidden", isHidden);
        if (hideDetailsBtn) hideDetailsBtn.classList.toggle("is-hidden-state", isHidden);
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
        if (nextState === "completed" || nextState === "current") return "is-complete";
        if (nextState === "rejected") return "is-rejected";
        return "";
    }

    function getProgressNodeMarkup(state, index) {
        if (state === "completed") return '<span class="dealer-progress-check"></span>';
        if (state === "rejected") return '<span class="dealer-progress-alert"></span>';
        return '<span class="dealer-progress-number">' + (index + 1) + "</span>";
    }

    function getProgressMarkup(stage) {
        const states = progressSteps.map(function (step) {
            return getProgressState(stage, step.key);
        });

        const stepsMarkup = progressSteps.map(function (step, index) {
            const state = states[index];
            const isLast = index === progressSteps.length - 1;
            const label = (stage === "rejected" && rejectedLabels[step.key]) || step.label;
            const connectorClass = getConnectorClass(state, states[index + 1]);

            return `
                <div class="dealer-progress-step ${state}">
                    <div class="dealer-progress-node">${getProgressNodeMarkup(state, index)}</div>
                    <span class="dealer-progress-label">${label}</span>
                    ${isLast ? "" : `<span class="dealer-progress-connector ${connectorClass}"></span>`}
                </div>
            `;
        }).join("");

        return `
            <div class="dealer-progress">
                <div class="dealer-progress-track">${stepsMarkup}</div>
            </div>
        `;
    }

    function getDetailItemMarkup(label, valueHtml, extraClass) {
        return `
            <div class="dealer-detail-item ${extraClass || ""}">
                <span>${label}</span>
                <strong>${valueHtml}</strong>
            </div>
        `;
    }

    function createDealerDetailRow(row) {
        const dealerName = getDealerName(row);
        const stage = getDealerStage(row);
        const details = dealerDetails[dealerName] || dealerDetails["Zenith Steel Traders"];
        const leadType = row.dataset.leadType === "old" ? "Old" : "Fresh";

        const detailRow = document.createElement("tr");
        detailRow.className = "dealer-details-row";
        detailRow.dataset.dealerDetailsFor = dealerName;

        detailRow.innerHTML = `
            <td colspan="8">
                <div class="dealer-detail-panel">

                    <div class="dealer-detail-info">
                        ${getDetailItemMarkup("Lead type", escapeHtml(leadType), "dealer-detail-item--mobile-only")}
                        ${getDetailItemMarkup("Dealer ID", escapeHtml(details.dealerId))}
                        ${getDetailItemMarkup("Cheque returns", escapeHtml(details.chequeReturns))}
                        ${getDetailItemMarkup("Business vintage", escapeHtml(details.vintage))}
                        ${getDetailItemMarkup("Instances of overdue", escapeHtml(details.overdue))}
                        ${getDetailItemMarkup("Recommendation limit", escapeHtml(details.recommendation))}
                        ${getDetailItemMarkup("Uploaded by", escapeHtml(details.uploadedBy) + ' <i class="dealer-upload-user-icon"></i>')}
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
        `;

        detailRow.querySelector(".dealer-collapse-btn").addEventListener("click", function () {
            toggleDealerRow(row);
        });

        return detailRow;
    }

    function initializeDetailRows() {
        dealerRows.forEach(function (row) {
            const nextRow = row.nextElementSibling;
            if (nextRow && nextRow.classList.contains("dealer-details-row")) return;

            row.parentNode.insertBefore(createDealerDetailRow(row), row.nextSibling);
        });
    }

    function closeAllDealerDetails() {
        dealerRows.forEach(function (row) {
            row.classList.remove("is-expanded");

            const detailRow = row.nextElementSibling;
            if (detailRow && detailRow.classList.contains("dealer-details-row")) {
                detailRow.classList.remove("is-visible");
            }
        });
    }

    function toggleDealerRow(row) {
        const wasExpanded = row.classList.contains("is-expanded");
        closeAllDealerDetails();
        if (wasExpanded) return;

        row.classList.add("is-expanded");
        const detailRow = row.nextElementSibling;
        if (detailRow && detailRow.classList.contains("dealer-details-row")) {
            detailRow.classList.add("is-visible");
        }
    }

    function initRowExpansion() {
        dealerRows.forEach(function (row) {
            const expandButton = row.querySelector(".dealer-expand-btn");
            if (!expandButton) return;

            expandButton.addEventListener("click", function (event) {
                event.stopPropagation();
                toggleDealerRow(row);
            });
        });
    }

    function getStatusTooltip(status, stage) {
        if (status === "actioned") return "The dealer has not started the application process yet.";
        if (status === "rejected") return "The application has been rejected by the bank.";

        if (status === "sanctioned") {
            if (stage === "current-account") return "The application has been sanctioned and is pending for current account.";
            if (stage === "esign") return "The application has been sanctioned and is pending for eSign.";
            if (stage === "limit-setup") return "The application has been sanctioned and is pending for limit setup.";
            return "The application has been sanctioned.";
        }

        return "";
    }

    function initStatusTooltips() {
        dealerRows.forEach(function (row) {
            const infoIcon = row.querySelector(".dealer-status small");
            if (infoIcon) {
                infoIcon.setAttribute("data-tooltip", getStatusTooltip(row.dataset.status, getDealerStage(row)));
            }
        });

        document.querySelectorAll("#newDealerPage .dealer-table-view tbody tr").forEach(function (tRow) {
            const statusEl = tRow.querySelector(".table-status");
            const infoIcon = tRow.querySelector(".table-status small");
            if (!statusEl || !infoIcon) return;

            const status = ["actioned", "sanctioned", "rejected"].find(function (name) {
                return statusEl.classList.contains(name);
            }) || "";

            const dealerName = getRobustFirmName(tRow.querySelector(".table-firm-name"));
            const stage = dealerStages[dealerName] || "apply";

            infoIcon.setAttribute("data-tooltip", getStatusTooltip(status, stage));
        });
    }


    function renderFirmOptions(panel, firms) {
        if (!panel) return;
        panel.innerHTML = "";

        firms.forEach(function (firm) {
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            const text = document.createElement("span");
            const meta = document.createElement("small");

            checkbox.type = "checkbox";
            checkbox.value = firm.name;
            checkbox.dataset.label = firm.name;
            text.textContent = firm.name;
            meta.textContent = firm.meta;
            text.appendChild(meta);
            label.append(checkbox, text);
            panel.appendChild(label);
        });
    }

    function getOptionLabel(input) {
        return input.dataset.label || input.closest("label").textContent.trim();
    }

    function updateDropdownSummary(dropdown) {
        const inputs = Array.from(dropdown.querySelectorAll(".dealer-filter-dropdown-panel input[type='checkbox']"));
        const allBox = inputs.find(function (input) { return input.value === "all"; });
        const picked = inputs.filter(function (input) { return input.checked && input.value !== "all"; });
        const summary = allBox && allBox.checked ? "All" : picked.map(getOptionLabel).join(", ");
        const searchField = dropdown.querySelector(".dealer-filter-search-input input");
        if (searchField) {
            searchField.value = summary;
            return;
        }

        const button = dropdown.querySelector(".dealer-filter-dropdown-btn");
        if (!button) return;

        const textNode = Array.from(button.childNodes).find(function (node) {
            return node.nodeType === Node.TEXT_NODE;
        });
        if (textNode) textNode.textContent = (summary || dropdown.dataset.defaultText) + " ";
    }

    function closeFilterDropdown(dropdown) {
        dropdown.classList.remove("open");
        dropdown.querySelectorAll(".dealer-filter-dropdown-panel label").forEach(function (label) {
            label.style.display = "";
        });
        updateDropdownSummary(dropdown);
    }

    function resetFilterDropdown(dropdown) {
        const inputs = Array.from(dropdown.querySelectorAll(".dealer-filter-dropdown-panel input[type='checkbox']"));
        const hasAll = inputs.some(function (input) { return input.value === "all"; });
        inputs.forEach(function (input) { input.checked = hasAll; });
        updateDropdownSummary(dropdown);
    }

    function getActivePillValue(selector) {
        const active = document.querySelector(selector + " .active");
        return active ? active.dataset.value : "all";
    }

    function getCheckedValues(selector) {
        return Array.from(document.querySelectorAll(selector + " input[type='checkbox']:checked"))
            .map(function (input) { return input.value; })
            .filter(function (value) { return value !== "all"; });
    }

    function initFilterDropdowns() {
        document.querySelectorAll(".dealer-filter-dropdown").forEach(function (dropdown) {
            const trigger = dropdown.querySelector(".dealer-filter-dropdown-btn, .dealer-filter-search-input");
            const panel = dropdown.querySelector(".dealer-filter-dropdown-panel");
            if (!trigger || !panel) return;

            const isSearch = trigger.classList.contains("dealer-filter-search-input");
            const button = dropdown.querySelector(".dealer-filter-dropdown-btn");
            if (button) {
                const textNode = Array.from(button.childNodes).find(function (node) {
                    return node.nodeType === Node.TEXT_NODE;
                });
                dropdown.dataset.defaultText = textNode ? textNode.textContent.trim() : "";
            }

            const allBox = panel.querySelector("input[value='all']");
            if (allBox && allBox.checked) {
                panel.querySelectorAll("input[type='checkbox']").forEach(function (input) {
                    input.checked = true;
                });
            }

            trigger.addEventListener("click", function (event) {
                event.stopPropagation();

                document.querySelectorAll(".dealer-filter-dropdown.open").forEach(function (item) {
                    if (item !== dropdown) closeFilterDropdown(item);
                });

                if (isSearch && !event.target.closest("span")) {
                    dropdown.classList.add("open");
                } else if (dropdown.classList.contains("open")) {
                    closeFilterDropdown(dropdown);
                } else {
                    dropdown.classList.add("open");
                }
            });

            panel.addEventListener("click", function (event) {
                event.stopPropagation();
            });

            panel.addEventListener("change", function (event) {
                const changed = event.target;
                if (changed.type !== "checkbox") return;

                const inputs = Array.from(panel.querySelectorAll("input[type='checkbox']"));
                const all = inputs.find(function (input) { return input.value === "all"; });

                if (all) {
                    if (changed === all) {
                        inputs.forEach(function (input) { input.checked = all.checked; });
                    } else {
                        all.checked = inputs
                            .filter(function (input) { return input !== all; })
                            .every(function (input) { return input.checked; });
                    }
                }

                updateDropdownSummary(dropdown);
            });

            updateDropdownSummary(dropdown);
        });

        document.addEventListener("click", function () {
            document.querySelectorAll(".dealer-filter-dropdown.open").forEach(closeFilterDropdown);
        });
    }

    function initFirmSearch(input, panel) {
        if (!input || !panel) return;

        input.addEventListener("focus", function () { input.select(); });
        input.addEventListener("input", function () {
            const query = input.value.trim().toLowerCase();
            panel.querySelectorAll("label").forEach(function (label) {
                label.style.display = !query || label.textContent.toLowerCase().includes(query) ? "" : "none";
            });
        });
    }

    function initDealerFirmFilter() {
        const panel = document.querySelector("#firmDropdown .dealer-filter-dropdown-panel");

        renderFirmOptions(panel, dealerRows.map(function (row) {
            const code = (row.querySelector(".dealer-firm small") || {}).textContent || "";
            const pan = (row.querySelector(".dealer-association small") || {}).textContent || "";

            return {
                name: getDealerName(row),
                meta: "Dealer code: " + code.replace(/^Code:\s*/i, "").trim() + "\n" + pan.trim()
            };
        }));

        initFirmSearch(document.getElementById("firmSearchInput"), panel);
    }


    //    NEW DEALER LEADS - FILTERS MODAL

    function readModalFilters() {
        return {
            sanction: getActivePillValue("#sanctionStatusPills"),
            application: getActivePillValue("#applicationStatusPills"),
            loanFrom: parseFloat((document.getElementById("loanOfferFrom") || {}).value) || null,
            loanTo: parseFloat((document.getElementById("loanOfferTo") || {}).value) || null,
            firms: getCheckedValues("#firmDropdown"),
            leadTypes: getCheckedValues("#leadTypeDropdown"),
            uploadedBy: getCheckedValues("#uploadedByDropdown")
        };
    }

    function initDealerFiltersModal() {
        const openBtn = document.getElementById("dealerFiltersBtn");
        const overlay = document.getElementById("dealerFiltersOverlay");
        const closeBtn = document.getElementById("dealerFiltersClose");
        const resetBtn = document.getElementById("dealerFiltersReset");
        const applyBtn = document.getElementById("dealerFiltersApply");
        if (!overlay) return;

        let appliedSnapshot = null;

        function syncApplyState() {
            if (!applyBtn) return;
            applyBtn.disabled = appliedSnapshot !== null &&
                JSON.stringify(readModalFilters()) === appliedSnapshot;
        }

        function closeOverlay() {
            overlay.classList.remove("show");
        }

        ["change", "input", "click"].forEach(function (eventName) {
            overlay.addEventListener(eventName, syncApplyState);
        });

        if (openBtn) {
            openBtn.addEventListener("click", function () {
                if (appliedSnapshot === null) appliedSnapshot = JSON.stringify(readModalFilters());
                overlay.classList.add("show");
                syncApplyState();
            });
        }

        if (closeBtn) closeBtn.addEventListener("click", closeOverlay);

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeOverlay();
        });

        overlay.querySelectorAll(".dealer-filter-pills").forEach(function (group) {
            group.addEventListener("click", function (event) {
                const pill = event.target.closest(".dealer-filter-pill");
                if (!pill) return;
                setActive(Array.from(group.querySelectorAll(".dealer-filter-pill")), pill);
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                overlay.querySelectorAll(".dealer-filter-pills").forEach(function (group) {
                    group.querySelectorAll(".dealer-filter-pill").forEach(function (pill, index) {
                        pill.classList.toggle("active", index === 0);
                    });
                });

                ["loanOfferFrom", "loanOfferTo"].forEach(function (id) {
                    const input = document.getElementById(id);
                    if (input) input.value = "";
                });

                overlay.querySelectorAll(".dealer-filter-dropdown").forEach(resetFilterDropdown);
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener("click", function () {
                modalFilters = readModalFilters();
                appliedSnapshot = JSON.stringify(modalFilters);

                closeAllDealerDetails();
                applyCurrentView();
                closeOverlay();
                showAppToast("Filters applied successfully");
            });
        }
    }

    function matchesModalFilters(dealerName) {
        const f = modalFilters;

        if (f.firms.length && !f.firms.includes(dealerName)) return false;

        const listRow = findDealerRow(dealerName);
        if (!listRow) return true;

        const stage = getDealerStage(listRow);
        const status = listRow.dataset.status;
        const loanValue = parseCurrency(listRow.children[4].textContent);
        const uploadedBy = (dealerDetails[dealerName] || {}).uploadedBy || "";
        const uploadedKey = /icici/i.test(uploadedBy) ? "icici" : "anchor";

        const matchSanction = f.sanction === "all" || status === f.sanction;
        const matchApplication = f.application === "all" ||
            (f.application === "pending" && stage === "apply") ||
            stage === f.application || status === f.application;
        const matchLoan = (f.loanFrom === null || loanValue >= f.loanFrom) &&
                          (f.loanTo === null || loanValue <= f.loanTo);
        const matchLead = !f.leadTypes.length || f.leadTypes.includes(listRow.dataset.leadType);
        const matchUploader = !f.uploadedBy.length || f.uploadedBy.includes(uploadedKey);

        return matchSanction && matchApplication && matchLoan && matchLead && matchUploader;
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

    function matchesFilter(row, filter) {
        return matchesFilterValue(
            filter,
            row.dataset.status || "",
            row.dataset.leadType || "",
            getDealerStage(row)
        );
    }

    function matchesFilterByName(dealerName, filter) {
        const listRow = findDealerRow(dealerName);
        if (listRow) return matchesFilter(listRow, filter);

        return matchesFilterValue(filter, "", "", dealerStages[dealerName] || "apply");
    }

    function applyCurrentView() {
        const searchValue = searchInput ? searchInput.value.trim().toLowerCase() : "";

        /* List view */
        dealerRows.forEach(function (row) {
            const visible =
                matchesFilter(row, activeFilter) &&
                (!searchValue || row.textContent.toLowerCase().includes(searchValue)) &&
                matchesModalFilters(getDealerName(row));

            row.classList.toggle("hidden-by-filter", !visible);

            const detailRow = row.nextElementSibling;
            if (detailRow && detailRow.classList.contains("dealer-details-row")) {
                detailRow.classList.toggle("hidden-by-filter", !visible);
            }
        });

        /* Grid view */
        document.querySelectorAll("#newDealerPage .dealer-table-view tbody tr").forEach(function (tRow) {
            const dealerName = getRobustFirmName(tRow.querySelector(".table-firm-name"));

            const visible =
                matchesFilterByName(dealerName, activeFilter) &&
                (!searchValue || tRow.textContent.toLowerCase().includes(searchValue)) &&
                matchesModalFilters(dealerName);

            tRow.classList.toggle("hidden-by-filter", !visible);
        });

        syncLeadSelection();
    }

    function initDealerFilterButtons() {
        const viewMoreBtn = document.getElementById("viewMoreBtn");
        const viewMoreMenu = document.getElementById("viewMoreMenu");
        const toBeActionedBtn = document.getElementById("toBeActionedBtn");
        const filterButtons = document.querySelectorAll("#newDealerPage .dealer-filter-btn");
        const viewMoreFilters = document.querySelectorAll("#newDealerPage .view-more-menu button");

        const viewMoreDefaultHTML = viewMoreBtn ? viewMoreBtn.innerHTML : "View more";
        const toBeActionedOriginalHTML = toBeActionedBtn ? toBeActionedBtn.innerHTML : "";

        initDropdownMenu(viewMoreBtn, viewMoreMenu);

        function resetViewMoreButton() {
            if (!viewMoreBtn) return;
            viewMoreBtn.innerHTML = viewMoreDefaultHTML;
            viewMoreBtn.classList.remove("active");
        }

        function restoreToBeActionedButton() {
            if (!toBeActionedBtn) return;
            toBeActionedBtn.innerHTML = toBeActionedOriginalHTML;
            toBeActionedBtn.dataset.filter = "actioned";
        }

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                const filter = button.dataset.filter;
                if (!filter) return;

                activeFilter = filter;

                restoreToBeActionedButton();
                setActive(Array.from(filterButtons), button);
                resetViewMoreButton();

                closeAllDealerDetails();
                applyCurrentView();
            });
        });

        viewMoreFilters.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.dataset.filter || "all";

                if (viewMoreMenu) viewMoreMenu.classList.remove("show");
                const fullText = button.textContent.trim();
                const match = fullText.match(/^(.*)\((\d+)\)$/);
                const label = escapeHtml(match ? match[1].trim() : fullText);
                const count = match ? match[2] : "";
                const badge = count ? " <span>" + count + "</span>" : "";

                const isCompact = toBeActionedBtn && getComputedStyle(toBeActionedBtn).display === "none";

                setActive(Array.from(filterButtons), null);

                if (isCompact && viewMoreBtn) {
                    viewMoreBtn.innerHTML = label + badge;
                    viewMoreBtn.classList.add("active");
                } else {
                    resetViewMoreButton();
                    if (toBeActionedBtn) {
                        toBeActionedBtn.innerHTML = label + badge;
                        toBeActionedBtn.dataset.filter = activeFilter;
                        toBeActionedBtn.classList.add("active");
                    }
                }

                closeAllDealerDetails();
                applyCurrentView();
            });
        });
    }

    function wrapCodeValues() {
        document.querySelectorAll(".dealer-firm small, .table-firm-code").forEach(function (el) {
            if (el.querySelector(".code-value")) return;
            const m = el.textContent.match(/^\s*Code:\s*(.+?)\s*$/i);
            if (!m) return;
            el.innerHTML = 'Code: <span class="code-value">' + escapeHtml(m[1]) + "</span>";
        });
    }

    function initDealerSearch() {
        if (searchInput) searchInput.addEventListener("input", applyCurrentView);
    }

    function initDetailsToggle() {
        if (hideDetailsBtn) {
            hideDetailsBtn.addEventListener("click", function () {
                setDetailsHidden(!detailsHidden);
            });
        }
    }

    function initDealerViewSwitch() {
        const buttons = document.querySelectorAll("#newDealerPage .view-switch-btn");
        const listWrapper = document.querySelector("#newDealerPage .new-dealer-table-wrapper");
        const gridWrapper = document.querySelector("#newDealerPage .dealer-table-view-wrapper");

        function setView(view) {
            const isGrid = view === "grid";

            if (listWrapper) listWrapper.style.display = isGrid ? "none" : "";
            if (gridWrapper) gridWrapper.style.display = isGrid ? "block" : "none";
            if (newDealerPage) newDealerPage.classList.toggle("table-view", isGrid);
            syncLeadSelection();
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                setActive(Array.from(buttons), button);
                setView(button.dataset.view || "list");
            });
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

    function getPinKey(pin) {
        const tableRow = pin.closest("tr");
        if (!tableRow) return "";
        const tableName = tableRow.querySelector(".table-firm-name");
        if (tableName) return getRobustFirmName(tableName);
        const dealerName = tableRow.querySelector(".dealer-firm strong");
        return dealerName ? dealerName.textContent.trim() : "";
    }

    function reorderPinnedFirst(tbody, rowSelector) {
        if (!tbody) return;

        const pinnedDealers = getPinnedDealers();

        const groups = Array.from(tbody.querySelectorAll(":scope > " + rowSelector)).map(function (row, index) {
            if (row.dataset.order === undefined) row.dataset.order = index;

            const next = row.nextElementSibling;
            const detail = next && (
                next.classList.contains("dealer-details-row") ||
                next.classList.contains("txn-details-row") ||
                next.classList.contains("renewal-details-row")
            ) ? next : null;

            const pin = row.querySelector(".dealer-pin");

            return {
                row: row,
                detail: detail,
                order: Number(row.dataset.order),
                pinned: Boolean(pin && pinnedDealers[getPinKey(pin)])
            };
        });

        groups.sort(function (a, b) {
            return (b.pinned - a.pinned) || (a.order - b.order);
        });

        groups.forEach(function (group) {
            tbody.appendChild(group.row);
            if (group.detail) tbody.appendChild(group.detail);
        });
    }

    function applySavedPins() {
        const pinnedDealers = getPinnedDealers();

        document.querySelectorAll(".dealer-pin").forEach(function (pin) {
            const key = getPinKey(pin);
            pin.classList.toggle("is-pinned", Boolean(key && pinnedDealers[key]));
        });

        PIN_SORT_TARGETS.forEach(function (target) {
            reorderPinnedFirst(document.querySelector(target.body), target.row);
        });
    }

    function initPinning() {
        document.addEventListener("click", function (event) {
            const pin = event.target.closest(".dealer-pin");
            if (!pin) return;

            event.preventDefault();
            event.stopPropagation();

            const key = getPinKey(pin);
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

    function bindOption(item, onPick) {
        item.addEventListener("click", onPick);
        item.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onPick();
            }
        });
    }

    function initShareViaMail() {
        const overlay = document.getElementById("shareMailOverlay");
        if (!overlay) return;

        const emailInput  = document.getElementById("shareEmailInput");
        const emailError  = document.getElementById("shareEmailError");
        const emailWrap   = document.getElementById("shareEmailDropdown");
        const emailPanel  = document.getElementById("shareEmailPanel");
        const emailToggle = document.getElementById("shareEmailToggle");
        const bucketWrap  = document.getElementById("shareBucketDropdown");
        const bucketBtn   = bucketWrap.querySelector(".share-select-btn");
        const bucketText  = bucketWrap.querySelector(".share-select-text");
        const bucketItems = Array.from(bucketWrap.querySelectorAll("[role='option']"));
        const submitBtn   = document.getElementById("shareMailSubmit");
        const desktopMq   = window.matchMedia("(min-width: 768px)");
        const EMAIL_RE    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        let scope = "leads";
        let bucket = "";
        let sending = false;

        function setOpen(wrap, isOpen) {
            wrap.classList.toggle("open", isOpen);
            const btn = wrap.querySelector(".share-select-btn");
            if (btn) btn.setAttribute("aria-expanded", String(isOpen));
        }

        function updateSubmitState() {
            const emailOk = EMAIL_RE.test(emailInput.value.trim());
            submitBtn.disabled = sending || !emailOk || !bucket;
        }

        function setBucket(value) {
            bucket = value;
            const picked = bucketItems.find(function (item) { return item.dataset.value === value; });

            bucketText.textContent = picked ? picked.textContent : "Select bucketing";
            bucketBtn.classList.toggle("is-placeholder", !picked);
            bucketItems.forEach(function (item) {
                item.setAttribute("aria-selected", String(item === picked));
            });
        }

        function pickEmail(email) {
            emailInput.value = email;
            emailError.textContent = "";
            setOpen(emailWrap, false);
            updateSubmitState();
        }

        function pickBucket(value) {
            setBucket(value);
            setOpen(bucketWrap, false);
            updateSubmitState();
            bucketBtn.focus();
        }

        function closeModal() {
            overlay.classList.remove("show");
            setOpen(emailWrap, false);
            setOpen(bucketWrap, false);
        }

        function openModal(trigger) {
            scope = trigger.closest("#transactionDashboardPage") ? "transaction" : "leads";

            emailInput.value = "";
            emailInput.placeholder = desktopMq.matches ? "Select email" : "Enter email";
            emailError.textContent = "";
            setBucket("");
            setOpen(emailWrap, false);
            setOpen(bucketWrap, false);
            sending = false;
            updateSubmitState();

            overlay.classList.add("show");
            if (desktopMq.matches) emailInput.focus();
        }

        async function submit() {
            if (submitBtn.disabled) return;

            sending = true;
            updateSubmitState();

            try {
                await sendShareMail({
                    scope: scope,
                    email: emailInput.value.trim(),
                    bucketDays: Number(bucket)
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
            const option = document.createElement("div");
            option.className = "share-option";
            option.setAttribute("role", "option");
            option.tabIndex = 0;
            option.textContent = email;
            bindOption(option, function () { pickEmail(email); });
            emailPanel.appendChild(option);
        });

        document.addEventListener("click", function (event) {
            const trigger = event.target.closest(".dealer-share-btn");
            if (trigger) openModal(trigger);
        });

        emailInput.addEventListener("input", function () {
            emailError.textContent = "";
            updateSubmitState();
        });
        emailInput.addEventListener("blur", function () {
            const value = emailInput.value.trim();
            emailError.textContent = value && !EMAIL_RE.test(value) ? "Enter a valid email ID" : "";
        });
        emailInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") submit();
        });
        emailToggle.addEventListener("click", function () {
            setOpen(bucketWrap, false);
            setOpen(emailWrap, !emailWrap.classList.contains("open"));
        });

        bucketBtn.addEventListener("click", function () {
            setOpen(emailWrap, false);
            setOpen(bucketWrap, !bucketWrap.classList.contains("open"));
        });
        bucketItems.forEach(function (item) {
            bindOption(item, function () { pickBucket(item.dataset.value); });
        });

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) {
                closeModal();
                return;
            }
            if (!event.target.closest("#shareBucketDropdown")) setOpen(bucketWrap, false);
            if (!event.target.closest("#shareEmailDropdown")) setOpen(emailWrap, false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key !== "Escape" || !overlay.classList.contains("show")) return;

            if (bucketWrap.classList.contains("open") || emailWrap.classList.contains("open")) {
                setOpen(bucketWrap, false);
                setOpen(emailWrap, false);
            } else {
                closeModal();
            }
        });

        bindClick("shareMailClose", closeModal);
        bindClick("shareMailCancel", closeModal);
        submitBtn.addEventListener("click", submit);
    }

    function initScrollLock() {
        const overlays = Array.from(document.querySelectorAll(
            ".dealer-filters-overlay, #shareMailOverlay, #openTranchesModal"
        ));
        if (!overlays.length) return;

        let locked = false;

        function sync() {
            const shouldLock = overlays.some(function (overlay) {
                return overlay.classList.contains("show");
            });
            if (shouldLock === locked) return;
            locked = shouldLock;

            if (shouldLock) {
                const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
                if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + "px";
            } else {
                document.body.style.paddingRight = "";
            }

            document.documentElement.classList.toggle("nd-scroll-lock", shouldLock);
            document.body.classList.toggle("nd-scroll-lock", shouldLock);
        }

        const observer = new MutationObserver(sync);
        overlays.forEach(function (overlay) {
            observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });
        });

        sync();
    }


    function deleteLeadsRequest(names) {
        /* TODO(backend): call the delete API here; resolve on success, reject on failure */
        return Promise.resolve(names);
    }

    function cellText(cell) {
        return cell ? (cell.dataset.original || cell.textContent).trim() : "";
    }

    function stripInfoIcon(badge) {
        if (!badge) return "";
        const clone = badge.cloneNode(true);
        const icon = clone.querySelector("small");
        if (icon) icon.remove();
        return clone.textContent.trim();
    }

    function getGridRowByName(name) {
        return Array.from(document.querySelectorAll("#newDealerPage .dealer-table-view tbody tr")).find(function (tRow) {
            return getRobustFirmName(tRow.querySelector(".table-firm-name")) === name;
        });
    }

    function getLeadInfoFromList(row) {
        const codeEl = row.querySelector(".dealer-firm small .code-value");
        const codeSmall = row.querySelector(".dealer-firm small");
        const panEl = row.querySelector(".dealer-association small");
        const phoneEl = row.querySelector(".dealer-contact span[data-value]");

        return {
            firm: getDealerName(row),
            code: codeEl
                ? cellText(codeEl)
                : (codeSmall ? codeSmall.textContent.replace(/^\s*Code:\s*/i, "").trim() : ""),
            pan: cellText(panEl).replace(/^\s*PAN:\s*/i, ""),
            mobile: phoneEl ? (phoneEl.dataset.original || phoneEl.dataset.value || "").trim() : "",
            sales: row.children[3].textContent.trim(),
            loan: row.children[4].textContent.trim(),
            status: row.dataset.status || "",
            statusText: stripInfoIcon(row.querySelector(".dealer-status"))
        };
    }

    /* Fallback: lead exists only in the grid view (no list row) */
    function getLeadInfoFromGrid(tRow) {
        const cells = tRow.children;
        const codeEl = tRow.querySelector(".table-firm-code .code-value") || tRow.querySelector(".table-firm-code");
        const statusEl = tRow.querySelector(".table-status");
        const status = ["actioned", "sanctioned", "rejected"].find(function (name) {
            return statusEl && statusEl.classList.contains(name);
        }) || "";

        return {
            firm: getRobustFirmName(tRow.querySelector(".table-firm-name")),
            code: cellText(codeEl).replace(/^\s*Code:\s*/i, ""),
            pan: cellText(cells[7]),
            mobile: cellText(cells[5]),
            sales: cellText(cells[8]),
            loan: "-",
            status: status,
            statusText: stripInfoIcon(statusEl)
        };
    }

    function getLeadInfo(name) {
        const listRow = findDealerRow(name);
        if (listRow) return getLeadInfoFromList(listRow);

        const gridRow = getGridRowByName(name);
        return gridRow ? getLeadInfoFromGrid(gridRow) : null;
    }

    function getLeadNameFromBox(box) {
        const listRow = box.closest(".dealer-row");
        if (listRow) return getDealerName(listRow);

        const tRow = box.closest("tr");
        return tRow ? getRobustFirmName(tRow.querySelector(".table-firm-name")) : "";
    }

    function getVisibleLeadNames() {
        const isGrid = newDealerPage && newDealerPage.classList.contains("table-view");

        if (isGrid) {
            return Array.from(document.querySelectorAll("#newDealerPage .dealer-table-view tbody tr:not(.hidden-by-filter)"))
                .map(function (tRow) { return getRobustFirmName(tRow.querySelector(".table-firm-name")); });
        }

        return dealerRows
            .filter(function (row) { return !row.classList.contains("hidden-by-filter"); })
            .map(getDealerName);
    }

    function getSelectedLeadNames() {
        const visible = new Set(getVisibleLeadNames());
        return Array.from(leadSelection).filter(function (name) { return visible.has(name); });
    }

    function syncLeadSelection() {
        const visible = getVisibleLeadNames();
        const selected = getSelectedLeadNames();
        const picked = new Set(selected);

        document.querySelectorAll("#newDealerPage .lead-select-row").forEach(function (box) {
            box.checked = picked.has(getLeadNameFromBox(box));
        });

        const inView = visible.filter(function (name) { return picked.has(name); }).length;
        document.querySelectorAll("#newDealerPage .lead-select-all").forEach(function (box) {
            box.checked = visible.length > 0 && inView === visible.length;
            box.indeterminate = inView > 0 && inView < visible.length;
        });

        const countEl = document.getElementById("leadBulkCount");
        const deleteBtn = document.getElementById("leadBulkDelete");
        if (countEl) countEl.textContent = selected.length;
        if (deleteBtn) {
            deleteBtn.textContent = "Delete (" + selected.length + ")";
            deleteBtn.disabled = selected.length === 0;
        }
    }

    function setLeadSelectMode(on) {
        if (!newDealerPage) return;
        newDealerPage.classList.toggle("select-mode", on);
        if (on) closeAllDealerDetails();
        else leadSelection.clear();
        syncLeadSelection();
    }

    function removeLead(name) {
        const row = findDealerRow(name);
        if (row) {
            const detailRow = row.nextElementSibling;
            if (detailRow && detailRow.classList.contains("dealer-details-row")) detailRow.remove();

            const index = dealerRows.indexOf(row);
            if (index !== -1) dealerRows.splice(index, 1);
            row.remove();
        }

        const gridRow = getGridRowByName(name);
        if (gridRow) gridRow.remove();

        document.querySelectorAll("#firmDropdown .dealer-filter-dropdown-panel input[type='checkbox']").forEach(function (input) {
            if (input.value !== name) return;
            const label = input.closest("label");
            if (label) label.remove();
        });

        const pinned = getPinnedDealers();
        if (pinned[name]) {
            delete pinned[name];
            savePinnedDealers(pinned);
        }
    }

    function decrementBadge(el, by) {
        if (!el || !by) return;
        const value = parseInt(el.textContent, 10);
        if (!isNaN(value)) el.textContent = Math.max(value - by, 0);
    }

    /* TODO(backend): if counts come from the API, remove this and set them directly */
    function updateLeadCounts(infos) {
        const toBeActionedBtn = document.getElementById("toBeActionedBtn");
        const actioned = infos.filter(function (info) { return info.status === "actioned"; }).length;

        decrementBadge(document.querySelector('#newDealerPage .dealer-filter-btn[data-filter="all"] span'), infos.length);
        if (toBeActionedBtn && toBeActionedBtn.dataset.filter === "actioned") {
            decrementBadge(toBeActionedBtn.querySelector("span"), actioned);
        }
        document.querySelectorAll('#newDealerPage .new-dealer-tab.active .new-dealer-count, [data-goto="newdealer"] .new-dealer-count')
            .forEach(function (el) { decrementBadge(el, infos.length); });
    }

    function initLeadDeletion() {
        const overlay = document.getElementById("deleteLeadOverlay");
        if (!newDealerPage || !overlay) return;

        const titleEl = document.getElementById("deleteLeadTitle");
        const panel = document.getElementById("deleteLeadPanel");
        const confirmBtn = document.getElementById("deleteLeadConfirm");
        const toolbarBtn = document.getElementById("leadBulkDeleteBtn");
        const bulkDeleteBtn = document.getElementById("leadBulkDelete");

        let pendingNames = [];
        let pendingIsBulk = false;

        function makeCheckbox(cls, label) {
            const box = document.createElement("input");
            box.type = "checkbox";
            box.className = "lead-select " + cls;
            box.setAttribute("aria-label", label);
            return box;
        }

        dealerRows.forEach(function (row) {
            const del = row.querySelector(".dealer-row-actions button:nth-child(2)");
            if (del) {
                del.classList.add("dealer-delete-btn");
                del.title = "Delete";
            }

            const firm = row.querySelector(".dealer-firm");
            if (firm) firm.insertBefore(makeCheckbox("lead-select-row", "Select lead"), firm.firstChild);
        });

        document.querySelectorAll("#newDealerPage .dealer-table-view tbody .table-firm").forEach(function (firm) {
            firm.insertBefore(makeCheckbox("lead-select-row", "Select lead"), firm.firstChild);
        });

        document.querySelectorAll(
            "#newDealerPage .dealer-leads-table thead th:first-child .dealer-th-inner, " +
            "#newDealerPage .dealer-table-view thead th:first-child .dealer-th-inner"
        ).forEach(function (inner) {
            inner.insertBefore(makeCheckbox("lead-select-all", "Select all leads"), inner.firstChild);
        });

        function panelRow(label, valueHtml) {
            return '<div class="delete-lead-row"><span>' + label + "</span><strong>" + valueHtml + "</strong></div>";
        }

        function renderSingle(info) {
            const badge = '<span class="dealer-status ' + escapeHtml(info.status) + '">' +
                escapeHtml(info.statusText) + " <small>ⓘ</small></span>";

            return panelRow("Firm", escapeHtml(info.firm)) +
                panelRow("Dealer code", escapeHtml(info.code)) +
                panelRow("PAN", escapeHtml(info.pan)) +
                panelRow("Mobile number", escapeHtml(info.mobile)) +
                panelRow("Sales to dealer (last 12M)", formatAmountMarkup(info.sales)) +
                panelRow("Loan offer", formatAmountMarkup(info.loan)) +
                panelRow("Sanction status", badge);
        }

        function renderBulk(infos) {
            const rows = infos.map(function (info) {
                return "<tr><td>" + escapeHtml(info.firm) + "</td><td>" + escapeHtml(info.code) +
                    "</td><td>" + escapeHtml(info.loan) + "</td></tr>";
            }).join("");

            return '<div class="delete-lead-row"><span>Total leads</span>' +
                '<div class="delete-lead-selected" tabindex="0">' +
                    "<span>" + infos.length + " selected</span><i class=\"delete-lead-trash\"></i>" +
                    '<div class="delete-lead-tip"><div class="delete-lead-tip-box"><table>' +
                    "<thead><tr><th>Firm</th><th>Code</th><th>Loan offer</th></tr></thead>" +
                    "<tbody>" + rows + "</tbody></table></div></div>" +
                "</div></div>";
        }

        function openModal(names, isBulk) {
            const infos = names.map(getLeadInfo).filter(Boolean);
            if (!infos.length) return;

            pendingNames = infos.map(function (info) { return info.firm; });
            pendingIsBulk = isBulk;

            titleEl.textContent = isBulk
                ? "Are you sure you want to delete selected lead(s)?"
                : "Are you sure you want to delete this lead?";
            panel.innerHTML = isBulk ? renderBulk(infos) : renderSingle(infos[0]);

            const modal = overlay.querySelector(".delete-lead-modal");
            modal.classList.toggle("is-bulk", isBulk);
            modal.classList.toggle("is-single", !isBulk);

            overlay.classList.add("show");
        }

        function closeModal() {
            overlay.classList.remove("show");
        }

        async function confirmDelete() {
            if (!pendingNames.length || confirmBtn.disabled) return;

            const names = pendingNames.slice();
            const infos = names.map(getLeadInfo).filter(Boolean);   /* collect BEFORE removing rows */
            confirmBtn.disabled = true;

            try {
                await deleteLeadsRequest(names);

                names.forEach(removeLead);
                updateLeadCounts(infos);
                closeAllDealerDetails();
                closeModal();

                if (pendingIsBulk) {
                    setLeadSelectMode(false);
                } else {
                    names.forEach(function (name) { leadSelection.delete(name); });
                }

                applyCurrentView();
                showAppToast(pendingIsBulk ? "Leads deleted successfully" : "Lead deleted successfully");
            } catch (error) {
                console.error("Delete lead failed:", error);
                showAppToast("Could not delete. Please try again.", "error");
            } finally {
                confirmBtn.disabled = false;
            }
        }

        newDealerPage.addEventListener("click", function (event) {
            const btn = event.target.closest(".dealer-delete-btn, .table-delete-btn");
            if (!btn) return;

            const listRow = btn.closest(".dealer-row");
            const detailRow = btn.closest(".dealer-details-row");
            const gridRow = btn.closest("tr");

            const name = listRow
                ? getDealerName(listRow)
                : detailRow
                    ? detailRow.dataset.dealerDetailsFor
                    : getRobustFirmName(gridRow.querySelector(".table-firm-name"));

            if (name) openModal([name], false);
        });

        newDealerPage.addEventListener("change", function (event) {
            const box = event.target;

            if (box.classList.contains("lead-select-all")) {
                getVisibleLeadNames().forEach(function (name) {
                    if (box.checked) leadSelection.add(name);
                    else leadSelection.delete(name);
                });
            } else if (box.classList.contains("lead-select-row")) {
                const name = getLeadNameFromBox(box);
                if (box.checked) leadSelection.add(name);
                else leadSelection.delete(name);
            } else {
                return;
            }

            syncLeadSelection();
        });

        if (toolbarBtn) {
            toolbarBtn.addEventListener("click", function () {
                setLeadSelectMode(!newDealerPage.classList.contains("select-mode"));
            });
        }

        bindClick("leadBulkCancel", function () {
            setLeadSelectMode(false);
        });

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener("click", function () {
                openModal(getSelectedLeadNames(), true);
            });
        }

        bindClick("deleteLeadClose", closeModal);
        bindClick("deleteLeadCancel", closeModal);
        confirmBtn.addEventListener("click", confirmDelete);

        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeModal();
        });

        /* touch: tap on "N selected" toggles the tooltip */
        panel.addEventListener("click", function (event) {
            const selected = event.target.closest(".delete-lead-selected");
            if (selected && !event.target.closest(".delete-lead-tip")) selected.classList.toggle("open");
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && overlay.classList.contains("show")) closeModal();
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
        return number.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function initRangeField(opts) {
        const from = document.getElementById(opts.fromId);
        const to = document.getElementById(opts.toId);
        const msgEl = document.getElementById(opts.errorId);
        if (!from || !to || !msgEl) {
            return { hasError: function () { return false; }, reset: function () {} };
        }

        let checkOrder = false;

        function isFormatOk(el) {
            const clean = cleanAmount(el.value);
            return clean === "" || AMOUNT_RE.test(clean);
        }

        function isOrderBad() {
            const a = parseAmountInput(from.value);
            const b = parseAmountInput(to.value);
            return a !== null && b !== null && a > b;
        }

        function decorate(el) {
            const wrap = document.createElement("div");
            const view = document.createElement("div");
            wrap.className = "range-amount-wrap";
            view.className = "range-amount-view";
            el.parentNode.insertBefore(wrap, el);
            wrap.append(el, view);

            return function render() {
                const number = parseAmountInput(el.value);
                view.innerHTML = number !== null ? formatAmountMarkup(formatAmount(number)) : "";
                wrap.classList.toggle("has-value", number !== null);
            };
        }

        const renderFrom = decorate(from);
        const renderTo = decorate(to);

        function renderViews() {
            renderFrom();
            renderTo();
        }

        function paint(errFrom, errTo, message) {
            from.closest(".dealer-filter-range-input").classList.toggle("is-error", errFrom);
            to.closest(".dealer-filter-range-input").classList.toggle("is-error", errTo);
            msgEl.textContent = message;
            if (opts.onChange) opts.onChange();
        }

        function validate() {
            const badFrom = !isFormatOk(from);
            const badTo = !isFormatOk(to);

            if (badFrom || badTo) {
                paint(badFrom, badTo, opts.formatMsg);
            } else if (checkOrder && isOrderBad()) {
                paint(true, true, opts.orderMsg);
            } else {
                paint(false, false, "");
            }
        }

        [from, to].forEach(function (el) {
            const wrap = el.closest(".range-amount-wrap");

            el.addEventListener("input", function () {
                checkOrder = false;
                validate();
                renderViews();
            });

            el.addEventListener("focus", function () {
                wrap.classList.add("is-focused");
                el.value = cleanAmount(el.value);
            });

            el.addEventListener("blur", function () {
                wrap.classList.remove("is-focused");
                checkOrder = true;
                const number = parseAmountInput(el.value);
                if (number !== null) el.value = formatAmount(number);
                validate();
                renderViews();
            });
        });

        return {
            hasError: function () {
                return !isFormatOk(from) || !isFormatOk(to) || (checkOrder && isOrderBad());
            },
            reset: function () {
                checkOrder = false;
                paint(false, false, "");
                renderViews();
            }
        };
    }

    function formatDMY(d) {
        return String(d.getDate()).padStart(2, "0") + "/" +
               String(d.getMonth() + 1).padStart(2, "0") + "/" + d.getFullYear();
    }

    function initDateRangePicker(opts) {
        const cal = opts.cal;
        let tmpFrom = null, tmpTo = null, calView = null;

        function shortDate(d) {
            return d.getDate() + " " + CAL_MONTHS[d.getMonth()].slice(0, 3) + " '" + String(d.getFullYear()).slice(-2);
        }

        function renderMonth(offset) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const fromT = tmpFrom ? tmpFrom.getTime() : null;
            const toT = tmpTo ? tmpTo.getTime() : null;
            const hasRange = fromT !== null && toT !== null && toT > fromT;

            const first = new Date(calView.getFullYear(), calView.getMonth() + offset, 1);
            const total = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
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

                cells += '<span class="' + cellCls + '"><button type="button" class="' + dayCls +
                    '" data-ts="' + t + '">' + d + "</button></span>";
            }

            return '<div class="renewal-cal-month"><div class="renewal-cal-title">' +
                CAL_MONTHS[first.getMonth()] + " " + first.getFullYear() +
                '</div><div class="renewal-cal-grid">' + CAL_WEEK + cells + "</div></div>";
        }

        function render() {
            const headText = tmpFrom
                ? shortDate(tmpFrom) + (tmpTo ? " - " + shortDate(tmpTo) : "")
                : "Select date range";

            cal.innerHTML =
                '<div class="renewal-cal-head"><span>' + headText + '</span><i class="renewal-cal-pencil"></i></div>' +
                '<div class="renewal-cal-body">' +
                    '<div class="renewal-cal-nav"><button type="button" data-nav="-1" aria-label="Previous month"></button>' +
                    '<button type="button" data-nav="1" aria-label="Next month"></button></div>' +
                    '<div class="renewal-cal-months">' + renderMonth(0) + renderMonth(1) + "</div>" +
                "</div>" +
                '<div class="renewal-cal-footer"><button type="button" data-cal="clear">Clear</button>' +
                '<div><button type="button" data-cal="cancel">Cancel</button><button type="button" data-cal="ok">OK</button></div></div>';
        }

        function open() {
            const range = opts.getRange();
            tmpFrom = range.from;
            tmpTo = range.to;
            const base = tmpFrom || new Date();
            calView = new Date(base.getFullYear(), base.getMonth(), 1);
            render();
            cal.classList.add("show");
        }

        cal.addEventListener("click", function (event) {
            event.stopPropagation();

            const nav = event.target.closest("[data-nav]");
            if (nav) {
                calView = new Date(calView.getFullYear(), calView.getMonth() + Number(nav.dataset.nav), 1);
                render();
                return;
            }

            const day = event.target.closest(".renewal-cal-day");
            if (day) {
                const picked = new Date(Number(day.dataset.ts));
                if (!tmpFrom || tmpTo) { tmpFrom = picked; tmpTo = null; }
                else if (picked < tmpFrom) { tmpFrom = picked; }
                else { tmpTo = picked; }
                render();
                return;
            }

            const action = event.target.closest("[data-cal]");
            if (!action) return;

            if (action.dataset.cal === "clear") {
                tmpFrom = tmpTo = null;
                render();
            } else if (action.dataset.cal === "cancel") {
                cal.classList.remove("show");
            } else if (action.dataset.cal === "ok") {
                cal.classList.remove("show");
                opts.onOk(tmpFrom, tmpTo || tmpFrom);
            }
        });

        opts.fromBtn.addEventListener("click", open);
        opts.toBtn.addEventListener("click", open);
    }

    //    TRANSACTION DASHBOARD

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
        dateTo: null
    };

    function getTxnDaysMarkup(item) {
        return item.days === "overdue"
            ? '<span class="txn-days overdue">Overdue</span>'
            : '<span class="txn-days pending">' + escapeHtml(item.days) + "</span>";
    }

    function getTxnScfMarkup(item) {
        const isFreeze = item.status === "freeze";
        return `<span class="txn-scf-account">${escapeHtml(item.scfAccount)}</span><br>` +
               `<span class="scf-badge ${escapeHtml(item.status)}">${isFreeze ? "Freeze" : "Unfreeze"}</span>`;
    }

    function getTxnAmountMarkup(amount, pct) {
        return '<div class="txn-amount">' + formatAmountMarkup(amount) +
            '<span class="txn-percent">' + escapeHtml(pct) + "</span></div>";
    }

    function getTxnOpenCountMarkup(item, index) {
        return `<span class="txn-open-count" data-open-tranches="${index}">${item.openTxns} <span class="txn-open-icon"></span></span>`;
    }

    function getTxnRowAttributes(item, index) {
        return `data-txn-index="${index}"` +
            ` data-firm="${escapeHtml(item.firm)}"` +
            ` data-days-left="${item.days === "overdue" ? "" : parseInt(item.days, 10)}"` +
            ` data-status="${item.days === "overdue" ? "overdue" : "upcoming"}"` +
            ` data-sanction-value="${parseCurrency(item.sanction)}"` +
            ` data-overdue-value="${parseCurrency(item.overdueAmount)}"`;
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
                        <button type="button" class="txn-refresh-btn" title="Refresh"></button>
                        <button type="button" class="dealer-expand-btn">⌄</button>
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
                        <button type="button" class="txn-refresh-btn" title="Refresh"></button>
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
        document.querySelectorAll("#txnTableBody .txn-details-row").forEach(function (row) {
            row.classList.remove("is-visible");
        });
        document.querySelectorAll("#txnTableBody .txn-row").forEach(function (row) {
            row.classList.remove("is-expanded");
        });
    }

    function txnRowMatches(row) {
        const s = txnState;

        if (s.tab !== "all" && row.dataset.status !== s.tab) return false;
        if (s.search && !row.textContent.toLowerCase().includes(s.search)) return false;
        if (s.firms.length && !s.firms.includes(row.dataset.firm)) return false;

        if (s.tab === "upcoming" && s.daysDue !== "all") {
            const left = Number(row.dataset.daysLeft);

            if (s.daysDue === "custom") {
                const now = new Date();
                const due = new Date(now.getFullYear(), now.getMonth(), now.getDate() + left);
                if (s.dateFrom && due < s.dateFrom) return false;
                if (s.dateTo && due > s.dateTo) return false;
            } else if (left > TXN_DAYS_LIMIT[s.daysDue]) {
                return false;
            }
        }

        const sanctionValue = parseFloat(row.dataset.sanctionValue) || 0;
        if (s.sanctionFrom !== null && sanctionValue < s.sanctionFrom) return false;
        if (s.sanctionTo !== null && sanctionValue > s.sanctionTo) return false;

        if (s.tab === "overdue") {
            const overdueValue = parseFloat(row.dataset.overdueValue) || 0;
            if (s.overdueFrom !== null && overdueValue < s.overdueFrom) return false;
            if (s.overdueTo !== null && overdueValue > s.overdueTo) return false;
        }

        return true;
    }

    function applyTxnFilters() {
        closeAllTxnDetails();

        document.querySelectorAll(".txn-row, .txn-table-view tbody tr").forEach(function (row) {
            row.classList.toggle("hidden-by-filter", !txnRowMatches(row));
        });
    }

    function bindTxnRowExpansion(listBody) {
        listBody.querySelectorAll(".dealer-expand-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                const row = btn.closest(".txn-row");
                const detailRow = listBody.querySelector(
                    '.txn-details-row[data-txn-details-for="' + row.dataset.txnIndex + '"]'
                );
                const wasVisible = detailRow.classList.contains("is-visible");

                closeAllTxnDetails();

                if (!wasVisible) {
                    detailRow.classList.add("is-visible");
                    row.classList.add("is-expanded");
                }
            });
        });
    }

    function bindTxnRefreshButtons() {
        document.querySelectorAll(".txn-refresh-btn").forEach(function (btn) {
            btn.addEventListener("click", function (event) {
                event.stopPropagation();
                btn.classList.add("spinning");
                setTimeout(function () { btn.classList.remove("spinning"); }, 450);
            });
        });
    }

    function initInfoTooltips() {
        const tip = document.createElement("div");
        tip.className = "app-tooltip";
        tip.setAttribute("role", "tooltip");
        document.body.appendChild(tip);

        const canHover = window.matchMedia("(hover: hover)");
        const mobileMq = window.matchMedia("(max-width: 767.98px)");
        let source = null;

        function hide() {
            tip.classList.remove("show");
            source = null;
        }

        function show(el, text, rect) {
            source = el;
            tip.textContent = text;
            tip.classList.remove("below");
            tip.classList.add("show");

            const r = rect || el.getBoundingClientRect();
            const w = tip.offsetWidth;
            const h = tip.offsetHeight;
            const centerX = r.left + r.width / 2;
            const left = Math.max(8, Math.min(centerX - w / 2, window.innerWidth - w - 8));
            const below = r.top - h - 12 < 8;

            tip.style.left = left + "px";
            tip.style.top = (below ? r.bottom + 12 : r.top - h - 12) + "px";
            tip.style.setProperty("--arrow-x", Math.max(14, Math.min(centerX - left, w - 14)) + "px");
            tip.classList.toggle("below", below);
        }

        document.addEventListener("mouseover", function (event) {
            if (!canHover.matches) return;
            const dot = event.target.closest(".info-dot[data-tooltip]");
            if (dot) show(dot, dot.dataset.tooltip);
        });

        document.addEventListener("mouseout", function (event) {
            if (event.target.closest(".info-dot[data-tooltip]")) hide();
        });

        document.addEventListener("click", function (event) {
            const dot = canHover.matches ? null : event.target.closest(".info-dot[data-tooltip]");
            const cell = mobileMq.matches ? event.target.closest(".txn-cell--days") : null;
            const el = dot || cell;

            if (!el) { hide(); return; }
            if (source === el) { hide(); return; }

            if (cell) {
                const r = cell.getBoundingClientRect();
                show(cell, "Excluding cure days", { left: r.right - 13, width: 13, top: r.top, bottom: r.top + 16 });
            } else {
                show(dot, dot.dataset.tooltip);
            }
        });

        window.addEventListener("scroll", hide, true);
        window.addEventListener("resize", hide);
    }

    function bindOpenTranchesModal() {
        const modal = document.getElementById("openTranchesModal");
        const countEl = document.getElementById("tranchesCount");
        const bodyEl = document.getElementById("tranchesTableBody");
        if (!modal || !countEl || !bodyEl) return;

        function closeModal() {
            modal.classList.remove("show");
        }

        document.querySelectorAll("[data-open-tranches]").forEach(function (el) {
            el.addEventListener("click", function () {
                const item = transactionData[el.dataset.openTranches];

                countEl.textContent = item.openTxns;
                bodyEl.innerHTML = item.tranches.map(function (t) {
                    return `
                        <tr>
                            <td data-label="ID">${escapeHtml(t.id)}</td>
                            <td data-label="Transaction date">${escapeHtml(t.date)}</td>
                            <td data-label="Transaction type">${escapeHtml(t.type)}</td>
                            <td data-label="Amount">${formatAmountMarkup(t.amount)}</td>
                            <td data-label="Due date">${escapeHtml(t.due)}</td>
                        </tr>
                    `;
                }).join("") || '<tr><td colspan="5" style="text-align:center;color:#999;">No open tranches</td></tr>';

                modal.classList.add("show");
            });
        });

        ["openTranchesClose", "openTranchesCloseBtn"].forEach(function (id) {
            bindClick(id, closeModal);
        });
    }

    function setTxnFilterTab(tab) {
        const tabsWrap = document.getElementById("txnFilterTabs");

        if (tabsWrap) {
            tabsWrap.querySelectorAll(".dealer-filter-pill").forEach(function (pill) {
                pill.classList.toggle("active", pill.dataset.tab === tab);
            });
        }

        document.querySelectorAll(".txn-filter-extra").forEach(function (el) {
            el.style.display = el.dataset.extraFor === tab ? "" : "none";
        });
    }

    function initTxnToolbar(txnPage) {
        const tabButtons = Array.from(document.querySelectorAll(".txn-filter-btn"));
        const txnSearchInput = document.getElementById("txnSearchInput");
        const txnHideBtn = document.getElementById("txnHideDetailsBtn");

        tabButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                txnState.tab = btn.dataset.txnFilter;
                setActive(tabButtons, btn);
                setTxnFilterTab(txnState.tab);
                applyTxnFilters();
            });
        });

        if (txnSearchInput) {
            txnSearchInput.addEventListener("input", function () {
                txnState.search = txnSearchInput.value.trim().toLowerCase();
                applyTxnFilters();
            });
        }

        function setTxnView(view) {
            if (txnPage) txnPage.classList.toggle("txn-grid-active", view === "grid");
        }

        if (txnPage) {
            const viewButtons = Array.from(txnPage.querySelectorAll(".view-switch-btn"));
            viewButtons.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    setActive(viewButtons, btn);
                    setTxnView(btn.dataset.view || "list");
                });
            });
        }
        setTxnView("list");

        if (txnHideBtn) {
            txnHideBtn.addEventListener("click", function () {
                setDetailsHidden(!detailsHidden);
            });
        }

        initDropdownMenu(
            document.getElementById("txnAddDealerBtn"),
            document.getElementById("txnAddDealerMenu")
        );
    }

    function initTxnFiltersModal() {
        const openBtn = document.getElementById("txnFiltersBtn");
        const overlay = document.getElementById("txnFiltersOverlay");
        const closeBtn = document.getElementById("txnFiltersClose");
        const resetBtn = document.getElementById("txnFiltersReset");
        const applyBtn = document.getElementById("txnFiltersApply");
        const tabsWrap = document.getElementById("txnFilterTabs");
        const daysPills = Array.from(document.querySelectorAll("#txnDaysDuePills .dealer-filter-pill"));
        const toolbarTabs = Array.from(document.querySelectorAll(".txn-filter-btn"));
        const customField = document.getElementById("txnCustomField");
        const fromBtn = document.getElementById("txnDateFrom");
        const toBtn = document.getElementById("txnDateTo");
        const cal = document.getElementById("txnCalendar");

        let daysDue = "all", dateFrom = null, dateTo = null;

        function readNumber(id) {
            return parseAmountInput((document.getElementById(id) || {}).value);
        }

        function getActiveTab() {
            const pill = tabsWrap ? tabsWrap.querySelector(".active") : null;
            return (pill && pill.dataset.tab) || "all";
        }

        function closeOverlay() {
            if (cal) cal.classList.remove("show");
            if (overlay) overlay.classList.remove("show");
        }

        function syncTxnApply() {
            if (!applyBtn) return;
            const tab = getActiveTab();
            const incomplete = tab === "upcoming" && daysDue === "custom" && (!dateFrom || !dateTo);
            applyBtn.disabled = incomplete ||
                sanctionField.hasError() ||
                (tab === "overdue" && overdueField.hasError());
        }

        function updateDays() {
            daysPills.forEach(function (pill) {
                pill.classList.toggle("active", pill.dataset.value === daysDue);
            });
            customField.hidden = !(getActiveTab() === "upcoming" && daysDue === "custom");
            fromBtn.firstElementChild.textContent = dateFrom ? formatDMY(dateFrom) : "Select date";
            toBtn.firstElementChild.textContent = dateTo ? formatDMY(dateTo) : "Select date";
            cal.classList.remove("show");
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
            formatMsg: "Entered sanction limit is in wrong format, please enter a valid limit.",
            orderMsg: "Entered starting limit cannot be greater than ending limit, please enter a valid limit.",
            onChange: syncTxnApply
        });

        const overdueField = initRangeField({
            fromId: "txnOverdueFrom",
            toId: "txnOverdueTo",
            errorId: "txnOverdueError",
            formatMsg: "Entered overdue amount is in wrong format, please enter a valid amount.",
            orderMsg: "Entered starting amount cannot be greater than ending amount, please enter a valid amount.",
            onChange: syncTxnApply
        });

        initDateRangePicker({
            cal: cal,
            fromBtn: fromBtn,
            toBtn: toBtn,
            getRange: function () { return { from: dateFrom, to: dateTo }; },
            onOk: function (from, to) {
                dateFrom = from;
                dateTo = to;
                updateDays();
            }
        });

        renderFirmOptions(
            document.querySelector("#txnFirmDropdown .dealer-filter-dropdown-panel"),
            transactionData.map(function (item) {
                return { name: item.firm, meta: "Code: " + item.code };
            })
        );

        if (openBtn && overlay) {
            openBtn.addEventListener("click", function () {
                setTxnFilterTab(txnState.tab);
                daysDue = txnState.daysDue;
                dateFrom = txnState.dateFrom;
                dateTo = txnState.dateTo;
                updateDays();
                overlay.classList.add("show");
            });
        }

        if (closeBtn) closeBtn.addEventListener("click", closeOverlay);

        if (overlay) {
            overlay.addEventListener("click", function (event) {
                if (event.target === overlay) closeOverlay();
            });
        }

        if (tabsWrap) {
            tabsWrap.querySelectorAll(".dealer-filter-pill").forEach(function (pill) {
                pill.addEventListener("click", function () { pickTab(pill.dataset.tab); });
            });
        }

        daysPills.forEach(function (pill) {
            pill.addEventListener("click", function () {
                daysDue = pill.dataset.value;
                if (daysDue !== "custom") dateFrom = dateTo = null;
                updateDays();
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                ["txnSanctionFrom", "txnSanctionTo", "txnOverdueFrom", "txnOverdueTo"].forEach(function (id) {
                    const input = document.getElementById(id);
                    if (input) input.value = "";
                });

                sanctionField.reset();
                overdueField.reset();
                overlay.querySelectorAll(".dealer-filter-dropdown").forEach(resetFilterDropdown);
                pickTab("all");
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener("click", function () {
                txnState.tab = getActiveTab();
                txnState.firms = getCheckedValues("#txnFirmDropdown");
                txnState.sanctionFrom = readNumber("txnSanctionFrom");
                txnState.sanctionTo = readNumber("txnSanctionTo");
                txnState.overdueFrom = readNumber("txnOverdueFrom");
                txnState.overdueTo = readNumber("txnOverdueTo");
                txnState.daysDue = daysDue;
                txnState.dateFrom = dateFrom;
                txnState.dateTo = dateTo;

                toolbarTabs.forEach(function (btn) {
                    btn.classList.toggle("active", btn.dataset.txnFilter === txnState.tab);
                });

                applyTxnFilters();
                closeOverlay();
                showAppToast("Filters applied successfully");
            });
        }
    }

    function initTransactionDashboard() {
        const listBody = document.getElementById("txnTableBody");
        const gridBody = document.getElementById("txnTableViewBody");
        const txnPage = document.getElementById("transactionDashboardPage");
        if (!listBody || !gridBody) return;

        listBody.innerHTML = transactionData.map(renderTxnRow).join("");
        gridBody.innerHTML = transactionData.map(renderTxnGridRow).join("");

        bindTxnRowExpansion(listBody);
        bindTxnRefreshButtons();
        bindOpenTranchesModal();
        initTxnToolbar(txnPage);
        initTxnFiltersModal();
    }

    
    // RENEWAL DETAILS

    const renewalActions = {
        enhance: "Enhance limit",
        update:  "Update expiry",
        renew:   "Renew limit"
    };

    const renewalCommon = {
        id: "CLB-000203606-PRO",
        phone: "+91 9836273854",
        uploadedBy: "ICICI Bank"
    };

    /* TODO(backend): replace with API data */
    const renewalData = [
        { firm: "Zenith Steel Traders",        email: "harish@zenith.com",         years: "3 years", pan: "CFSG34527F", sales: "₹3,15,00,000.00", sanction: "₹70,00,000.00", state: "due",     days: 12, action: "enhance", vintage: "12 years" },
        { firm: "SunDesh Systems Pvt. Ltd",    email: "keshav@sundesh.com",        years: "3 years", pan: "CFSG34527F", sales: "₹4,00,00,000.00", sanction: "₹65,00,000.00", state: "expired", days: 20, action: "update",  vintage: "14 years" },
        { firm: "Chauhan Traders",             email: "shivam@chauhan.com",        years: "3 years", pan: "CFSG34527F", sales: "₹3,00,00,000.00", sanction: "₹80,00,000.00", state: "due",     days: 8,  action: "renew",   vintage: "15 years" },
        { firm: "Polychem Global",             email: "aryan@polychem.com",        years: "5 years", pan: "CFSG34527F", sales: "₹2,95,00,000.00", sanction: "₹90,00,000.00", state: "expired", days: 20, action: "update",  vintage: "16 years" },
        { firm: "Vertex Industrial Solutions", email: "kartik@polychem.com",       years: "2 years", pan: "CFSG34527F", sales: "₹3,15,00,000.00", sanction: "₹95,00,000.00", state: "due",     days: 4,  action: "renew",   vintage: "10 years" },
        { firm: "Kartikey Corporations",       email: "keshav@kartikey.com",       years: "6 years", pan: "CFSG34527F", sales: "₹3,15,00,000.00", sanction: "₹70,00,000.00", state: "due",     days: 24, action: "enhance", vintage: "13 years" },
        { firm: "TradersTech",                 email: "arjun@traderstech.com",     years: "7 years", pan: "YAHS8D9573", sales: "₹3,00,00,000.00", sanction: "₹86,00,000.00", state: "due",     days: 8,  action: "renew",   vintage: "9 years" },
        { firm: "Global Traders",              email: "harshal@globaltraders.com", years: "9 years", pan: "MEJA8D9573", sales: "₹3,15,00,000.00", sanction: "₹86,00,000.00", state: "expired", days: 10, action: "update",  vintage: "11 years" }
    ].map(function (item) {
        const today = new Date();
        const offset = item.state === "expired" ? -item.days : item.days;
        return Object.assign({}, renewalCommon, item, {
            recommendation: item.sanction,
            expiryDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset)
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
        dateTo: null
    };

    function getRenewalStatusMarkup(item, cls) {
        const info = cls === "dealer-status" ? "ⓘ" : "i";

        if (item.state === "expired") {
            return '<div class="renewal-status">' +
                '<span class="' + cls + ' rejected">Expired <small data-tooltip="This lead is expired.">' + info + "</small></span>" +
                '<span class="renewal-status-sub">' + item.days + " days ago</span></div>";
        }

        return '<div class="renewal-status"><span class="' + cls + ' actioned">Expiry in ' + item.days + " days</span></div>";
    }

    function getRenewalActionMarkup(item) {
        return '<button type="button" class="renewal-action-link ' + item.action + '">' +
            renewalActions[item.action] + "</button>";
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
                        <button type="button" class="renewal-expand-btn" aria-label="Toggle details">⌄</button>
                    </div>
                </td>
                <td class="renewal-cell renewal-cell--extra renewal-cell--vintage renewal-mobile-only" data-label="Business vintage">${escapeHtml(item.vintage)}</td>
                <td class="renewal-cell renewal-cell--extra renewal-cell--uploaded renewal-mobile-only" data-label="Uploaded by">${escapeHtml(item.uploadedBy)}<i class="dealer-upload-user-icon"></i></td>
                <td class="renewal-cell renewal-cell--extra renewal-cell--recommend renewal-mobile-only" data-label="Recommendation limit">${formatAmountMarkup(item.recommendation)}</td>
            </tr>
            <tr class="renewal-details-row">
                <td><div class="renewal-detail-item"><span>Business vintage</span><strong>${escapeHtml(item.vintage)}</strong></div></td>
                <td><div class="renewal-detail-item"><span>Uploaded by</span><strong>${escapeHtml(item.uploadedBy)}<i class="dealer-upload-user-icon"></i></strong></div></td>
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
        document.querySelectorAll(".renewal-row.is-expanded").forEach(function (row) {
            row.classList.remove("is-expanded");
        });
        document.querySelectorAll(".renewal-details-row.is-visible").forEach(function (row) {
            row.classList.remove("is-visible");
        });
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

        document.querySelectorAll(".renewal-row, .renewal-table-view tbody tr").forEach(function (row) {
            const item = renewalData[row.dataset.renewalIndex];
            const matchFilter = item ? renewalItemMatches(item) : true;
            const matchSearch = !renewalState.search || row.textContent.toLowerCase().includes(renewalState.search);
            row.classList.toggle("hidden-by-filter", !(matchFilter && matchSearch));
        });
    }

    function initRenewalFiltersModal() {
        const overlay = document.getElementById("renewalFiltersOverlay");
        const openBtn = document.getElementById("renewalFiltersBtn");
        if (!overlay || !openBtn) return;

        const page = document.getElementById("renewalDetailsPage");
        const applyBtn = document.getElementById("renewalFiltersApply");
        const resetBtn = document.getElementById("renewalFiltersReset");
        const tabPills = Array.from(document.querySelectorAll("#renewalFilterTabs .dealer-filter-pill"));
        const daysField = document.getElementById("renewalDaysField");
        const daysLabel = document.getElementById("renewalDaysLabel");
        const daysPills = Array.from(document.querySelectorAll("#renewalDaysPills .dealer-filter-pill"));
        const customField = document.getElementById("renewalCustomField");
        const fromBtn = document.getElementById("renewalDateFrom");
        const toBtn = document.getElementById("renewalDateTo");
        const cal = document.getElementById("renewalCalendar");
        const firmPanel = document.querySelector("#renewalFirmDropdown .dealer-filter-dropdown-panel");

        let tab = "all", range = "all", dateFrom = null, dateTo = null;
        let snapshot = null;

        function num(id) { return parseAmountInput(document.getElementById(id).value); }

        renderFirmOptions(firmPanel, renewalData.map(function (item) {
            return { name: item.firm, meta: "ID: " + item.id + "\nPAN: " + item.pan };
        }));
        initFirmSearch(document.getElementById("renewalFirmSearchInput"), firmPanel);

        function readFilters() {
            return {
                filter: tab,
                range: range,
                dateFrom: dateFrom ? dateFrom.getTime() : null,
                dateTo: dateTo ? dateTo.getTime() : null,
                firms: getCheckedValues("#renewalFirmDropdown"),
                uploadedBy: getCheckedValues("#renewalUploadedByDropdown"),
                sanctionFrom: num("renewalSanctionFrom"),
                sanctionTo: num("renewalSanctionTo")
            };
        }

        function syncApply() {
            const incomplete = range === "custom" && (!dateFrom || !dateTo);
            const unchanged = snapshot !== null && JSON.stringify(readFilters()) === snapshot;
            const invalid = sanctionField.hasError();
            applyBtn.disabled = incomplete || unchanged || invalid;
        }

        const sanctionField = initRangeField({
            fromId: "renewalSanctionFrom",
            toId: "renewalSanctionTo",
            errorId: "renewalSanctionError",
            formatMsg: "Entered sanction limit is in wrong format, please enter a valid limit.",
            orderMsg: "Entered starting limit cannot be greater than ending limit, please enter a valid limit.",
            onChange: syncApply
        });

        function updateExtra() {
            tabPills.forEach(function (p) { p.classList.toggle("active", p.dataset.tab === tab); });
            daysField.style.display = tab === "all" ? "none" : "";
            daysLabel.textContent = tab === "expired" ? "Expired since" : "Days to expire";
            daysPills.forEach(function (p) { p.classList.toggle("active", p.dataset.value === range); });
            customField.style.display = range === "custom" ? "" : "none";
            fromBtn.firstElementChild.textContent = dateFrom ? formatDMY(dateFrom) : "Select date";
            toBtn.firstElementChild.textContent = dateTo ? formatDMY(dateTo) : "Select date";
            cal.classList.remove("show");
        }

        function setTab(next) {
            tab = next;
            range = "all";
            dateFrom = dateTo = null;
            updateExtra();
        }

        initDateRangePicker({
            cal: cal,
            fromBtn: fromBtn,
            toBtn: toBtn,
            getRange: function () { return { from: dateFrom, to: dateTo }; },
            onOk: function (from, to) {
                dateFrom = from;
                dateTo = to;
                updateExtra();
                syncApply();
            }
        });

        function closeOverlay() {
            cal.classList.remove("show");
            overlay.classList.remove("show");
        }

        openBtn.addEventListener("click", function () {
            tab = renewalState.filter;
            range = renewalState.range;
            dateFrom = renewalState.dateFrom;
            dateTo = renewalState.dateTo;
            updateExtra();
            if (snapshot === null) snapshot = JSON.stringify(readFilters());
            overlay.classList.add("show");
            syncApply();
        });

        bindClick("renewalFiltersClose", closeOverlay);
        overlay.addEventListener("click", function (event) {
            if (event.target === overlay) closeOverlay();
        });

        tabPills.forEach(function (pill) {
            pill.addEventListener("click", function () { setTab(pill.dataset.tab); });
        });

        daysPills.forEach(function (pill) {
            pill.addEventListener("click", function () {
                range = pill.dataset.value;
                if (range !== "custom") dateFrom = dateTo = null;
                updateExtra();
            });
        });

        ["change", "input", "click"].forEach(function (name) {
            overlay.addEventListener(name, syncApply);
        });

        resetBtn.addEventListener("click", function () {
            setTab("all");
            ["renewalSanctionFrom", "renewalSanctionTo"].forEach(function (id) {
                document.getElementById(id).value = "";
            });
            sanctionField.reset();
            overlay.querySelectorAll(".dealer-filter-dropdown").forEach(resetFilterDropdown);
            syncApply();
        });

        applyBtn.addEventListener("click", function () {
            const f = readFilters();

            renewalState.filter = f.filter;
            renewalState.range = f.range;
            renewalState.dateFrom = dateFrom;
            renewalState.dateTo = dateTo;
            renewalState.firms = f.firms;
            renewalState.uploadedBy = f.uploadedBy;
            renewalState.sanctionFrom = f.sanctionFrom;
            renewalState.sanctionTo = f.sanctionTo;

            page.querySelectorAll(".renewal-filter-btn").forEach(function (btn) {
                btn.classList.toggle("active", btn.dataset.renewalFilter === f.filter);
            });

            snapshot = JSON.stringify(f);
            applyRenewalFilters();
            closeOverlay();
            showAppToast("Filters applied successfully");
        });
    }

    function initRenewalDashboard() {
        const page = document.getElementById("renewalDetailsPage");
        const listBody = document.getElementById("renewalTableBody");
        const gridBody = document.getElementById("renewalTableViewBody");
        if (!page || !listBody || !gridBody) return;

        listBody.innerHTML = renewalData.map(renderRenewalRow).join("");
        gridBody.innerHTML = renewalData.map(renderRenewalGridRow).join("");

        const filterButtons = Array.from(page.querySelectorAll(".renewal-filter-btn"));
        const viewButtons = Array.from(page.querySelectorAll(".view-switch-btn"));
        const searchBox = document.getElementById("renewalSearchInput");
        const hideBtn = document.getElementById("renewalHideDetailsBtn");

        filterButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                renewalState.filter = btn.dataset.renewalFilter;
                setActive(filterButtons, btn);
                applyRenewalFilters();
            });
        });

        if (searchBox) {
            searchBox.addEventListener("input", function () {
                renewalState.search = searchBox.value.trim().toLowerCase();
                applyRenewalFilters();
            });
        }

        viewButtons.forEach(function (btn) {
            btn.addEventListener("click", function () {
                setActive(viewButtons, btn);
                page.classList.toggle("renewal-grid-active", btn.dataset.view === "grid");
            });
        });

        if (hideBtn) {
            hideBtn.addEventListener("click", function () {
                setDetailsHidden(!detailsHidden);
            });
        }

        initDropdownMenu(
            document.getElementById("renewalAddDealerBtn"),
            document.getElementById("renewalAddDealerMenu")
        );

        /* expand / collapse (list view) */
        listBody.addEventListener("click", function (event) {
            const btn = event.target.closest(".renewal-expand-btn");
            if (!btn) return;

            const row = btn.closest(".renewal-row");
            const detailRow = row.nextElementSibling;
            const wasOpen = row.classList.contains("is-expanded");

            closeAllRenewalDetails();

            if (!wasOpen) {
                row.classList.add("is-expanded");
                if (detailRow) detailRow.classList.add("is-visible");
            }
        });

        page.addEventListener("click", function (event) {
            const link = event.target.closest(".renewal-action-link");
            if (!link) return;

            if (link.classList.contains("update")) {
                showAppToast(
                    "This lead is expired",
                    "warning",
                    "This lead is expired. Please contact ICICI Bank SM/RM for enhancement."
                );
            }
            /* TODO: "Enhance limit" and "Renew limit" flows */
        });

        initRenewalFiltersModal();
    }

    function centerActiveTab(page) {
        const activeTab = page.querySelector(".new-dealer-tab.active");
        const tabList = activeTab && activeTab.closest(".new-dealer-tab-list");
        if (!tabList) return;
        tabList.scrollLeft = activeTab.offsetLeft - (tabList.clientWidth - activeTab.offsetWidth) / 2;
    }

    function syncMenuActive(which) {
        menuItems.forEach(function (item) {
            const title = item.querySelector(".menu-title");
            const route = title ? MENU_ROUTES[title.textContent.trim().toLowerCase()] : "";
            item.classList.toggle("active", route === which);
        });
    }

    function showPage(which) {
        const pages = {
            newdealer: document.getElementById("newDealerPage"),
            transaction: document.getElementById("transactionDashboardPage"),
            renewal: document.getElementById("renewalDetailsPage"),
            dashboard: document.querySelector(".Dashboard-page-section")
        };

        Object.keys(pages).forEach(function (key) {
            if (pages[key]) pages[key].style.display = "none";
        });

        const target = pages[which];
        if (!target) return;

        target.style.display = which === "dashboard" ? "" : "block";
        centerActiveTab(target);
        syncMenuActive(which);
    }

    function initNavigation() {
        menuItems.forEach(function (item) {
            const title = item.querySelector(".menu-title");
            const route = title ? MENU_ROUTES[title.textContent.trim().toLowerCase()] : "";
            if (!route) return;

            item.addEventListener("click", function () {
                showPage(route);   /* also syncs the active menu item */
            });
        });

        document.querySelectorAll("[data-goto]").forEach(function (tab) {
            tab.addEventListener("click", function () {
                showPage(tab.dataset.goto);
            });
        });
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

    initDropdownMenu(
        document.getElementById("newDealerAddBtn"),
        document.getElementById("newDealerAddMenu")
    );
    initDealerFilterButtons();
    initDealerSearch();
    initRowExpansion();
    initDetailsToggle();
    initDealerViewSwitch();
    initLeadDeletion();
    applyCurrentView();

    initTransactionDashboard();
    initRenewalDashboard();
    wrapCodeValues();
    initInfoTooltips();


    initPinning();
    initNavigation();
    applySavedPins();
    applyAllMasking(detailsHidden);

});
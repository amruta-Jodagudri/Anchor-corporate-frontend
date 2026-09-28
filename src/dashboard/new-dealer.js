"use strict";

document.addEventListener("DOMContentLoaded", function () {

    function escapeHtml(value) {
        const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return String(value).replace(/[&<>"']/g, function (ch) { return map[ch]; });
    }

    function parseCurrency(str) {
        return parseFloat(String(str).replace(/[₹,]/g, "")) || 0;
    }

    function setActive(items, activeItem) {
        items.forEach(function (item) {
            item.classList.toggle("active", item === activeItem);
        });
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

    function showAppToast(message, type) {
        const toast = document.getElementById("appToast");
        const text = document.getElementById("appToastText");
        const icon = document.getElementById("appToastIcon");
        if (!toast) return;

        const isError = type === "error";
        toast.classList.toggle("error", isError);
        if (icon) icon.textContent = isError ? "!" : "✓";
        if (text) text.textContent = message;

        toast.classList.add("show");
        clearTimeout(toast._hideTimer);
        toast._hideTimer = setTimeout(function () {
            toast.classList.remove("show");
        }, 2500);
    }


    const PIN_STORAGE_KEY = "dealerPinnedState";

    const PIN_SORT_TARGETS = [
        { body: "#dealerTableBody",                        row: ".dealer-row" },
        { body: "#newDealerPage .dealer-table-view tbody", row: "tr" },
        { body: "#txnTableBody",                           row: ".txn-row" },
        { body: "#txnTableViewBody",                       row: "tr" }
    ];

    const SHARE_SAVED_EMAILS = ["harish.sharma@gmail.com"];   /* backend: user's saved emails */

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

    function maskCode(value) {
        const v = value.trim();
        const m = v.match(/^(Code:\s*)(.+)$/i);
        if (!m) return v;
        const code = m[2].trim();
        return m[1] + "x".repeat(Math.max(code.length - 3, 3)) + code.slice(-3);
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

        document.querySelectorAll("#newDealerPage .dealer-firm small").forEach(function (el) {
            toggleTextMask(el, isHidden, maskCode);
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
            const codeEl = row.querySelector(".table-firm-code");
            if (codeEl) toggleTextMask(codeEl, isHidden, maskCode);

            gridColumns.forEach(function (column) {
                const cell = row.children[column.index];
                if (cell) toggleTextMask(cell, isHidden, column.maskFn);
            });
        });
    }

    function applyTxnMasking(isHidden) {
        document.querySelectorAll(".txn-row .dealer-firm small, .txn-table-view .table-firm-code").forEach(function (el) {
            toggleTextMask(el, isHidden, maskCode);
        });

        document.querySelectorAll(".txn-scf-account").forEach(function (el) {
            toggleTextMask(el, isHidden, maskAccountNumber);
        });
    }

    function applyAllMasking(isHidden) {
        applyDealerMasking(isHidden);
        applyTxnMasking(isHidden);
        updateHideButtonUI(document.getElementById("hideDetailsBtn"), isHidden);
        updateHideButtonUI(document.getElementById("txnHideDetailsBtn"), isHidden);
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
                const label = match ? match[1].trim() : fullText;
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
                next.classList.contains("txn-details-row")
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

        document.getElementById("shareMailClose").addEventListener("click", closeModal);
        document.getElementById("shareMailCancel").addEventListener("click", closeModal);
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


    /* =========================================================
       14. TRANSACTION DASHBOARD
       ========================================================= */
    const txnState = {
        tab: "all",
        search: "",
        sanctionFrom: null,
        sanctionTo: null,
        overdueFrom: null,
        overdueTo: null
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
        return escapeHtml(amount) + "<br><small>" + escapeHtml(pct) + "</small>";
    }

    function getTxnOpenCountMarkup(item, index) {
        return `<span class="txn-open-count" data-open-tranches="${index}">${item.openTxns} <span class="txn-open-icon"></span></span>`;
    }

    function getTxnRowAttributes(item, index) {
        return `data-txn-index="${index}"` +
               ` data-status="${item.days === "overdue" ? "overdue" : "upcoming"}"` +
               ` data-sanction-value="${parseCurrency(item.sanction)}"` +
               ` data-overdue-value="${parseCurrency(item.overdueAmount)}"`;
    }

    function renderTxnRow(item, index) {
        return `
            <tr class="dealer-row txn-row" ${getTxnRowAttributes(item, index)}>
                <td>
                    <div class="dealer-firm">
                        <span class="material-symbols-outlined dealer-pin" role="button" tabindex="0">push_pin</span>
                        <div>
                            <strong>${escapeHtml(item.firm)}</strong>
                            <small>Code: ${escapeHtml(item.code)}</small>
                        </div>
                    </div>
                </td>
                <td>${getTxnScfMarkup(item)}</td>
                <td>${escapeHtml(item.sanction)}</td>
                <td>${getTxnAmountMarkup(item.utilized, item.utilizedPct)}</td>
                <td>${getTxnAmountMarkup(item.available, item.availablePct)}</td>
                <td>${getTxnOpenCountMarkup(item, index)}</td>
                <td>${escapeHtml(item.overdueAmount)}</td>
                <td>${getTxnDaysMarkup(item)}</td>
                <td>
                    <div class="dealer-row-actions">
                        <button type="button" class="txn-refresh-btn" title="Refresh"></button>
                        <button type="button" class="dealer-expand-btn">⌄</button>
                    </div>
                </td>
            </tr>
            <tr class="txn-details-row" data-txn-details-for="${index}">
                <td colspan="9">
                    <div class="txn-detail-inline">
                        <div><span>Case type</span><strong>${escapeHtml(item.caseType || "-")}</strong></div>
                        <div><span>A/c expiry date</span><strong>${escapeHtml(item.acExpiry || "-")}</strong></div>
                    </div>
                </td>
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
                <td>${getTxnDaysMarkup(item)}</td>
                <td>${getTxnScfMarkup(item)}</td>
                <td>${escapeHtml(item.sanction)}</td>
                <td>${getTxnAmountMarkup(item.utilized, item.utilizedPct)}</td>
                <td>${getTxnAmountMarkup(item.available, item.availablePct)}</td>
                <td>${getTxnOpenCountMarkup(item, index)}</td>
                <td>${escapeHtml(item.overdueAmount)}</td>
                <td>${escapeHtml(item.caseType || "-")}</td>
                <td>
                    <div class="table-action">
                        <button type="button" class="txn-refresh-btn" title="Refresh"></button>
                    </div>
                </td>
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
                            <td>${escapeHtml(t.id)}</td>
                            <td>${escapeHtml(t.date)}</td>
                            <td>${escapeHtml(t.type)}</td>
                            <td>${escapeHtml(t.amount)}</td>
                            <td>${escapeHtml(t.due)}</td>
                        </tr>
                    `;
                }).join("") || '<tr><td colspan="5" style="text-align:center;color:#999;">No open tranches</td></tr>';

                modal.classList.add("show");
            });
        });

        ["openTranchesClose", "openTranchesCloseBtn"].forEach(function (id) {
            const btn = document.getElementById(id);
            if (btn) btn.addEventListener("click", closeModal);
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

        function readNumber(id) {
            return parseFloat((document.getElementById(id) || {}).value) || null;
        }

        function closeOverlay() {
            if (overlay) overlay.classList.remove("show");
        }

        renderFirmOptions(
            document.querySelector("#txnFirmDropdown .dealer-filter-dropdown-panel"),
            transactionData.map(function (item) {
                return { name: item.firm, meta: "Code: " + item.code };
            })
        );

        if (openBtn && overlay) {
            openBtn.addEventListener("click", function () {
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
                pill.addEventListener("click", function () {
                    setTxnFilterTab(pill.dataset.tab);
                });
            });
        }

        daysPills.forEach(function (pill) {
            pill.addEventListener("click", function () {
                setActive(daysPills, pill);
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                setTxnFilterTab("all");

                ["txnSanctionFrom", "txnSanctionTo", "txnOverdueFrom", "txnOverdueTo"].forEach(function (id) {
                    const input = document.getElementById(id);
                    if (input) input.value = "";
                });

                daysPills.forEach(function (pill, index) {
                    pill.classList.toggle("active", index === 0);
                });
            });
        }

        if (applyBtn) {
            applyBtn.addEventListener("click", function () {
                const activePill = tabsWrap ? tabsWrap.querySelector(".active") : null;

                txnState.tab = (activePill && activePill.dataset.tab) || "all";
                txnState.sanctionFrom = readNumber("txnSanctionFrom");
                txnState.sanctionTo = readNumber("txnSanctionTo");
                txnState.overdueFrom = readNumber("txnOverdueFrom");
                txnState.overdueTo = readNumber("txnOverdueTo");

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


    function showPage(which) {
        const pages = {
            newdealer: document.getElementById("newDealerPage"),
            transaction: document.getElementById("transactionDashboardPage"),
            dashboard: document.querySelector(".Dashboard-page-section")
        };

        Object.keys(pages).forEach(function (key) {
            if (pages[key]) pages[key].style.display = "none";
        });

        const target = pages[which];
        if (!target) return;

        target.style.display = which === "dashboard" ? "" : "block";
    }

    function bindMenuRoutes(items, routes) {
        items.forEach(function (menuItem) {
            const title = menuItem.querySelector(".menu-title");
            if (!title) return;

            const route = routes[title.textContent.trim().toLowerCase()];
            if (!route) return;

            menuItem.addEventListener("click", function () {
                showPage(route);
                menuItems.forEach(function (item) { item.classList.remove("active"); });
                menuItem.classList.add("active");
            });
        });
    }

    function initNavigation() {
        bindMenuRoutes(Array.from(menuItems), {
            "new dealer leads": "newdealer",
            "analytics dashboard": "dashboard"
        });

        bindMenuRoutes(Array.from(document.querySelectorAll(".menu-item")), {
            "transaction dashboard": "transaction"
        });

        document.querySelectorAll("[data-goto]").forEach(function (tab) {
            tab.addEventListener("click", function () {
                showPage(tab.dataset.goto);
            });
        });
    }


    applyDealerCellLabels();
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
    applyCurrentView();

    /* Transaction dashboard */
    initTransactionDashboard();

    /* Shared */
    initPinning();
    initNavigation();
    applySavedPins();
    applyAllMasking(detailsHidden);

});
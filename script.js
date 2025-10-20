// Step 1: Select all important elements
const calculateBtn = document.querySelector(".calculate");
const amountInput = document.getElementById("mortgage-amount");
const termInput = document.getElementById("mortgage-term");
const rateInput = document.getElementById("interest-rate");
const typeInputs = document.querySelectorAll("input[name='mortgageType']");
const errorMessages = document.querySelectorAll(".error");

// New elements for result display
const mainContainer = document.querySelector(".main-container"); // placeholder
const resultContainer = document.querySelector(".h-container"); // hidden result box
const monthlyResult = document.querySelector(".totally"); // monthly repayment
const totalResult = document.querySelector(".total-t"); // total repayable

// ✅ Helper functions
function showError(element) {
  const group = element.closest(".input-group");
  const error = group.querySelector(".error");
  const inputBox = group.querySelector(".input-box");

  if (error) error.classList.remove("hidden");
  if (inputBox) inputBox.classList.add("error-box");
}

function hideError(element) {
  const group = element.closest(".input-group");
  const error = group.querySelector(".error");
  const inputBox = group.querySelector(".input-box");

  if (error) error.classList.add("hidden");
  if (inputBox) inputBox.classList.remove("error-box");
}

// ✅ Input focus and visual feedback
[amountInput, termInput, rateInput].forEach((input) => {
  const group = input.closest(".input-group");
  const error = group.querySelector(".error");
  const box = group.querySelector(".input-box");

  input.addEventListener("focus", () => {
    if (box.classList.contains("error-box")) box.classList.add("active-error");
    if (error) error.classList.add("hidden"); // hide error when typing starts
  });

  input.addEventListener("blur", () => {
    box.classList.remove("active-error");
    if (input.value.trim() === "") {
      box.classList.add("error-box");
      if (error) error.classList.remove("hidden");
    }
  });

  input.addEventListener("input", () => {
    if (input.value.trim() !== "") {
      box.classList.remove("error-box", "active-error");
      box.classList.add("filled-box");
      if (error) error.classList.add("hidden");
    } else {
      box.classList.remove("filled-box");
      box.classList.add("error-box");
      if (error) error.classList.remove("hidden");
    }
  });
});

// ✅ Limit interest rate input (max 5 characters including dot)
rateInput.addEventListener("input", (e) => {
  let value = e.target.value.replace(/[^0-9.]/g, ""); // allow only digits and one dot
  const parts = value.split(".");
  if (parts.length > 2) value = parts[0] + "." + parts[1];
  if (value.length > 5) value = value.slice(0, 5); // limit total length
  e.target.value = value;
});

// ✅ Format mortgage amount with commas while typing
function formatDigitsWithCommas(str) {
  const digits = str.replace(/\D/g, "");
  if (digits === "") return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

amountInput.addEventListener("input", (e) => {
  const input = e.target;
  const raw = input.value;
  const selStart = input.selectionStart;
  const digitsLeftOfCaret = (raw.slice(0, selStart).match(/\d/g) || []).length;
  const onlyDigits = raw.replace(/\D/g, "");
  const formatted = formatDigitsWithCommas(onlyDigits);
  input.value = formatted;

  // restore caret position
  let pos = 0, digitsCount = 0;
  while (pos < input.value.length && digitsCount < digitsLeftOfCaret) {
    if (/\d/.test(input.value[pos])) digitsCount++;
    pos++;
  }
  input.setSelectionRange(pos, pos);
});

// ✅ Main calculation and result logic
calculateBtn.addEventListener("click", () => {
  let isValid = true;

  // Validation
  if (amountInput.value.trim() === "") {
    showError(amountInput);
    isValid = false;
  } else hideError(amountInput);

  if (termInput.value.trim() === "") {
    showError(termInput);
    isValid = false;
  } else hideError(termInput);

  if (rateInput.value.trim() === "") {
    showError(rateInput);
    isValid = false;
  } else hideError(rateInput);

  // Check mortgage type
  let selectedType = null;
  typeInputs.forEach((radio) => {
    if (radio.checked) selectedType = radio.value;
  });
  const typeError = document.querySelector(".total .error");
  if (!selectedType) {
    typeError.classList.remove("hidden");
    isValid = false;
  } else typeError.classList.add("hidden");

  // ✅ Perform calculation if all valid
  if (isValid) {
    const principal = parseFloat(amountInput.value.replace(/,/g, ""));
    const annualRate = parseFloat(rateInput.value);
    const years = parseFloat(termInput.value);

    const monthlyRate = annualRate / 100 / 12;
    const numPayments = years * 12;

    let monthlyPayment;
    if (selectedType === "repayment") {
      monthlyPayment =
        (principal * monthlyRate) /
        (1 - Math.pow(1 + monthlyRate, -numPayments));
    } else {
      monthlyPayment = principal * monthlyRate;
    }

    const totalRepay = monthlyPayment * numPayments;
    const format = (num) =>
      "£" + num.toLocaleString("en-GB", { minimumFractionDigits: 2 });

    // Show results
    monthlyResult.textContent = format(monthlyPayment);
    totalResult.textContent = format(totalRepay);

    // Swap containers
    mainContainer.classList.add("hidden");
    resultContainer.classList.remove("hidden");
  }
});

// ✅ Clear All button logic
const clearBtn = document.querySelector(".clearer");

clearBtn.addEventListener("click", () => {
  // Clear all text inputs
  amountInput.value = "";
  termInput.value = "";
  rateInput.value = "";

  // Uncheck mortgage type radios
  typeInputs.forEach((radio) => (radio.checked = false));

  // Hide all error messages
  errorMessages.forEach((msg) => msg.classList.add("hidden"));

  // Reset all input box visuals
  document.querySelectorAll(".input-box").forEach((box) => {
    box.classList.remove("error-box", "active-error", "filled-box");
  });

  // Optionally, hide the result section and show the empty container again
  const resultContainer = document.querySelector(".h-container");
  const emptyContainer = document.querySelector(".main-container");

  if (resultContainer && emptyContainer) {
    resultContainer.classList.add("hidden"); // hide results
    emptyContainer.classList.remove("hidden"); // show "Results shown here"
  }

  console.log("All inputs cleared ✅ Ready for new entry!");
});

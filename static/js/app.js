/**
 * ReviewFlow - Customer Feedback to AI Review Generation
 * Client-side Controller & UI State Handler
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Rating scale labels
  const RATING_LABELS = {
    1: "Very dissatisfied (1/5)",
    2: "Dissatisfied (2/5)",
    3: "Okay (3/5)",
    4: "Satisfied (4/5)",
    5: "Very satisfied (5/5)",
  };

  // 2. Application state
  const state = {
    food: 5,
    service: 4,
    ambience: 5,
    value: 4,
    overall: 5,
    highlight: "",
    comment: "",
  };

  // 3. DOM Elements
  const questionnaireCard = document.getElementById("questionnaireCard");
  const resultCard = document.getElementById("resultCard");
  const feedbackForm = document.getElementById("feedbackForm");
  const generateBtn = document.getElementById("generateBtn");
  const errorBanner = document.getElementById("errorBanner");
  const errorMessage = document.getElementById("errorMessage");
  const errorDetail = document.getElementById("errorDetail");
  const retryBtn = document.getElementById("retryBtn");
  const reviewText = document.getElementById("reviewText");
  const copyBtn = document.getElementById("copyBtn");
  const backBtn = document.getElementById("backBtn");
  const googleReviewBtn = document.getElementById("googleReviewBtn");
  const googleMissingNotice = document.getElementById("googleMissingNotice");
  const customerComment = document.getElementById("customerComment");
  const charCount = document.getElementById("charCount");

  // 4. Slider configuration & event listeners
  const sliders = [
    { id: "sliderFood", labelId: "labelFood", field: "food" },
    { id: "sliderService", labelId: "labelService", field: "service" },
    { id: "sliderAmbience", labelId: "labelAmbience", field: "ambience" },
    { id: "sliderValue", labelId: "labelValue", field: "value" },
    { id: "sliderOverall", labelId: "labelOverall", field: "overall" },
  ];

  function updateSlider(sliderObj) {
    const el = document.getElementById(sliderObj.id);
    const labelEl = document.getElementById(sliderObj.labelId);
    if (!el || !labelEl) return;

    const val = parseInt(el.value, 10);
    state[sliderObj.field] = val;
    labelEl.textContent = RATING_LABELS[val] || `${val}/5`;

    // Visual color accent based on rating
    labelEl.className = `rating-badge rating-${val}`;

    // Update native slider track progress fill
    const percent = ((val - el.min) / (el.max - el.min)) * 100;
    el.style.background = `linear-gradient(to right, #171717 0%, #171717 ${percent}%, #dedbd4 ${percent}%, #dedbd4 100%)`;
  }

  sliders.forEach((sliderObj) => {
    const el = document.getElementById(sliderObj.id);
    if (el) {
      updateSlider(sliderObj); // Initial sync
      el.addEventListener("input", () => updateSlider(sliderObj));
    }
  });

  // 5. Highlight pills selection
  const pills = document.querySelectorAll(".pill-btn");
  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const val = pill.dataset.value;
      if (state.highlight === val) {
        // Deselect if already selected
        state.highlight = "";
        pill.classList.remove("selected");
      } else {
        pills.forEach((p) => p.classList.remove("selected"));
        pill.classList.add("selected");
        state.highlight = val;
      }
    });
  });

  // 6. Character counter for customer notes
  if (customerComment && charCount) {
    customerComment.addEventListener("input", () => {
      charCount.textContent = customerComment.value.length;
    });
  }

  // 7. Error banner management
  function clearError() {
    if (errorBanner) errorBanner.classList.add("hidden");
    if (errorDetail) errorDetail.classList.add("hidden");
  }

  function showError(msg, detail) {
    if (!errorBanner) return;

    if (errorMessage) {
      errorMessage.textContent = msg || "Gemini couldn't generate the review. Please try again.";
    }

    if (errorDetail) {
      if (detail) {
        errorDetail.textContent = detail;
        errorDetail.classList.remove("hidden");
      } else {
        errorDetail.classList.add("hidden");
      }
    }

    errorBanner.classList.remove("hidden");
    errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // 8. Submit feedback & request AI generation
  async function submitFeedback() {
    clearError();
    if (customerComment) {
      state.comment = customerComment.value.trim();
    }

    // Set loading state
    if (generateBtn) {
      generateBtn.disabled = true;
      generateBtn.classList.add("loading");
      generateBtn.innerHTML = `
        <span class="spinner"></span>
        <span class="btn-text">Creating your review...</span>
      `;
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(state),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate review. Please try again.");
      }

      if (!data.review) {
        throw new Error("Received an empty review response. Please try again.");
      }

      // Populate review textarea
      if (reviewText) {
        reviewText.value = data.review;
      }

      // Configure Google Review button
      if (data.google_review_url && data.google_review_url.trim() !== "") {
        if (googleReviewBtn) {
          googleReviewBtn.href = data.google_review_url.trim();
          googleReviewBtn.classList.remove("hidden");
        }
        if (googleMissingNotice) {
          googleMissingNotice.classList.add("hidden");
        }
      } else {
        if (googleReviewBtn) {
          googleReviewBtn.classList.add("hidden");
        }
        if (googleMissingNotice) {
          googleMissingNotice.classList.remove("hidden");
        }
      }

      // Transition to result card
      if (questionnaireCard && resultCard) {
        questionnaireCard.classList.add("hidden");
        resultCard.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      showError("⚠️ Gemini couldn't generate the review. Please try again.", err.message);
    } finally {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.classList.remove("loading");
        generateBtn.innerHTML = `
          <span class="btn-text">Generate my review</span>
          <span class="btn-arrow">→</span>
        `;
      }
    }
  }

  // 9. Form submission & retry triggers
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitFeedback();
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      clearError();
      submitFeedback();
    });
  }

  // 10. Back button (edit answers)
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      if (resultCard && questionnaireCard) {
        resultCard.classList.add("hidden");
        questionnaireCard.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }

  // 11. One-tap copy to clipboard
  if (copyBtn && reviewText) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(reviewText.value);
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `<span class="copy-icon">✓</span><span>Copied!</span>`;
        copyBtn.classList.add("copied");

        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
          copyBtn.classList.remove("copied");
        }, 2000);
      } catch (err) {
        // Fallback for non-secure contexts or older browsers
        reviewText.select();
        document.execCommand("copy");
        copyBtn.innerHTML = `<span class="copy-icon">✓</span><span>Copied!</span>`;
        setTimeout(() => {
          copyBtn.innerHTML = `<span class="copy-icon">📋</span><span class="copy-text">Copy review</span>`;
        }, 2000);
      }
    });
  }
});

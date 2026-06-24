import { loadData, saveData } from "./storage.js";

const updateSlidingIndicator = (option: string) => {
    const indicator = document.getElementById("slidingIndicator");
    if (!indicator) return;

    if (option === "5") {
        indicator.style.transform = "translateX(0%)";
    } else if (option === "7") {
        indicator.style.transform = "translateX(100%)";
    } else if (option === "custom") {
        indicator.style.transform = "translateX(200%)";
    }
};

const loadSettings = () => {
    const data = loadData();
    const element = document.getElementById("noRepeatDays");
    if (element) {
        (element as HTMLInputElement).value = String(data.settings.noRepeatDays);
    }

    const limitOptionRadios = document.getElementsByName("limitOption") as NodeListOf<HTMLInputElement>;
    const customLimitContainer = document.getElementById("customLimitContainer");
    const customLimitInput = document.getElementById("customLimit") as HTMLInputElement | null;

    const selectedOption = data.settings.limitOption || "7";

    limitOptionRadios.forEach((radio) => {
        const label = radio.closest("label");
        const span = label?.querySelector("span");
        if (radio.value === selectedOption) {
            radio.checked = true;
            span?.classList.add("text-neutral-900", "dark:text-neutral-50", "font-semibold");
            span?.classList.remove("text-neutral-700", "dark:text-neutral-300");
        } else {
            radio.checked = false;
            span?.classList.remove("text-neutral-900", "dark:text-neutral-50", "font-semibold");
            span?.classList.add("text-neutral-700", "dark:text-neutral-300");
        }
    });

    updateSlidingIndicator(selectedOption);

    if (customLimitContainer) {
        if (selectedOption === "custom") {
            customLimitContainer.classList.remove("hidden");
        } else {
            customLimitContainer.classList.add("hidden");
        }
    }

    if (customLimitInput) {
        customLimitInput.value = String(data.settings.customLimit || 10);
    }
};

const saveSettings = () => {
    const data = loadData();
    const noRepeatElement = document.getElementById("noRepeatDays");
    if (noRepeatElement) {
        const value = (noRepeatElement as HTMLInputElement).value;
        data.settings.noRepeatDays = Math.max(0, Number(value));
    }

    const limitOptionRadios = document.getElementsByName("limitOption") as NodeListOf<HTMLInputElement>;
    let selectedOption: "5" | "7" | "custom" = "7";
    for (const radio of limitOptionRadios) {
        if (radio.checked) {
            selectedOption = radio.value as "5" | "7" | "custom";
        }
    }
    data.settings.limitOption = selectedOption;

    const customLimitInput = document.getElementById("customLimit") as HTMLInputElement | null;
    if (customLimitInput) {
        data.settings.customLimit = Math.max(1, Number(customLimitInput.value));
    }

    // Set mealsPerWeek for legacy/compatibility
    if (selectedOption === "5") {
        data.settings.mealsPerWeek = 5;
    } else if (selectedOption === "7") {
        data.settings.mealsPerWeek = 7;
    } else {
        data.settings.mealsPerWeek = data.settings.customLimit;
    }

    saveData(data);
};

export { loadSettings, saveSettings };

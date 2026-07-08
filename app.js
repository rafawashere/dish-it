// app.js
(function () {
    const STORAGE_KEY = "dish_it";

    const DEFAULT_DATA = {
        settings: {
            mealsPerWeek: 7,
            noRepeatDays: 14,
            randomize: true,
            limitOption: "7",
            customLimit: 10
        },
        meals: [],
        recentMeals: []
    };

    let editingMealId = null;
    const routes = ["create", "meals", "settings"];

    // Fallback for random UUID in case crypto.randomUUID is not available
    const generateUUID = () => {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID();
        }
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    // --- Storage Logic ---
    const loadData = () => {
        const lsData = localStorage.getItem(STORAGE_KEY);
        if (!lsData) return JSON.parse(JSON.stringify(DEFAULT_DATA)); // deep copy

        try {
            const storedData = JSON.parse(lsData);
            const settings = Object.assign({}, DEFAULT_DATA.settings, storedData.settings);

            // Initialize limitOption and customLimit if loading legacy data
            if (storedData.settings && !("limitOption" in storedData.settings)) {
                const mpw = settings.mealsPerWeek;
                if (mpw === 5) {
                    settings.limitOption = "5";
                } else if (mpw === 7) {
                    settings.limitOption = "7";
                } else {
                    settings.limitOption = "custom";
                    settings.customLimit = mpw;
                }
            }

            return Object.assign({}, DEFAULT_DATA, storedData, { settings });
        } catch (e) {
            console.error("Failed to parse stored data", e);
            return JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
    };

    const saveData = (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    const exportData = () => {
        const dataStr = localStorage.getItem(STORAGE_KEY);
        if (!dataStr) return;

        try {
            const data = JSON.parse(dataStr);
            const exportObj = Object.assign({}, data, {
                meals: Array.isArray(data?.meals) ? data.meals.map((meal) => meal.name) : [],
                recentMeals: data.recentMeals || []
            });

            const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${STORAGE_KEY}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export failed:", error);
        }
    };

    const importData = (file, onComplete) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            if (!e.target) return;
            const result = e.target.result;
            if (typeof result === "string") {
                try {
                    const parsed = JSON.parse(result);
                    const currentData = loadData();

                    if (Array.isArray(parsed)) {
                        currentData.meals = parsed.map((item) => {
                            const name = typeof item === "string" ? item : (item?.name || "");
                            return {
                                id: generateUUID(),
                                name: name.trim()
                            };
                        }).filter((meal) => meal.name !== "");
                    } else if (parsed && typeof parsed === "object") {
                        if (Array.isArray(parsed.meals)) {
                            currentData.meals = parsed.meals.map((meal) => {
                                const name = typeof meal === "string" ? meal : (meal?.name || "");
                                const id = (typeof meal === "object" && meal?.id) ? meal.id : generateUUID();
                                return {
                                    id,
                                    name: name.trim()
                                };
                            }).filter((meal) => meal.name !== "");
                        }
                        if (parsed.settings) {
                            currentData.settings = Object.assign({}, currentData.settings, parsed.settings);
                        }
                        if (Array.isArray(parsed.recentMeals)) {
                            currentData.recentMeals = parsed.recentMeals;
                        }
                    }

                    saveData(currentData);
                } catch (error) {
                    console.error("Import failed:", error);
                }
            }
            if (onComplete) onComplete();
        };
        reader.readAsText(file);
    };

    // --- Meals Logic ---
    const addMeal = (name) => {
        const data = loadData();
        data.meals.push({
            id: generateUUID(),
            name: name
        });
        saveData(data);
        renderMeals();
    };

    const updateMeal = (id, newName) => {
        const data = loadData();
        const meal = data.meals.find((m) => m.id === id);
        if (!meal) return;

        const oldName = meal.name;
        meal.name = newName.trim();

        if (data.mealPlan) {
            data.mealPlan = data.mealPlan.map((name) => name === oldName ? meal.name : name);
        }
        if (data.recentMeals) {
            data.recentMeals = data.recentMeals.map((name) => name === oldName ? meal.name : name);
        }

        saveData(data);
        editingMealId = null;
        renderMeals();
    };

    const deleteMeal = (id) => {
        const data = loadData();
        data.meals = data.meals.filter((meal) => meal.id !== id);

        if (data.mealPlan) {
            data.mealPlan = data.mealPlan.filter((name) => data.meals.some((m) => m.name === name));
        }
        if (data.recentMeals) {
            data.recentMeals = data.recentMeals.filter((name) => data.meals.some((m) => m.name === name));
        }

        saveData(data);
        renderMeals();
    };

    const renderMeals = () => {
        const data = loadData();
        const container = document.getElementById("mealList");
        if (!container) return;

        container.innerHTML = "";

        data.meals.forEach((meal) => {
            const row = document.createElement("div");
            row.className = "bg-white border border-neutral-200 rounded-lg shadow-sm flex items-center justify-between gap-4 mt-3 min-h-14 py-3.5 px-4 dark:bg-neutral-800 dark:border-neutral-700";

            if (meal.id === editingMealId) {
                const editForm = document.createElement("form");
                editForm.className = "flex-1 flex flex-row items-center justify-between gap-4 w-full";

                const editInput = document.createElement("input");
                editInput.type = "text";
                editInput.value = meal.name;
                editInput.required = true;
                editInput.className = "flex-1 border border-neutral-300 rounded-lg px-3 py-2 bg-white dark:bg-neutral-900 dark:border-neutral-700 text-neutral-900 dark:text-neutral-50 focus:outline-none focus:ring-2 focus:ring-sky-500";

                const editActions = document.createElement("div");
                editActions.className = "flex gap-3";

                const saveButton = document.createElement("button");
                saveButton.type = "submit";
                saveButton.className = "inline-flex items-center justify-center bg-sky-600 hover:bg-sky-700 text-white rounded-lg min-h-10 px-4 py-2.5 no-underline cursor-pointer border-0 dark:bg-sky-700 dark:hover:bg-sky-600";
                saveButton.textContent = "Save";

                const cancelButton = document.createElement("button");
                cancelButton.type = "button";
                cancelButton.className = "inline-flex items-center justify-center bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg min-h-10 px-4 py-2.5 no-underline cursor-pointer border-0 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-neutral-100";
                cancelButton.textContent = "Cancel";
                cancelButton.addEventListener("click", () => {
                    editingMealId = null;
                    renderMeals();
                });

                editActions.append(saveButton, cancelButton);
                editForm.append(editInput, editActions);
                row.append(editForm);

                editForm.addEventListener("submit", (e) => {
                    e.preventDefault();
                    const newName = editInput.value.trim();
                    if (newName) {
                        updateMeal(meal.id, newName);
                    }
                });

                setTimeout(() => editInput.focus(), 0);
            } else {
                const name = document.createElement("span");
                const options = document.createElement("div");
                const editButton = document.createElement("button");
                const deleteButton = document.createElement("button");

                name.className = "text-neutral-900 dark:text-neutral-50 font-medium";
                name.textContent = meal.name;

                options.className = "flex gap-3";

                deleteButton.dataset.id = meal.id;
                deleteButton.className = "inline-flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 rounded-lg min-h-10 px-4 py-2.5 no-underline cursor-pointer border-0 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300";
                deleteButton.title = "Delete meal";
                deleteButton.ariaLabel = `Delete ${meal.name}`;
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => deleteMeal(meal.id));

                editButton.dataset.id = meal.id;
                editButton.className = "inline-flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-800 rounded-lg min-h-10 px-4 py-2.5 no-underline cursor-pointer border-0 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300";
                editButton.title = "Edit meal";
                editButton.ariaLabel = `Edit ${meal.name}`;
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => {
                    editingMealId = meal.id;
                    renderMeals();
                });

                options.append(editButton, deleteButton);
                row.append(name, options);
            }

            container.appendChild(row);
        });
    };

    // --- Settings Logic ---
    const updateSlidingIndicator = (option) => {
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
            element.value = String(data.settings.noRepeatDays);
        }

        const limitOptionRadios = document.getElementsByName("limitOption");
        const customLimitContainer = document.getElementById("customLimitContainer");
        const customLimitInput = document.getElementById("customLimit");

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
            const value = noRepeatElement.value;
            data.settings.noRepeatDays = Math.max(0, Number(value));
        }

        const limitOptionRadios = document.getElementsByName("limitOption");
        let selectedOption = "7";
        for (const radio of limitOptionRadios) {
            if (radio.checked) {
                selectedOption = radio.value;
            }
        }
        data.settings.limitOption = selectedOption;

        const customLimitInput = document.getElementById("customLimit");
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

    const deleteMeals = () => {
        if (!confirm("Are you sure you want to delete all meals? This action cannot be undone.")) {
            return false;
        }

        const data = loadData();
        data.meals = [];
        data.mealPlan = [];
        data.recentMeals = [];
        saveData(data);
        return true;
    };

    // --- App Routing & Flow ---
    const getRoute = () => {
        const hash = location.hash.replace("#", "");
        return routes.includes(hash) ? hash : "create";
    };

    const generateMealPlan = () => {
        const data = loadData();
        if (!data.meals.length) return;

        const meals = data.settings.randomize
            ? [...data.meals].sort(() => Math.random() - 0.5)
            : [...data.meals];

        const limit = data.settings.limitOption === "5"
            ? 5
            : (data.settings.limitOption === "7" ? 7 : Math.max(1, data.settings.customLimit));
        const count = Math.min(meals.length, limit);
        const noRepeatDays = Math.max(0, data.settings.noRepeatDays);

        const historicalRecentMealNames = [...(data.recentMeals || [])];
        const mealPlan = [];
        const currentPlanMealNames = [];

        for (let index = 0; index < count; index += 1) {
            const availableMeal =
                meals.find((meal) => !historicalRecentMealNames.includes(meal.name) && !currentPlanMealNames.includes(meal.name)) 
                ?? meals.find((meal) => !currentPlanMealNames.includes(meal.name))
                ?? meals[index % meals.length];

            if (!availableMeal) break;

            currentPlanMealNames.push(availableMeal.name);
            historicalRecentMealNames.push(availableMeal.name);
            mealPlan.push(availableMeal.name);

            while (historicalRecentMealNames.length > noRepeatDays) {
                historicalRecentMealNames.shift();
            }
        }

        data.mealPlan = mealPlan;
        data.recentMeals = historicalRecentMealNames;
        saveData(data);
        renderMealPlan();
    };

    const renderMealPlan = () => {
        const data = loadData();
        const container = document.getElementById("mealPlan");
        const emptyState = document.getElementById("mealPlanEmpty");

        if (!container || !emptyState) return;

        container.innerHTML = "";

        if (!data.meals.length) {
            emptyState.hidden = false;
            return;
        }

        emptyState.hidden = true;

        if (!data.mealPlan || data.mealPlan.length === 0) {
            return;
        }

        const row = document.createElement("ol");

        data.mealPlan.forEach((name, index) => {
            const mealName = document.createElement("li");
            mealName.textContent = (index + 1) + ". " + name;
            row.append(mealName);
        });

        container.appendChild(row);
    };

    const renderRoute = () => {
        const route = getRoute();

        document.querySelectorAll("[data-view]").forEach((view) => {
            view.hidden = view.dataset.view !== route;
        });

        document.querySelectorAll("[data-nav]").forEach((link) => {
            const isActive = link.dataset.nav === route;
            link.classList.toggle("bg-neutral-100", isActive);
            link.classList.toggle("dark:bg-neutral-800", isActive);
            link.classList.toggle("text-neutral-900", isActive);
            link.classList.toggle("dark:text-neutral-100", isActive);
            link.classList.toggle("text-neutral-700", !isActive);
            link.classList.toggle("dark:text-neutral-300", !isActive);
            link.setAttribute("aria-current", isActive ? "page" : "false");
        });

        renderMeals();
        loadSettings();

        if (route === "create") {
            renderMealPlan();
        }
    };

    document.addEventListener("DOMContentLoaded", () => {
        // Set default hash if not present or invalid
        const currentHash = location.hash.replace("#", "");
        if (!currentHash || !routes.includes(currentHash)) {
            location.hash = "#create";
        }

        renderRoute();

        const addMealForm = document.getElementById("addMealForm");
        if (addMealForm) {
            addMealForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const inputElement = document.getElementById("newMealName");
                if (inputElement) {
                    const name = inputElement.value.trim();
                    if (name) {
                        addMeal(name);
                        inputElement.value = "";
                        renderRoute();
                    }
                }
            });
        }

        document.getElementById("createMealPlanBtn").addEventListener("click", generateMealPlan);

        document.getElementById("noRepeatDays").addEventListener("change", () => {
            saveSettings();
            renderRoute();
        });

        document.querySelectorAll('input[name="limitOption"]').forEach((radio) => {
            radio.addEventListener("change", () => {
                saveSettings();
                renderRoute();
            });
        });

        const customLimit = document.getElementById("customLimit");
        if (customLimit) {
            customLimit.addEventListener("change", () => {
                saveSettings();
                renderRoute();
            });
        }

        document.getElementById("exportBtn").addEventListener("click", exportData);

        document.getElementById("deleteMealsBtn").addEventListener("click", () => {
            if (deleteMeals()) {
                renderRoute();
            }
        });

        document.getElementById("importFile").addEventListener("change", ({ target }) => {
            const inputElement = target;
            const file = inputElement.files?.[0];

            if (!file) return;

            importData(file, () => {
                inputElement.value = "";
                renderRoute();

                const statusElement = document.getElementById("importStatus");
                if (statusElement) {
                    statusElement.classList.replace("opacity-0", "opacity-100");
                    setTimeout(() => {
                        statusElement.classList.replace("opacity-100", "opacity-0");
                    }, 4000);
                }
            });
        });

        document.getElementById("mealList").addEventListener("click", ({ target }) => {
            const targetElement = target;
            if (!targetElement || !targetElement.classList.contains("delete-btn")) {
                return;
            }

            const mealId = targetElement.dataset.id;
            if (!mealId) return;
            deleteMeal(mealId);
            renderRoute();
        });

        window.addEventListener("hashchange", renderRoute);
    });
})();

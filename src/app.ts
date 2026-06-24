import { addMeal, deleteMeal, renderMeals } from "./meals.js";
import { deleteMeals, loadSettings, saveSettings } from "./settings.js";
import { exportData, importData, loadData, saveData } from "./storage.js";

const routes = ["create", "meals", "settings"] as const;
type Route = typeof routes[number];

const getRoute = (): Route => {
    const route = location.pathname.replace("/", "");
    return routes.includes(route as Route) ? route as Route : "create";
};

const navigateTo = (path: string) => {
    history.pushState(null, "", path);
    renderRoute();
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
    
    // Use stored recentMeals (names) as starting point for historical tracking
    const historicalRecentMealNames: string[] = [...(data.recentMeals || [])];
    const mealPlan: string[] = [];
    const currentPlanMealNames: string[] = [];

    for (let index = 0; index < count; index += 1) {
        const availableMeal =
            meals.find((meal) => !historicalRecentMealNames.includes(meal.name) && !currentPlanMealNames.includes(meal.name)) 
            ?? meals.find((meal) => !currentPlanMealNames.includes(meal.name)) // Fallback to avoid repeating in the SAME plan
            ?? meals[index % meals.length]; // Absolute fallback

        if (!availableMeal) break;

        currentPlanMealNames.push(availableMeal.name);
        historicalRecentMealNames.push(availableMeal.name);
        mealPlan.push(availableMeal.name);

        // Keep historical tracking within the noRepeatDays limit
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

    document.querySelectorAll<HTMLElement>("[data-view]").forEach((view) => {
        view.hidden = view.dataset.view !== route;
    });

    document.querySelectorAll<HTMLAnchorElement>("[data-nav]").forEach((link) => {
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

document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (location.pathname === "/") {
            history.replaceState(null, "", "/create");
        }

        renderRoute();

        document.querySelectorAll<HTMLAnchorElement>("[data-nav], [data-route]").forEach((link) => {
            link.addEventListener(
                "click",
                (event) => {
                    event.preventDefault();
                    navigateTo(link.pathname);
                }
            );
        });

        const addMealForm = document.getElementById("addMealForm") as HTMLFormElement | null;
        if (addMealForm) {
            addMealForm.addEventListener("submit", (event) => {
                event.preventDefault();
                const inputElement = document.getElementById("newMealName") as HTMLInputElement | null;
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

        document
            .getElementById("createMealPlanBtn")!
            .addEventListener(
                "click",
                generateMealPlan
            );

        document
            .getElementById("noRepeatDays")!
            .addEventListener(
                "change",
                () => {
                    saveSettings();
                    renderRoute();
                }
            );

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

        document
            .getElementById("exportBtn")!
            .addEventListener(
                "click",
                exportData
            );

        document
            .getElementById("deleteMealsBtn")!
            .addEventListener(
                "click",
                () => {
                    if (deleteMeals()) {
                        renderRoute();
                    }
                }
            );

        document
            .getElementById("importFile")!
            .addEventListener(
                "change",
                ({ target }) => {
                    const inputElement = target as HTMLInputElement;
                    const file = inputElement.files?.[0];

                    if (!file) return;

                    return importData(file, () => {
                        inputElement.value = "";
                        renderRoute();

                        const statusElement = document.getElementById("importStatus");
                        if (statusElement) {
                            statusElement.classList.replace("opacity-0", "opacity-100");
                            setTimeout(() => {
                                statusElement.classList.replace("opacity-100", "opacity-0");
                            }, 2000);
                        }
                    });
                }

            );

        document
            .getElementById("mealList")!
            .addEventListener(
                "click",
                ({ target }) => {
                    const targetElement = target as HTMLElement | null;
                    if (!targetElement || !targetElement.classList.contains("delete-btn")) {
                        return;
                    }

                    const mealId = targetElement.dataset.id;
                    if (!mealId) return;
                    deleteMeal(mealId);
                    renderRoute();
                }
            );

        window.addEventListener("popstate", renderRoute);
    }
);

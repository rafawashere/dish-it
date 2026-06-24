import { addMeal, deleteMeal, renderMeals } from "./meals.js";
import { loadSettings, saveSettings } from "./settings.js";
import { exportData, importData, loadData } from "./storage.js";

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

    const meals = data.settings.randomize
        ? [...data.meals].sort(() => Math.random() - 0.5)
        : [...data.meals];

    const days = Math.max(1, data.settings.mealsPerWeek);
    const noRepeatDays = Math.max(0, data.settings.noRepeatDays);
    const recentMealIds: string[] = [];

    for (let day = 0; day < days; day += 1) {
        const fallbackMeal = meals[day % meals.length];
        if (!fallbackMeal) return;

        const availableMeal =
            meals.find((meal) => !recentMealIds.includes(meal.id)) ?? fallbackMeal;

        recentMealIds.push(availableMeal.id);

        if (recentMealIds.length > noRepeatDays) {
            recentMealIds.shift();
        }

        const row = document.createElement("div");
        const dayLabel = document.createElement("span");
        const mealName = document.createElement("strong");

        row.className = "bg-white border border-neutral-200 rounded-lg shadow-sm flex items-center justify-between gap-4 mt-3 min-h-14 py-3.5 px-4";
        dayLabel.className = "text-neutral-500 text-sm";
        dayLabel.textContent = `Day ${day + 1}`;
        mealName.className = "text-[1.05rem] font-bold";
        mealName.textContent = availableMeal.name;

        row.append(dayLabel, mealName);
        container.appendChild(row);
    }
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

        document
            .getElementById("addMealBtn")!
            .addEventListener(
                "click",
                () => {
                    const name = prompt("Enter meal name:");
                    if (name) {
                        addMeal(name);
                        renderRoute();
                    }
                }
            );

        document
            .getElementById("createMealPlanBtn")!
            .addEventListener(
                "click",
                renderMealPlan
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

        document
            .getElementById("exportBtn")!
            .addEventListener(
                "click",
                exportData
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

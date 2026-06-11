import {addMeal, deleteMeal, renderMeals,} from "./meals.js";
import { loadSettings } from "./settings.js";
import { exportData, importData } from "./storage.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderMeals();
        loadSettings();

        document
            .getElementById("addMealBtn")!
            .addEventListener(
                "click",
                () => {
                    const name = prompt("Enter meal name:");
                    if (name) {
                        addMeal(name);
                    }
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

                    return importData(file);
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
                }
            );
    }
);

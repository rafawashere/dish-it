import {  renderMeals,  } from "./meals.js";
import { loadSettings } from "./settings.js";
import { exportData, importData } from "./storage.js";

document.addEventListener(
    "DOMContentLoaded",
    () => {
        renderMeals();
        loadSettings();

        document
            .getElementById("exportBtn")
            .addEventListener(
                "click",
                exportData
            );

        document
            .getElementById("importFile")
            .addEventListener(
                "change",
                ({ target }) =>
                    importData(target.files[0])
            );

        document
            .getElementById("mealList")
            .addEventListener(
                "click",
                ({ target }) => {
                    if (
                        !target.classList.contains(
                            "delete-btn"
                        )
                    ) {
                        return;
                    }

                    deleteMeal(
                        target.dataset.id
                    );
                }
            );
    }
);
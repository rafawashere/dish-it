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
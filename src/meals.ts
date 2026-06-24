import { loadData, saveData } from "./storage.js";

let editingMealId: string | null = null;

const addMeal = (name: string) => {
    const data = loadData();

    data.meals.push({
        id: crypto.randomUUID(),
        name
    });

    saveData(data);

    renderMeals();
};

const updateMeal = (id: string, newName: string) => {
    const data = loadData();

    const meal =
        data.meals.find((m) => m.id === id);

    if (!meal) return;

    meal.name = newName.trim();

    saveData(data);

    editingMealId = null;

    renderMeals();
};

const deleteMeal = (id: string) => {
    const data = loadData();

    data.meals =
        data.meals.filter(
            (meal) => meal.id !== id
        );

    saveData(data);

    renderMeals();
};

const renderMeals = () => {
    const data = loadData();

    const container =
        document.getElementById("mealList");

    if (!container) return;

    container.innerHTML = "";

    data.meals.forEach((meal) => {
        const row =
            document.createElement("div");

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
            const name =
                document.createElement("span");
            const options =
                document.createElement("div");
            const editButton =
                document.createElement("button");
            const deleteButton =
                document.createElement("button");

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
            
            options.append(editButton, deleteButton)
            row.append(name, options);
        }
        
        container.appendChild(row);
    });
};

export { addMeal, updateMeal, deleteMeal, renderMeals };

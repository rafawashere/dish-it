import { loadData, saveData } from "./storage.js";

const addMeal = (name: string) => {
    const data = loadData();

    data.meals.push({
        id: crypto.randomUUID(),
        name
    });

    saveData(data);

    renderMeals();
};

const updateMeal = (id: string, name: string) => {
    const data = loadData();

    const meal =
        data.meals.find((m) => m.id === id);

    if (!meal) return;

    meal.name = name;

    saveData(data);

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
        const name =
            document.createElement("span");
        const deleteButton =
            document.createElement("button");

        row.className = "bg-white border border-neutral-200 rounded-lg shadow-sm flex items-center justify-between gap-4 mt-3 min-h-14 py-3.5 px-4 dark:bg-neutral-800 dark:border-neutral-700";
        name.textContent = meal.name;

        deleteButton.dataset.id = meal.id;
        deleteButton.className = "inline-flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-800 rounded-lg min-h-10 px-4 py-2.5 no-underline cursor-pointer border-0";
        deleteButton.title = "Delete meal";
        deleteButton.ariaLabel = `Delete ${meal.name}`;
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => deleteMeal(meal.id));

        row.append(name, deleteButton);
        container.appendChild(row);
    });
};

export { addMeal, updateMeal, deleteMeal, renderMeals };

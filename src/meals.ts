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

        row.className = "meal-card";
        name.textContent = meal.name;

        deleteButton.dataset.id = meal.id;
        deleteButton.className = "delete-btn";
        deleteButton.title = "Delete meal";
        deleteButton.ariaLabel = `Delete ${meal.name}`;
        deleteButton.textContent = "Delete";

        row.append(name, deleteButton);
        container.appendChild(row);
    });
};

export { addMeal, updateMeal, deleteMeal, renderMeals };

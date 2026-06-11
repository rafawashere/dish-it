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
        data.meals.find(( m: {[key: string]: string }) => m.id === id);

    if (!meal) return;

    meal.name = name;

    saveData(data);

    renderMeals();
};

const deleteMeal = (id: string) => {
    const data = loadData();

    data.meals =
        data.meals.filter(
            (meal: {[key: string]: string }) => meal.id !== id
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

    data.meals.forEach((meal: {[key: string]: string }) => {
        const row =
            document.createElement("div");

        row.className = "meal-card";

        row.innerHTML = `
            <span>${meal.name}</span>
            <button
                data-id="${meal.id}"
                class="delete-btn">
                🗑️
            </button>
        `;

        container.appendChild(row);
    });
};

export { addMeal, updateMeal, deleteMeal, renderMeals };
const STORAGE_KEY = "dishit";

const DEFAULT_DATA = {
    settings: {
        mealsPerWeek: 7,
        noRepeatDays: 14,
        randomize: true
    },
    meals: []
};

export const loadData = () =>
    JSON.parse(localStorage.getItem(STORAGE_KEY))
    ?? structuredClone(DEFAULT_DATA);

export const saveData = data =>
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

//Export
const exportData = () => {
    const data = localStorage.getItem(STORAGE_KEY);

    const blob = new Blob(
        [data],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "dishit.json";
    link.click();

    URL.revokeObjectURL(url);
};

//Import
const importData = (file) => {
    const reader = new FileReader();

    reader.onload = ({ target }) => {
        localStorage.setItem(
            STORAGE_KEY,
            target.result
        );

        location.reload();
    };

    reader.readAsText(file);
};
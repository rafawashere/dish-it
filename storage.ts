const STORAGE_KEY = "dish_it";

interface IStorage {
    settings: {
        mealsPerWeek: number;
        noRepeatDays: number;
        randomize: boolean;
    },
    meals: []
}

const DEFAULT_DATA: IStorage = {
    settings: {
        mealsPerWeek: 7,
        noRepeatDays: 14,
        randomize: true
    },
    meals: []
};

const loadData = () => {
    const lsData = localStorage.getItem(STORAGE_KEY);
    if (!lsData) return structuredClone(DEFAULT_DATA); 
    return JSON.parse(lsData);
}

const saveData = (data: IStorage) =>
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

//Export
const exportData = () => {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return;
    
    const blob = new Blob(
        [data],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `${STORAGE_KEY}.json`;
    link.click();

    URL.revokeObjectURL(url);
};

//Import
const importData = (file: File) => {
    const reader = new FileReader();

    reader.onload = ({ target }) => {
        if (!target) return;

        if (typeof target.result === "string") {
            localStorage.setItem(
                STORAGE_KEY,
                target.result
            );
        }

        location.reload();
    };

    reader.readAsText(file);
};

export { exportData, importData, saveData, loadData };

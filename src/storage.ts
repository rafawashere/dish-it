const STORAGE_KEY = "dish_it";

interface Meal {
    id: string;
    name: string;
}

interface IStorage {
    settings: {
        mealsPerWeek: number;
        noRepeatDays: number;
        randomize: boolean;
    },
    meals: Meal[]
}

const DEFAULT_DATA: IStorage = {
    settings: {
        mealsPerWeek: 7,
        noRepeatDays: 14,
        randomize: true
    },
    meals: []
};

const loadData = (): IStorage => {
    const lsData = localStorage.getItem(STORAGE_KEY);
    if (!lsData) return structuredClone(DEFAULT_DATA);

    const storedData = JSON.parse(lsData) as Partial<IStorage>;

    return {
        ...structuredClone(DEFAULT_DATA),
        ...storedData,
        settings: {
            ...DEFAULT_DATA.settings,
            ...storedData.settings
        }
    };
}

const saveData = (data: IStorage) =>
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

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

const importData = (file: File, onComplete?: () => void) => {
    const reader = new FileReader();

    reader.onload = ({ target }) => {
        if (!target) return;

        if (typeof target.result === "string") {
            JSON.parse(target.result);

            localStorage.setItem(
                STORAGE_KEY,
                target.result
            );
        }

        onComplete?.();
    };

    reader.readAsText(file);
};

export type { Meal, IStorage };
export { exportData, importData, saveData, loadData };

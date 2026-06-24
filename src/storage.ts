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
    const dataStr = localStorage.getItem(STORAGE_KEY);

    if (!dataStr) return;

    try {
        const data = JSON.parse(dataStr) as IStorage;
        const exportObj = {
            ...data,
            meals: Array.isArray(data?.meals)
                ? data.meals.map((meal) => meal.name)
                : []
        };

        const blob = new Blob(
            [JSON.stringify(exportObj, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;
        link.download = `${STORAGE_KEY}.json`;
        link.click();

        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export failed:", error);
    }
};

const importData = (file: File, onComplete?: () => void) => {
    const reader = new FileReader();

    reader.onload = ({ target }) => {
        if (!target) return;

        if (typeof target.result === "string") {
            try {
                const parsed = JSON.parse(target.result);
                const currentData = loadData();

                if (Array.isArray(parsed)) {
                    currentData.meals = parsed.map((item: any) => {
                        const name = typeof item === "string" ? item : (item?.name || "");
                        return {
                            id: crypto.randomUUID(),
                            name: name.trim()
                        };
                    }).filter((meal: any) => meal.name !== "");
                } else if (parsed && typeof parsed === "object") {
                    if (Array.isArray(parsed.meals)) {
                        currentData.meals = parsed.meals.map((meal: any) => {
                            const name = typeof meal === "string" ? meal : (meal?.name || "");
                            const id = (typeof meal === "object" && meal?.id) ? meal.id : crypto.randomUUID();
                            return {
                                id,
                                name: name.trim()
                            };
                        }).filter((meal: any) => meal.name !== "");
                    }
                    if (parsed.settings) {
                        currentData.settings = {
                            ...currentData.settings,
                            ...parsed.settings
                        };
                    }
                }

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(currentData)
                );
            } catch (error) {
                console.error("Import failed:", error);
            }
        }

        onComplete?.();
    };

    reader.readAsText(file);
};

export type { Meal, IStorage };
export { exportData, importData, saveData, loadData };

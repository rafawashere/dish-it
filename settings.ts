import { loadData, saveData } from "./storage.js";

const loadSettings = () => {
    const data = loadData();
    const element = document.getElementById("noRepeatDays");
    if (element) {
        (element as HTMLInputElement).value = String(data.settings.noRepeatDays);
    }
};

const saveSettings = () => {
    const data = loadData();
    const element = document.getElementById("noRepeatDays");
    if (element) {
        const value = (element as HTMLInputElement).value;
        data.settings.noRepeatDays = Number(value);
    }

    saveData(data);
};

export { loadSettings, saveSettings };
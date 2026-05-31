const loadSettings = () => {
    const data = loadData();

    document.getElementById(
        "noRepeatDays"
    ).value =
        data.settings.noRepeatDays;
};

const saveSettings = () => {
    const data = loadData();

    data.settings.noRepeatDays =
        Number(
            document.getElementById(
                "noRepeatDays"
            ).value
        );

    saveData(data);
};
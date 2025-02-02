import watchlater from "../models/watchlater.js";

export const watchlatercontroller = async (req, res) => {
    const watchlaterdata = req.body;
    const addtowatchlater = new watchlater(watchlaterdata);
    try {
        await addtowatchlater.save();
        res.status(200).json("added to watchlater");
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getallwatchlatercontroller = async (req, res) => {
    try {
        const watchlatervideos = await watchlater.find();
        res.status(200).json(watchlatervideos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletewatchlater = async (req, res) => {
    const { videoid, viewer } = req.params;
    try {
        await watchlater.findOneAndDelete({
            videoid: videoid,
            viewer: viewer,
        });
        res.status(200).json({ message: "removed from watch later" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
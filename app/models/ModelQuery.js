"use strict";

const Model = require("../../services/model");

const ModelQuery = () => {
    return {
        ...Model.model({
            table: "Model",
            created_at: "time_created",
            updated_at: "time_updated",
        }),
    };
};

module.exports = ModelQuery;

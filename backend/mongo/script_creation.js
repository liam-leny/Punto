const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  creation_date: { type: Date, required: true },
  round_number: { type: Number, required: true },
  card_moves: [
    {
      moment: { type: Date },
      pseudo: { type: String },
      point_number: { type: Number, min: 0, max: 9 },
      color: { type: String, enum: ["green", "yellow", "red", "blue"] },
      coord_x: { type: Number, min: 0, max: 5 },
      coord_y: { type: Number, min: 0, max: 5 },
    },
  ],
});

const Game = mongoose.model("Game", gameSchema);

module.exports = { Game };

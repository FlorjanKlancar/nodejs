import mongoose from "mongoose";

const BattleSchema = new mongoose.Schema(
  {
    id: { type: String },
    playerOne: { type: String },
    playerTwo: { type: String },
    unitsPlayerOne: [
      {
        level: { type: Number },
        amount: { type: Number },
        name: { type: String },
      },
    ],
    unitsPlayerTwo: [
      {
        level: { type: Number },
        amount: { type: Number },
        name: { type: String },
      },
    ],
    eloPlayerOne: { type: Number },
    eloPlayerTwo: { type: Number },

    playerOneSocketId: { type: String },
    playerTwoSocketId: { type: String },

    playerOneAccepted: { type: Boolean },
    playerTwoAccepted: { type: Boolean },
  },
  { timestamps: true }
);

export default mongoose.model("Battle", BattleSchema);

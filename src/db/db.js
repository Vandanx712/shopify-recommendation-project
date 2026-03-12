import mogoose from "mongoose";

const connectDb = async () => {
  try {
    const connectionInstance = await mogoose.connect(
      // `${process.env.DB_URL}/recommendation`,
      `${process.env.DB_URL}/Products-filters-react`
    );
    console.log(`mongoodb connect on ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error(`connection error is ${error}`);
  }
};

export default connectDb;

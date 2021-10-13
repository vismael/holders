const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const admin = require("firebase-admin");
const cron = require("node-cron");
require("dotenv").config();

// const serviceAccount = require("E:/00_Programacion2021/Holders/Back/tokenholders-firebase-adminsdk-kinwg-ce7b193a26.json"); // Saving it as reference.
// $env:GOOGLE_APPLICATION_CREDENTIALS='E:\00_Programacion2021\Holders\Back\tokenholders-firebase-adminsdk-kinwg-ce7b193a26.json' // Saving it as reference.
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIAL); // it has been JSON.stringify() before and stored on .env

const saveData = async (name, holders, databaseSDK) => {
  const ref = databaseSDK.ref(`/${name}/`);
  const id = ref.push().key;
  ref.child(id).set(
    {
      name: "cars",
      holders: holders,
      date: Date.now(),
    },
    (error) => {
      if (error) {
        console.log("Data could not be saved." + error);
      } else {
        console.log("Data saved successfully.");
        databaseSDK.app.delete();
      }
    }
  );
};

const getHolders = async (url, databaseSDK) => {
  console.log("quering :", url);
  try {
    const response = await got(url);

    const dom = new JSDOM(response.body);
    const holdersText = dom.window.document.querySelector(
      "#ContentPlaceHolder1_tr_tokenHolders .mr-3"
    ).textContent;

    const holders = parseInt(
      holdersText.replace(" addresses", "").replace(/,/g, ""),
      10
    );

    console.log("Holders: ", holders);
    await saveData("cars", holders, databaseSDK);
  } catch (error) {
    console.log(error);
  }
};

const tokens = [
  "https://bscscan.com/token/0x1228fb5ef4c98cabd696ba1bd4819e050389d21a#balances",
];

const main = async (databaseSDK) => {
  for (const token of tokens) {
    await getHolders(token, databaseSDK);
  }
};


const SECONDS = 50;

cron.schedule(`*/${SECONDS} * * * * *`, function () {

  console.log(Date.now().toLocaleString())

  console.log(new Date())
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.DATABASE_URL,
    }); 
  }

  const databaseSDK = admin.database();
  main(databaseSDK);

  // databaseSDK.app.delete();
});

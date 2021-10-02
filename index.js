const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const admin = require("firebase-admin");

const serviceAccount = require("E:/00_Programacion2021/Holders/Back/tokenholders-firebase-adminsdk-kinwg-ce7b193a26.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tokenholders-default-rtdb.firebaseio.com",
});

const database = admin.database();

// $env:GOOGLE_APPLICATION_CREDENTIALS='E:\00_Programacion2021\Holders\Back\tokenholders-firebase-adminsdk-kinwg-ce7b193a26.json'

const saveData = async (name, holders) => {

      const ref = database.ref(`/${name}/`);
      const id = ref.push().key;
      ref.child(id).set({
        name: "cars",
        holders: holders,
        date: Date.now(),
      });
    
      console.log(1, 'pasaaa')

};

const getHolders = async (url) => {
  // const vgmUrl =
  //   "https://bscscan.com/token/0x1228fb5ef4c98cabd696ba1bd4819e050389d21a#balances";
  console.log("quering :", url);
  await got(url)
    .then( async (response) => {
      const dom = new JSDOM(response.body);
      const holdersText = dom.window.document.querySelector(
        "#ContentPlaceHolder1_tr_tokenHolders .mr-3"
      ).textContent;
      const holders = parseInt(
        holdersText.replace(" addresses", "").replace(/,/g, ""),
        10
      );

      console.log("Holders: ", holders);
      await saveData('cars', holders)
      console.log(2, 'pasaaa')


    })
    .catch((err) => {
      console.log(err);
    });
};

const tokens = [
  "https://bscscan.com/token/0x1228fb5ef4c98cabd696ba1bd4819e050389d21a#balances",
];

const main = async () => {
  for (const token of tokens) {
    await getHolders(token);
  }
  console.log(3, 'pasaaa')
  
};

main().then(console.log('a'));
console.log(4, 'pasaaa')

const fs = require("fs");
// const path = require("path");
const iconv = require("iconv-lite");
const jschardet = require("jschardet");
const qs = require("qs");
const axios = require("axios");

let text = fs.readFileSync("accounts.txt");
// let text = fs.readFileSync(path.join(__dirname, "accounts.txt"));
let encoding = jschardet.detect(text).encoding;
text = iconv.decode(text, encoding);
const accounts = text
  .split(/\n/)
  .map((account) => account.replace("\r", ""))
  .filter((account) => !!account);

run();

async function run() {
  for (let account of accounts) {
    await checkIn(account);
    console.log("-----");
    console.log("等候10秒");
    await sleep(10000);
  }

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question(`任務完成。`, (name) => {
    console.log(`${name}`);
    readline.close();
  });
}

async function checkIn(account) {
  try {
    const accountInfo = account.split(/:/);
    console.log(accountInfo[0], accountInfo[1]);
    console.log("登入");
    const bodyData = {
      gamecode: "MLBB",
      areacode: accountInfo[0],
      mobile: accountInfo[1],
      password: accountInfo[2],
      verify: "",
      timestamp: Date.now(),
      signature: "none",
      comefrom: "web",
      language: "zh_TW",
      autoLogin: "0",
    };
    const response = await axios({
      method: "post",
      url: "https://pcweb.originmood.com/webClient/loginPwd",
      data: qs.stringify(bodyData),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log(response.data);
    if (response.data.code !== "1000") {
      return;
    }

    await sleep(1000);

    console.log("簽到");
    const response2 = await axios({
      method: "get",
      url: "https://activity.originmood.com/activity/dailyClock",
      params: {
        actId: 1434,
        gamecode: "MLBB",
        comefrom: "web",
        platform: "GD",
        // relaCode: "Sign933",
        timestamp: Date.now(),
      },
      headers: {
        Cookie: response.headers["set-cookie"][0],
      },
    });
    console.log(response2.data);

    await sleep(1000);

    console.log("更新簽到資訊");
    const response3 = await axios({
      method: "get",
      url: "https://activity.originmood.com/activity/queryBraveTypeByUserId",
      params: {
        actId: 1434,
        gamecode: "MLBB",
        comefrom: "web",
        platform: "GD",
        // relaCode: "Sign933",
        timestamp: Date.now(),
      },
      headers: {
        Cookie: response.headers["set-cookie"][0],
      },
    });

    await sleep(1000);

    console.log("領取每日簽到點數");
    const response4 = await axios({
      method: "get",
      url: "https://activity.originmood.com/activity/receivePrize",
      params: {
        actId: 1434,
        flag: 50,
        typeId: 147904,
        type: "daily",
        gamecode: "MLBB",
        comefrom: "web",
        platform: "GD",
        // relaCode: "Sign933",
        timestamp: Date.now(),
      },
      headers: {
        Cookie: response.headers["set-cookie"][0],
      },
    });
    console.log(response4.data);
  } catch (error) {
    console.log(error);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

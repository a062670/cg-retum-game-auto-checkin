const fs = require("fs");
// const path = require("path");
const iconv = require("iconv-lite");
const jschardet = require("jschardet");
const qs = require("qs");
const axios = require("axios");

let text = fs.readFileSync("join.txt");
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
    const cookie = await getCookie(account);
    if (cookie) {
      const accountInfo = account.split(/:/);
      await join(cookie, parseInt(accountInfo[3]));
    }
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

async function getCookie(account) {
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
      return "";
    }
    return response.headers["set-cookie"][0];
  } catch (error) {
    console.log(error);
  }
}

async function join(cookie, typeCode) {
  try {
    console.log("等候5秒");
    await sleep(5000);
    console.log("組隊", typeCode);
    const response2 = await axios({
      method: "get",
      url: "https://activity.originmood.com/act/inviteBindL",
      params: {
        actId: 933,
        gamecode: "MLBB",
        comefrom: "web",
        platform: "GD",
        typeCode: typeCode,
        timestamp: Date.now(),
      },
      headers: {
        Cookie: cookie,
      },
    });
    console.log(response2.data);

    if (
      ["5202", "5203", "5205", "5222", "5012"].includes(response2.data.code)
    ) {
      await join(cookie, typeCode + 10);
    }
  } catch (error) {
    console.log(error);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
